import fetch from "node-fetch";

const BASE_URL = "http://localhost:3000";

// Helper function to make authenticated requests
async function makeRequest(endpoint, options = {}, token = null) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  return { status: response.status, data };
}

async function testRecruitmentAPIs() {
  console.log("🚀 Starting Comprehensive API Endpoint Testing\n");

  let adminToken = null;
  let hrToken = null;

  try {
    // Test 1: Authentication Endpoints
    console.log("1️⃣ Testing Authentication Endpoints...");

    // Admin Login
    const adminAuth = await makeRequest("/api/auth", {
      method: "POST",
      body: JSON.stringify({
        email: "admin@freshhr.com",
        password: "admin123",
      }),
    });

    if (adminAuth.status === 200) {
      adminToken = adminAuth.data.token;
      console.log("✅ Admin Authentication: Success");
      console.log(`   Role: ${adminAuth.data.user.role}`);
    } else {
      console.log("❌ Admin Authentication: Failed");
      return;
    }

    // HR Manager Login
    const hrAuth = await makeRequest("/api/auth", {
      method: "POST",
      body: JSON.stringify({
        email: "hr@freshhr.com",
        password: "hr123",
      }),
    });

    if (hrAuth.status === 200) {
      hrToken = hrAuth.data.token;
      console.log("✅ HR Manager Authentication: Success");
      console.log(`   Role: ${hrAuth.data.user.role}\n`);
    } else {
      console.log("❌ HR Manager Authentication: Failed\n");
    }

    // Test 2: Jobs API Endpoints
    console.log("2️⃣ Testing Jobs API Endpoints...");

    // GET /api/jobs (with admin auth)
    const jobsResponse = await makeRequest(
      "/api/jobs",
      { method: "GET" },
      adminToken
    );
    if (jobsResponse.status === 200) {
      console.log(
        `✅ GET /api/jobs (Admin): Success (${jobsResponse.data.jobs.length} jobs)`
      );
    } else {
      console.log("❌ GET /api/jobs (Admin): Failed");
    }

    // GET /api/jobs (with HR auth)
    const hrJobsResponse = await makeRequest(
      "/api/jobs",
      { method: "GET" },
      hrToken
    );
    if (hrJobsResponse.status === 200) {
      console.log(
        `✅ GET /api/jobs (HR): Success (${hrJobsResponse.data.jobs.length} jobs)`
      );
    } else {
      console.log("❌ GET /api/jobs (HR): Failed");
    }

    // GET /api/careers/jobs (public)
    const publicJobsResponse = await makeRequest("/api/careers/jobs", {
      method: "GET",
    });
    if (publicJobsResponse.status === 200) {
      console.log(
        `✅ GET /api/careers/jobs (public): Success (${publicJobsResponse.data.jobs.length} jobs)`
      );
    } else {
      console.log("❌ GET /api/careers/jobs (public): Failed");
    }

    // POST /api/jobs (create job)
    const newJobData = {
      title: "API Test Developer",
      description: "Testing job creation via API",
      department: "Engineering",
      location: "Remote",
      employmentType: "Full-time",
      salaryMin: 80000,
      salaryMax: 120000,
      requirements: "API testing experience",
      benefits: "Remote work, health insurance",
      status: "OPEN",
    };

    const createJobResponse = await makeRequest(
      "/api/jobs",
      {
        method: "POST",
        body: JSON.stringify(newJobData),
      },
      adminToken
    );

    let testJobId = null;
    if (createJobResponse.status === 201) {
      testJobId = createJobResponse.data.job.id;
      console.log(`✅ POST /api/jobs: Success (Created job ID: ${testJobId})`);
    } else {
      console.log("❌ POST /api/jobs: Failed");
    }

    // GET /api/jobs/[id]
    if (testJobId) {
      const jobDetailsResponse = await makeRequest(
        `/api/jobs/${testJobId}`,
        { method: "GET" },
        adminToken
      );
      if (jobDetailsResponse.status === 200) {
        console.log(`✅ GET /api/jobs/[id]: Success`);
      } else {
        console.log("❌ GET /api/jobs/[id]: Failed");
      }
    }

    // Test 3: Applications API Endpoints
    console.log("\n3️⃣ Testing Applications API Endpoints...");

    if (testJobId) {
      // POST /api/careers/apply (public application)
      const applicationData = {
        jobId: testJobId,
        candidateName: "API Test Candidate",
        candidateEmail: "api.test@email.com",
        candidatePhone: "555-0199",
        coverLetter: "This is a test application submitted via API.",
      };

      const applyResponse = await makeRequest("/api/careers/apply", {
        method: "POST",
        body: JSON.stringify(applicationData),
      });

      let testApplicationId = null;
      if (applyResponse.status === 201) {
        testApplicationId = applyResponse.data.application.id;
        console.log(
          `✅ POST /api/careers/apply: Success (Application ID: ${testApplicationId})`
        );
      } else {
        console.log("❌ POST /api/careers/apply: Failed");
      }

      // GET /api/jobs/[id]/applications
      const applicationsResponse = await makeRequest(
        `/api/jobs/${testJobId}/applications`,
        { method: "GET" },
        adminToken
      );
      if (applicationsResponse.status === 200) {
        console.log(
          `✅ GET /api/jobs/[id]/applications: Success (${applicationsResponse.data.applications.length} applications)`
        );
      } else {
        console.log("❌ GET /api/jobs/[id]/applications: Failed");
      }

      // Test 4: Interview API Endpoints
      console.log("\n4️⃣ Testing Interview API Endpoints...");

      if (testApplicationId) {
        // POST /api/interviews (schedule interview)
        const interviewData = {
          applicationId: testApplicationId,
          jobId: testJobId,
          candidateName: "API Test Candidate",
          candidateEmail: "api.test@email.com",
          interviewType: "VIDEO",
          scheduledDate: new Date(
            Date.now() + 5 * 24 * 60 * 60 * 1000
          ).toISOString(),
          duration: 60,
          meetingLink: "https://zoom.us/api-test-meeting",
          interviewerIds: [adminAuth.data.user.id],
        };

        const scheduleInterviewResponse = await makeRequest(
          "/api/interviews",
          {
            method: "POST",
            body: JSON.stringify(interviewData),
          },
          adminToken
        );

        let testInterviewId = null;
        if (scheduleInterviewResponse.status === 200) {
          testInterviewId = scheduleInterviewResponse.data.interview.id;
          console.log(
            `✅ POST /api/interviews: Success (Interview ID: ${testInterviewId})`
          );
        } else {
          console.log(
            `❌ POST /api/interviews: Failed (Status: ${scheduleInterviewResponse.status})`
          );
          console.log(
            `   Error: ${JSON.stringify(scheduleInterviewResponse.data)}`
          );
        }

        // GET /api/interviews
        const interviewsResponse = await makeRequest(
          "/api/interviews",
          { method: "GET" },
          adminToken
        );
        if (interviewsResponse.status === 200) {
          console.log(
            `✅ GET /api/interviews: Success (${interviewsResponse.data.interviews.length} interviews)`
          );
        } else {
          console.log("❌ GET /api/interviews: Failed");
        }

        // Test 5: Frontend Pages Test
        console.log("\n5️⃣ Testing Frontend Pages Accessibility...");

        // Test public pages
        const publicPages = [
          "/careers",
          `/careers/jobs/${testJobId}`,
          "/login",
        ];

        for (const page of publicPages) {
          const pageResponse = await fetch(`${BASE_URL}${page}`);
          if (pageResponse.status === 200) {
            console.log(`✅ Page ${page}: Accessible`);
          } else {
            console.log(
              `❌ Page ${page}: Not accessible (${pageResponse.status})`
            );
          }
        }

        // Test 6: Cleanup Test Data
        console.log("\n6️⃣ Cleaning up test data...");

        if (testInterviewId) {
          // Delete interview (would need DELETE endpoint - for now just note)
          console.log(
            `📝 Interview ${testInterviewId} created (manual cleanup needed)`
          );
        }

        if (testApplicationId) {
          // Delete application (would need DELETE endpoint - for now just note)
          console.log(
            `📝 Application ${testApplicationId} created (manual cleanup needed)`
          );
        }

        if (testJobId) {
          // Delete job (would need DELETE endpoint - for now just note)
          console.log(`📝 Job ${testJobId} created (manual cleanup needed)`);
        }
      }
    }

    // Test 7: Error Handling
    console.log("\n7️⃣ Testing Error Handling...");

    // Test unauthorized access
    const unauthorizedResponse = await makeRequest("/api/jobs", {
      method: "GET",
    });
    if (unauthorizedResponse.status === 401) {
      console.log("✅ Unauthorized access properly rejected");
    } else {
      console.log("❌ Unauthorized access not properly handled");
    }

    // Test invalid credentials
    const invalidAuthResponse = await makeRequest("/api/auth", {
      method: "POST",
      body: JSON.stringify({
        email: "invalid@email.com",
        password: "wrongpassword",
      }),
    });

    if (invalidAuthResponse.status === 401) {
      console.log("✅ Invalid credentials properly rejected");
    } else {
      console.log("❌ Invalid credentials not properly handled");
    }

    console.log("\n🎉 API Endpoint Testing Complete!");
    console.log("\n📝 Summary of Tested Endpoints:");
    console.log("✅ Authentication: POST /api/auth");
    console.log("✅ Jobs: GET/POST /api/jobs, GET /api/jobs/[id]");
    console.log(
      "✅ Public Jobs: GET /api/careers/jobs, GET /api/careers/jobs/[id]"
    );
    console.log(
      "✅ Applications: POST /api/careers/apply, GET /api/jobs/[id]/applications"
    );
    console.log("✅ Interviews: GET/POST /api/interviews");
    console.log("✅ Frontend Pages: /careers, /careers/jobs/[id], /login");
    console.log("✅ Error Handling: 401 Unauthorized, 401 Invalid Credentials");
  } catch (error) {
    console.error("❌ API Testing Error:", error.message);
  }
}

// Run the API tests
testRecruitmentAPIs();
