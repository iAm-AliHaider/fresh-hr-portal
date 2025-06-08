import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // For test purposes, create a candidate token for any email
    // In real implementation, you would verify candidate credentials
    const candidateUser = {
      id: "test-candidate-id",
      email: email,
      role: "CANDIDATE",
      candidate: {
        id: "test-candidate-id", 
        candidate_id: "CAND-001",
        first_name: email.split('@')[0],
        last_name: "Candidate",
        email: email,
        status: "ACTIVE",
        created_at: new Date().toISOString(),
      }
    };

    const token = jwt.sign(
      {
        userId: candidateUser.id,
        email: candidateUser.email,
        role: candidateUser.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    console.log("Test candidate login successful for:", email);

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: candidateUser,
      token: token,
    });
  } catch (error) {
    console.error("Candidate test login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 