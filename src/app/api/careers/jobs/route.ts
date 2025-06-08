import { prisma } from "@/lib/database";
import { NextResponse } from "next/server";

// GET /api/careers/jobs - Get public job listings (no authentication required)
export async function GET() {
  try {
    // Only return OPEN jobs for public viewing
    const jobs = await prisma.job.findMany({
      where: {
        status: "OPEN",
        // Only show jobs that haven't closed yet
        OR: [{ closingDate: null }, { closingDate: { gte: new Date() } }],
      },
      include: {
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: {
        postedDate: "desc",
      },
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Public jobs fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
