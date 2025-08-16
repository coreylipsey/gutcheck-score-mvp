import { Timestamp } from 'firebase/firestore';
import { AssessmentResponse } from './assessment';

// Firestore User Model
export interface FirestoreUser {
  email: string;
  displayName?: string;
  createdAt: Date | Timestamp;
  assessmentCount: number;
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
    competitiveAdvantage: {
      category: string;
      score: string;
      summary: string;
      specificStrengths: string[];
    };
    growthOpportunity: {
      category: string;
      score: string;
      summary: string;
      specificWeaknesses: string[];
    };
    scoreProjection: {
      currentScore: number;
      projectedScore: number;
      improvementPotential: number;
      analysis?: {
        lowestCategory: string;
        currentCategoryScore: number;
        realisticImprovements: Array<{
          questionId: string;
          currentResponse: string;
          currentScore: number;
          suggestedImprovement: string;
          potentialScore: number;
          pointGain: number;
          reasoning: string;
        }>;
        totalPointGain: number;
      };
    };
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

// Token Economy Firestore Models
export interface FirestoreTokenBalance {
  userId: string;
  balance: number;
  lastUpdated: Timestamp;
  lastPurchaseAt?: Timestamp;
}

export interface FirestoreFeatureAccess {
  userId: string;
  features: {
    'ai-market-analysis': boolean;
    'investor-matching': boolean;
    'competitor-report': boolean;
    'team-analysis': boolean;
    'pitch-deck-ai': boolean;
    'growth-projections': boolean;
  };
  lastUpdated: Timestamp;
}

export interface FirestoreTokenTransaction {
  id: string;
  userId: string;
  type: 'purchase' | 'spend' | 'refund' | 'bonus';
  amount: number;
  featureName?: string;
  source?: 'stripe' | 'admin' | 'system';
  stripePaymentIntentId?: string;
  description: string;
  timestamp: Timestamp;
  balanceAfter: number;
}

export interface FirestoreTokenPurchase {
  id: string;
  userId: string;
  amount: number;
  price: number;
  currency: string;
  stripePaymentIntentId: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: Timestamp;
  completedAt?: Timestamp;
}
