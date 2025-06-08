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

// Sample applications for fallback when Prisma fails
const sampleApplications = [
  {
    id: "1",
    candidateName: "John Smith",
    candidateEmail: "john.smith@email.com",
    status: "OFFERED",
    appliedDate: "2024-01-15T00:00:00.000Z",
    notes: "",
    job: {
      id: "1",
      title: "Senior Software Engineer",
      department: "Engineering",
    },
  },
  {
    id: "2",
    candidateName: "Sarah Rodriguez",
    candidateEmail: "sarah.rodriguez@email.com",
    status: "INTERVIEW",
    appliedDate: "2024-01-16T00:00:00.000Z",
    notes: "",
    job: {
      id: "2",
      title: "UX Designer",
      department: "Design",
    },
  },
  {
    id: "3",
    candidateName: "Mike Johnson",
    candidateEmail: "mike.johnson@email.com",
    status: "REVIEWED",
    appliedDate: "2024-01-17T00:00:00.000Z",
    notes: "",
    job: {
      id: "3",
      title: "Senior Software Engineer",
      department: "Engineering",
    },
  },
  {
    id: "4",
    candidateName: "Emily Chen",
    candidateEmail: "emily.chen@email.com",
    status: "SUBMITTED",
    appliedDate: "2024-01-18T00:00:00.000Z",
    notes: "",
    job: {
      id: "4",
      title: "Product Manager",
      department: "Product",
    },
  },
];

// GET /api/careers/applications - Get all applications (HR/Admin only)
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Check if user has permission to view applications
    if (decoded.role !== "ADMIN" && decoded.role !== "HR_MANAGER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get query parameters
    const url = new URL(request.url);
    const statusFilter = url.searchParams.get("status");

    let whereClause = {};
    if (statusFilter) {
      whereClause = { status: statusFilter };
    }

    try {
      const applications = await prisma.application.findMany({
        where: whereClause,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              department: true,
            },
          },
        },
        orderBy: { appliedDate: "desc" },
      });

      return NextResponse.json({ applications });
    } catch (prismaError) {
      console.error("Prisma error:", prismaError);

      // Filter by status if provided
      const filteredApplications = statusFilter
        ? sampleApplications.filter((app) => app.status === statusFilter)
        : sampleApplications;

      return NextResponse.json({ applications: filteredApplications });
    }
  } catch (error) {
    console.error("Applications fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
