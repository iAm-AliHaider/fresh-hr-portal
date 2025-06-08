const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create test users
  const adminPassword = await bcrypt.hash("admin123", 10);
  const hrPassword = await bcrypt.hash("hr123", 10);
  const empPassword = await bcrypt.hash("emp123", 10);

  // Create Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@company.com" },
    update: {},
    create: {
      email: "admin@company.com",
      passwordHash: adminPassword,
      role: "ADMIN",
      isActive: true,
    },
  });

  // Create HR Manager User
  const hrUser = await prisma.user.upsert({
    where: { email: "hr@company.com" },
    update: {},
    create: {
      email: "hr@company.com",
      passwordHash: hrPassword,
      role: "HR_MANAGER",
      isActive: true,
    },
  });

  // Create Employee User
  const empUser = await prisma.user.upsert({
    where: { email: "employee@company.com" },
    update: {},
    create: {
      email: "employee@company.com",
      passwordHash: empPassword,
      role: "EMPLOYEE",
      isActive: true,
    },
  });

  // Create Employee profiles
  await prisma.employee.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      employeeId: "EMP001",
      firstName: "John",
      lastName: "Admin",
      phone: "+1-555-0101",
      department: "Administration",
      position: "System Administrator",
      hireDate: new Date("2023-01-15"),
      salary: 120000,
      status: "ACTIVE",
    },
  });

  await prisma.employee.upsert({
    where: { userId: hrUser.id },
    update: {},
    create: {
      userId: hrUser.id,
      employeeId: "EMP002",
      firstName: "Sarah",
      lastName: "Wilson",
      phone: "+1-555-0102",
      department: "Human Resources",
      position: "HR Manager",
      hireDate: new Date("2023-02-01"),
      salary: 95000,
      status: "ACTIVE",
    },
  });

  await prisma.employee.upsert({
    where: { userId: empUser.id },
    update: {},
    create: {
      userId: empUser.id,
      employeeId: "EMP003",
      firstName: "Mike",
      lastName: "Johnson",
      phone: "+1-555-0103",
      department: "Engineering",
      position: "Software Developer",
      hireDate: new Date("2023-03-15"),
      salary: 85000,
      status: "ACTIVE",
    },
  });

  // Create sample job postings
  const job1 = await prisma.job.create({
    data: {
      title: "Senior Software Engineer",
      description:
        "We are looking for an experienced software engineer to join our team. You will work on cutting-edge projects using modern technologies and collaborate with a talented team.",
      department: "Engineering",
      location: "Remote",
      employmentType: "FULL_TIME",
      salaryMin: 90000,
      salaryMax: 130000,
      requirements:
        "5+ years experience, React, Node.js, TypeScript, Strong problem-solving skills",
      benefits:
        "Health insurance, 401k, flexible hours, professional development budget",
      status: "OPEN",
    },
  });

  const job2 = await prisma.job.create({
    data: {
      title: "HR Coordinator",
      description:
        "Support HR operations and employee relations. Handle onboarding, benefits administration, and employee communications.",
      department: "Human Resources",
      location: "New York, NY",
      employmentType: "FULL_TIME",
      salaryMin: 50000,
      salaryMax: 65000,
      requirements:
        "Bachelor degree, 2+ years HR experience, excellent communication skills",
      benefits:
        "Health insurance, 401k, paid time off, professional development",
      status: "OPEN",
    },
  });

  const job3 = await prisma.job.create({
    data: {
      title: "Product Manager",
      description:
        "Lead product strategy and development for our core platform. Work closely with engineering and design teams.",
      department: "Product",
      location: "San Francisco, CA",
      employmentType: "FULL_TIME",
      salaryMin: 120000,
      salaryMax: 150000,
      requirements:
        "MBA preferred, 5+ years product management experience, technical background",
      benefits: "Health insurance, 401k, equity package, unlimited PTO",
      status: "OPEN",
    },
  });

  const job4 = await prisma.job.create({
    data: {
      title: "Marketing Intern",
      description:
        "Summer internship opportunity in our marketing department. Great learning experience for students.",
      department: "Marketing",
      location: "Chicago, IL",
      employmentType: "INTERN",
      salaryMin: 20,
      salaryMax: 25,
      requirements:
        "Currently enrolled in college, marketing or business major preferred",
      benefits: "Learning stipend, mentorship program",
      status: "PAUSED",
    },
  });

  // Create sample applications
  await prisma.application.create({
    data: {
      jobId: job1.id,
      candidateName: "Alice Smith",
      candidateEmail: "alice.smith@email.com",
      candidatePhone: "+1-555-0201",
      coverLetter:
        "I am very interested in this Senior Software Engineer position and believe my 7 years of experience with React and Node.js makes me a great fit for your team.",
      status: "SUBMITTED",
    },
  });

  await prisma.application.create({
    data: {
      jobId: job1.id,
      candidateName: "Carlos Rodriguez",
      candidateEmail: "carlos.rodriguez@email.com",
      candidatePhone: "+1-555-0203",
      coverLetter:
        "As a full-stack developer with extensive TypeScript experience, I'm excited about the opportunity to contribute to your engineering team.",
      status: "REVIEWED",
      interviewDate: new Date("2024-02-15T10:00:00Z"),
    },
  });

  await prisma.application.create({
    data: {
      jobId: job2.id,
      candidateName: "Bob Davis",
      candidateEmail: "bob.davis@email.com",
      candidatePhone: "+1-555-0202",
      coverLetter:
        "I have extensive experience in HR and would love to contribute to your team. My background in employee relations and benefits administration aligns perfectly with this role.",
      status: "REVIEWED",
    },
  });

  await prisma.application.create({
    data: {
      jobId: job3.id,
      candidateName: "Emily Chen",
      candidateEmail: "emily.chen@email.com",
      candidatePhone: "+1-555-0204",
      coverLetter:
        "With my MBA and 6 years of product management experience at tech startups, I'm excited to bring my strategic thinking to your product team.",
      status: "INTERVIEW_SCHEDULED",
      interviewDate: new Date("2024-02-20T14:00:00Z"),
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log("\n📊 Sample Data Created:");
  console.log("• 3 Users (Admin, HR Manager, Employee)");
  console.log("• 3 Employee profiles");
  console.log("• 4 Job postings (3 open, 1 paused)");
  console.log("• 4 Job applications (various statuses)");
  console.log("\n🔑 Test Accounts:");
  console.log("Admin: admin@company.com / admin123");
  console.log("HR Manager: hr@company.com / hr123");
  console.log("Employee: employee@company.com / emp123");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
