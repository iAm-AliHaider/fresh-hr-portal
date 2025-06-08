import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET /api/careers/jobs/[id] - Get public job details (no authentication required)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;

    // Only return OPEN jobs for public viewing
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        status: "OPEN",
        // Only show jobs that haven't closed yet
        OR: [{ closingDate: null }, { closingDate: { gte: new Date() } }],
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found or not available" },
        { status: 404 }
      );
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error("Public job fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
