const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createTestUsers() {
  console.log("🔑 Creating test users for Fresh HR Portal...");

  try {
    // Create test users with hashed passwords
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

    console.log("✅ Test users created successfully!");
    console.log("\n🔑 Login Credentials:");
    console.log("Admin: admin@company.com / admin123");
    console.log("HR Manager: hr@company.com / hr123");
    console.log("Employee: employee@company.com / emp123");
  } catch (error) {
    console.error("❌ Error creating test users:", error);
    throw error;
  }
}

createTestUsers()
  .catch((e) => {
    console.error("Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
