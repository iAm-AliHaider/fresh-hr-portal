import { prisma } from "@/lib/database";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export async function GET(request: NextRequest) {
  try {
    console.log("Employees API - GET request received");
    
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      console.log("Employees API - No token provided");
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    console.log("Employees API - Token decoded, userId:", decoded.userId);

    // Get user to verify authentication
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.isActive) {
      console.log("Employees API - Invalid user or inactive:", !!user, user?.isActive);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    console.log("Employees API - User verified, fetching employees...");

    // Fetch all employees with their user data
    const employees = await prisma.employee.findMany({
      include: {
        user: {
          select: {
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    });

    console.log("Employees API - Found employees:", employees.length);

    // Format employee data for frontend
    const formattedEmployees = employees.map((emp) => ({
      id: emp.id,
      employeeId: emp.employeeId,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.user.email,
      phone: emp.phone,
      department: emp.department,
      position: emp.position,
      hireDate: emp.hireDate.toISOString(),
      status: emp.status,
      avatarUrl: emp.avatarUrl,
      isActive: emp.user.isActive,
      role: emp.user.role,
    }));

    console.log("Employees API - Returning formatted employees:", formattedEmployees.length);

    return NextResponse.json({
      employees: formattedEmployees,
      count: formattedEmployees.length,
    });
  } catch (error) {
    console.error("Employees API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Get user to verify authentication and role
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Check if user has permission to create employees
    if (user.role !== "ADMIN" && user.role !== "HR_MANAGER") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const employeeData = await request.json();

    // Generate employee ID
    const employeeIdPrefix = "EMP";
    const latestEmployee = await prisma.employee.findFirst({
      where: {
        employeeId: {
          startsWith: employeeIdPrefix,
        },
      },
      orderBy: {
        employeeId: "desc",
      },
    });

    let nextNumber = 1001;
    if (latestEmployee) {
      const currentNumber = parseInt(
        latestEmployee.employeeId.replace(employeeIdPrefix, "")
      );
      nextNumber = currentNumber + 1;
    }
    const employeeId = `${employeeIdPrefix}${nextNumber}`;

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create User account for the employee
      const userAccount = await tx.user.create({
        data: {
          email: employeeData.email,
          role: employeeData.role || "EMPLOYEE",
          passwordHash: employeeData.password || "changePassword123", // Default password
          isActive: true,
        },
      });

      // Create Employee record
      const employee = await tx.employee.create({
        data: {
          employeeId,
          userId: userAccount.id,
          firstName: employeeData.firstName,
          lastName: employeeData.lastName,
          phone: employeeData.phone,
          department: employeeData.department,
          position: employeeData.position,
          hireDate: employeeData.hireDate ? new Date(employeeData.hireDate) : new Date(),
          status: employeeData.status || "ACTIVE",
          salary: employeeData.salary,
          avatarUrl: employeeData.avatarUrl,
        },
      });

      // If this is from a hired candidate, update offer status
      if (employeeData.offerId) {
        await tx.offer.update({
          where: { id: employeeData.offerId },
          data: { status: "ACCEPTED" },
        });

        // Update application status
        const offer = await tx.offer.findUnique({
          where: { id: employeeData.offerId },
        });
        
        if (offer) {
          await tx.application.update({
            where: { id: offer.applicationId },
            data: { status: "HIRED" },
          });
        }
      }

      return { employee, user: userAccount };
    });

    return NextResponse.json({
      message: "Employee created successfully",
      employee: {
        id: result.employee.id,
        employeeId: result.employee.employeeId,
        firstName: result.employee.firstName,
        lastName: result.employee.lastName,
        email: result.user.email,
        department: result.employee.department,
        position: result.employee.position,
        hireDate: result.employee.hireDate.toISOString(),
        status: result.employee.status,
      },
    });
  } catch (error) {
    console.error("Create employee error:", error);
    return NextResponse.json(
      { error: "Failed to create employee" },
      { status: 500 }
    );
  }
}
