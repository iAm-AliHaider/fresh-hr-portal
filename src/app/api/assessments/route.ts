import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  employeeId?: string;
}

// GET /api/assessments - Get all assessments (HR/Admin only)
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Check if user has permission to view assessments
    if (decoded.role !== "ADMIN" && decoded.role !== "HR_MANAGER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const assessments = await prisma.assessment.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ assessments });
  } catch (error) {
    console.error("Assessments fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/assessments - Create new assessment
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Check if user has permission to create assessments
    if (decoded.role !== "ADMIN" && decoded.role !== "HR_MANAGER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      interviewId,
      technicalSkills,
      communication,
      culturalFit,
      overallRating,
      strengths,
      weaknesses,
      recommendation,
      additionalNotes,
    } = body;

    // Validate required fields
    if (
      !interviewId ||
      technicalSkills === undefined ||
      communication === undefined ||
      culturalFit === undefined ||
      overallRating === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate rating ranges
    const validateRating = (rating: number) => rating >= 1 && rating <= 10;
    if (
      !validateRating(technicalSkills) ||
      !validateRating(communication) ||
      !validateRating(culturalFit) ||
      !validateRating(overallRating)
    ) {
      return NextResponse.json(
        { error: "Ratings must be between 1 and 10" },
        { status: 400 }
      );
    }

    // Check if interview exists
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
    });

    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    // Check if assessment already exists for this interview
    const existingAssessment = await prisma.assessment.findFirst({
      where: { interviewId },
    });

    if (existingAssessment) {
      return NextResponse.json(
        { 
          error: "Assessment already exists for this interview", 
          message: "An assessment has already been submitted for this interview. Each interview can only have one assessment.",
          existingAssessmentId: existingAssessment.id
        },
        { status: 409 }
      );
    }

    // Create assessment
    const assessment = await prisma.assessment.create({
      data: {
        interviewId,
        technicalSkills,
        communication,
        culturalFit,
        overallRating,
        strengths: strengths || "",
        weaknesses: weaknesses || "",
        recommendation,
        additionalNotes: additionalNotes || "",
        createdBy: decoded.userId,
      },
    });

    return NextResponse.json({
      message: "Assessment created successfully",
      assessment,
    });
  } catch (error) {
    console.error("Assessment creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
