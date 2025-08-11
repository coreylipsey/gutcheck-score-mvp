import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { AnonymousSession } from '../../application/services/AntiGamingService';

export interface FirestoreAnonymousSession {
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Timestamp;
  completedAt: Timestamp;
  score: number;
  responsePattern: string;
  deviceFingerprint?: string;
}

export class FirestoreAnonymousSessionRepository {
  private readonly collectionName = 'anonymousSessions';

  /**
   * Store an anonymous assessment session
   */
  async storeSession(session: AnonymousSession, deviceFingerprint?: string): Promise<void> {
    const sessionRef = doc(collection(db, this.collectionName), session.sessionId);
    const firestoreSession: FirestoreAnonymousSession = {
      sessionId: session.sessionId,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      createdAt: Timestamp.fromDate(session.createdAt),
      completedAt: Timestamp.fromDate(session.completedAt),
      score: session.score,
      responsePattern: session.responsePattern,
      deviceFingerprint
    };

    await setDoc(sessionRef, firestoreSession);
  }

  /**
   * Get anonymous assessments by IP address (last 30 days)
   */
  async getAssessmentsByIP(ipAddress: string): Promise<AnonymousSession[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sessionsRef = collection(db, this.collectionName);
    const q = query(
      sessionsRef,
      where('ipAddress', '==', ipAddress),
      where('completedAt', '>=', Timestamp.fromDate(thirtyDaysAgo)),
      orderBy('completedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as FirestoreAnonymousSession;
      return {
        sessionId: data.sessionId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        createdAt: data.createdAt.toDate(),
        completedAt: data.completedAt.toDate(),
        score: data.score,
        responsePattern: data.responsePattern
      };
    });
  }

  /**
   * Get anonymous assessments by device fingerprint (last 30 days)
   */
  async getAssessmentsByDevice(deviceFingerprint: string): Promise<AnonymousSession[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sessionsRef = collection(db, this.collectionName);
    const q = query(
      sessionsRef,
      where('deviceFingerprint', '==', deviceFingerprint),
      where('completedAt', '>=', Timestamp.fromDate(thirtyDaysAgo)),
      orderBy('completedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as FirestoreAnonymousSession;
      return {
        sessionId: data.sessionId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        createdAt: data.createdAt.toDate(),
        completedAt: data.completedAt.toDate(),
        score: data.score,
        responsePattern: data.responsePattern
      };
    });
  }

  /**
   * Get the most recent anonymous assessment by IP
   */
  async getMostRecentByIP(ipAddress: string): Promise<AnonymousSession | null> {
    const sessionsRef = collection(db, this.collectionName);
    const q = query(
      sessionsRef,
      where('ipAddress', '==', ipAddress),
      orderBy('completedAt', 'desc'),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }

    const data = querySnapshot.docs[0].data() as FirestoreAnonymousSession;
    return {
      sessionId: data.sessionId,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      createdAt: data.createdAt.toDate(),
      completedAt: data.completedAt.toDate(),
      score: data.score,
      responsePattern: data.responsePattern
    };
  }

  /**
   * Check for duplicate response patterns
   */
  async checkForDuplicatePattern(responsePattern: string, ipAddress: string): Promise<boolean> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sessionsRef = collection(db, this.collectionName);
    const q = query(
      sessionsRef,
      where('ipAddress', '==', ipAddress),
      where('responsePattern', '==', responsePattern),
      where('completedAt', '>=', Timestamp.fromDate(thirtyDaysAgo))
    );

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }

  /**
   * Get suspicious assessments (high scores, rapid completion, etc.)
   */
  async getSuspiciousAssessments(): Promise<AnonymousSession[]> {
    const sessionsRef = collection(db, this.collectionName);
    const q = query(
      sessionsRef,
      where('score', '>=', 85), // High scores
      orderBy('score', 'desc'),
      limit(100)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as FirestoreAnonymousSession;
      return {
        sessionId: data.sessionId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        createdAt: data.createdAt.toDate(),
        completedAt: data.completedAt.toDate(),
        score: data.score,
        responsePattern: data.responsePattern
      };
    });
  }
} 