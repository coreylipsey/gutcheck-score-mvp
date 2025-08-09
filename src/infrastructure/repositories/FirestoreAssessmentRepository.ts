import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { IAssessmentRepository } from '../../domain/repositories/IAssessmentRepository';
import { AssessmentSession } from '../../domain/entities/Assessment';

export class FirestoreAssessmentRepository implements IAssessmentRepository {
  async save(session: AssessmentSession): Promise<string> {
    const sessionData: Record<string, unknown> = {
      sessionId: session.sessionId,
      responses: session.responses,
      scores: session.scores,
      createdAt: serverTimestamp(),
      completedAt: serverTimestamp(),
      isAnonymous: !session.userId,
    };

    if (session.userId) {
      sessionData.userId = session.userId;
    }

    if (session.geminiFeedback) {
      sessionData.geminiFeedback = session.geminiFeedback;
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
      scores: data.scores,
      geminiFeedback: data.geminiFeedback,
      outcomeTrackingReady: data.outcomeTrackingReady || false,
      consentForML: data.consentForML || false,
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
        scores: data.scores,
        geminiFeedback: data.geminiFeedback,
        outcomeTrackingReady: data.outcomeTrackingReady || false,
        consentForML: data.consentForML || false,
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
      claimedAt: serverTimestamp(),
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
      createdAt: serverTimestamp(),
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
} 