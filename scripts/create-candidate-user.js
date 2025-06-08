const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createCandidateUser() {
  console.log("🔑 Creating candidate test user...");

  try {
    const candidatePassword = await bcrypt.hash("candidate123", 10);

    // Create Candidate User
    const candidateUser = await prisma.user.upsert({
      where: { email: "candidate@company.com" },
      update: {},
      create: {
        email: "candidate@company.com",
        passwordHash: candidatePassword,
        role: "CANDIDATE",
        isActive: true,
      },
    });

    console.log("✅ Candidate user created successfully!");
    console.log("\n🔑 Candidate Login Credentials:");
    console.log("Email: candidate@company.com");
    console.log("Password: candidate123");
    
  } catch (error) {
    console.error("❌ Error creating candidate user:", error);
    throw error;
  }
}

createCandidateUser()
  .catch((e) => {
    console.error("Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 