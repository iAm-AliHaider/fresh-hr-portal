import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      linkedinUrl,
      portfolioUrl,
      experienceYears,
      currentCompany,
      currentPosition,
      preferredLocation,
      expectedSalary,
      availabilityDate,
      skills,
      summary,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "First name, last name, email, and password are required",
        },
        { status: 400 }
      );
    }

    // TODO: Replace with actual UnifiedAuthService when database is ready
    // For now, return a mock success response
    const mockUser = {
      id: `cand_${Date.now()}`,
      email,
      userType: "CANDIDATE",
      candidate: {
        candidate_id: "CAN001",
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || null,
        linkedin_url: linkedinUrl || null,
        portfolio_url: portfolioUrl || null,
        experience_years: experienceYears ? parseInt(experienceYears) : null,
        current_company: currentCompany || null,
        current_position: currentPosition || null,
        preferred_location: preferredLocation || null,
        expected_salary: expectedSalary || null,
        availability_date: availabilityDate || null,
        skills: skills || null,
        summary: summary || null,
        status: "ACTIVE",
        created_at: new Date().toISOString(),
      },
    };

    return NextResponse.json(
      {
        success: true,
        message: "Candidate account created successfully",
        user: mockUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Candidate registration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
