import { Timestamp } from 'firebase/firestore';
import { AssessmentResponse } from './assessment';

// Firestore User Model
export interface FirestoreUser {
  id: string;
  email?: string;
  displayName?: string;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  assessmentCount: number;
  averageScore?: number;
  bestScore?: number;
}

// Firestore Assessment Session Model
export interface FirestoreAssessmentSession {
  id: string;
  userId?: string; // Optional for anonymous users
  sessionId: string;
  responses: AssessmentResponse[];
  scores: {
    overall: number;
    personalBackground: number;
    entrepreneurialSkills: number;
    resources: number;
    behavioralMetrics: number;
    growthVision: number;
  };
  starRating: number;
  categoryBreakdown: Record<string, number>;
  geminiFeedback?: {
    feedback: string;
    strengths: string;
    focusAreas: string;
    nextSteps: string;
  };
  createdAt: Timestamp;
  completedAt: Timestamp;
  isAnonymous: boolean;
}

// Firestore Open-Ended Score Model
export interface FirestoreOpenEndedScore {
  id: string;
  userId?: string; // Optional for anonymous users
  sessionId: string;
  questionId: string;
  questionText: string;
  response: string;
  aiScore: number;
  aiExplanation: string;
  createdAt: Timestamp;
}

// Firestore Assessment Question Model (for caching)
export interface FirestoreAssessmentQuestion {
  id: string;
  text: string;
  subHeading?: string;
  category: string;
  type: 'multipleChoice' | 'multiSelect' | 'openEnded' | 'likert';
  options?: string[];
  weight: number;
  section: string;
  minCharacters?: number;
  validationPrompt?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
