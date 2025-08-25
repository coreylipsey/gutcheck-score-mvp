import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Airtable from 'airtable';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Initialize Airtable
const airtableApiKey = process.env.AIRTABLE_API_KEY;
const airtableBaseId = process.env.AIRTABLE_BASE_ID;

if (!airtableApiKey || !airtableBaseId) {
  console.warn('Airtable credentials not configured - sync will be disabled');
}

const base = airtableApiKey && airtableBaseId 
  ? new Airtable({ apiKey: airtableApiKey }).base(airtableBaseId)
  : null;

// Sync assessment session to Airtable
export const syncAssessmentToAirtable = functions.firestore
  .document('assessmentSessions/{sessionId}')
  .onCreate(async (snap, context) => {
    if (!base) {
      console.log('Airtable not configured - skipping sync');
      return;
    }

    const sessionData = snap.data();
    const sessionId = context.params.sessionId;

    try {
      console.log(`Syncing assessment session ${sessionId} to Airtable`);

      // Create record in Assessment Sessions table
      await base('Assessment Sessions').create([
        {
          fields: {
            'Session ID': sessionId,
            'User ID': sessionData.userId || '',
            'Partner': sessionData.partnerMetadata?.partnerId || '',
            'Cohort': sessionData.partnerMetadata?.cohortId || '',
            'Overall Score': sessionData.scores?.overallScore || 0,
            'Star Rating': sessionData.starRating || 1,
            'Category Breakdown': JSON.stringify(sessionData.categoryBreakdown || {}),
            'Completed At': sessionData.completedAt?.toDate?.() || new Date(),
            'Outcome Tracking Ready': sessionData.outcomeTrackingReady || false,
            'Consent for ML': sessionData.consentForML || false,
            'Partner Metadata': JSON.stringify(sessionData.partnerMetadata || {})
          }
        }
      ]);

      console.log(`Successfully synced session ${sessionId} to Airtable`);

      // Update cohort metrics
      if (sessionData.partnerMetadata?.partnerId && sessionData.partnerMetadata?.cohortId) {
        await updateCohortMetrics(sessionData.partnerMetadata.partnerId, sessionData.partnerMetadata.cohortId);
      }

    } catch (error) {
      console.error(`Failed to sync session ${sessionId} to Airtable:`, error);
      
      // Store in outbox for retry
      await storeInOutbox({
        type: 'assessment_sync',
        sessionId,
        sessionData,
        error: error.message,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });

// Sync outcome tracking updates
export const syncOutcomeToAirtable = functions.firestore
  .document('assessmentSessions/{sessionId}')
  .onUpdate(async (change, context) => {
    if (!base) {
      console.log('Airtable not configured - skipping sync');
      return;
    }

    const beforeData = change.before.data();
    const afterData = change.after.data();
    const sessionId = context.params.sessionId;

    // Only sync if outcome tracking changed
    if (JSON.stringify(beforeData.outcomeTracking) === JSON.stringify(afterData.outcomeTracking)) {
      return;
    }

    try {
      console.log(`Syncing outcome tracking for session ${sessionId} to Airtable`);

      // Update or create outcome tracking record
      const outcomeFields = {
        'Session ID': sessionId,
        'Outcome Tag': afterData.outcomeTracking?.outcomeTag || '',
        'Outcome Notes': afterData.outcomeTracking?.outcomeNotes || '',
        'Tagged By': afterData.outcomeTracking?.taggedBy || '',
        'Tagged At': afterData.outcomeTracking?.taggedAt?.toDate?.() || new Date(),
        'Partner': afterData.partnerMetadata?.partnerId || '',
        'Cohort': afterData.partnerMetadata?.cohortId || '',
        'User Score': afterData.scores?.overallScore || 0
      };

      // Check if record exists
      const existingRecords = await base('Outcome Tracking').select({
        filterByFormula: `{Session ID} = '${sessionId}'`
      }).firstPage();

      if (existingRecords.length > 0) {
        // Update existing record
        await base('Outcome Tracking').update([
          {
            id: existingRecords[0].id,
            fields: outcomeFields
          }
        ]);
      } else {
        // Create new record
        await base('Outcome Tracking').create([
          { fields: outcomeFields }
        ]);
      }

      console.log(`Successfully synced outcome for session ${sessionId} to Airtable`);

    } catch (error) {
      console.error(`Failed to sync outcome for session ${sessionId} to Airtable:`, error);
      
      // Store in outbox for retry
      await storeInOutbox({
        type: 'outcome_sync',
        sessionId,
        outcomeData: afterData.outcomeTracking,
        error: error.message,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });

// Update cohort metrics in Airtable
async function updateCohortMetrics(partnerId: string, cohortId: string) {
  try {
    // Get cohort data from Firestore
    const sessionsSnapshot = await db.collection('assessmentSessions')
      .where('partnerMetadata.partnerId', '==', partnerId)
      .where('partnerMetadata.cohortId', '==', cohortId)
      .get();

    const sessions = sessionsSnapshot.docs.map(doc => doc.data());
    
    const totalAssessments = sessions.length;
    const completedAssessments = sessions.filter(s => s.completedAt).length;
    const completionRate = totalAssessments > 0 ? (completedAssessments / totalAssessments) * 100 : 0;
    
    const completedSessions = sessions.filter(s => s.completedAt && s.scores?.overallScore);
    const averageScore = completedSessions.length > 0 
      ? completedSessions.reduce((sum, s) => sum + s.scores.overallScore, 0) / completedSessions.length 
      : 0;

    const taggedOutcomes = sessions.filter(s => s.outcomeTracking?.outcomeTag).length;

    // Find existing cohort record
    const existingRecords = await base('Cohorts').select({
      filterByFormula: `{Cohort ID} = '${cohortId}'`
    }).firstPage();

    if (existingRecords.length > 0) {
      // Update existing record
      await base('Cohorts').update([
        {
          id: existingRecords[0].id,
          fields: {
            'Total Assessments': totalAssessments,
            'Completed Assessments': completedAssessments,
            'Completion Rate': completionRate,
            'Average Score': averageScore,
            'Tagged Outcomes': taggedOutcomes
          }
        }
      ]);
    }

  } catch (error) {
    console.error(`Failed to update cohort metrics for ${cohortId}:`, error);
  }
}

// Store failed syncs in outbox for retry
async function storeInOutbox(outboxData: any) {
  try {
    await db.collection('airtableOutbox').add(outboxData);
    console.log('Stored failed sync in outbox for retry');
  } catch (error) {
    console.error('Failed to store in outbox:', error);
  }
}

// Retry failed syncs from outbox
export const retryAirtableSync = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    if (!base) {
      console.log('Airtable not configured - skipping retry');
      return;
    }

    try {
      const outboxSnapshot = await db.collection('airtableOutbox')
        .where('createdAt', '<=', admin.firestore.Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60))) // 1 hour old
        .limit(10)
        .get();

      for (const doc of outboxSnapshot.docs) {
        const outboxData = doc.data();

        try {
          if (outboxData.type === 'assessment_sync') {
            // Retry assessment sync
            await base('Assessment Sessions').create([
              {
                fields: {
                  'Session ID': outboxData.sessionId,
                  'User ID': outboxData.sessionData.userId || '',
                  'Partner': outboxData.sessionData.partnerMetadata?.partnerId || '',
                  'Cohort': outboxData.sessionData.partnerMetadata?.cohortId || '',
                  'Overall Score': outboxData.sessionData.scores?.overallScore || 0,
                  'Star Rating': outboxData.sessionData.starRating || 1,
                  'Category Breakdown': JSON.stringify(outboxData.sessionData.categoryBreakdown || {}),
                  'Completed At': outboxData.sessionData.completedAt?.toDate?.() || new Date(),
                  'Outcome Tracking Ready': outboxData.sessionData.outcomeTrackingReady || false,
                  'Consent for ML': outboxData.sessionData.consentForML || false,
                  'Partner Metadata': JSON.stringify(outboxData.sessionData.partnerMetadata || {})
                }
              }
            ]);
          } else if (outboxData.type === 'outcome_sync') {
            // Retry outcome sync
            await base('Outcome Tracking').create([
              {
                fields: {
                  'Session ID': outboxData.sessionId,
                  'Outcome Tag': outboxData.outcomeData?.outcomeTag || '',
                  'Outcome Notes': outboxData.outcomeData?.outcomeNotes || '',
                  'Tagged By': outboxData.outcomeData?.taggedBy || '',
                  'Tagged At': outboxData.outcomeData?.taggedAt?.toDate?.() || new Date()
                }
              }
            ]);
          }

          // Remove from outbox on success
          await doc.ref.delete();
          console.log(`Successfully retried sync for ${outboxData.sessionId}`);

        } catch (error) {
          console.error(`Retry failed for ${outboxData.sessionId}:`, error);
        }
      }

    } catch (error) {
      console.error('Error in retry function:', error);
    }
  });

// Manual sync function for testing
export const manualAirtableSync = functions.https.onCall(async (data, context) => {
  if (!base) {
    throw new functions.https.HttpsError('failed-precondition', 'Airtable not configured');
  }

  try {
    const { sessionId } = data;
    
    if (!sessionId) {
      throw new functions.https.HttpsError('invalid-argument', 'Session ID required');
    }

    // Get session data from Firestore
    const sessionDoc = await db.collection('assessmentSessions').doc(sessionId).get();
    
    if (!sessionDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Session not found');
    }

    const sessionData = sessionDoc.data();

    // Sync to Airtable
    await base('Assessment Sessions').create([
      {
        fields: {
          'Session ID': sessionId,
          'User ID': sessionData.userId || '',
          'Partner': sessionData.partnerMetadata?.partnerId || '',
          'Cohort': sessionData.partnerMetadata?.cohortId || '',
          'Overall Score': sessionData.scores?.overallScore || 0,
          'Star Rating': sessionData.starRating || 1,
          'Category Breakdown': JSON.stringify(sessionData.categoryBreakdown || {}),
          'Completed At': sessionData.completedAt?.toDate?.() || new Date(),
          'Outcome Tracking Ready': sessionData.outcomeTrackingReady || false,
          'Consent for ML': sessionData.consentForML || false,
          'Partner Metadata': JSON.stringify(sessionData.partnerMetadata || {})
        }
      }
    ]);

    return { success: true, message: `Session ${sessionId} synced to Airtable` };

  } catch (error) {
    console.error('Manual sync failed:', error);
    throw new functions.https.HttpsError('internal', 'Sync failed');
  }
});
