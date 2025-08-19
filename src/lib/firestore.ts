import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  FirestoreAssessmentSession, 
  FirestoreOpenEndedScore, 
  FirestoreUser 
} from '@/types/firestore';
import { AssessmentResponse } from '@/types/assessment';

// Assessment Sessions
export const saveAssessmentSession = async (
  sessionId: string,
  responses: AssessmentResponse[],
  scores: {
    overall: number;
    personalBackground: number;
    entrepreneurialSkills: number;
    resources: number;
    behavioralMetrics: number;
    growthVision: number;
  },
  starRating: number,
  categoryBreakdown: Record<string, number>,
  geminiFeedback?: {
    feedback: string;
    strengths: string;
    focusAreas: string;
    nextSteps: string;
  },
  userId?: string
): Promise<string> => {
  // Create session data without undefined fields
  const sessionData: Record<string, unknown> = {
    sessionId,
    responses,
    scores,
    starRating,
    categoryBreakdown,
    geminiFeedback,
    createdAt: serverTimestamp(),
    completedAt: serverTimestamp(),
    isAnonymous: !userId,
  };

  // Only add userId if it exists
  if (userId) {
    sessionData.userId = userId;
  }

  const docRef = await addDoc(collection(db, 'assessmentSessions'), sessionData);
  return docRef.id;
};

export const getAssessmentSession = async (sessionId: string): Promise<FirestoreAssessmentSession | null> => {
  const q = query(
    collection(db, 'assessmentSessions'),
    where('sessionId', '==', sessionId),
    limit(1)
  );
  
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  
  const doc = querySnapshot.docs[0];
  return { id: doc.id, ...doc.data() } as FirestoreAssessmentSession;
};

export const getUserAssessmentSessions = async (userId: string): Promise<FirestoreAssessmentSession[]> => {
  const q = query(
    collection(db, 'assessmentSessions'),
    where('userId', '==', userId),
    orderBy('completedAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as FirestoreAssessmentSession);
};

// Open-Ended Scores
export const saveOpenEndedScore = async (
  sessionId: string,
  questionId: string,
  questionText: string,
  response: string,
  aiScore: number,
  aiExplanation: string,
  userId?: string
): Promise<string> => {
  // Create score data without undefined fields
  const scoreData: Record<string, unknown> = {
    sessionId,
    questionId,
    questionText,
    response,
    aiScore,
    aiExplanation,
    createdAt: serverTimestamp(),
  };

  // Only add userId if it exists
  if (userId) {
    scoreData.userId = userId;
  }

  const docRef = await addDoc(collection(db, 'openEndedScores'), scoreData);
  return docRef.id;
};

export const getSessionOpenEndedScores = async (sessionId: string): Promise<FirestoreOpenEndedScore[]> => {
  const q = query(
    collection(db, 'openEndedSessions'),
    where('sessionId', '==', sessionId)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as FirestoreOpenEndedScore);
};

// Users
export const createUser = async (userId: string, email?: string, displayName?: string): Promise<void> => {
  const userData: Record<string, unknown> = {
    id: userId,
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
    assessmentCount: 0,
  };

  // Only add optional fields if they exist
  if (email) userData.email = email;
  if (displayName) userData.displayName = displayName;

  await addDoc(collection(db, 'users'), userData);
};

export const getUser = async (userId: string): Promise<FirestoreUser | null> => {
  const q = query(
    collection(db, 'users'),
    where('id', '==', userId),
    limit(1)
  );
  
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  
  const doc = querySnapshot.docs[0];
  return { id: doc.id, ...doc.data() } as unknown as FirestoreUser;
};

export const updateUserAssessmentCount = async (userId: string, newCount: number): Promise<void> => {
  const q = query(
    collection(db, 'users'),
    where('id', '==', userId),
    limit(1)
  );
  
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const docRef = doc(db, 'users', querySnapshot.docs[0].id);
    await updateDoc(docRef, { 
      assessmentCount: newCount,
      lastLoginAt: serverTimestamp()
    });
  }
};
