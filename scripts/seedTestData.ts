/* eslint-disable no-console */
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { randomUUID } from 'crypto';

// Inline sanitizer functions to avoid import issues
import { Timestamp } from 'firebase-admin/firestore';

function toTimestamp(d: Date | string | number): Timestamp {
  if (d instanceof Date) return Timestamp.fromDate(d);
  if (typeof d === 'number') return Timestamp.fromMillis(d);
  return Timestamp.fromDate(new Date(d));
}

function sanitizeFirestore(input: any): any {
  if (input === null) return null;
  if (input === undefined) return undefined;
  if (input instanceof Date) return toTimestamp(input);
  if (typeof input === 'number' && !Number.isFinite(input)) return null;

  if (Array.isArray(input)) {
    return input
      .map(sanitizeFirestore)
      .filter((v) => v !== undefined);
  }

  if (typeof input === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(input)) {
      if (v === undefined) continue;
      if (k.includes('.')) {
        out[k.replace(/\./g, '_')] = sanitizeFirestore(v);
      } else {
        out[k] = sanitizeFirestore(v);
      }
    }
    return out;
  }

  return input;
}

async function main() {
  try {
    initializeApp({ projectId: 'gutcheck-score-mvp' });
  } catch (error) {
    // App already initialized
  }
  const db = getFirestore();
  
  // Connect to emulator
  db.settings({
    host: 'localhost:8080',
    ssl: false
  });

  const partnerName = 'Queens College';
  const cohortName  = 'Alpha-Fall25';
  const partnerId   = 'queens-college';
  const cohortId    = 'alpha-fall25';

  const assessmentUrl = `http://localhost:3000/assessment?partner_id=${partnerId}&cohort_id=${cohortId}`;

  // partnerCohorts doc (if you keep this collection for ops)
  const cohortDoc = sanitizeFirestore({
    partnerId,
    cohortId,
    partnerName,
    cohortName,
    partnerEmail: 'ying@queens.edu',
    assessmentUrl,
    createdAt: toTimestamp(new Date()),
    status: 'active',
    outcomeTags: ['stagnation', 'no_growth', 'breakthrough'],
  });
  await db.collection('partnerCohorts').doc(cohortId).set(cohortDoc, { merge: true });

  // 3 assessmentSessions (simulate different scores but DO NOT touch scoring logic)
  const sessions = [
    { userId: 'u_high',  mockScore: 92 },
    { userId: 'u_mid',   mockScore: 76 },
    { userId: 'u_low',   mockScore: 58 },
  ];

  for (const s of sessions) {
    const sessionId = randomUUID();
    const base = {
      sessionId,
      userId: s.userId,
      createdAt: toTimestamp(new Date()),
      consentForML: true,
      // DO NOT write scoring fields here; they come from your pipeline.
      partnerMetadata: {
        partnerId,
        cohortId,
        partnerName,
        cohortName,
        createdAt: toTimestamp(new Date()),
      },
      outcomeTracking: {
        isReady: true,
        // leave outcomeTag empty initially
      },
    };
    await db.collection('assessmentSessions').doc(sessionId).set(sanitizeFirestore(base), { merge: true });
  }

  console.log('Seed OK:', { partnerId, cohortId, assessmentUrl });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
