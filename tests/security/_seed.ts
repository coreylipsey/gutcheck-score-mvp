import { initializeTestEnvironment } from '@firebase/rules-unit-testing';

export async function seedWithAdmin(env: any, data: any) {
  await env.withSecurityRulesDisabled(async (ctx: any) => {
    const db = ctx.firestore();
    
    // Seed cohort data
    if (data.cohortDoc) {
      await db.collection('partnerCohorts').doc(data.cohortId).set(data.cohortDoc);
    }
    
    // Seed assessment sessions
    if (data.sessions) {
      for (const s of data.sessions) {
        await db.collection('assessmentSessions').doc(s.sessionId).set(s.doc);
      }
    }
    
    // Seed partner data
    if (data.partnerDoc) {
      await db.collection('partners').doc(data.partnerId).set(data.partnerDoc);
    }
  });
}
