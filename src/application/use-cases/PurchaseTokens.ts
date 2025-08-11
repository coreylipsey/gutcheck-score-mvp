import { TokenService } from '../services/TokenService';
import { TokenPurchase } from '../../domain/entities/Token';

export interface PurchaseTokensRequest {
  userId: string;
  amount: number;
  price: number;
  currency: string;
  stripePaymentIntentId: string;
}

export interface PurchaseTokensResponse {
  success: boolean;
  newBalance: number;
  purchaseId?: string;
  error?: string;
}

export class PurchaseTokens {
  constructor(private tokenService: TokenService) {}

  async execute(request: PurchaseTokensRequest): Promise<PurchaseTokensResponse> {
    try {
      // Create purchase record
      const purchase: Omit<TokenPurchase, 'id'> = {
        userId: request.userId,
        amount: request.amount,
        price: request.price,
        currency: request.currency,
        stripePaymentIntentId: request.stripePaymentIntentId,
        status: 'pending',
        createdAt: new Date()
      };

      await this.tokenService.createTokenPurchase(purchase);

      // Add tokens to user balance
      const newBalance = await this.tokenService.addTokensToUser(
        request.userId,
        request.amount,
        'stripe',
        request.stripePaymentIntentId
      );

      return {
        success: true,
        newBalance: newBalance.getBalance()
      };
    } catch (error) {
      console.error('Error purchasing tokens:', error);
      return {
        success: false,
        newBalance: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
} 