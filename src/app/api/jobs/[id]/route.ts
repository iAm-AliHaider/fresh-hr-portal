import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

interface JWTPayload {
  id: string;
  email: string;
  role: string;
  employeeId?: string;
}

// GET /api/jobs/[id] - Get individual job details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    console.log("Job API - GET - Auth token:", token ? "Present" : "Missing");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      jwt.verify(token, JWT_SECRET);
      console.log("Job API - GET - Token verified successfully");
    } catch (jwtError) {
      console.error("Job API - GET - JWT verification failed:", jwtError);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { id: jobId } = await params;
    console.log("Job API - GET - Fetching job with ID:", jobId);

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    console.log("Job API - GET - Job found:", !!job);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    console.log("Job API - GET - Returning job data");
    return NextResponse.json({ job });
  } catch (error) {
    console.error("Job fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT /api/jobs/[id] - Update job
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Check if user has permission to edit jobs
    if (decoded.role !== "ADMIN" && decoded.role !== "HR_MANAGER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: jobId } = await params;
    const body = await request.json();

    const {
      title,
      description,
      department,
      location,
      employmentType,
      salaryMin,
      salaryMax,
      requirements,
      benefits,
      status,
      closingDate,
    } = body;

    // Validate required fields
    if (!title || !description || !department || !location || !employmentType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update job
    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        title,
        description,
        department,
        location,
        employmentType,
        salaryMin: salaryMin ? parseInt(salaryMin) : null,
        salaryMax: salaryMax ? parseInt(salaryMax) : null,
        requirements,
        benefits,
        status,
        closingDate: closingDate ? new Date(closingDate) : null,
      },
      include: {
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Job updated successfully",
      job: updatedJob,
    });
  } catch (error) {
    console.error("Job update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/jobs/[id] - Delete job
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Check if user has permission to delete jobs
    if (decoded.role !== "ADMIN" && decoded.role !== "HR_MANAGER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: jobId } = await params;

    // Check if job exists
    const existingJob = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!existingJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check if job has applications
    if (existingJob._count.applications > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete job with existing applications. Close the job instead.",
          hasApplications: true,
        },
        { status: 400 }
      );
    }

    // Delete job
    await prisma.job.delete({
      where: { id: jobId },
    });

    return NextResponse.json({
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Job deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
