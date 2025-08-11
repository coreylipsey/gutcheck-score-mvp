import { TokenBalance, TokenTransaction, TokenPurchase, FeatureAccess } from '../entities/Token';

export interface ITokenRepository {
  // Token Balance Operations
  getTokenBalance(userId: string): Promise<TokenBalance | null>;
  updateTokenBalance(tokenBalance: TokenBalance): Promise<void>;
  createTokenBalance(tokenBalance: TokenBalance): Promise<void>;

  // Token Transactions
  createTransaction(transaction: TokenTransaction): Promise<void>;
  getTransactionHistory(userId: string, limit?: number): Promise<TokenTransaction[]>;
  getTransactionById(transactionId: string): Promise<TokenTransaction | null>;

  // Token Purchases
  createPurchase(purchase: TokenPurchase): Promise<void>;
  updatePurchaseStatus(purchaseId: string, status: TokenPurchase['status']): Promise<void>;
  getPurchaseByStripeIntent(stripePaymentIntentId: string): Promise<TokenPurchase | null>;

  // Feature Access
  getFeatureAccess(userId: string): Promise<FeatureAccess | null>;
  updateFeatureAccess(featureAccess: FeatureAccess): Promise<void>;
  createFeatureAccess(featureAccess: FeatureAccess): Promise<void>;

  // Batch Operations
  updateTokenBalanceAndCreateTransaction(
    tokenBalance: TokenBalance, 
    transaction: TokenTransaction
  ): Promise<void>;
} 