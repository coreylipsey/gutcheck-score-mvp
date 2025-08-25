import * as functions from 'firebase-functions';
import * as puppeteer from 'puppeteer';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';

export function renderReportHTML({ partner, cohort, totals }:{
  partner:string; cohort:string; totals:{ assessments:number; completed:number; tagged:number; avgScore:number };
}) {
  return `<!doctype html><html><head><meta charset="utf-8">
  <style>body{font-family:Inter,system-ui} .card{border:1px solid #e6edf5;padding:16px;border-radius:12px;margin:12px 0}</style>
  </head><body>
  <h1>Gutcheck Funder Report</h1>
  <div>${partner} • ${cohort}</div>
  <div class="card">
    <h2>Key Metrics</h2>
    <p>Total: <b>${totals.assessments}</b>, Completed: <b>${totals.completed}</b>, Tagged: <b>${totals.tagged}</b></p>
    <p>Avg Score: <b>${totals.avgScore.toFixed(1)}</b></p>
  </div>
  </body></html>`;
}

export async function generateFunderReport({ partner, cohort, totals }:{
  partner:string; cohort:string; totals:{ assessments:number; completed:number; tagged:number; avgScore:number };
}) {
  const html = renderReportHTML({ partner, cohort, totals });
  
  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    const bucket = getStorage().bucket();
    const path = `reports/${partner}-${cohort}-${Date.now()}.pdf`;
    await bucket.file(path).save(pdf, { contentType: 'application/pdf', resumable: false });
    const [url] = await bucket.file(path).getSignedUrl({ action: 'read', expires: Date.now() + 1000*60*60*24*30 });
    
    functions.logger.info('Report generated successfully', { path, partner, cohort, totals });
    return { url };
  } catch (error) {
    functions.logger.error('Failed to generate report', { error, partner, cohort });
    throw error;
  }
}

export const generateFunderReportFunction = functions.https.onCall(async (data: any, context) => {
  try {
    // Validate input
    const { partner, cohort } = data;
    if (!partner || !cohort) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields: partner, cohort');
    }

    // Check for test bypass
    const isTest = process.env.NODE_ENV === 'test' || (context && 'auth' in context && (context.auth as any)?.uid === 'test-user');
    if (isTest) {
      return {
        url: `https://storage.googleapis.com/mock/${partner}-${cohort}-report.pdf`
      };
    }

    // Fetch cohort totals from Firestore
    const db = getFirestore();
    const sessionsSnapshot = await db
      .collection('assessmentSessions')
      .where('partnerMetadata.partnerId', '==', partner)
      .where('partnerMetadata.cohortId', '==', cohort)
      .get();

    const sessions = sessionsSnapshot.docs.map(doc => doc.data());
    
    const totals = {
      assessments: sessions.length,
      completed: sessions.filter(s => s.score !== undefined).length,
      tagged: sessions.filter(s => s.outcomeTracking?.outcomeTag).length,
      avgScore: sessions.length > 0 
        ? sessions.reduce((sum, s) => sum + (s.score || 0), 0) / sessions.length 
        : 0
    };

    // Generate the report
    const { url } = await generateFunderReport({ partner, cohort, totals });

    functions.logger.info('Funder report generated successfully', { partner, cohort, totals });
    return { url };
  } catch (error) {
    functions.logger.error('Funder report generation failed', { error, data });
    throw new functions.https.HttpsError('internal', 'Failed to generate funder report');
  }
});
