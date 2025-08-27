import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';

const db = admin.firestore();

// Set global options for all functions
setGlobalOptions({ maxInstances: 10 });

// Get partner dashboard data
export const getPartnerDashboardData = onCall(async (request) => {
  try {
    const { partnerId } = request.data;

    if (!partnerId) {
      throw new Error('Missing required field: partnerId');
    }

    // Get partner data
    const partnerDoc = await db.collection('partners').doc(partnerId).get();
    if (!partnerDoc.exists) {
      throw new HttpsError('not-found', 'Partner not found');
    }

    const partnerData = partnerDoc.data();

    // Get cohorts for this partner
    const cohortsQuery = await db.collection('cohorts')
      .where('partnerId', '==', partnerId)
      .get();

    const cohorts = cohortsQuery.docs.map(doc => {
      const data = doc.data();
      return {
        cohortId: doc.id,
        partnerId: data.partnerId,
        cohortName: data.name,
        totalAssessments: data.expectedParticipants || 0,
        completedAssessments: 0, // Will be calculated below
        completionRate: 0, // Will be calculated below
        averageScore: 0, // Will be calculated below
        taggedOutcomes: 0, // Will be calculated below
        status: data.status || 'active',
        assessmentUrl: data.assessmentUrl || `https://gutcheck-score-mvp.web.app/assessment?partner_id=${partnerId}&cohort_id=${doc.id}`
      };
    });

    // Get assessment sessions for this partner
    const sessionsQuery = await db.collection('assessmentSessions')
      .where('partnerMetadata.partnerId', '==', partnerId)
      .get();

    const sessions = sessionsQuery.docs.map(doc => doc.data());

    // Calculate metrics
    const totalParticipants = cohorts.reduce((sum, cohort) => sum + cohort.totalAssessments, 0);
    const totalCompleted = sessions.filter(s => s.completedAt).length;
    const averageScore = totalCompleted > 0 
      ? sessions.filter(s => s.completedAt && s.scores?.overallScore)
          .reduce((sum, s) => sum + s.scores.overallScore, 0) / totalCompleted 
      : 0;
    const completionRate = totalParticipants > 0 ? (totalCompleted / totalParticipants) * 100 : 0;

    // Update cohort data with calculated metrics
    const updatedCohorts = cohorts.map(cohort => {
      const cohortSessions = sessions.filter(s => 
        s.partnerMetadata?.cohortId === cohort.cohortId
      );
      const cohortCompleted = cohortSessions.filter(s => s.completedAt).length;
      const cohortAvgScore = cohortCompleted > 0 
        ? cohortSessions.filter(s => s.completedAt && s.scores?.overallScore)
            .reduce((sum, s) => sum + s.scores.overallScore, 0) / cohortCompleted 
        : 0;
      const cohortCompletionRate = cohort.totalAssessments > 0 
        ? (cohortCompleted / cohort.totalAssessments) * 100 
        : 0;
      const cohortTaggedOutcomes = cohortSessions.filter(s => s.outcomeTracking?.outcomeTag).length;

      return {
        ...cohort,
        completedAssessments: cohortCompleted,
        completionRate: cohortCompletionRate,
        averageScore: cohortAvgScore,
        taggedOutcomes: cohortTaggedOutcomes
      };
    });

    return {
      success: true,
      partner: {
        partnerId: partnerId,
        partnerName: partnerData?.name || 'Unknown Partner',
        partnerEmail: partnerData?.email || '',
        status: partnerData?.status || 'active',
        createdAt: partnerData?.createdAt?.toDate?.() || new Date(),
        cohortsCount: updatedCohorts.length
      },
      cohorts: updatedCohorts,
      metrics: {
        totalParticipants,
        totalCompleted,
        averageScore,
        completionRate
      }
    };

  } catch (error) {
    console.error('Error getting partner dashboard data:', error);
    throw new HttpsError('internal', 'Failed to get partner dashboard data');
  }
});

