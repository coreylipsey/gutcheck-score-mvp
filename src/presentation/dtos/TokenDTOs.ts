// Data Transfer Objects for the presentation layer
// These should be used instead of domain entities in components

export interface TokenBalanceDTO {
  balance: number;
  formattedBalance: string;
}

export interface FeatureDTO {
  id: string;
  title: string;
  description: string;
  cost: number;
  category: 'AI Agent' | 'Premium Insights' | 'Advanced Analytics';
  benefits: string[];
  popular?: boolean;
  isUnlocked: boolean;
  canAfford: boolean;
}

export interface TransactionDTO {
  id: string;
  type: 'purchase' | 'spend' | 'refund' | 'bonus';
  amount: number;
  description: string;
  timestamp: string;
  balanceAfter: number;
  formattedAmount: string;
  formattedBalanceAfter: string;
}

export interface TokenPackageDTO {
  id: string;
  name: string;
  tokens: number;
  price: number;
  savings?: number;
  popular?: boolean;
  features: string[];
  description: string;
  formattedTokens: string;
  formattedPrice: string;
  formattedSavings?: string;
}

// Utility functions for converting domain entities to DTOs
export class TokenDTOMapper {
  static toTokenBalanceDTO(balance: number): TokenBalanceDTO {
    return {
      balance,
      formattedBalance: balance.toLocaleString()
    };
  }

  static toFeatureDTO(
    feature: {
      id: string;
      title: string;
      description: string;
      cost: number;
      category: 'AI Agent' | 'Premium Insights' | 'Advanced Analytics';
      benefits: string[];
      popular?: boolean;
    },
    isUnlocked: boolean,
    canAfford: boolean
  ): FeatureDTO {
    return {
      ...feature,
      isUnlocked,
      canAfford
    };
  }

  static toTransactionDTO(transaction: {
    id: string;
    type: 'purchase' | 'spend' | 'refund' | 'bonus';
    amount: number;
    description: string;
    timestamp: Date;
    balanceAfter: number;
  }): TransactionDTO {
    return {
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      timestamp: transaction.timestamp.toLocaleDateString(),
      balanceAfter: transaction.balanceAfter,
      formattedAmount: transaction.amount.toLocaleString(),
      formattedBalanceAfter: transaction.balanceAfter.toLocaleString()
    };
  }

  static toTokenPackageDTO(package: {
    id: string;
    name: string;
    tokens: number;
    price: number;
    savings?: number;
    popular?: boolean;
    features: string[];
    description: string;
  }): TokenPackageDTO {
    return {
      ...package,
      formattedTokens: package.tokens.toLocaleString(),
      formattedPrice: `$${package.price}`,
      formattedSavings: package.savings ? `$${package.savings}` : undefined
    };
  }
} 