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

// GET /api/interviews - Get all interviews
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    jwt.verify(token, JWT_SECRET);

    const interviews = await prisma.interview.findMany({
      include: {
        application: true,
        job: {
          select: {
            id: true,
            title: true,
            department: true,
          },
        },
      },
      orderBy: { scheduledDate: "asc" },
    });

    // Also fetch assessments to send to frontend
    const assessments = await prisma.assessment.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ interviews, assessments });
  } catch (error) {
    console.error("Interviews fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/interviews - Create new interview
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Check if user has permission to schedule interviews
    if (decoded.role !== "ADMIN" && decoded.role !== "HR_MANAGER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      applicationId,
      jobId,
      candidateName,
      candidateEmail,
      interviewType,
      scheduledDate,
      duration,
      location,
      meetingLink,
      interviewerIds,
      notes,
    } = body;

    // Validate required fields
    if (
      !applicationId ||
      !jobId ||
      !candidateName ||
      !candidateEmail ||
      !scheduledDate
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create interview
    const interview = await prisma.interview.create({
      data: {
        applicationId,
        jobId,
        candidateName,
        candidateEmail,
        interviewType: interviewType || "VIDEO",
        scheduledDate: new Date(scheduledDate),
        duration: duration || 60,
        location,
        meetingLink,
        interviewerIds: interviewerIds ? JSON.stringify(interviewerIds) : null,
        notes,
      },
      include: {
        application: true,
        job: {
          select: {
            id: true,
            title: true,
            department: true,
          },
        },
      },
    });

    // Update application status to INTERVIEW
    await prisma.application.update({
      where: { id: applicationId },
      data: { status: "INTERVIEW" },
    });

    return NextResponse.json({
      message: "Interview scheduled successfully",
      interview,
    });
  } catch (error) {
    console.error("Interview creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
