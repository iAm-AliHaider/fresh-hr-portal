const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function seedSampleData() {
  try {
    console.log("🌱 Seeding sample data...");

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 12);
    const adminUser = await prisma.user.upsert({
      where: { email: "admin@freshhr.com" },
      update: {},
      create: {
        email: "admin@freshhr.com",
        passwordHash: hashedPassword,
        role: "ADMIN",
        isActive: true,
      },
    });

    // Create HR Manager user
    const hrPassword = await bcrypt.hash("hr123", 12);
    const hrUser = await prisma.user.upsert({
      where: { email: "hr@freshhr.com" },
      update: {},
      create: {
        email: "hr@freshhr.com",
        passwordHash: hrPassword,
        role: "HR_MANAGER",
        isActive: true,
      },
    });

    console.log("✅ Users created");

    // Create sample jobs
    const job1 = await prisma.job.create({
      data: {
        title: "Senior Software Engineer",
        description:
          "We are looking for a senior software engineer to join our team...",
        department: "Engineering",
        location: "Remote",
        employmentType: "Full-time",
        salaryMin: 80000,
        salaryMax: 120000,
        requirements: "5+ years of experience with JavaScript, React, Node.js",
        benefits: "Health insurance, 401k, flexible PTO",
        status: "OPEN",
        postedDate: new Date(),
        closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    });

    const job2 = await prisma.job.create({
      data: {
        title: "UX/UI Designer",
        description:
          "Join our design team to create amazing user experiences...",
        department: "Design",
        location: "San Francisco, CA",
        employmentType: "Full-time",
        salaryMin: 70000,
        salaryMax: 100000,
        requirements: "3+ years of experience with Figma, Adobe Creative Suite",
        benefits: "Health insurance, 401k, creative freedom",
        status: "OPEN",
        postedDate: new Date(),
        closingDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      },
    });

    const job3 = await prisma.job.create({
      data: {
        title: "Marketing Manager",
        description: "Lead our marketing efforts and drive growth...",
        department: "Marketing",
        location: "New York, NY",
        employmentType: "Full-time",
        salaryMin: 60000,
        salaryMax: 90000,
        requirements:
          "4+ years of marketing experience, digital marketing skills",
        benefits: "Health insurance, 401k, marketing budget",
        status: "OPEN",
        postedDate: new Date(),
        closingDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      },
    });

    console.log("✅ Jobs created");

    // Create sample applications
    const applications = [
      {
        jobId: job1.id,
        candidateName: "John Smith",
        candidateEmail: "john.smith@email.com",
        candidatePhone: "+1-555-0101",
        coverLetter:
          "I am excited to apply for the Senior Software Engineer position...",
        status: "SUBMITTED",
        appliedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        jobId: job1.id,
        candidateName: "Sarah Johnson",
        candidateEmail: "sarah.johnson@email.com",
        candidatePhone: "+1-555-0102",
        coverLetter: "With 6 years of full-stack development experience...",
        status: "REVIEWED",
        appliedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        jobId: job1.id,
        candidateName: "Mike Chen",
        candidateEmail: "mike.chen@email.com",
        candidatePhone: "+1-555-0103",
        coverLetter: "I bring deep expertise in React and Node.js...",
        status: "REVIEWED",
        appliedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        jobId: job2.id,
        candidateName: "Emily Davis",
        candidateEmail: "emily.davis@email.com",
        candidatePhone: "+1-555-0201",
        coverLetter:
          "As a passionate UX designer with 4 years of experience...",
        status: "REVIEWED",
        appliedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      },
      {
        jobId: job2.id,
        candidateName: "Alex Rodriguez",
        candidateEmail: "alex.rodriguez@email.com",
        candidatePhone: "+1-555-0202",
        coverLetter: "I specialize in user-centered design and have worked...",
        status: "SUBMITTED",
        appliedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        jobId: job3.id,
        candidateName: "Lisa Thompson",
        candidateEmail: "lisa.thompson@email.com",
        candidatePhone: "+1-555-0301",
        coverLetter:
          "I have successfully led marketing campaigns that increased...",
        status: "REVIEWED",
        appliedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
      },
    ];

    for (const app of applications) {
      await prisma.application.create({ data: app });
    }

    console.log("✅ Applications created");

    // Create a sample interview
    const sampleApplication = await prisma.application.findFirst({
      where: { status: "REVIEWED" },
    });

    if (sampleApplication) {
      await prisma.interview.create({
        data: {
          applicationId: sampleApplication.id,
          jobId: sampleApplication.jobId,
          candidateName: sampleApplication.candidateName,
          candidateEmail: sampleApplication.candidateEmail,
          interviewType: "VIDEO",
          scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          duration: 60,
          meetingLink: "https://zoom.us/j/123456789",
          status: "SCHEDULED",
          notes: "Technical interview with the engineering team",
        },
      });

      // Update application status to INTERVIEW
      await prisma.application.update({
        where: { id: sampleApplication.id },
        data: { status: "INTERVIEW" },
      });

      console.log("✅ Sample interview created");
    }

    console.log("🎉 Sample data seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSampleData();
