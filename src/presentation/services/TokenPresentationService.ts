import { Container } from '@/infrastructure/di/container';
import { GetUserTokenInfo } from '@/application/use-cases/GetUserTokenInfo';
import { SpendTokensForFeature } from '@/application/use-cases/SpendTokensForFeature';

export interface TokenBalanceData {
  balance: number;
  loading: boolean;
  error: string | null;
}

export interface FeatureAccessData {
  features: {
    'ai-market-analysis': boolean;
    'investor-matching': boolean;
    'competitor-report': boolean;
    'team-analysis': boolean;
    'pitch-deck-ai': boolean;
    'growth-projections': boolean;
  };
  loading: boolean;
  error: string | null;
}

export interface UnlockFeatureResult {
  success: boolean;
  newBalance: number;
  error?: string;
}

export class TokenPresentationService {
  private static instance: TokenPresentationService;

  private constructor() {}

  static getInstance(): TokenPresentationService {
    if (!TokenPresentationService.instance) {
      TokenPresentationService.instance = new TokenPresentationService();
    }
    return TokenPresentationService.instance;
  }

  async getTokenBalance(userId: string): Promise<TokenBalanceData> {
    try {
      const getUserTokenInfo = Container.getInstance().resolve<GetUserTokenInfo>('GetUserTokenInfo');
      const result = await getUserTokenInfo.execute({
        userId,
        includeTransactionHistory: false
      });

      if (result.success) {
        return {
          balance: result.tokenBalance,
          loading: false,
          error: null
        };
      } else {
        return {
          balance: 0,
          loading: false,
          error: result.error || 'Failed to load token balance'
        };
      }
    } catch (error) {
      return {
        balance: 0,
        loading: false,
        error: 'Failed to load token balance'
      };
    }
  }

  async getFeatureAccess(userId: string): Promise<FeatureAccessData> {
    try {
      const getUserTokenInfo = Container.getInstance().resolve<GetUserTokenInfo>('GetUserTokenInfo');
      const result = await getUserTokenInfo.execute({
        userId,
        includeTransactionHistory: false
      });

      if (result.success) {
        return {
          features: result.featureAccess,
          loading: false,
          error: null
        };
      } else {
        return {
          features: {
            'ai-market-analysis': false,
            'investor-matching': false,
            'competitor-report': false,
            'team-analysis': false,
            'pitch-deck-ai': false,
            'growth-projections': false
          },
          loading: false,
          error: result.error || 'Failed to load feature access'
        };
      }
    } catch (error) {
      return {
        features: {
          'ai-market-analysis': false,
          'investor-matching': false,
          'competitor-report': false,
          'team-analysis': false,
          'pitch-deck-ai': false,
          'growth-projections': false
        },
        loading: false,
        error: 'Failed to load feature access'
      };
    }
  }

  async unlockFeature(userId: string, featureName: string): Promise<UnlockFeatureResult> {
    try {
      const spendTokensForFeature = Container.getInstance().resolve<SpendTokensForFeature>('SpendTokensForFeature');
      const result = await spendTokensForFeature.execute({
        userId,
        featureName
      });

      if (result.success) {
        return {
          success: true,
          newBalance: result.newBalance
        };
      } else {
        return {
          success: false,
          newBalance: result.newBalance,
          error: result.error || 'Failed to unlock feature'
        };
      }
    } catch (error) {
      return {
        success: false,
        newBalance: 0,
        error: 'Failed to unlock feature'
      };
    }
  }
} 