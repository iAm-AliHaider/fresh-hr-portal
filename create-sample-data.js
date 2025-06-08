const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function createSampleData() {
  console.log("🌱 Creating sample data...");

  try {
    // Create sample users
    const hashedPassword = await bcrypt.hash("password123", 10);

    const adminUser = await prisma.user.create({
      data: {
        email: "admin@company.com",
        passwordHash: hashedPassword,
        role: "ADMIN",
      },
    });

    const hrUser = await prisma.user.create({
      data: {
        email: "hr@company.com",
        passwordHash: hashedPassword,
        role: "HR_MANAGER",
      },
    });

    console.log("✅ Created users");

    // Create sample employees
    const adminEmployee = await prisma.employee.create({
      data: {
        userId: adminUser.id,
        employeeId: "EMP001",
        firstName: "Admin",
        lastName: "User",
        department: "Administration",
        position: "System Administrator",
        hireDate: new Date(),
        salary: 75000,
        status: "ACTIVE",
        phone: "+1234567890",
      },
    });

    const hrEmployee = await prisma.employee.create({
      data: {
        userId: hrUser.id,
        employeeId: "EMP002",
        firstName: "HR",
        lastName: "Manager",
        department: "Human Resources",
        position: "HR Manager",
        hireDate: new Date(),
        salary: 70000,
        status: "ACTIVE",
        phone: "+1234567891",
      },
    });

    console.log("✅ Created employees");

    // Create sample jobs
    const jobs = await Promise.all([
      prisma.job.create({
        data: {
          title: "Senior Software Engineer",
          description:
            "We are looking for an experienced software engineer to join our development team.",
          department: "Engineering",
          location: "Remote",
          employmentType: "FULL_TIME",
          salaryMin: 80000,
          salaryMax: 120000,
          requirements:
            "5+ years of experience in software development, proficiency in JavaScript/TypeScript, React, Node.js",
          benefits:
            "Health insurance, 401k, flexible work hours, remote work options",
          status: "OPEN",
          postedDate: new Date(),
        },
      }),

      prisma.job.create({
        data: {
          title: "Product Manager",
          description:
            "Join our product team to drive innovation and deliver exceptional user experiences.",
          department: "Product",
          location: "New York, NY",
          employmentType: "FULL_TIME",
          salaryMin: 90000,
          salaryMax: 130000,
          requirements:
            "3+ years of product management experience, strong analytical skills, user-centric mindset",
          benefits:
            "Health insurance, 401k, stock options, professional development budget",
          status: "OPEN",
          postedDate: new Date(),
        },
      }),

      prisma.job.create({
        data: {
          title: "UX Designer",
          description:
            "Create beautiful and intuitive user experiences for our web and mobile applications.",
          department: "Design",
          location: "San Francisco, CA",
          employmentType: "FULL_TIME",
          salaryMin: 70000,
          salaryMax: 100000,
          requirements:
            "Portfolio demonstrating UX/UI design skills, proficiency in Figma, user research experience",
          benefits:
            "Health insurance, 401k, creative workspace, design conference budget",
          status: "OPEN",
          postedDate: new Date(),
        },
      }),

      prisma.job.create({
        data: {
          title: "API Test Developer",
          description: "Testing job creation via API",
          department: "Engineering",
          location: "Remote",
          employmentType: "FULL_TIME",
          salaryMin: 80000,
          salaryMax: 120000,
          requirements: "API testing experience",
          benefits: "Standard benefits package",
          status: "OPEN",
          postedDate: new Date(),
        },
      }),
    ]);

    console.log("✅ Created jobs");

    // Create sample applications
    const applications = await Promise.all([
      prisma.application.create({
        data: {
          jobId: jobs[0].id,
          candidateName: "Sarah Johnson",
          candidateEmail: "sarah.johnson@email.com",
          candidatePhone: "+1234567892",
          coverLetter:
            "I am excited to apply for the Senior Software Engineer position. With over 6 years of experience in full-stack development...",
          status: "SUBMITTED",
          appliedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        },
      }),

      prisma.application.create({
        data: {
          jobId: jobs[1].id,
          candidateName: "Michael Chen",
          candidateEmail: "michael.chen@email.com",
          candidatePhone: "+1234567893",
          coverLetter:
            "I believe my product management experience at tech startups makes me an ideal candidate...",
          status: "REVIEWED",
          appliedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        },
      }),

      prisma.application.create({
        data: {
          jobId: jobs[2].id,
          candidateName: "Emily Rodriguez",
          candidateEmail: "emily.rodriguez@email.com",
          candidatePhone: "+1234567894",
          coverLetter:
            "As a UX designer with a passion for creating user-centered designs...",
          status: "INTERVIEW",
          appliedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        },
      }),

      prisma.application.create({
        data: {
          jobId: jobs[3].id,
          candidateName: "API Test Candidate",
          candidateEmail: "api.test@email.com",
          candidatePhone: "+1234567895",
          coverLetter: "Test application for API testing job",
          status: "SUBMITTED",
          appliedDate: new Date(),
        },
      }),
    ]);

    console.log("✅ Created applications");

    // Create sample interviews
    const interviews = await Promise.all([
      prisma.interview.create({
        data: {
          applicationId: applications[2].id,
          jobId: jobs[2].id,
          candidateName: "Emily Rodriguez",
          candidateEmail: "emily.rodriguez@email.com",
          interviewType: "VIDEO",
          scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          duration: 60,
          meetingLink: "https://zoom.us/j/123456789",
          status: "SCHEDULED",
          notes:
            "First round interview focusing on portfolio review and design process",
        },
      }),

      prisma.interview.create({
        data: {
          applicationId: applications[3].id,
          jobId: jobs[3].id,
          candidateName: "API Test Candidate",
          candidateEmail: "api.test@email.com",
          interviewType: "VIDEO",
          scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
          duration: 60,
          meetingLink: "https://zoom.us/j/987654321",
          status: "SCHEDULED",
          notes: "Technical interview for API testing position",
        },
      }),
    ]);

    console.log("✅ Created interviews");

    console.log("\n🎉 Sample data created successfully!");
    console.log("\n📋 Login Credentials:");
    console.log("Admin: admin@company.com / password123");
    console.log("HR Manager: hr@company.com / password123");

    console.log("\n📊 Sample Data Created:");
    console.log(`- ${jobs.length} job postings`);
    console.log(`- ${applications.length} applications`);
    console.log(`- ${interviews.length} interviews scheduled`);
    console.log(`- 2 users (Admin & HR Manager)`);
  } catch (error) {
    console.error("❌ Error creating sample data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleData();