// Get cohort analytics data
export const getCohortAnalyticsData = onCall(async (request) => {
  try {
    const { partnerId, cohortId } = request.data;

    if (!partnerId || !cohortId) {
      throw new Error('Missing required fields: partnerId, cohortId');
    }

    // Get cohort data
    const cohortDoc = await db.collection('cohorts').doc(cohortId).get();
    if (!cohortDoc.exists) {
      throw new HttpsError('not-found', 'Cohort not found');
    }

    const cohortData = cohortDoc.data();

    // Get assessment sessions for this specific cohort
    const sessionsQuery = await db.collection('assessmentSessions')
      .where('partnerMetadata.partnerId', '==', partnerId)
      .where('partnerMetadata.cohortId', '==', cohortId)
      .get();

    const sessions = sessionsQuery.docs.map(doc => doc.data());

    // Calculate cohort metrics
    const totalParticipants = cohortData?.expectedParticipants || 0;
    const totalCompleted = sessions.filter(s => s.completedAt).length;
    const averageScore = totalCompleted > 0 
      ? sessions.filter(s => s.completedAt && s.scores?.overallScore)
          .reduce((sum, s) => sum + s.scores.overallScore, 0) / totalCompleted 
      : 0;
    const completionRate = totalParticipants > 0 ? (totalCompleted / totalParticipants) * 100 : 0;

    // Create participants list
    const participants = sessions
      .filter(s => s.completedAt && s.scores?.overallScore)
      .map((session, index) => ({
        id: `p${index + 1}`,
        name: session.userId ? `Participant ${index + 1}` : 'Anonymous',
        email: session.userId ? `${session.userId}@email.com` : 'anonymous@email.com',
        score: session.scores.overallScore,
        completedAt: session.completedAt?.toDate?.() || new Date(),
        sessionId: session.sessionId
      }));

    // Calculate score distribution
    const scores = participants.map(p => p.score);
    const scoreDistribution = [
      { range: '90-100', count: scores.filter(s => s >= 90).length },
      { range: '80-89', count: scores.filter(s => s >= 80 && s < 90).length },
      { range: '70-79', count: scores.filter(s => s >= 70 && s < 80).length },
      { range: '60-69', count: scores.filter(s => s >= 60 && s < 70).length },
      { range: '50-59', count: scores.filter(s => s >= 50 && s < 60).length }
    ];

    return {
      success: true,
      cohort: {
        cohortId: cohortId,
        partnerId: partnerId,
        cohortName: cohortData?.name || 'Unknown Cohort',
        totalAssessments: totalParticipants,
        completedAssessments: totalCompleted,
        completionRate: completionRate,
        averageScore: averageScore,
        taggedOutcomes: sessions.filter(s => s.outcomeTracking?.outcomeTag).length,
        status: cohortData?.status || 'active',
        assessmentUrl: cohortData?.assessmentUrl || `https://gutcheck-score-mvp.web.app/assessment?partner_id=${partnerId}&cohort_id=${cohortId}`
      },
      participants: participants,
      metrics: {
        totalParticipants,
        totalCompleted,
        averageScore,
        completionRate
      },
      scoreDistribution: scoreDistribution
    };

  } catch (error) {
    console.error('Error getting cohort analytics data:', error);
    throw new HttpsError('internal', 'Failed to get cohort analytics data');
  }
});

// Get participant report data
export const getParticipantReportData = onCall(async (request) => {
  try {
    const { partnerId, cohortId, sessionId } = request.data;

    if (!partnerId || !cohortId || !sessionId) {
      throw new Error('Missing required fields: partnerId, cohortId, sessionId');
    }

    // Get assessment session data
    const sessionDoc = await db.collection('assessmentSessions').doc(sessionId).get();
    if (!sessionDoc.exists) {
      throw new HttpsError('not-found', 'Assessment session not found');
    }

    const sessionData = sessionDoc.data();

    // Verify this session belongs to the specified partner and cohort
    if (sessionData?.partnerMetadata?.partnerId !== partnerId || 
        sessionData?.partnerMetadata?.cohortId !== cohortId) {
      throw new HttpsError('permission-denied', 'Access denied to this assessment session');
    }

    // Get user data if available
    let participantName = 'Anonymous';
    let participantEmail = 'anonymous@email.com';
    
    if (sessionData.userId) {
      const userDoc = await db.collection('users').doc(sessionData.userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        participantName = userData?.displayName || userData?.email || 'Anonymous';
        participantEmail = userData?.email || 'anonymous@email.com';
      }
    }

    return {
      success: true,
      report: {
        sessionId: sessionId,
        participantName: participantName,
        participantEmail: participantEmail,
        completedAt: sessionData.completedAt?.toDate?.() || new Date(),
        overallScore: sessionData.scores?.overallScore || 0,
        categoryScores: sessionData.scores?.categoryScores || {},
        responses: sessionData.responses || {},
        feedback: {
          keyInsights: sessionData.feedback?.keyInsights,
          competitiveAdvantage: sessionData.feedback?.competitiveAdvantage,
          growthOpportunity: sessionData.feedback?.growthOpportunity,
          nextSteps: sessionData.feedback?.nextSteps
        }
      }
    };

  } catch (error) {
    console.error('Error getting participant report data:', error);
    throw new HttpsError('internal', 'Failed to get participant report data');
  }
});
