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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

      // Check if user has permission to update applications
      if (decoded.role !== "ADMIN" && decoded.role !== "HR_MANAGER") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const { id } = await params;
      const { status, notes } = await request.json();

      if (!status) {
        return NextResponse.json(
          { error: "Status is required" },
          { status: 400 }
        );
      }

      // Valid status transitions
      const validStatuses = [
        "SUBMITTED",
        "SCREENING",
        "REVIEWED",
        "INTERVIEW",
        "INTERVIEWED",
        "COMPLETED",
        "OFFERED",
        "HIRED",
        "REJECTED",
        "WITHDRAWN"
      ];

      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: "Invalid status" },
          { status: 400 }
        );
      }

      // Update application status
      const updatedApplication = await prisma.application.update({
        where: { id },
        data: {
          status,
          notes: notes || undefined,
        },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              department: true,
            },
          },
          interviews: {
            orderBy: {
              scheduledDate: 'asc',
            },
          },
        },
      });

      // Trigger notifications based on status change
      await sendStatusNotification(updatedApplication, status);

      return NextResponse.json({
        success: true,
        message: "Application status updated successfully",
        application: updatedApplication,
      });
    } catch (error) {
      console.error("JWT verification failed:", error);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  } catch (error) {
    console.error("Error updating application status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Function to send notifications (placeholder for now)
async function sendStatusNotification(application: { 
  id: string; 
  candidateName: string; 
  candidateEmail: string; 
  job: { title: string } 
}, newStatus: string) {
  try {
    console.log(`Sending notification for application ${application.id}:`);
    console.log(`- Candidate: ${application.candidateName} (${application.candidateEmail})`);
    console.log(`- Position: ${application.job.title}`);
    console.log(`- New Status: ${newStatus}`);
    
    // In a real implementation, this would:
    // 1. Send email to candidate
    // 2. Update any external systems
    // 3. Log the status change
    // 4. Notify relevant stakeholders
    
    const statusMessages = {
      SCREENING: "Your application is being reviewed by our HR team.",
      REVIEWED: "Your application has been reviewed and forwarded to the hiring manager.",
      INTERVIEW: "Congratulations! You've been selected for an interview.",
      INTERVIEWED: "Thank you for the interview. We're evaluating all candidates.",
      COMPLETED: "The interview process is complete. We'll be in touch soon.",
      OFFERED: "Congratulations! We're pleased to extend you a job offer.",
      HIRED: "Welcome to the team! We're excited to have you on board.",
      REJECTED: "Thank you for your interest. We've decided to move forward with other candidates.",
    };

    const message = statusMessages[newStatus as keyof typeof statusMessages] || "Your application status has been updated.";
    
    // Log notification (in real app, send actual notification)
    console.log(`Notification message: ${message}`);
    
    return true;
  } catch (error) {
    console.error("Error sending notification:", error);
    return false;
  }
} 