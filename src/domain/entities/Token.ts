export interface TokenBalance {
  userId: string;
  balance: number;
  lastUpdated: Date;
  lastPurchaseAt?: Date;
}

export interface FeatureAccess {
  userId: string;
  features: {
    'ai-market-analysis': boolean;
    'investor-matching': boolean;
    'competitor-report': boolean;
    'team-analysis': boolean;
    'pitch-deck-ai': boolean;
    'growth-projections': boolean;
  };
  lastUpdated: Date;
}

export interface TokenTransaction {
  id: string;
  userId: string;
  type: 'purchase' | 'spend' | 'refund' | 'bonus';
  amount: number;
  featureName?: string;
  source?: 'stripe' | 'admin' | 'system';
  stripePaymentIntentId?: string;
  description: string;
  timestamp: Date;
  balanceAfter: number;
}

export interface TokenPurchase {
  userId: string;
  amount: number;
  price: number;
  currency: string;
  stripePaymentIntentId: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: Date;
  completedAt?: Date;
}

export class TokenEntity {
  constructor(
    public readonly userId: string,
    public readonly balance: number,
    public readonly lastUpdated: Date,
    public readonly lastPurchaseAt?: Date
  ) {}

  static create(userId: string): TokenEntity {
    return new TokenEntity(userId, 0, new Date());
  }

  static fromTokenBalance(tokenBalance: TokenBalance): TokenEntity {
    return new TokenEntity(
      tokenBalance.userId,
      tokenBalance.balance,
      tokenBalance.lastUpdated,
      tokenBalance.lastPurchaseAt
    );
  }

  toTokenBalance(): TokenBalance {
    return {
      userId: this.userId,
      balance: this.balance,
      lastUpdated: this.lastUpdated,
      lastPurchaseAt: this.lastPurchaseAt
    };
  }

  addTokens(amount: number): TokenEntity {
    return new TokenEntity(
      this.userId,
      this.balance + amount,
      new Date(),
      amount > 0 ? new Date() : this.lastPurchaseAt
    );
  }

  spendTokens(amount: number): TokenEntity {
    if (this.balance < amount) {
      throw new Error('Insufficient token balance');
    }
    return new TokenEntity(
      this.userId,
      this.balance - amount,
      new Date(),
      this.lastPurchaseAt
    );
  }

  hasEnoughTokens(amount: number): boolean {
    return this.balance >= amount;
  }

  getBalance(): number {
    return this.balance;
  }
}

export class FeatureAccessEntity {
  constructor(
    public readonly userId: string,
    public readonly features: {
      'ai-market-analysis': boolean;
      'investor-matching': boolean;
      'competitor-report': boolean;
      'team-analysis': boolean;
      'pitch-deck-ai': boolean;
      'growth-projections': boolean;
    },
    public readonly lastUpdated: Date
  ) {}

  static create(userId: string): FeatureAccessEntity {
    return new FeatureAccessEntity(userId, {
      'ai-market-analysis': false,
      'investor-matching': false,
      'competitor-report': false,
      'team-analysis': false,
      'pitch-deck-ai': false,
      'growth-projections': false
    }, new Date());
  }

  static fromFeatureAccess(featureAccess: FeatureAccess): FeatureAccessEntity {
    return new FeatureAccessEntity(
      featureAccess.userId,
      featureAccess.features,
      featureAccess.lastUpdated
    );
  }

  toFeatureAccess(): FeatureAccess {
    return {
      userId: this.userId,
      features: this.features,
      lastUpdated: this.lastUpdated
    };
  }

  unlockFeature(featureName: keyof typeof this.features): FeatureAccessEntity {
    return new FeatureAccessEntity(
      this.userId,
      {
        ...this.features,
        [featureName]: true
      },
      new Date()
    );
  }

  hasAccess(featureName: keyof typeof this.features): boolean {
    return this.features[featureName];
  }

  getUnlockedFeatures(): string[] {
    return Object.entries(this.features)
      .filter(([_, hasAccess]) => hasAccess)
      .map(([featureName, _]) => featureName);
  }
} 