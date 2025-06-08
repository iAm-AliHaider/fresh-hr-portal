const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function quickTest() {
  try {
    console.log('Adding sample job...');
    
    const job = await prisma.job.create({
      data: {
        title: 'Software Engineer',
        description: 'We are looking for a software engineer to join our team.',
        department: 'Engineering',
        location: 'San Francisco',
        employmentType: 'FULL_TIME',
        status: 'OPEN'
      }
    });

    console.log('Job created:', job.id);

    console.log('Adding sample application...');
    
    const application = await prisma.application.create({
      data: {
        jobId: job.id,
        candidateName: 'Test Candidate',
        candidateEmail: 'test@candidate.com',
        coverLetter: 'I am interested in this position.',
        status: 'SUBMITTED'
      }
    });

    console.log('Application created:', application.id);

    console.log('Adding test employee user...');
    
    // Check if employee user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'employee@company.com' }
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('employee123', 10);
      
      const testUser = await prisma.user.create({
        data: {
          email: 'employee@company.com',
          passwordHash: hashedPassword,
          role: 'EMPLOYEE',
          isActive: true
        }
      });

      const testEmployee = await prisma.employee.create({
        data: {
          userId: testUser.id,
          employeeId: 'EMP-001',
          firstName: 'Test',
          lastName: 'Employee',
          department: 'HR',
          position: 'HR Manager',
          hireDate: new Date(),
          status: 'ACTIVE'
        }
      });

      console.log('Test employee created:', testEmployee.id);
    } else {
      console.log('Test employee already exists');
    }

    console.log('✅ Test data added successfully!');
    console.log('Test accounts:');
    console.log('- Candidate: test@candidate.com (for candidate portal)');
    console.log('- Employee: employee@company.com / employee123 (for job management)');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

quickTest(); 