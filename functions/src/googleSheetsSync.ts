import * as admin from 'firebase-admin';
import { google } from 'googleapis';
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Initialize Google Sheets API
const sheetsSpreadsheetId = "1vDo4CX9Yz2iLAdC-7ZsHIaYJv4L0fbQB7WXjhOfcn6g";

if (!sheetsSpreadsheetId) {
  console.warn('Google Sheets spreadsheet ID not configured - sync will be disabled');
}

// Initialize Google Sheets client using Application Default Credentials
let sheets: any = null;
try {
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  sheets = google.sheets({ version: 'v4', auth });
  console.log('Google Sheets client initialized with Application Default Credentials');
} catch (error) {
  console.error('Failed to initialize Google Sheets client:', error);
}

// Sync assessment session to Google Sheets
export const syncAssessmentToSheets = onDocumentCreated(
  'assessmentSessions/{sessionId}',
  async (event) => {
    if (!sheets || !sheetsSpreadsheetId) {
      console.log('Google Sheets not configured - skipping sync');
      return;
    }

    const sessionData = event.data?.data();
    const sessionId = event.params.sessionId;

    if (!sessionData) {
      console.log('No session data found - skipping sync');
      return;
    }

    try {
      console.log(`Syncing assessment session ${sessionId} to Google Sheets`);

      // Prepare row data for Assessment Sessions sheet
      const rowData = [
        sessionId,
        sessionData.userId || '',
        sessionData.partnerMetadata?.partnerId || '',
        sessionData.partnerMetadata?.cohortId || '',
        sessionData.scores?.overallScore || 0,
        sessionData.starRating || 1,
        JSON.stringify(sessionData.categoryBreakdown || {}),
        sessionData.completedAt?.toDate?.() || new Date(),
        sessionData.outcomeTrackingReady || false,
        sessionData.consentForML || false,
        JSON.stringify(sessionData.partnerMetadata || {})
      ];

      // Append to Assessment Sessions sheet
      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetsSpreadsheetId,
        range: 'Assessment Sessions!A:K',
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [rowData]
        }
      });

      console.log(`Successfully synced session ${sessionId} to Google Sheets`);

      // Update cohort metrics
      if (sessionData.partnerMetadata?.partnerId && sessionData.partnerMetadata?.cohortId) {
        await updateCohortMetrics(sessionData.partnerMetadata.partnerId, sessionData.partnerMetadata.cohortId);
      }

    } catch (error) {
      console.error(`Failed to sync session ${sessionId} to Google Sheets:`, error);
      
      // Store in outbox for retry
      await storeInOutbox({
        type: 'assessment_sync',
        sessionId,
        sessionData,
        error: error instanceof Error ? error.message : 'Unknown error',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });

// Sync outcome tracking updates
export const syncOutcomeToSheets = onDocumentUpdated(
  'assessmentSessions/{sessionId}',
  async (event) => {
    if (!sheets || !sheetsSpreadsheetId) {
      console.log('Google Sheets not configured - skipping sync');
      return;
    }

    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();
    const sessionId = event.params.sessionId;

    if (!beforeData || !afterData) {
      console.log('No data found - skipping sync');
      return;
    }

    // Only sync if outcome tracking changed
    if (JSON.stringify(beforeData.outcomeTracking) === JSON.stringify(afterData.outcomeTracking)) {
      return;
    }

    try {
      console.log(`Syncing outcome tracking for session ${sessionId} to Google Sheets`);

      // Prepare row data for Outcome Tracking sheet
      const rowData = [
        sessionId,
        afterData.outcomeTracking?.outcomeTag || '',
        afterData.outcomeTracking?.outcomeNotes || '',
        afterData.outcomeTracking?.taggedBy || '',
        afterData.outcomeTracking?.taggedAt?.toDate?.() || new Date(),
        afterData.partnerMetadata?.partnerId || '',
        afterData.partnerMetadata?.cohortId || '',
        afterData.scores?.overallScore || 0
      ];

      // Append to Outcome Tracking sheet
      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetsSpreadsheetId,
        range: 'Outcome Tracking!A:H',
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [rowData]
        }
      });

      console.log(`Successfully synced outcome for session ${sessionId} to Google Sheets`);

    } catch (error) {
      console.error(`Failed to sync outcome for session ${sessionId} to Google Sheets:`, error);
      
      // Store in outbox for retry
      await storeInOutbox({
        type: 'outcome_sync',
        sessionId,
        outcomeData: afterData.outcomeTracking,
        error: error instanceof Error ? error.message : 'Unknown error',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });

// Update cohort metrics in Google Sheets
async function updateCohortMetrics(partnerId: string, cohortId: string) {
  if (!sheets || !sheetsSpreadsheetId) {
    return;
  }

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
      ? completedSessions.reduce((sum, s) => sum + (s.scores?.overallScore || 0), 0) / completedSessions.length 
      : 0;

    const taggedOutcomes = sessions.filter(s => s.outcomeTracking?.outcomeTag).length;

    // Find existing cohort record in Cohorts sheet
    const cohortResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetsSpreadsheetId,
      range: 'Cohorts!A:E'
    });

    const cohortRows = cohortResponse.data.values || [];
    const cohortIndex = cohortRows.findIndex((row: any[]) => row[0] === cohortId);

    const cohortData = [
      cohortId,
      totalAssessments,
      completedAssessments,
      completionRate,
      averageScore,
      taggedOutcomes
    ];

    if (cohortIndex > 0) {
      // Update existing record
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetsSpreadsheetId,
        range: `Cohorts!A${cohortIndex + 1}:F${cohortIndex + 1}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [cohortData]
        }
      });
    } else {
      // Append new record
      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetsSpreadsheetId,
        range: 'Cohorts!A:F',
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [cohortData]
        }
      });
    }

  } catch (error) {
    console.error(`Failed to update cohort metrics for ${cohortId}:`, error);
  }
}

// Store failed syncs in outbox for retry
async function storeInOutbox(outboxData: any) {
  try {
    await db.collection('sheetsOutbox').add(outboxData);
    console.log('Stored failed sync in outbox for retry');
  } catch (error) {
    console.error('Failed to store in outbox:', error);
  }
}

// Retry failed syncs from outbox (commented out due to Cloud Scheduler permissions)
// export const retrySheetsSync = onSchedule(
//   'every 1 hours',
//   async (event) => {
//     // Implementation for retry logic
//     // This can be enabled later when Cloud Scheduler permissions are properly configured
//   });

// Manual sync function for testing
export const manualSheetsSync = onCall(async (request) => {
  if (!sheets || !sheetsSpreadsheetId) {
    throw new HttpsError('failed-precondition', 'Google Sheets not configured');
  }

  try {
    const { sessionId } = request.data;
    
    if (!sessionId) {
      throw new HttpsError('invalid-argument', 'Session ID required');
    }

    // Get session data from Firestore
    const sessionDoc = await db.collection('assessmentSessions').doc(sessionId).get();
    
    if (!sessionDoc.exists) {
      throw new HttpsError('not-found', 'Session not found');
    }

    const sessionData = sessionDoc.data();
    if (!sessionData) {
      throw new HttpsError('not-found', 'Session data not found');
    }

    // Sync to Google Sheets
    const rowData = [
      sessionId,
      sessionData.userId || '',
      sessionData.partnerMetadata?.partnerId || '',
      sessionData.partnerMetadata?.cohortId || '',
      sessionData.scores?.overallScore || 0,
      sessionData.starRating || 1,
      JSON.stringify(sessionData.categoryBreakdown || {}),
      sessionData.completedAt?.toDate?.() || new Date(),
      sessionData.outcomeTrackingReady || false,
      sessionData.consentForML || false,
      JSON.stringify(sessionData.partnerMetadata || {})
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetsSpreadsheetId,
      range: 'Assessment Sessions!A:K',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [rowData]
      }
    });

    return { success: true, message: `Session ${sessionId} synced to Google Sheets` };

  } catch (error) {
    console.error('Manual sync failed:', error);
    throw new HttpsError('internal', 'Sync failed');
  }
});
