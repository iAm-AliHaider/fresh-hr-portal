const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function checkDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== Checking Database Users ===');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        passwordHash: true
      }
    });
    
    if (users.length === 0) {
      console.log('❌ No users found in database!');
      
      // Create test users
      console.log('Creating test users...');
      
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await prisma.user.create({
        data: {
          email: 'admin@company.com',
          passwordHash: hashedPassword,
          role: 'ADMIN',
          isActive: true
        }
      });
      
      console.log('✅ Created admin@company.com with password: admin123');
      
    } else {
      console.log(`Found ${users.length} users:`);
      
      for (const user of users) {
        console.log(`- ${user.email} | Role: ${user.role} | Active: ${user.isActive}`);
        
        if (user.email === 'admin@company.com') {
          const isValidPassword = await bcrypt.compare('admin123', user.passwordHash);
          console.log(`  Password test for admin123: ${isValidPassword ? '✅ VALID' : '❌ INVALID'}`);
        }
      }
    }
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase(); 