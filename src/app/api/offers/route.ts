import { globalOffers, type OfferData } from "@/lib/offerStorage";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

interface JWTPayload {
  userId: string;
  role: string;
  email: string;
  [key: string]: unknown;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    console.log(
      "Offers API - Auth header:",
      authHeader ? "Present" : "Missing"
    );

    if (!authHeader) {
      console.log("Offers API - No authorization header");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const JWT_SECRET =
      process.env.JWT_SECRET || "your-secret-key-change-in-production";

    console.log("Offers API - Token:", token.substring(0, 20) + "...");
    console.log("Offers API - JWT_SECRET:", JWT_SECRET ? "Present" : "Missing");

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      console.log("Offers API - Decoded token:", {
        userId: decoded.userId,
        role: decoded.role,
        email: decoded.email,
      });

      // Only allow HR managers and admins
      if (decoded.role !== "HR_MANAGER" && decoded.role !== "ADMIN") {
        console.log("Offers API - Role check failed:", decoded.role);
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      console.log("Offers API - Authentication successful");
      return NextResponse.json({
        success: true,
        offers: globalOffers,
      });
    } catch (jwtError) {
      console.error("Offers API - JWT verification failed:", jwtError);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  } catch (error) {
    console.error("Error fetching offers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const JWT_SECRET =
      process.env.JWT_SECRET || "your-secret-key-change-in-production";

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

      // Only allow HR managers and admins
      if (decoded.role !== "HR_MANAGER" && decoded.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const {
      applicationId,
      candidateName,
      candidateEmail,
      position,
      department,
      salary,
      startDate,
      expiryDate,
      notes,
    } = body;

    // Validate required fields
    if (
      !candidateName ||
      !candidateEmail ||
      !position ||
      !department ||
      !salary ||
      !startDate ||
      !expiryDate
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new offer
    const offer: OfferData = {
      id: Date.now().toString(),
      candidateName,
      candidateEmail,
      position,
      department,
      salary: parseInt(salary.toString()),
      startDate,
      expiryDate,
      notes: notes || "",
      status: "PENDING",
      offerDate: new Date().toISOString(),
      applicationId,
      application: {
        id: applicationId || "temp",
        candidateName,
      },
      job: {
        id: "temp",
        title: position,
        department,
      },
    };

    globalOffers.push(offer);

    return NextResponse.json({
      success: true,
      offer,
    });
  } catch (error) {
    console.error("Error creating offer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
