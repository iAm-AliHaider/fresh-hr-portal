import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

const prisma = new PrismaClient();

// POST /api/careers/apply - Submit job application (no authentication required)
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let jobId: string;
    let candidateName: string;
    let candidateEmail: string;
    let candidatePhone: string | null;
    let coverLetter: string;
    let resumeFile: File | null = null;
    let resumePath: string | null = null;

    if (contentType.includes("application/json")) {
      // Handle JSON request (for API testing)
      const body = await request.json();
      jobId = body.jobId;
      candidateName = body.candidateName;
      candidateEmail = body.candidateEmail;
      candidatePhone = body.candidatePhone || null;
      coverLetter = body.coverLetter;
      // Note: No file upload support for JSON requests
    } else {
      // Handle FormData request (for file uploads)
      const formData = await request.formData();
      jobId = formData.get("jobId") as string;
      candidateName = formData.get("candidateName") as string;
      candidateEmail = formData.get("candidateEmail") as string;
      candidatePhone = formData.get("candidatePhone") as string;
      coverLetter = formData.get("coverLetter") as string;
      resumeFile = formData.get("resume") as File | null;
    }

    // Validate required fields
    if (!jobId || !candidateName || !candidateEmail || !coverLetter) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(candidateEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if job exists and is still open
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        status: "OPEN",
        OR: [{ closingDate: null }, { closingDate: { gte: new Date() } }],
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found or application deadline has passed" },
        { status: 404 }
      );
    }

    // Check for duplicate applications
    const existingApplication = await prisma.application.findFirst({
      where: {
        jobId: jobId,
        candidateEmail: candidateEmail,
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied for this position" },
        { status: 409 }
      );
    }

    // Handle file upload if provided (only for FormData requests)
    if (resumeFile && resumeFile.size > 0) {
      // Validate file type
      if (
        !resumeFile.type.includes("pdf") &&
        !resumeFile.type.includes("doc")
      ) {
        return NextResponse.json(
          { error: "Resume must be a PDF or Word document" },
          { status: 400 }
        );
      }

      // Validate file size (5MB limit)
      if (resumeFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Resume file size must be less than 5MB" },
          { status: 400 }
        );
      }

      try {
        const bytes = await resumeFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate unique filename
        const fileExtension = resumeFile.name.split(".").pop();
        const uniqueFilename = `${randomUUID()}.${fileExtension}`;

        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), "public", "uploads", "resumes");

        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true });
        }

        // Save file
        const filePath = join(uploadsDir, uniqueFilename);
        await writeFile(filePath, buffer);

        resumePath = `/uploads/resumes/${uniqueFilename}`;
      } catch (error) {
        console.error("File upload error:", error);
        return NextResponse.json(
          { error: "Failed to upload resume" },
          { status: 500 }
        );
      }
    }

    // Create application record
    const application = await prisma.application.create({
      data: {
        jobId: jobId,
        candidateName: candidateName,
        candidateEmail: candidateEmail,
        candidatePhone: candidatePhone,
        coverLetter: coverLetter,
        resumeUrl: resumePath,
        status: "SUBMITTED",
        appliedDate: new Date(),
      },
    });

    // TODO: Send confirmation email to candidate
    // TODO: Send notification email to HR team

    return NextResponse.json(
      {
        message: "Application submitted successfully",
        application: application,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Application submission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
