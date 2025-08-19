import { ITokenRepository } from '../../domain/repositories/ITokenRepository';
import { TokenEntity, FeatureAccessEntity, TokenTransaction, TokenPurchase } from '../../domain/entities/Token';

export interface FeatureCost {
  name: string;
  cost: number;
  description: string;
  category: 'retail' | 'institutional';
}

export class TokenService {
  private readonly tokenRepository: ITokenRepository;

  // Feature costs as defined in the design
  private static readonly FEATURE_COSTS: Record<string, FeatureCost> = {
    'ai-market-analysis': {
      name: 'AI Market Analysis Agent',
      cost: 25,
      description: 'Comprehensive market analysis powered by AI',
      category: 'retail'
    },
    'investor-matching': {
      name: 'Investor Matching Algorithm',
      cost: 35,
      description: 'Advanced algorithm for investor matching',
      category: 'retail'
    },
    'competitor-report': {
      name: 'Premium Competitor Report',
      cost: 15,
      description: 'Deep dive competitor analysis',
      category: 'retail'
    },
    'team-analysis': {
      name: 'Team Dynamics Analysis',
      cost: 20,
      description: 'Comprehensive team analysis',
      category: 'retail'
    },
    'pitch-deck-ai': {
      name: 'AI Pitch Deck Optimizer',
      cost: 30,
      description: 'AI-powered pitch deck optimization',
      category: 'retail'
    },
    'growth-projections': {
      name: 'Advanced Growth Projections',
      cost: 40,
      description: 'Sophisticated financial modeling',
      category: 'retail'
    }
  };

  constructor(tokenRepository: ITokenRepository) {
    this.tokenRepository = tokenRepository;
  }

  // Get user's token balance
  async getUserTokenBalance(userId: string): Promise<TokenEntity> {
    const tokenBalance = await this.tokenRepository.getTokenBalance(userId);
    
    if (!tokenBalance) {
      // Create new token balance for user
      const newTokenBalance = TokenEntity.create(userId);
      await this.tokenRepository.createTokenBalance(newTokenBalance.toTokenBalance());
      return newTokenBalance;
    }
    
    return TokenEntity.fromTokenBalance(tokenBalance);
  }

  // Get user's feature access
  async getUserFeatureAccess(userId: string): Promise<FeatureAccessEntity> {
    const featureAccess = await this.tokenRepository.getFeatureAccess(userId);
    
    if (!featureAccess) {
      // Create new feature access for user
      const newFeatureAccess = FeatureAccessEntity.create(userId);
      await this.tokenRepository.createFeatureAccess(newFeatureAccess.toFeatureAccess());
      return newFeatureAccess;
    }
    
    return FeatureAccessEntity.fromFeatureAccess(featureAccess);
  }

  // Add tokens to user balance (for purchases)
  async addTokensToUser(userId: string, amount: number, source: 'stripe' | 'admin' | 'system', stripePaymentIntentId?: string): Promise<TokenEntity> {
    const currentBalance = await this.getUserTokenBalance(userId);
    const newBalance = currentBalance.addTokens(amount);
    
    // Create transaction record
    const transaction: TokenTransaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: 'purchase',
      amount,
      source,
      stripePaymentIntentId,
      description: `Purchased ${amount} tokens`,
      timestamp: new Date(),
      balanceAfter: newBalance.getBalance()
    };

    // Update balance and create transaction atomically
    await this.tokenRepository.updateTokenBalanceAndCreateTransaction(
      newBalance.toTokenBalance(),
      transaction
    );

    return newBalance;
  }

  // Spend tokens to unlock a feature
  async spendTokensForFeature(userId: string, featureName: string): Promise<{ success: boolean; newBalance: TokenEntity; featureAccess: FeatureAccessEntity }> {
    const featureCost = TokenService.FEATURE_COSTS[featureName];
    if (!featureCost) {
      throw new Error(`Unknown feature: ${featureName}`);
    }

    const currentBalance = await this.getUserTokenBalance(userId);
    const currentFeatureAccess = await this.getUserFeatureAccess(userId);

    // Check if user has enough tokens
    if (!currentBalance.hasEnoughTokens(featureCost.cost)) {
      return {
        success: false,
        newBalance: currentBalance,
        featureAccess: currentFeatureAccess
      };
    }

    // Check if feature is already unlocked
    if (currentFeatureAccess.hasAccess(featureName as any)) {
      return {
        success: false,
        newBalance: currentBalance,
        featureAccess: currentFeatureAccess
      };
    }

    // Spend tokens
    const newBalance = currentBalance.spendTokens(featureCost.cost);
    const newFeatureAccess = currentFeatureAccess.unlockFeature(featureName as any);

    // Create transaction record
    const transaction: TokenTransaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: 'spend',
      amount: -featureCost.cost,
      featureName,
      source: 'system',
      description: `Unlocked ${featureCost.name}`,
      timestamp: new Date(),
      balanceAfter: newBalance.getBalance()
    };

    // Update balance and create transaction atomically
    await this.tokenRepository.updateTokenBalanceAndCreateTransaction(
      newBalance.toTokenBalance(),
      transaction
    );

    // Update feature access
    await this.tokenRepository.updateFeatureAccess(newFeatureAccess.toFeatureAccess());

    return {
      success: true,
      newBalance,
      featureAccess: newFeatureAccess
    };
  }

  // Get transaction history
  async getTransactionHistory(userId: string, limit?: number): Promise<TokenTransaction[]> {
    return this.tokenRepository.getTransactionHistory(userId, limit);
  }

  // Get feature costs
  static getFeatureCosts(): Record<string, FeatureCost> {
    return { ...TokenService.FEATURE_COSTS };
  }

  // Get feature cost for specific feature
  static getFeatureCost(featureName: string): FeatureCost | null {
    return TokenService.FEATURE_COSTS[featureName] || null;
  }

  // Check if user can afford a feature
  async canUserAffordFeature(userId: string, featureName: string): Promise<boolean> {
    const featureCost = TokenService.FEATURE_COSTS[featureName];
    if (!featureCost) {
      return false;
    }

    const currentBalance = await this.getUserTokenBalance(userId);
    return currentBalance.hasEnoughTokens(featureCost.cost);
  }

  // Check if user has access to a feature
  async userHasFeatureAccess(userId: string, featureName: string): Promise<boolean> {
    const featureAccess = await this.getUserFeatureAccess(userId);
    return featureAccess.hasAccess(featureName as any);
  }

  // Create token purchase record
  async createTokenPurchase(purchase: TokenPurchase): Promise<void> {
    await this.tokenRepository.createPurchase(purchase);
  }

  // Update purchase status
  async updatePurchaseStatus(purchaseId: string, status: TokenPurchase['status']): Promise<void> {
    await this.tokenRepository.updatePurchaseStatus(purchaseId, status);
  }

  // Get purchase by Stripe payment intent
  async getPurchaseByStripeIntent(stripePaymentIntentId: string): Promise<TokenPurchase | null> {
    return this.tokenRepository.getPurchaseByStripeIntent(stripePaymentIntentId);
  }
} 