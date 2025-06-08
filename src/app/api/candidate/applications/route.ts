import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface JWTPayload {
  userId: string;
  role: string;
  email: string;
  [key: string]: unknown;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    console.log("Candidate Applications API - Auth header:", authHeader ? "Present" : "Missing");
    
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

    console.log("Candidate Applications API - Token received, length:", token.length);

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      console.log("Candidate Applications API - Decoded token:", { email: decoded.email, role: decoded.role });

      // Get email from query params or use token email
      const url = new URL(request.url);
      const email = url.searchParams.get("email") || decoded.email;

      if (!email) {
        return NextResponse.json({ error: "Email required" }, { status: 400 });
      }

      console.log("Candidate Applications API - Fetching applications for email:", email);

      // Fetch real applications for this candidate email
      const applications = await prisma.application.findMany({
        where: {
          candidateEmail: email,
        },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              department: true,
              description: true,
              status: true,
              postedDate: true,
            },
          },
          interviews: {
            orderBy: {
              scheduledDate: 'asc',
            },
            select: {
              id: true,
              scheduledDate: true,
              duration: true,
              interviewType: true,
              meetingLink: true,
              notes: true,
              status: true,
              location: true,
            },
          },
        },
        orderBy: {
          appliedDate: 'desc',
        },
      });

      console.log("Candidate Applications API - Found applications:", applications.length);

      // Format the applications for the frontend
      const formattedApplications = applications.map(app => ({
        id: app.id,
        candidateName: app.candidateName,
        candidateEmail: app.candidateEmail,
        status: app.status,
        appliedDate: app.appliedDate.toISOString(),
        coverLetter: app.coverLetter,
        resumeUrl: app.resumeUrl,
        notes: app.notes,
        job: {
          id: app.job.id,
          title: app.job.title,
          department: app.job.department,
          description: app.job.description,
          status: app.job.status,
          postedDate: app.job.postedDate.toISOString(),
        },
        interviews: app.interviews.map((interview) => ({
          id: interview.id,
          scheduledDate: interview.scheduledDate.toISOString(),
          duration: interview.duration,
          interviewType: interview.interviewType,
          meetingLink: interview.meetingLink,
          notes: interview.notes,
          status: interview.status,
          location: interview.location,
        })),
        // For now, fetch offers separately if needed
        offers: [],
      }));

      console.log("Candidate Applications API - Returning formatted applications");

      return NextResponse.json({
        success: true,
        applications: formattedApplications,
        candidateInfo: {
          email: email,
          name: applications.length > 0 ? applications[0].candidateName : email.split('@')[0],
          status: "ACTIVE",
          created_at: new Date().toISOString(),
        },
      });
    } catch (jwtError) {
      console.error("Candidate Applications API - JWT verification failed:", jwtError);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  } catch (error) {
    console.error("Error fetching candidate applications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
