import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// GET /api/jobs - Get all jobs
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    jwt.verify(token, JWT_SECRET);

    const jobs = await prisma.job.findMany({
      include: {
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: { postedDate: "desc" },
    });

    return NextResponse.json({
      success: true,
      jobs: jobs,
      total: jobs.length,
      open: jobs.filter((job) => job.status === "OPEN").length,
    });
  } catch (error) {
    console.error("Jobs API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/jobs - Create new job
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let userPayload;
    try {
      userPayload = jwt.verify(token, JWT_SECRET) as any;
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Check if user has permission to create jobs
    if (userPayload.role !== "ADMIN" && userPayload.role !== "HR_MANAGER") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

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
      closingDate,
    } = body;

    // Validate required fields
    if (!title || !description || !department || !location || !employmentType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const job = await prisma.job.create({
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
        status: "OPEN",
        postedDate: new Date(),
        closingDate: closingDate ? new Date(closingDate) : null,
      },
    });

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    console.error("Job creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
