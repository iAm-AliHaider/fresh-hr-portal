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

// GET /api/interviews/[id] - Get single interview
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Check if user has permission to view interviews
    if (decoded.role !== "ADMIN" && decoded.role !== "HR_MANAGER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const resolvedParams = await params;
    const interview = await prisma.interview.findUnique({
      where: { id: resolvedParams.id },
      include: {
        application: {
          select: {
            id: true,
            status: true,
            candidateName: true,
            candidateEmail: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            department: true,
          },
        },
      },
    });

    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ interview });
  } catch (error) {
    console.error("Interview fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/interviews/[id] - Update interview
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Check if user has permission to update interviews
    if (decoded.role !== "ADMIN" && decoded.role !== "HR_MANAGER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      status,
      interviewType,
      scheduledDate,
      duration,
      location,
      meetingLink,
      notes,
    } = body;

    const resolvedParams = await params;

    // Check if interview exists
    const existingInterview = await prisma.interview.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!existingInterview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    // Validate status if provided
    const validStatuses = [
      "SCHEDULED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
    ];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status provided" },
        { status: 400 }
      );
    }

    // Update interview
    const updatedInterview = await prisma.interview.update({
      where: { id: resolvedParams.id },
      data: {
        ...(status && { status }),
        ...(interviewType && { interviewType }),
        ...(scheduledDate && { scheduledDate: new Date(scheduledDate) }),
        ...(duration && { duration }),
        ...(location && { location }),
        ...(meetingLink && { meetingLink }),
        ...(notes && { notes }),
        updatedAt: new Date(),
      },
      include: {
        application: {
          select: {
            id: true,
            status: true,
            candidateName: true,
            candidateEmail: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            department: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Interview updated successfully",
      interview: updatedInterview,
    });
  } catch (error) {
    console.error("Interview update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/interviews/[id] - Delete interview
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Check if user has permission to delete interviews
    if (decoded.role !== "ADMIN" && decoded.role !== "HR_MANAGER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const resolvedParams = await params;

    // Check if interview exists
    const existingInterview = await prisma.interview.findUnique({
      where: { id: resolvedParams.id },
      include: {
        application: true,
      },
    });

    if (!existingInterview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    // Delete interview
    await prisma.interview.delete({
      where: { id: resolvedParams.id },
    });

    // Update application status back to REVIEWED if this was the only interview
    const remainingInterviews = await prisma.interview.findMany({
      where: { applicationId: existingInterview.applicationId },
    });

    if (remainingInterviews.length === 0) {
      await prisma.application.update({
        where: { id: existingInterview.applicationId },
        data: { status: "REVIEWED" },
      });
    }

    return NextResponse.json({
      message: "Interview deleted successfully",
    });
  } catch (error) {
    console.error("Interview delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
