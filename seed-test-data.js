const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedTestData() {
  try {
    console.log('🌱 Seeding test data...');

    // Create test jobs
    const existingJob1 = await prisma.job.findFirst({ where: { title: 'Senior Software Engineer' } });
    let job1;
    if (!existingJob1) {
      job1 = await prisma.job.create({
        data: {
          title: 'Senior Software Engineer',
          description: 'We are looking for a skilled Senior Software Engineer to join our dynamic development team. You will be responsible for designing, developing, and maintaining high-quality software applications.',
          department: 'Engineering',
          location: 'San Francisco, CA',
          employmentType: 'FULL_TIME',
          salaryMin: 120000,
          salaryMax: 160000,
          requirements: 'Bachelor\'s degree in Computer Science or related field\n5+ years of experience in software development\nProficiency in React, Node.js, and TypeScript\nExperience with cloud platforms (AWS, Azure, or GCP)',
          benefits: 'Competitive salary and equity package\nComprehensive health, dental, and vision insurance\nFlexible work arrangements\nProfessional development opportunities',
          status: 'OPEN',
        },
      });
    } else {
      job1 = existingJob1;
    }

    const existingJob2 = await prisma.job.findFirst({ where: { title: 'Product Manager' } });
    let job2;
    if (!existingJob2) {
      job2 = await prisma.job.create({
        data: {
          title: 'Product Manager',
          description: 'Join our product team as a Product Manager and help shape the future of our platform. You will work closely with engineering, design, and marketing teams to deliver exceptional user experiences.',
          department: 'Product',
          location: 'New York, NY',
          employmentType: 'FULL_TIME',
          salaryMin: 100000,
          salaryMax: 140000,
          requirements: 'Bachelor\'s degree in Business, Engineering, or related field\n3+ years of product management experience\nStrong analytical and problem-solving skills\nExperience with agile development methodologies',
          benefits: 'Competitive salary and bonus structure\nStock options\nHealth and wellness benefits\nFlexible PTO policy',
          status: 'OPEN',
        },
      });
    } else {
      job2 = existingJob2;
    }

    const existingJob3 = await prisma.job.findFirst({ where: { title: 'UX Designer' } });
    let job3;
    if (!existingJob3) {
      job3 = await prisma.job.create({
        data: {
          title: 'UX Designer',
          description: 'We\'re seeking a talented UX Designer to create intuitive and engaging user experiences for our products. You will collaborate with cross-functional teams to research, design, and test user interfaces.',
          department: 'Design',
          location: 'Remote',
          employmentType: 'FULL_TIME',
          salaryMin: 80000,
          salaryMax: 110000,
          requirements: 'Bachelor\'s degree in Design, HCI, or related field\n3+ years of UX design experience\nProficiency in Figma, Sketch, or Adobe Creative Suite\nStrong portfolio demonstrating design thinking',
          benefits: 'Remote-first culture\nCompetitive compensation\nHealth benefits\nLearning and development budget',
          status: 'OPEN',
        },
      });
    } else {
      job3 = existingJob3;
    }

    console.log('✅ Jobs created successfully');

    // Create test applications only if they don't exist
    const existingApp1 = await prisma.application.findFirst({ 
      where: { candidateEmail: 'john.doe@example.com', jobId: job1.id } 
    });
    if (!existingApp1) {
      await prisma.application.create({
        data: {
          jobId: job1.id,
          candidateName: 'John Doe',
          candidateEmail: 'john.doe@example.com',
          candidatePhone: '+1-555-0123',
          coverLetter: 'I am excited to apply for the Senior Software Engineer position. With my 6 years of experience in full-stack development and expertise in React and Node.js, I believe I would be a great fit for your team.',
          status: 'REVIEWED',
          notes: 'Strong candidate with relevant experience',
        },
      });
    }

    const existingApp2 = await prisma.application.findFirst({ 
      where: { candidateEmail: 'jane.smith@example.com', jobId: job2.id } 
    });
    if (!existingApp2) {
      await prisma.application.create({
        data: {
          jobId: job2.id,
          candidateName: 'Jane Smith',
          candidateEmail: 'jane.smith@example.com',
          candidatePhone: '+1-555-0456',
          coverLetter: 'I am writing to express my interest in the Product Manager role. My background in product strategy and user research makes me well-suited for this position.',
          status: 'INTERVIEW',
          notes: 'Scheduled for technical interview',
        },
      });
    }

    const existingApp3 = await prisma.application.findFirst({ 
      where: { candidateEmail: 'alice.johnson@example.com', jobId: job3.id } 
    });
    if (!existingApp3) {
      await prisma.application.create({
        data: {
          jobId: job3.id,
          candidateName: 'Alice Johnson',
          candidateEmail: 'alice.johnson@example.com',
          candidatePhone: '+1-555-0789',
          coverLetter: 'As a passionate UX designer with a strong portfolio in user-centered design, I am thrilled to apply for the UX Designer position at your company.',
          status: 'OFFERED',
          notes: 'Excellent portfolio and interview performance',
        },
      });
    }

    // Add a test candidate account that matches one of the applications
    const existingTestApp = await prisma.application.findFirst({ 
      where: { candidateEmail: 'test@candidate.com' } 
    });
    if (!existingTestApp) {
      await prisma.application.create({
        data: {
          jobId: job1.id,
          candidateName: 'Test Candidate',
          candidateEmail: 'test@candidate.com',
          candidatePhone: '+1-555-0000',
          coverLetter: 'This is a test application for the candidate portal demonstration.',
          status: 'SUBMITTED',
          notes: 'Test application for demo purposes',
        },
      });
    }

    console.log('✅ Applications created successfully');

    console.log('\n🎉 Test data seeded successfully!');
    console.log('\nTest Accounts:');
    console.log('- Candidate: test@candidate.com (for candidate portal)');
    console.log('- Applications for: john.doe@example.com, jane.smith@example.com, alice.johnson@example.com');
    console.log('\nYou can now test the candidate portal and job management features!');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTestData(); 