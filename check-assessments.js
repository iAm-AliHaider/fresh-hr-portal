const { PrismaClient } = require('@prisma/client');

async function checkAssessments() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking assessments and interviews...');
    
    const interviews = await prisma.interview.findMany({
      include: {
        job: true
      }
    });
    console.log(`Found ${interviews.length} interviews in database`);
    
    const assessments = await prisma.assessment.findMany({
      include: {
        interview: {
          include: {
            job: true
          }
        }
      }
    });
    console.log(`Found ${assessments.length} assessments in database`);
    
    if (interviews.length > 0) {
      console.log('\nInterviews:');
      interviews.forEach(interview => {
        console.log(`- ID: ${interview.id} | Candidate: ${interview.candidateName} | Job: ${interview.job.title} | Status: ${interview.status}`);
      });
    }
    
    if (assessments.length > 0) {
      console.log('\nAssessments:');
      assessments.forEach(assessment => {
        console.log(`- Interview ID: ${assessment.interviewId} | Candidate: ${assessment.interview.candidateName} | Rating: ${assessment.overallRating}/10`);
      });
    }
    
    // If there are interviews but no assessments, this is normal
    // If there are both, we need to check for the specific case causing 409
    if (interviews.length > 0 && assessments.length > 0) {
      console.log('\n🔍 Checking for potential conflicts...');
      const interviewsWithAssessments = interviews.filter(interview => 
        assessments.some(assessment => assessment.interviewId === interview.id)
      );
      console.log(`Interviews with assessments: ${interviewsWithAssessments.length}`);
      
      const interviewsWithoutAssessments = interviews.filter(interview => 
        !assessments.some(assessment => assessment.interviewId === interview.id)
      );
      console.log(`Interviews without assessments: ${interviewsWithoutAssessments.length}`);
      
      if (interviewsWithoutAssessments.length > 0) {
        console.log('\nInterviews that can have assessments added:');
        interviewsWithoutAssessments.forEach(interview => {
          console.log(`- ${interview.candidateName} (${interview.job.title}) - Status: ${interview.status}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAssessments(); 