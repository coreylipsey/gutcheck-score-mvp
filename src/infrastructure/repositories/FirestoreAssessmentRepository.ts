import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  addDoc, 
  updateDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { IAssessmentRepository } from '../../domain/repositories/IAssessmentRepository';
import { AssessmentSession } from '../../domain/entities/Assessment';
import { PartnerMetadata } from '../../domain/value-objects/PartnerMetadata';
import { OutcomeTracking } from '../../domain/value-objects/OutcomeTracking';

export class FirestoreAssessmentRepository implements IAssessmentRepository {
  async save(session: AssessmentSession): Promise<string> {
    const sessionData: Record<string, unknown> = {
      sessionId: session.sessionId,
      responses: session.responses,
      scores: session.scores, // Existing scoring data preserved
      createdAt: Timestamp.now(),
      completedAt: Timestamp.now(),
      isAnonymous: !session.userId,
    };

    if (session.userId) {
      sessionData.userId = session.userId;
    }

    if (session.geminiFeedback) {
      sessionData.geminiFeedback = session.geminiFeedback; // Existing AI feedback preserved
    }

    // NEW: Add partner metadata if present (optional, backward compatible)
    if (session.partnerMetadata) {
      sessionData.partnerMetadata = session.partnerMetadata.toFirestore();
    }

    // NEW: Add outcome tracking if present (optional, backward compatible)
    if (session.outcomeTracking) {
      sessionData.outcomeTracking = session.outcomeTracking.toFirestore();
    }

    const docRef = await addDoc(collection(db, 'assessmentSessions'), sessionData);
    return docRef.id;
  }

  async findById(sessionId: string): Promise<AssessmentSession | null> {
    const q = query(
      collection(db, 'assessmentSessions'),
      where('sessionId', '==', sessionId),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      sessionId: data.sessionId,
      userId: data.userId,
      createdAt: data.createdAt?.toDate() || new Date(),
      completedAt: data.completedAt?.toDate(),
      responses: data.responses || [],
      scores: data.scores, // Existing scoring data preserved
      starRating: data.starRating || 1, // Existing 5-star system preserved
      categoryBreakdown: data.categoryBreakdown || {},
      geminiFeedback: data.geminiFeedback, // Existing AI feedback preserved
      outcomeTrackingReady: data.outcomeTrackingReady || false,
      consentForML: data.consentForML || false,
      // NEW: Parse partner metadata if present (optional, backward compatible)
      partnerMetadata: data.partnerMetadata ? PartnerMetadata.fromFirestore(data.partnerMetadata) : undefined,
      // NEW: Parse outcome tracking if present (optional, backward compatible)
      outcomeTracking: data.outcomeTracking ? OutcomeTracking.fromFirestore(data.outcomeTracking) : undefined,
    };
  }

