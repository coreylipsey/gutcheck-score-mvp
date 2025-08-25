import * as puppeteer from 'puppeteer';
import { getStorage } from 'firebase-admin/storage';

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
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdf = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();

  const bucket = getStorage().bucket();
  const path = `reports/${partner}-${cohort}-${Date.now()}.pdf`;
  await bucket.file(path).save(pdf, { contentType: 'application/pdf', resumable: false });
  const [url] = await bucket.file(path).getSignedUrl({ action: 'read', expires: Date.now() + 1000*60*60*24*30 });
  return { url };
}
