import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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
        "We are looking for an experienced software engineer to join our team.",
      department: "Engineering",
      location: "Remote",
      employmentType: "FULL_TIME",
      salaryMin: 90000,
      salaryMax: 130000,
      requirements: "5+ years experience, React, Node.js, TypeScript",
      benefits: "Health insurance, 401k, flexible hours",
      status: "OPEN",
    },
  });

  const job2 = await prisma.job.create({
    data: {
      title: "HR Coordinator",
      description: "Support HR operations and employee relations.",
      department: "Human Resources",
      location: "New York, NY",
      employmentType: "FULL_TIME",
      salaryMin: 50000,
      salaryMax: 65000,
      requirements: "Bachelor degree, 2+ years HR experience",
      benefits: "Health insurance, 401k, paid time off",
      status: "OPEN",
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
        "I am very interested in this position and believe my experience makes me a great fit.",
      status: "SUBMITTED",
    },
  });

  await prisma.application.create({
    data: {
      jobId: job2.id,
      candidateName: "Bob Davis",
      candidateEmail: "bob.davis@email.com",
      candidatePhone: "+1-555-0202",
      coverLetter:
        "I have extensive experience in HR and would love to contribute to your team.",
      status: "REVIEWED",
    },
  });

  console.log("✅ Database seeded successfully!");
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
