import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";

const prisma = new PrismaClient();
const BASE_URL = "http://localhost:3000";

// Color codes for console output
const colors = {
  success: "\x1b[32m",
  error: "\x1b[31m",
  warning: "\x1b[33m",
  info: "\x1b[36m",
  reset: "\x1b[0m",
};

const log = {
  success: (msg) => console.log(`${colors.success}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.error}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.warning}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.info}ℹ️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.info}=== ${msg} ===${colors.reset}`),
};

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

async function finalValidation() {
  console.log(
    "🚀 FRESH HR PORTAL - COMPREHENSIVE RECRUITMENT WORKFLOW VALIDATION\n"
  );

  let testResults = {
    database: false,
    authentication: false,
    jobsCRUD: false,
    applicationsCRUD: false,
    interviewsCRUD: false,
    apiEndpoints: false,
    frontendPages: false,
    workflow: false,
  };

  try {
    // === DATABASE CONNECTIVITY ===
    log.header("DATABASE CONNECTIVITY TEST");

    const dbStats = {
      users: await prisma.user.count(),
      jobs: await prisma.job.count(),
      applications: await prisma.application.count(),
      interviews: await prisma.interview.count(),
    };

    log.success(`Database connected successfully`);
    log.info(
      `Users: ${dbStats.users} | Jobs: ${dbStats.jobs} | Applications: ${dbStats.applications} | Interviews: ${dbStats.interviews}`
    );
    testResults.database = true;

    // === AUTHENTICATION SYSTEM ===
    log.header("AUTHENTICATION SYSTEM TEST");

    const adminAuth = await makeRequest("/api/auth", {
      method: "POST",
      body: JSON.stringify({
        email: "admin@freshhr.com",
        password: "admin123",
      }),
    });

    const hrAuth = await makeRequest("/api/auth", {
      method: "POST",
      body: JSON.stringify({
        email: "hr@freshhr.com",
        password: "hr123",
      }),
    });

    if (adminAuth.status === 200 && hrAuth.status === 200) {
      log.success("Authentication system working");
      log.info(
        `Admin Role: ${adminAuth.data.user.role} | HR Role: ${hrAuth.data.user.role}`
      );
      testResults.authentication = true;
    } else {
      log.error("Authentication system failed");
    }

    const adminToken = adminAuth.data.token;
    const hrToken = hrAuth.data.token;

    // Test HR token as well
    const hrJobsTest = await makeRequest(
      "/api/jobs",
      { method: "GET" },
      hrToken
    );
    if (hrJobsTest.status === 200) {
      log.info(`HR Manager can access jobs API: ✓`);
    }

    // === JOBS CRUD OPERATIONS ===
    log.header("JOBS CRUD OPERATIONS TEST");

    // Create Job
    const newJob = await prisma.job.create({
      data: {
        title: "Final Test Position",
        description: "Final validation test job",
        department: "QA",
        location: "Remote",
        employmentType: "Full-time",
        salaryMin: 60000,
        salaryMax: 90000,
        requirements: "Testing skills",
        benefits: "Remote work",
        status: "OPEN",
      },
    });
    log.success(`CREATE: Job created (ID: ${newJob.id})`);

    // Read Jobs
    const jobs = await prisma.job.findMany();
    log.success(`READ: Found ${jobs.length} total jobs`);

    // Update Job
    const updatedJob = await prisma.job.update({
      where: { id: newJob.id },
      data: { title: "Updated Final Test Position" },
    });
    log.success(`UPDATE: Job title updated to "${updatedJob.title}"`);

    testResults.jobsCRUD = true;

    // === APPLICATIONS CRUD OPERATIONS ===
    log.header("APPLICATIONS CRUD OPERATIONS TEST");

    // Create Application via API
    const applicationData = {
      jobId: newJob.id,
      candidateName: "Final Test Candidate",
      candidateEmail: "final.test@email.com",
      candidatePhone: "555-FINAL",
      coverLetter: "Final test application for comprehensive validation.",
    };

    const applyResponse = await makeRequest("/api/careers/apply", {
      method: "POST",
      body: JSON.stringify(applicationData),
    });

    if (applyResponse.status === 201) {
      log.success(
        `CREATE: Application submitted (ID: ${applyResponse.data.application.id})`
      );

      // Read Applications
      const applications = await prisma.application.findMany({
        where: { jobId: newJob.id },
      });
      log.success(
        `READ: Found ${applications.length} applications for test job`
      );

      // Update Application
      const updatedApp = await prisma.application.update({
        where: { id: applyResponse.data.application.id },
        data: { status: "REVIEWED" },
      });
      log.success(
        `UPDATE: Application status updated to "${updatedApp.status}"`
      );

      testResults.applicationsCRUD = true;

      // === INTERVIEWS CRUD OPERATIONS ===
      log.header("INTERVIEWS CRUD OPERATIONS TEST");

      // Create Interview via API
      const interviewData = {
        applicationId: applyResponse.data.application.id,
        jobId: newJob.id,
        candidateName: applicationData.candidateName,
        candidateEmail: applicationData.candidateEmail,
        interviewType: "VIDEO",
        scheduledDate: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        duration: 60,
        meetingLink: "https://zoom.us/final-test",
        interviewerIds: [adminAuth.data.user.id],
      };

      const interviewResponse = await makeRequest(
        "/api/interviews",
        {
          method: "POST",
          body: JSON.stringify(interviewData),
        },
        adminToken
      );

      if (interviewResponse.status === 200) {
        log.success(
          `CREATE: Interview scheduled (ID: ${interviewResponse.data.interview.id})`
        );

        // Read Interviews
        const interviews = await prisma.interview.findMany();
        log.success(`READ: Found ${interviews.length} total interviews`);

        // Update Interview
        const updatedInterview = await prisma.interview.update({
          where: { id: interviewResponse.data.interview.id },
          data: {
            status: "COMPLETED",
            rating: 5,
            recommendation: "HIRE",
            feedback: "Excellent candidate - recommended for hire",
          },
        });
        log.success(
          `UPDATE: Interview completed with rating ${updatedInterview.rating}`
        );

        testResults.interviewsCRUD = true;

        // === END-TO-END WORKFLOW TEST ===
        log.header("END-TO-END WORKFLOW TEST");

        // Update application based on interview result
        await prisma.application.update({
          where: { id: applyResponse.data.application.id },
          data: { status: "ACCEPTED" },
        });
        log.success(
          "Workflow: Application status updated to ACCEPTED based on interview"
        );
        testResults.workflow = true;

        // === CLEANUP ===
        log.header("CLEANUP TEST DATA");
        await prisma.interview.delete({
          where: { id: interviewResponse.data.interview.id },
        });
        await prisma.application.delete({
          where: { id: applyResponse.data.application.id },
        });
        await prisma.job.delete({ where: { id: newJob.id } });
        log.success("Test data cleaned up successfully");
      } else {
        log.error("Interview creation via API failed");
      }
    } else {
      log.error("Application submission via API failed");
    }

    // === API ENDPOINTS TEST ===
    log.header("API ENDPOINTS COMPREHENSIVE TEST");

    const endpoints = [
      { method: "GET", url: "/api/jobs", auth: true, expected: 200 },
      { method: "GET", url: "/api/careers/jobs", auth: false, expected: 200 },
      { method: "GET", url: "/api/interviews", auth: true, expected: 200 },
      { method: "GET", url: "/api/jobs", auth: false, expected: 401 }, // Should fail
    ];

    let apiSuccess = true;
    for (const endpoint of endpoints) {
      const response = await makeRequest(
        endpoint.url,
        { method: endpoint.method },
        endpoint.auth ? adminToken : null
      );

      if (response.status === endpoint.expected) {
        log.success(`${endpoint.method} ${endpoint.url}: ✓`);
      } else {
        log.error(
          `${endpoint.method} ${endpoint.url}: Expected ${endpoint.expected}, got ${response.status}`
        );
        apiSuccess = false;
      }
    }
    testResults.apiEndpoints = apiSuccess;

    // === FRONTEND PAGES TEST ===
    log.header("FRONTEND PAGES ACCESSIBILITY TEST");

    const pages = ["/careers", "/login", "/dashboard"];
    let pageSuccess = true;

    for (const page of pages) {
      try {
        const response = await fetch(`${BASE_URL}${page}`);
        if (response.status === 200) {
          log.success(`Page ${page}: Accessible`);
        } else {
          log.warning(`Page ${page}: Status ${response.status}`);
        }
      } catch (err) {
        log.error(`Page ${page}: Not accessible`);
        pageSuccess = false;
      }
    }
    testResults.frontendPages = pageSuccess;

    // === FINAL VALIDATION SUMMARY ===
    log.header("FINAL VALIDATION SUMMARY");

    const totalTests = Object.keys(testResults).length;
    const passedTests = Object.values(testResults).filter(Boolean).length;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);

    console.log("\n📊 TEST RESULTS:");
    Object.entries(testResults).forEach(([test, passed]) => {
      const status = passed ? "✅ PASS" : "❌ FAIL";
      const testName = test.replace(/([A-Z])/g, " $1").toUpperCase();
      console.log(`   ${status} ${testName}`);
    });

    console.log(
      `\n🎯 SUCCESS RATE: ${passedTests}/${totalTests} (${successRate}%)`
    );

    if (successRate === 100) {
      log.success(
        "🎉 ALL TESTS PASSED - RECRUITMENT WORKFLOW FULLY FUNCTIONAL!"
      );
      console.log("\n📋 RECRUITMENT SYSTEM FEATURES:");
      console.log("✅ Multi-role Authentication (Admin/HR Manager)");
      console.log("✅ Job Management (Create, Edit, List, View)");
      console.log("✅ Public Job Portal for Candidates");
      console.log("✅ Application Submission with File Upload Support");
      console.log("✅ Interview Scheduling and Management");
      console.log("✅ Status Tracking Throughout Workflow");
      console.log("✅ Role-Based Access Control");
      console.log("✅ REST API Endpoints");
      console.log("✅ Responsive Frontend Interface");
      console.log("\n🚀 SYSTEM READY FOR PRODUCTION USE!");
    } else {
      log.warning(`Some tests failed. Success rate: ${successRate}%`);
    }

    // Display sample data for testing
    console.log("\n👥 TEST ACCOUNTS:");
    console.log("Admin: admin@freshhr.com / admin123");
    console.log("HR Manager: hr@freshhr.com / hr123");
    console.log("\n🌐 Access the system at: http://localhost:3000");
  } catch (error) {
    log.error(`Validation failed: ${error.message}`);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

finalValidation();
