import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

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
    const resolvedParams = await params;
    const offerId = resolvedParams.id;

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

      const body = await request.json();
      const { action } = body;

      if (!action || !["ACCEPTED", "REJECTED"].includes(action)) {
        return NextResponse.json(
          { error: "Invalid action. Must be ACCEPTED or REJECTED" },
          { status: 400 }
        );
      }

      // For now, simulate the offer response
      // This will be updated once the Offer model is added to Prisma
      console.log(`Candidate ${decoded.email} ${action} offer ${offerId}`);

      // If offer is accepted, we might want to automatically update the application status to HIRED
      // If offer is rejected, we might want to update it back to a previous status

      return NextResponse.json({
        success: true,
        message: `Offer ${action.toLowerCase()} successfully`,
        offerId,
        action,
      });
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  } catch (error) {
    console.error("Error responding to offer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
