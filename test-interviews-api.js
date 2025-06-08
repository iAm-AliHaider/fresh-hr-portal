// Test script for interviews API functionality
const BASE_URL = "http://localhost:3000";

// Mock JWT token (replace with actual token for testing)
const AUTH_TOKEN = "your-test-token-here";

async function testInterviewsAPI() {
  console.log("🧪 Testing Interviews API CRUD Operations...\n");

  try {
    // 1. Test GET /api/interviews
    console.log("1. Testing GET /api/interviews");
    const getResponse = await fetch(`${BASE_URL}/api/interviews`, {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    });

    if (getResponse.ok) {
      const interviews = await getResponse.json();
      console.log("✅ GET interviews successful");
      console.log(`   Found ${interviews.interviews?.length || 0} interviews`);
    } else {
      console.log("❌ GET interviews failed:", getResponse.status);
    }

    // 2. Test POST /api/interviews (Create)
    console.log("\n2. Testing POST /api/interviews");
    const newInterview = {
      applicationId: "test-app-id",
      jobId: "test-job-id",
      candidateName: "Test Candidate",
      candidateEmail: "test@example.com",
      interviewType: "VIDEO",
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      duration: 60,
      location: "",
      meetingLink: "https://zoom.us/test",
      notes: "Test interview",
    };

    const postResponse = await fetch(`${BASE_URL}/api/interviews`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newInterview),
    });

    let createdInterviewId = null;
    if (postResponse.ok) {
      const result = await postResponse.json();
      createdInterviewId = result.interview?.id;
      console.log("✅ POST create interview successful");
      console.log(`   Created interview ID: ${createdInterviewId}`);
    } else {
      console.log("❌ POST create interview failed:", postResponse.status);
    }

    // 3. Test GET /api/interviews/[id] (if we created one)
    if (createdInterviewId) {
      console.log("\n3. Testing GET /api/interviews/[id]");
      const getSingleResponse = await fetch(
        `${BASE_URL}/api/interviews/${createdInterviewId}`,
        {
          headers: {
            Authorization: `Bearer ${AUTH_TOKEN}`,
          },
        }
      );

      if (getSingleResponse.ok) {
        const interview = await getSingleResponse.json();
        console.log("✅ GET single interview successful");
        console.log(
          `   Interview candidate: ${interview.interview?.candidateName}`
        );
      } else {
        console.log(
          "❌ GET single interview failed:",
          getSingleResponse.status
        );
      }

      // 4. Test PATCH /api/interviews/[id] (Update)
      console.log("\n4. Testing PATCH /api/interviews/[id]");
      const updateData = {
        status: "COMPLETED",
        notes: "Interview completed successfully",
      };

      const patchResponse = await fetch(
        `${BASE_URL}/api/interviews/${createdInterviewId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${AUTH_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (patchResponse.ok) {
        const result = await patchResponse.json();
        console.log("✅ PATCH update interview successful");
        console.log(`   Updated status: ${result.interview?.status}`);
      } else {
        console.log("❌ PATCH update interview failed:", patchResponse.status);
      }

      // 5. Test DELETE /api/interviews/[id]
      console.log("\n5. Testing DELETE /api/interviews/[id]");
      const deleteResponse = await fetch(
        `${BASE_URL}/api/interviews/${createdInterviewId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${AUTH_TOKEN}`,
          },
        }
      );

      if (deleteResponse.ok) {
        console.log("✅ DELETE interview successful");
      } else {
        console.log("❌ DELETE interview failed:", deleteResponse.status);
      }
    }

    // 6. Test assessments API
    console.log("\n6. Testing GET /api/assessments");
    const assessmentsResponse = await fetch(`${BASE_URL}/api/assessments`, {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    });

    if (assessmentsResponse.ok) {
      const assessments = await assessmentsResponse.json();
      console.log("✅ GET assessments successful");
      console.log(
        `   Found ${assessments.assessments?.length || 0} assessments`
      );
    } else {
      console.log("❌ GET assessments failed:", assessmentsResponse.status);
    }

    console.log("\n🎉 Interview API testing completed!");
  } catch (error) {
    console.error("❌ Test failed with error:", error.message);
  }
}

// Instructions for running the test
console.log(`
📋 Interview API Test Instructions:

1. Make sure the development server is running (npm run dev)
2. Get a valid JWT token by logging in as HR_MANAGER or ADMIN
3. Replace AUTH_TOKEN variable above with your actual token
4. Run this script: node test-interviews-api.js

Expected API Endpoints:
- GET    /api/interviews           - List all interviews
- POST   /api/interviews           - Create new interview
- GET    /api/interviews/[id]      - Get single interview
- PATCH  /api/interviews/[id]      - Update interview
- DELETE /api/interviews/[id]      - Delete interview
- GET    /api/assessments          - List all assessments
- POST   /api/assessments          - Create new assessment

Interview Page Features:
- View scheduled, today's, and completed interviews
- Mark interviews as complete
- Create assessments with ratings (1-10 scale)
- Search and filter interviews
- Role-based access control (HR_MANAGER, ADMIN only)
`);

// Run the test (uncomment next line and add real token to execute)
// testInterviewsAPI();
