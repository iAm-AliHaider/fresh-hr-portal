const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function quickCheck() {
  try {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        role: true,
        isActive: true
      }
    });
    
    console.log('=== DATABASE USERS ===');
    console.log(`Total users: ${users.length}`);
    
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - ${user.isActive ? 'Active' : 'Inactive'}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

quickCheck(); 