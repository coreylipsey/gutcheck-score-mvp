import { getFunctions, httpsCallable } from 'firebase/functions';

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
      const functions = getFunctions();
      const getUserTokenInfo = httpsCallable(functions, 'getUserTokenInfo');
      
      const result = await getUserTokenInfo({
        userId,
        includeTransactionHistory: false
      });

      const data = result.data as any;
      if (data.success) {
        return {
          balance: data.tokenBalance,
          loading: false,
          error: null
        };
      } else {
        return {
          balance: 0,
          loading: false,
          error: data.error || 'Failed to load token balance'
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
      const functions = getFunctions();
      const getUserTokenInfo = httpsCallable(functions, 'getUserTokenInfo');
      
      const result = await getUserTokenInfo({
        userId,
        includeTransactionHistory: false
      });

      const data = result.data as any;
      if (data.success) {
        return {
          features: data.featureAccess,
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
          error: data.error || 'Failed to load feature access'
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
      const functions = getFunctions();
      const spendTokensForFeature = httpsCallable(functions, 'spendTokensForFeature');
      
      const result = await spendTokensForFeature({
        userId,
        featureName
      });

      const data = result.data as any;
      if (data.success) {
        return {
          success: true,
          newBalance: data.newBalance
        };
      } else {
        return {
          success: false,
          newBalance: data.newBalance,
          error: data.error || 'Failed to unlock feature'
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