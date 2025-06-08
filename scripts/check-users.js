const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkUsers() {
  console.log("=== FRESH HR PORTAL USERS ===");

  try {
    const users = await prisma.user.findMany();

    if (users.length === 0) {
      console.log("No users found in database");
    } else {
      users.forEach((user) => {
        console.log(
          `Email: ${user.email} | Role: ${user.role} | Active: ${user.isActive}`
        );
      });
    }
  } catch (error) {
    console.error("Error checking users:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
