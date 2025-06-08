const { PrismaClient } = require('@prisma/client');

async function checkAndCreateJobs() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking jobs in database...');
    
    const jobs = await prisma.job.findMany();
    console.log(`Found ${jobs.length} jobs in database`);
    
    if (jobs.length === 0) {
      console.log('📝 Creating sample jobs...');
      
      // Create sample jobs
      const sampleJobs = [
        {
          title: "Senior Software Engineer",
          description: "We are looking for an experienced Senior Software Engineer to join our dynamic development team. You will be responsible for designing, developing, and maintaining high-quality software solutions that meet our business requirements.",
          department: "Engineering",
          location: "San Francisco, CA",
          employmentType: "FULL_TIME",
          salaryMin: 120000,
          salaryMax: 160000,
          requirements: "• Bachelor's degree in Computer Science or related field\n• 5+ years of software development experience\n• Strong proficiency in JavaScript, TypeScript, React\n• Experience with Node.js and database systems\n• Excellent problem-solving skills",
          benefits: "• Competitive salary and equity package\n• Health, dental, and vision insurance\n• Flexible work arrangements\n• Professional development budget\n• 401(k) with company matching",
          status: "OPEN",
          postedDate: new Date(),
          closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        },
        {
          title: "Product Manager",
          description: "Join our product team to help shape the future of our HR technology platform. You'll work closely with engineering, design, and business stakeholders to deliver exceptional user experiences.",
          department: "Product",
          location: "New York, NY",
          employmentType: "FULL_TIME",
          salaryMin: 110000,
          salaryMax: 140000,
          requirements: "• 3+ years of product management experience\n• Strong analytical and problem-solving skills\n• Experience with agile development methodologies\n• Excellent communication and leadership abilities\n• Background in B2B SaaS products preferred",
          benefits: "• Competitive compensation package\n• Comprehensive health benefits\n• Stock options\n• Remote work flexibility\n• Annual learning stipend",
          status: "OPEN",
          postedDate: new Date(),
          closingDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000) // 45 days from now
        },
        {
          title: "UX/UI Designer",
          description: "We're seeking a talented UX/UI Designer to create intuitive and beautiful user interfaces for our HR management platform. You'll work on designing user-centered experiences that delight our customers.",
          department: "Design",
          location: "Austin, TX",
          employmentType: "FULL_TIME",
          salaryMin: 85000,
          salaryMax: 115000,
          requirements: "• 3+ years of UX/UI design experience\n• Proficiency in Figma, Sketch, or similar design tools\n• Strong portfolio demonstrating design thinking\n• Experience with user research and testing\n• Understanding of web and mobile design principles",
          benefits: "• Creative and collaborative work environment\n• Health and wellness benefits\n• Flexible PTO policy\n• Design conference attendance\n• Top-tier design tools and equipment",
          status: "OPEN",
          postedDate: new Date(),
          closingDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days from now
        }
      ];
      
      for (const jobData of sampleJobs) {
        const job = await prisma.job.create({
          data: jobData
        });
        console.log(`✅ Created job: ${job.title} (ID: ${job.id})`);
      }
      
      console.log('\n🎉 Sample jobs created successfully!');
      
    } else {
      console.log('\nExisting jobs:');
      jobs.forEach(job => {
        console.log(`- ID: ${job.id} | Title: ${job.title} | Status: ${job.status}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndCreateJobs(); 