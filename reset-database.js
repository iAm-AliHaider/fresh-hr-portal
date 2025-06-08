const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetDatabase() {
  try {
    console.log('🗑️  Clearing all existing data...');
    
    // Delete in order to respect foreign key constraints
    await prisma.assessment.deleteMany();
    await prisma.interview.deleteMany();
    await prisma.application.deleteMany();
    await prisma.job.deleteMany();
    await prisma.employee.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('✅ All existing data cleared');
    
    console.log('👥 Creating fresh user accounts...');
    
    // Create users with consistent passwords
    const users = [
      {
        email: 'admin@company.com',
        password: 'admin123',
        role: 'ADMIN'
      },
      {
        email: 'hr@company.com',
        password: 'hr123', 
        role: 'HR_MANAGER'
      },
      {
        email: 'employee@company.com',
        password: 'employee123',
        role: 'EMPLOYEE'
      },
      {
        email: 'candidate@company.com',
        password: 'candidate123',
        role: 'CANDIDATE'
      }
    ];
    
    const createdUsers = [];
    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          passwordHash: hashedPassword,
          role: userData.role
        }
      });
      createdUsers.push(user);
      console.log(`✅ Created user: ${userData.email} (${userData.role})`);
    }
    
    console.log('💼 Creating fresh job postings...');
    
    // Create jobs
    const jobs = [
      {
        title: 'Senior Software Engineer',
        description: 'We are looking for an experienced software engineer to join our team. You will be responsible for designing, developing, and maintaining scalable web applications.',
        department: 'Engineering',
        location: 'Remote',
        employmentType: 'FULL_TIME',
        salaryMin: 90000,
        salaryMax: 120000,
        requirements: '5+ years of experience in JavaScript, React, Node.js. Experience with databases and cloud platforms.',
        benefits: 'Health insurance, 401k matching, flexible work hours, professional development budget.',
        status: 'OPEN'
      },
      {
        title: 'Product Manager',
        description: 'Lead product strategy and development for our core platform. Work closely with engineering, design, and business teams.',
        department: 'Product',
        location: 'New York, NY',
        employmentType: 'FULL_TIME',
        salaryMin: 100000,
        salaryMax: 140000,
        requirements: '3+ years product management experience, MBA preferred, experience with agile methodologies.',
        benefits: 'Health insurance, stock options, unlimited PTO, gym membership.',
        status: 'OPEN'
      },
      {
        title: 'UX/UI Designer',
        description: 'Create beautiful and intuitive user experiences for our web and mobile applications.',
        department: 'Design',
        location: 'San Francisco, CA',
        employmentType: 'FULL_TIME',
        salaryMin: 80000,
        salaryMax: 110000,
        requirements: 'Portfolio demonstrating UX/UI skills, proficiency in Figma/Sketch, understanding of front-end technologies.',
        benefits: 'Health insurance, creative workspace, latest design tools, conference budget.',
        status: 'OPEN'
      }
    ];
    
    const createdJobs = [];
    for (const jobData of jobs) {
      const job = await prisma.job.create({
        data: {
          ...jobData,
          postedDate: new Date(),
          closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        }
      });
      createdJobs.push(job);
      console.log(`✅ Created job: ${jobData.title}`);
    }
    
    console.log('📄 Creating sample applications...');
    
    // Create sample applications
    const candidate = createdUsers.find(u => u.role === 'CANDIDATE');
    if (candidate && createdJobs.length > 0) {
      const application = await prisma.application.create({
        data: {
          jobId: createdJobs[0].id,
          candidateName: 'Test Candidate',
          candidateEmail: candidate.email,
          coverLetter: 'I am very interested in this position and believe my skills align well with your requirements.',
          status: 'SUBMITTED',
          appliedDate: new Date()
        }
      });
      console.log(`✅ Created application for: ${createdJobs[0].title}`);
      
      // Create an interview for this application
      console.log('🎤 Creating sample interview...');
      const interview = await prisma.interview.create({
        data: {
          applicationId: application.id,
          jobId: createdJobs[0].id,
          candidateName: 'Test Candidate',
          candidateEmail: candidate.email,
          scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          status: 'SCHEDULED',
          notes: 'Initial technical screening interview'
        }
      });
      console.log(`✅ Created interview for application`);
      
      // Create an assessment for this interview
      console.log('📝 Creating sample assessment...');
      await prisma.assessment.create({
        data: {
          interviewId: interview.id,
          technicalSkills: 8,
          communication: 9,
          culturalFit: 9,
          overallRating: 8,
          recommendation: 'HIRE',
          createdBy: 'hr@company.com'
        }
      });
      console.log(`✅ Created assessment for interview`);
    }
    
    console.log('\n🎉 Database reset complete!');
    console.log('\n📊 Summary:');
    console.log(`Users: ${createdUsers.length}`);
    console.log(`Jobs: ${createdJobs.length}`);
    console.log(`Applications: 1`);
    console.log(`Interviews: 1`);
    console.log(`Assessments: 1`);
    
    console.log('\n🔑 Login Credentials:');
    users.forEach(user => {
      console.log(`${user.email} | ${user.password} | ${user.role}`);
    });
    
  } catch (error) {
    console.error('❌ Error resetting database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase(); 