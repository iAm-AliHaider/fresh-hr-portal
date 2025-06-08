const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkApplicationStatuses() {
  try {
    console.log("📋 Checking Application Statuses...\n");

    const applications = await prisma.application.findMany({
      include: {
        job: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        appliedDate: "desc",
      },
    });

    if (applications.length === 0) {
      console.log("No applications found.");
      return;
    }

    console.log("Applications by Status:");
    console.log("======================");

    const statusCounts = {};

    applications.forEach((app) => {
      if (!statusCounts[app.status]) {
        statusCounts[app.status] = 0;
      }
      statusCounts[app.status]++;

      console.log(`${app.candidateName} (${app.job.title}): ${app.status}`);
    });

    console.log("\nStatus Summary:");
    console.log("===============");
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`${status}: ${count} applications`);
    });

    // Check specifically for REVIEWED status
    const reviewedApps = applications.filter(
      (app) => app.status === "REVIEWED"
    );
    console.log(
      `\n🎯 Applications available for interview scheduling (REVIEWED): ${reviewedApps.length}`
    );

    if (reviewedApps.length > 0) {
      console.log("REVIEWED Applications:");
      reviewedApps.forEach((app) => {
        console.log(`  - ${app.candidateName} for ${app.job.title}`);
      });
    } else {
      console.log("⚠️ No applications found with REVIEWED status!");
      console.log("\n💡 To schedule interviews, you need to:");
      console.log("1. Review submitted applications");
      console.log('2. Update their status to "REVIEWED"');
      console.log("3. Then they will appear in the interview scheduling form");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkApplicationStatuses();
