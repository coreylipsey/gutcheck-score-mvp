import { onCall } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Set global options for all functions
setGlobalOptions({ maxInstances: 10 });

// Create partner cohort
export const createPartnerCohort = onCall(async (request) => {
  try {
    const { partnerName, cohortName, partnerEmail, expectedParticipants } = request.data;

    // Validate required fields
    if (!partnerName || !cohortName || !partnerEmail || !expectedParticipants) {
      throw new Error('Missing required fields: partnerName, cohortName, partnerEmail, expectedParticipants');
    }

    // Generate unique IDs
    const partnerId = generatePartnerId(partnerName);
    const cohortId = generateCohortId(cohortName);
    const assessmentUrl = `https://app.gutcheck.ai/assessment?partner_id=${partnerId}&cohort_id=${cohortId}`;

    // Create partner record
    const partnerRef = db.collection('partners').doc(partnerId);
    await partnerRef.set({
      id: partnerId,
      name: partnerName,
      email: partnerEmail,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Create cohort record
    const cohortRef = db.collection('cohorts').doc(cohortId);
    await cohortRef.set({
      id: cohortId,
      name: cohortName,
      partnerId: partnerId,
      partnerName: partnerName,
      expectedParticipants: parseInt(expectedParticipants),
      assessmentUrl: assessmentUrl,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Generate welcome email template
    const welcomeEmail = generateWelcomeEmail(partnerName, cohortName, assessmentUrl, cohortId);

    return {
      success: true,
      partnerId,
      cohortId,
      assessmentUrl,
      welcomeEmail
    };

  } catch (error) {
    console.error('Error creating partner cohort:', error);
    throw new Error('Failed to create partner cohort');
  }
});

// Get pilot metrics
export const getPilotMetrics = onCall(async (request) => {
  try {
    const { partnerId, cohortId } = request.data;

    if (!partnerId || !cohortId) {
      throw new Error('Missing required fields: partnerId, cohortId');
    }

    // Get assessment sessions for this partner cohort
    const sessionsQuery = await db.collection('assessmentSessions')
      .where('partnerMetadata.partnerId', '==', partnerId)
      .where('partnerMetadata.cohortId', '==', cohortId)
      .get();

    const sessions = sessionsQuery.docs.map(doc => doc.data());

    // Calculate metrics using existing assessment data (no new scoring)
    const totalAssessments = sessions.length;
    const completedAssessments = sessions.filter(s => s.completedAt).length;
    const completionRate = totalAssessments > 0 ? (completedAssessments / totalAssessments) * 100 : 0;

    // Calculate average score using existing 35-100 range
    const completedSessions = sessions.filter(s => s.completedAt && s.scores?.overallScore);
    const averageScore = completedSessions.length > 0 
      ? completedSessions.reduce((sum, s) => sum + s.scores.overallScore, 0) / completedSessions.length 
      : 0;

    // Calculate score ranges using existing 35-100 range
    const scoreRanges = calculateScoreRanges(completedSessions);

    // Calculate star rating distribution using existing 5-star system
    const starRatingDistribution = calculateStarRatingDistribution(completedSessions);

    // Calculate outcome distribution
    const outcomeDistribution = calculateOutcomeDistribution(sessions);

    return {
      success: true,
      metrics: {
        totalAssessments,
        completedAssessments,
        completionRate,
        averageScore,
        scoreRanges,
        starRatingDistribution,
        outcomeDistribution
      }
    };

  } catch (error) {
    console.error('Error getting pilot metrics:', error);
    throw new Error('Failed to get pilot metrics');
  }
});

// Generate shareable badge
export const generateShareableBadge = onCall(async (request) => {
  try {
    const { sessionId } = request.data;

    if (!sessionId) {
      throw new Error('Missing required field: sessionId');
    }

    // Get existing assessment session
    const sessionQuery = await db.collection('assessmentSessions')
      .where('sessionId', '==', sessionId)
      .limit(1)
      .get();

    if (sessionQuery.empty) {
      throw new Error('Assessment session not found');
    }

    const sessionData = sessionQuery.docs[0].data();

    // Use existing scoring data (no new calculations)
    const badgeData = {
      overallScore: sessionData.scores.overallScore, // 35-100 range
      categories: sessionData.categoryBreakdown, // Existing breakdown
      starRating: sessionData.starRating, // 5-star system
      entrepreneurName: sessionData.userId || 'Anonymous',
      timestamp: sessionData.completedAt?.toDate?.() || new Date(),
      rank: calculateRank(sessionData.scores.overallScore)
    };

    // Generate badge URL (placeholder - would integrate with actual badge generation)
    const badgeUrl = `https://app.gutcheck.ai/badge/${sessionId}`;

    return {
      success: true,
      badgeData,
      badgeUrl,
      shareUrl: `https://app.gutcheck.ai/score/${sessionId}`
    };

  } catch (error) {
    console.error('Error generating shareable badge:', error);
    throw new Error('Failed to generate shareable badge');
  }
});

// Helper functions
function generatePartnerId(partnerName: string): string {
  return partnerName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36);
}

function generateCohortId(cohortName: string): string {
  return cohortName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36);
}

function generateWelcomeEmail(partnerName: string, cohortName: string, assessmentUrl: string, cohortId: string): string {
  return `
Dear ${partnerName} Team,

Your Gutcheck.AI pilot cohort "${cohortName}" has been successfully created!

📋 Cohort Details:
- Cohort ID: ${cohortId}
- Assessment URL: ${assessmentUrl}

🚀 Next Steps:
1. Share the assessment URL with your participants
2. Monitor completion rates in your dashboard
3. Tag outcomes as participants progress

📊 Dashboard Access:
Visit your partner dashboard to track progress and generate reports.

Need help? Contact us at support@gutcheck.ai

Best regards,
The Gutcheck.AI Team
  `.trim();
}

function calculateScoreRanges(sessions: any[]): Record<string, number> {
  const ranges = {
    '90-100': 0,
    '80-89': 0,
    '70-79': 0,
    '60-69': 0,
    '35-59': 0
  };

  sessions.forEach(session => {
    const score = session.scores.overallScore;
    if (score >= 90) ranges['90-100']++;
    else if (score >= 80) ranges['80-89']++;
    else if (score >= 70) ranges['70-79']++;
    else if (score >= 60) ranges['60-69']++;
    else if (score >= 35) ranges['35-59']++;
  });

  return ranges;
}

function calculateStarRatingDistribution(sessions: any[]): Record<string, number> {
  const distribution = {
    '5-star': 0,
    '4-star': 0,
    '3-star': 0,
    '2-star': 0,
    '1-star': 0
  };

  sessions.forEach(session => {
    const rating = session.starRating;
    if (rating === 5) distribution['5-star']++;
    else if (rating === 4) distribution['4-star']++;
    else if (rating === 3) distribution['3-star']++;
    else if (rating === 2) distribution['2-star']++;
    else if (rating === 1) distribution['1-star']++;
  });

  return distribution;
}

function calculateOutcomeDistribution(sessions: any[]): Record<string, number> {
  const distribution = {
    breakthrough: 0,
    growth: 0,
    stagnation: 0,
    pending: 0
  };

  sessions.forEach(session => {
    const outcome = session.outcomeTracking?.outcomeTag;
    if (outcome === 'breakthrough') distribution.breakthrough++;
    else if (outcome === 'no_growth') distribution.growth++;
    else if (outcome === 'stagnation') distribution.stagnation++;
    else distribution.pending++;
  });

  return distribution;
}

function calculateRank(score: number): string {
  if (score >= 90) return 'Top 10%';
  if (score >= 80) return 'Top 25%';
  if (score >= 70) return 'Top 50%';
  if (score >= 60) return 'Top 75%';
  return 'Developing';
}
