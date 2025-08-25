import * as admin from 'firebase-admin';
import { google } from 'googleapis';
import { onCall, HttpsError } from 'firebase-functions/v2/https';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Initialize Google Sheets API
const sheetsSpreadsheetId = "1vDo4CX9Yz2iLAdC-7ZsHIaYJv4L0fbQB7WXjhOfcn6g";

if (!sheetsSpreadsheetId) {
  console.warn('Google Sheets spreadsheet ID not configured - admin dashboard will be disabled');
}

// Initialize Google Sheets client using Application Default Credentials
let sheets: any = null;
try {
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  sheets = google.sheets({ version: 'v4', auth });
  console.log('Google Sheets client initialized for admin dashboard');
} catch (error) {
  console.error('Failed to initialize Google Sheets client for admin dashboard:', error);
}

interface DashboardMetrics {
  totalPartners: number;
  totalCohorts: number;
  totalAssessments: number;
  totalOutcomes: number;
  averageCompletionRate: number;
  averageScore: number;
  recentAssessments: number;
  pendingOutcomes: number;
  totalParticipants: number;
  totalCompleted: number;
}

interface PartnerData {
  partnerId: string;
  partnerName: string;
  partnerEmail: string;
  status: string;
  createdAt: string;
  cohortsCount: number;
}

interface CohortData {
  cohortId: string;
  partnerId: string;
  cohortName: string;
  totalAssessments: number;
  completedAssessments: number;
  completionRate: number;
  averageScore: number;
  taggedOutcomes: number;
  status: 'active' | 'completed' | 'draft';
  assessmentUrl: string;
}

interface AssessmentData {
  sessionId: string;
  userId: string;
  partnerId: string;
  cohortId: string;
  overallScore: number;
  starRating: number;
  completedAt: string;
  consentForML: boolean;
}

interface OutcomeData {
  sessionId: string;
  outcomeTag: string;
  outcomeNotes: string;
  taggedBy: string;
  taggedAt: string;
  partnerId: string;
  cohortId: string;
  userScore: number;
}

// Admin dashboard data endpoint
export const getAdminDashboardData = onCall(async (request) => {
  if (!sheets || !sheetsSpreadsheetId) {
    throw new HttpsError('failed-precondition', 'Google Sheets not configured');
  }

  try {
    console.log('Fetching admin dashboard data from Google Sheets');

    // Fetch data from all sheets
    const [partnersResponse, cohortsResponse, assessmentsResponse, outcomesResponse] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: sheetsSpreadsheetId,
        range: 'Partners!A2:F', // Skip header row
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: sheetsSpreadsheetId,
        range: 'Cohorts!A2:J', // Skip header row
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: sheetsSpreadsheetId,
        range: 'Assessment Sessions!A2:K', // Skip header row
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: sheetsSpreadsheetId,
        range: 'Outcome Tracking!A2:H', // Skip header row
      })
    ]);

    // Parse partners data
    const partners: PartnerData[] = (partnersResponse.data.values || []).map((row: any[]) => ({
      partnerId: row[0] || '',
      partnerName: row[1] || '',
      partnerEmail: row[2] || '',
      status: row[3] || 'active',
      createdAt: row[4] || new Date().toISOString(),
      cohortsCount: 0 // Will be calculated below
    }));

    // Parse cohorts data
    const cohorts: CohortData[] = (cohortsResponse.data.values || []).map((row: any[]) => ({
      cohortId: row[0] || '',
      partnerId: row[1] || '',
      cohortName: row[2] || '',
      totalAssessments: parseInt(row[5]) || 0,
      completedAssessments: parseInt(row[6]) || 0,
      completionRate: parseFloat(row[7]) || 0,
      averageScore: parseFloat(row[8]) || 0,
      taggedOutcomes: parseInt(row[9]) || 0,
      status: 'active' as const, // Default to active
      assessmentUrl: `https://gutcheck-score-mvp.web.app/assessment?partner_id=${row[1]}&cohort_id=${row[0]}`
    }));

    // Parse assessments data
    const assessments: AssessmentData[] = (assessmentsResponse.data.values || []).map((row: any[]) => ({
      sessionId: row[0] || '',
      userId: row[1] || '',
      partnerId: row[2] || '',
      cohortId: row[3] || '',
      overallScore: parseFloat(row[4]) || 0,
      starRating: parseInt(row[5]) || 1,
      completedAt: row[7] || new Date().toISOString(),
      consentForML: row[9] === 'true'
    }));

    // Parse outcomes data
    const outcomes: OutcomeData[] = (outcomesResponse.data.values || []).map((row: any[]) => ({
      sessionId: row[0] || '',
      outcomeTag: row[1] || '',
      outcomeNotes: row[2] || '',
      taggedBy: row[3] || '',
      taggedAt: row[4] || new Date().toISOString(),
      partnerId: row[5] || '',
      cohortId: row[6] || '',
      userScore: parseFloat(row[7]) || 0
    }));

    // Calculate cohort counts for partners
    partners.forEach(partner => {
      partner.cohortsCount = cohorts.filter(cohort => cohort.partnerId === partner.partnerId).length;
    });

    // Calculate metrics
    const totalPartners = partners.length;
    const totalCohorts = cohorts.length;
    const totalAssessments = assessments.length;
    const totalOutcomes = outcomes.length;
    const totalParticipants = cohorts.reduce((sum, cohort) => sum + cohort.totalAssessments, 0);
    const totalCompleted = cohorts.reduce((sum, cohort) => sum + cohort.completedAssessments, 0);
    const averageCompletionRate = totalParticipants > 0 ? (totalCompleted / totalParticipants) * 100 : 0;
    const averageScore = assessments.length > 0 ? assessments.reduce((sum, assessment) => sum + assessment.overallScore, 0) / assessments.length : 0;
    const recentAssessments = assessments.filter(assessment => {
      const assessmentDate = new Date(assessment.completedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return assessmentDate > weekAgo;
    }).length;
    const pendingOutcomes = totalCompleted - totalOutcomes;

    const metrics: DashboardMetrics = {
      totalPartners,
      totalCohorts,
      totalAssessments,
      totalOutcomes,
      averageCompletionRate,
      averageScore,
      recentAssessments,
      pendingOutcomes,
      totalParticipants,
      totalCompleted
    };

    // Get recent assessments (last 10)
    const recentAssessmentsData = assessments
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, 10);

    // Get recent outcomes (last 10)
    const recentOutcomesData = outcomes
      .sort((a, b) => new Date(b.taggedAt).getTime() - new Date(a.taggedAt).getTime())
      .slice(0, 10);

    console.log(`Admin dashboard data fetched: ${totalPartners} partners, ${totalCohorts} cohorts, ${totalAssessments} assessments`);

    return {
      metrics,
      partners,
      cohorts,
      recentAssessments: recentAssessmentsData,
      recentOutcomes: recentOutcomesData
    };

  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    throw new HttpsError('internal', 'Failed to fetch dashboard data');
  }
});
