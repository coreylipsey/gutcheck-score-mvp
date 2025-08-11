import { Container } from '@/infrastructure/di/container';
import { IAssessmentRepository } from '@/domain/repositories/IAssessmentRepository';
import { TokenService } from '@/application/services/TokenService';
import { AssessmentFrequencyService } from '@/application/services/AssessmentFrequencyService';

export interface AssessmentHistoryDTO {
  sessionId: string;
  completedAt: string;
  overallScore: number;
}

export interface AssessmentLimitsDTO {
  canTakeAssessment: boolean;
  nextAvailableDate: string | null;
  daysUntilNextAssessment: number | null;
  lastAssessmentDate: string | null;
}

export interface DashboardDataDTO {
  assessmentHistory: AssessmentHistoryDTO[];
  assessmentLimits: AssessmentLimitsDTO;
  tokenBalance: number;
  featureAccess: {
    'ai-market-analysis': boolean;
    'investor-matching': boolean;
    'competitor-report': boolean;
    'team-analysis': boolean;
    'pitch-deck-ai': boolean;
    'growth-projections': boolean;
  };
}

export class DashboardService {
  private static instance: DashboardService;

  private constructor() {}

  static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService();
    }
    return DashboardService.instance;
  }

  async getDashboardData(userId: string): Promise<DashboardDataDTO> {
    try {
      // Fetch assessment data
      const assessmentRepository = Container.getInstance().resolve<IAssessmentRepository>('IAssessmentRepository');
      const sessions = await assessmentRepository.findByUserId(userId);
      
      const assessmentHistory: AssessmentHistoryDTO[] = sessions.map(session => ({
        sessionId: session.sessionId,
        completedAt: session.completedAt?.toLocaleDateString() || new Date().toLocaleDateString(),
        overallScore: session.scores.overallScore
      }));
      
      // Check assessment frequency limits
      const limits = AssessmentFrequencyService.checkAssessmentLimits(assessmentHistory);
      const assessmentLimits: AssessmentLimitsDTO = {
        canTakeAssessment: limits.canTakeAssessment,
        nextAvailableDate: limits.nextAvailableDate?.toLocaleDateString() || null,
        daysUntilNextAssessment: limits.daysUntilNextAssessment,
        lastAssessmentDate: limits.lastAssessmentDate?.toLocaleDateString() || null
      };

      // Fetch token data
      const tokenService = Container.getInstance().resolve<TokenService>('TokenService');
      const tokenBalance = await tokenService.getUserTokenBalance(userId);
      const featureAccess = await tokenService.getUserFeatureAccess(userId);
      
      return {
        assessmentHistory,
        assessmentLimits,
        tokenBalance: tokenBalance.getBalance(),
        featureAccess: featureAccess.toFeatureAccess().features
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw new Error('Failed to load dashboard data');
    }
  }

  async refreshTokenData(userId: string): Promise<{
    tokenBalance: number;
    featureAccess: {
      'ai-market-analysis': boolean;
      'investor-matching': boolean;
      'competitor-report': boolean;
      'team-analysis': boolean;
      'pitch-deck-ai': boolean;
      'growth-projections': boolean;
    };
  }> {
    try {
      const tokenService = Container.getInstance().resolve<TokenService>('TokenService');
      const [tokenBalance, featureAccess] = await Promise.all([
        tokenService.getUserTokenBalance(userId),
        tokenService.getUserFeatureAccess(userId)
      ]);
      
      return {
        tokenBalance: tokenBalance.getBalance(),
        featureAccess: featureAccess.toFeatureAccess().features
      };
    } catch (error) {
      console.error('Error refreshing token data:', error);
      throw new Error('Failed to refresh token data');
    }
  }
} 