  async findByUserId(userId: string): Promise<AssessmentSession[]> {
    const q = query(
      collection(db, 'assessmentSessions'),
      where('userId', '==', userId),
      orderBy('completedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        sessionId: data.sessionId,
        userId: data.userId,
        createdAt: data.createdAt?.toDate() || new Date(),
        completedAt: data.completedAt?.toDate(),
        responses: data.responses || [],
        scores: data.scores, // Existing scoring data preserved
        starRating: data.starRating || 1, // Existing 5-star system preserved
        categoryBreakdown: data.categoryBreakdown || {},
        geminiFeedback: data.geminiFeedback, // Existing AI feedback preserved
        outcomeTrackingReady: data.outcomeTrackingReady || false,
        consentForML: data.consentForML || false,
        // NEW: Parse partner metadata if present (optional, backward compatible)
        partnerMetadata: data.partnerMetadata ? PartnerMetadata.fromFirestore(data.partnerMetadata) : undefined,
        // NEW: Parse outcome tracking if present (optional, backward compatible)
        outcomeTracking: data.outcomeTracking ? OutcomeTracking.fromFirestore(data.outcomeTracking) : undefined,
      };
    });
  }

  async claimSession(sessionId: string, userId: string): Promise<void> {
    const q = query(
      collection(db, 'assessmentSessions'),
      where('sessionId', '==', sessionId),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      throw new Error('Session not found');
    }
    
    const doc = querySnapshot.docs[0];
    await updateDoc(doc.ref, {
      userId: userId,
      isAnonymous: false,
      claimedAt: Timestamp.now(),
    });
  }

  async saveOpenEndedScore(
    sessionId: string,
    questionId: string,
    questionText: string,
    response: string,
    aiScore: number,
    aiExplanation: string,
    userId?: string
  ): Promise<string> {
    const scoreData: Record<string, unknown> = {
      sessionId,
      questionId,
      questionText,
      response,
      aiScore,
      aiExplanation,
      createdAt: Timestamp.now(),
    };

    if (userId) {
      scoreData.userId = userId;
    }

    const docRef = await addDoc(collection(db, 'openEndedScores'), scoreData);
    return docRef.id;
  }

  async getSessionOpenEndedScores(sessionId: string): Promise<Record<string, unknown>[]> {
    const q = query(
      collection(db, 'openEndedScores'),
      where('sessionId', '==', sessionId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  // NEW: Partner-specific query methods
  async findByPartnerCohort(partnerId: string, cohortId: string): Promise<AssessmentSession[]> {
    const q = query(
      collection(db, 'assessmentSessions'),
      where('partnerMetadata.partnerId', '==', partnerId),
      where('partnerMetadata.cohortId', '==', cohortId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        sessionId: data.sessionId,
        userId: data.userId,
        createdAt: data.createdAt?.toDate() || new Date(),
        completedAt: data.completedAt?.toDate(),
        responses: data.responses || [],
        scores: data.scores, // Existing scoring data preserved
        starRating: data.starRating || 1, // Existing 5-star system preserved
        categoryBreakdown: data.categoryBreakdown || {},
        geminiFeedback: data.geminiFeedback, // Existing AI feedback preserved
        outcomeTrackingReady: data.outcomeTrackingReady || false,
        consentForML: data.consentForML || false,
        partnerMetadata: data.partnerMetadata ? PartnerMetadata.fromFirestore(data.partnerMetadata) : undefined,
        outcomeTracking: data.outcomeTracking ? OutcomeTracking.fromFirestore(data.outcomeTracking) : undefined,
      };
    });
  }

  async countByPartnerCohort(partnerId: string, cohortId: string): Promise<{ total: number; completed: number; tagged: number }> {
    const sessions = await this.findByPartnerCohort(partnerId, cohortId);
    
    return {
      total: sessions.length,
      completed: sessions.filter(s => s.completedAt).length,
      tagged: sessions.filter(s => s.outcomeTracking?.outcomeTag).length
    };
  }

  async findByOutcomeStatus(status: string): Promise<AssessmentSession[]> {
    const q = query(
      collection(db, 'assessmentSessions'),
      where('outcomeTracking.outcomeTag', '==', status),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        sessionId: data.sessionId,
        userId: data.userId,
        createdAt: data.createdAt?.toDate() || new Date(),
        completedAt: data.completedAt?.toDate(),
        responses: data.responses || [],
        scores: data.scores, // Existing scoring data preserved
        starRating: data.starRating || 1, // Existing 5-star system preserved
        categoryBreakdown: data.categoryBreakdown || {},
        geminiFeedback: data.geminiFeedback, // Existing AI feedback preserved
        outcomeTrackingReady: data.outcomeTrackingReady || false,
        consentForML: data.consentForML || false,
        partnerMetadata: data.partnerMetadata ? PartnerMetadata.fromFirestore(data.partnerMetadata) : undefined,
        outcomeTracking: data.outcomeTracking ? OutcomeTracking.fromFirestore(data.outcomeTracking) : undefined,
      };
    });
  }
} 