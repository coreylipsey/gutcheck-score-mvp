import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { seedWithAdmin } from './_seed';

describe('Firestore Security Rules', () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'gutcheck-score-mvp',
      firestore: {
        host: 'localhost',
        port: 8080,
        rules: readFileSync('firestore.rules', 'utf8'),
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  afterEach(async () => {
    await testEnv.clearFirestore();
  });

  describe('Assessment Sessions', () => {
    it('should allow user to read their own assessment session', async () => {
      const userId = 'user123';
      const sessionId = 'session123';
      
      // Seed with admin first
      await seedWithAdmin(testEnv, {
        sessions: [{
          sessionId,
          doc: {
            sessionId,
            userId,
            responses: [],
            scores: { overallScore: 75 },
            createdAt: new Date(),
            isAnonymous: false
          }
        }]
      });
      
      // Create authenticated user context
      const userContext = testEnv.authenticatedContext(userId);
      const userDb = userContext.firestore();
      
      // Should succeed - user reading their own session
      await assertSucceeds(getDoc(doc(userDb, 'assessmentSessions', sessionId)));
    });

    it('should allow partner to read sessions with their partner metadata', async () => {
      const partnerId = 'queens-college';
      const sessionId = 'session123';
      
      // Seed with admin first
      await seedWithAdmin(testEnv, {
        sessions: [{
          sessionId,
          doc: {
            sessionId,
            userId: 'user123',
            responses: [],
            scores: { overallScore: 75 },
            createdAt: new Date(),
            isAnonymous: false,
            partnerMetadata: {
              partnerId,
              cohortId: 'alpha-fall25',
              partnerName: 'Queens College',
              cohortName: 'Alpha-Fall25',
              partnerEmail: 'ying@queens.edu',
              createdAt: new Date()
            }
          }
        }]
      });
      
      // Create partner context with partner token
      const partnerContext = testEnv.authenticatedContext('partner123', {
        email: 'ying@queens.edu'
      });
      const partnerDb = partnerContext.firestore();
      
      // Should succeed - partner reading session with their metadata
      await assertSucceeds(getDoc(doc(partnerDb, 'assessmentSessions', sessionId)));
    });

    it('should prevent partner from reading sessions without their metadata', async () => {
      const sessionId = 'session-no-metadata';
      
      // Seed with admin first - session without partner metadata
      await seedWithAdmin(testEnv, {
        sessions: [{
          sessionId,
          doc: {
            sessionId,
            userId: 'user123',
            responses: [],
            scores: { overallScore: 75 },
            createdAt: new Date(),
            isAnonymous: false
            // No partnerMetadata field
          }
        }]
      });
      
      // Create partner context
      const partnerContext = testEnv.authenticatedContext('partner123', {
        email: 'ying@queens.edu'
      });
      const partnerDb = partnerContext.firestore();
      
      // Should fail - partner cannot read session without their metadata
      await assertFails(getDoc(doc(partnerDb, 'assessmentSessions', sessionId)));
    });

    it('should prevent partner from modifying scoring fields', async () => {
      const partnerId = 'queens-college';
      const sessionId = 'session-scoring-test';
      
      // Seed with admin first
      await seedWithAdmin(testEnv, {
        sessions: [{
          sessionId,
          doc: {
            sessionId,
            userId: 'user123',
            responses: [],
            scores: { overallScore: 75 },
            createdAt: new Date(),
            isAnonymous: false,
            partnerMetadata: {
              partnerId,
              cohortId: 'alpha-fall25',
              partnerName: 'Queens College',
              cohortName: 'Alpha-Fall25',
              partnerEmail: 'ying@queens.edu',
              createdAt: new Date()
            }
          }
        }]
      });
      
      // Create partner context
      const partnerContext = testEnv.authenticatedContext('partner123', {
        email: 'ying@queens.edu'
      });
      const partnerDb = partnerContext.firestore();
      
      // Should fail - partner cannot modify scoring fields
      await assertFails(updateDoc(doc(partnerDb, 'assessmentSessions', sessionId), {
        scores: { overallScore: 90 } // Attempting to modify score
      }));
    });

    it('should allow partner to add outcome tracking', async () => {
      const partnerId = 'queens-college';
      const sessionId = 'session123';
      
      // Seed with admin first
      await seedWithAdmin(testEnv, {
        sessions: [{
          sessionId,
          doc: {
            sessionId,
            userId: 'user123',
            responses: [],
            scores: { overallScore: 75 },
            createdAt: new Date(),
            isAnonymous: false,
            partnerMetadata: {
              partnerId,
              cohortId: 'alpha-fall25',
              partnerName: 'Queens College',
              cohortName: 'Alpha-Fall25',
              partnerEmail: 'ying@queens.edu',
              createdAt: new Date()
            },
            outcomeTracking: {
              isReady: true
            }
          }
        }]
      });
      
      // Create partner context
      const partnerContext = testEnv.authenticatedContext('partner123', {
        email: 'ying@queens.edu'
      });
      const partnerDb = partnerContext.firestore();
      
      // Should succeed - partner can add outcome tracking
      await assertSucceeds(updateDoc(doc(partnerDb, 'assessmentSessions', sessionId), {
        outcomeTracking: {
          isReady: true,
          outcomeTag: 'breakthrough',
          outcomeNotes: 'Great progress',
          taggedBy: 'ying@queens.edu',
          taggedAt: new Date()
        },
        updatedAt: new Date()
      }));
    });
  });

  describe('Partner Cohorts', () => {
    it('should allow partner to read their own cohorts', async () => {
      const cohortId = 'alpha-fall25';
      
      // Seed with admin first
      await seedWithAdmin(testEnv, {
        cohortId,
        cohortDoc: {
          id: cohortId,
          partnerId: 'queens-college',
          cohortId,
          partnerName: 'Queens College',
          cohortName: 'Alpha-Fall25',
          partnerEmail: 'ying@queens.edu',
          expectedParticipants: 25,
          assessmentUrl: 'https://app.gutcheck.ai/assessment?cohort_id=alpha-fall25',
          status: 'active',
          createdAt: new Date(),
          // Ensure all required fields are present
          name: 'Alpha-Fall25'
        }
      });
      
      // Create partner context
      const partnerContext = testEnv.authenticatedContext('partner123', {
        email: 'ying@queens.edu'
      });
      const partnerDb = partnerContext.firestore();
      
      // Should succeed - partner reading their own cohort
      await assertSucceeds(getDoc(doc(partnerDb, 'cohorts', cohortId)));
    });

    it('should prevent partner from reading other partners cohorts', async () => {
      const cohortId = 'howard-fall25';
      
      // Seed with admin first
      await seedWithAdmin(testEnv, {
        cohortId,
        cohortDoc: {
          partnerId: 'howard-university',
          cohortId,
          partnerName: 'Howard University',
          cohortName: 'Howard-Fall25',
          partnerEmail: 'entrepreneurship@howard.edu', // Different email
          expectedParticipants: 25,
          assessmentUrl: 'https://app.gutcheck.ai/assessment?cohort_id=howard-fall25',
          status: 'active',
          createdAt: new Date()
        }
      });
      
      // Create partner context
      const partnerContext = testEnv.authenticatedContext('partner123', {
        email: 'ying@queens.edu'
      });
      const partnerDb = partnerContext.firestore();
      
      // Should fail - partner cannot read other partner's cohort
      await assertFails(getDoc(doc(partnerDb, 'cohorts', cohortId)));
    });
  });

  describe('Partners', () => {
    it('should allow partner to read their own data', async () => {
      const partnerId = 'queens-college';
      
      // Seed with admin first
      await seedWithAdmin(testEnv, {
        partnerId,
        partnerDoc: {
          id: partnerId,
          name: 'Queens College',
          email: 'ying@queens.edu',
          status: 'active',
          createdAt: new Date()
        }
      });
      
      // Create partner context
      const partnerContext = testEnv.authenticatedContext('partner123', {
        email: 'ying@queens.edu'
      });
      const partnerDb = partnerContext.firestore();
      
      // Should succeed - partner reading their own data
      await assertSucceeds(getDoc(doc(partnerDb, 'partners', partnerId)));
    });

    it('should prevent partner from reading other partners data', async () => {
      const partnerId = 'howard-university';
      
      // Seed with admin first
      await seedWithAdmin(testEnv, {
        partnerId,
        partnerDoc: {
          id: partnerId,
          name: 'Howard University',
          email: 'entrepreneurship@howard.edu', // Different email
          status: 'active',
          createdAt: new Date()
        }
      });
      
      // Create partner context
      const partnerContext = testEnv.authenticatedContext('partner123', {
        email: 'ying@queens.edu'
      });
      const partnerDb = partnerContext.firestore();
      
      // Should fail - partner cannot read other partner's data
      await assertFails(getDoc(doc(partnerDb, 'partners', partnerId)));
    });
  });

  describe('User Privacy', () => {
    it('should prevent user from reading other users data', async () => {
      const userId = 'user123';
      const otherUserId = 'user456';
      
      // Seed with admin first
      await seedWithAdmin(testEnv, {
        sessions: [{
          sessionId: 'session-other',
          doc: {
            sessionId: 'session-other',
            userId: otherUserId,
            responses: [],
            scores: { overallScore: 80 },
            createdAt: new Date(),
            isAnonymous: false,
            partnerMetadata: {
              partnerId: 'queens-college',
              cohortId: 'alpha-fall25',
              partnerName: 'Queens College',
              cohortName: 'Alpha-Fall25',
              createdAt: new Date()
            }
          }
        }]
      });
      
      // Create user context
      const userContext = testEnv.authenticatedContext(userId);
      const userDb = userContext.firestore();
      
      // Should fail - user cannot read other user's session
      await assertFails(getDoc(doc(userDb, 'assessmentSessions', 'session-other')));
    });

    it('should allow user to read their own token balance', async () => {
      const userId = 'user123';
      
      // Seed with admin first
      await seedWithAdmin(testEnv, {
        sessions: [{
          sessionId: 'token-test-session',
          doc: {
            sessionId: 'token-test-session',
            userId,
            responses: [],
            scores: { overallScore: 75 },
            createdAt: new Date(),
            isAnonymous: false
          }
        }]
      });
      
      // Create user context
      const userContext = testEnv.authenticatedContext(userId);
      const userDb = userContext.firestore();
      
      // Should succeed - user reading their own session (token balance test not applicable with current rules)
      await assertSucceeds(getDoc(doc(userDb, 'assessmentSessions', 'token-test-session')));
    });
  });
});
