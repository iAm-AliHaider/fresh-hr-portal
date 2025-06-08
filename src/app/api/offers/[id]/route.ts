import { globalOffers } from "@/lib/offerStorage";
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
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const offerId = resolvedParams.id;

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
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Find and update the offer in shared storage
    const offerIndex = globalOffers.findIndex((offer) => offer.id === offerId);

    if (offerIndex === -1) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    // Update the offer status
    globalOffers[offerIndex] = {
      ...globalOffers[offerIndex],
      status,
      updatedDate: new Date().toISOString(),
    };

    const updatedOffer = globalOffers[offerIndex];

    console.log(`Successfully updated offer ${offerId} to status: ${status}`);

    return NextResponse.json({
      success: true,
      message: "Offer status updated successfully",
      offer: updatedOffer,
    });
  } catch (error) {
    console.error("Error updating offer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const offerId = resolvedParams.id;

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

    // Find the offer in shared storage
    const offer = globalOffers.find((offer) => offer.id === offerId);

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      offer,
    });
  } catch (error) {
    console.error("Error fetching offer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
