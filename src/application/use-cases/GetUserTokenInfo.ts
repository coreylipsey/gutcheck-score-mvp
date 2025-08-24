import { TokenService } from '../services/TokenService';
import { TokenTransaction } from '../../domain/entities/Token';

export interface GetUserTokenInfoRequest {
  userId: string;
  includeTransactionHistory?: boolean;
  transactionLimit?: number;
}

export interface GetUserTokenInfoResponse {
  success: boolean;
  tokenBalance: number;
  featureAccess: {
    'ai-market-analysis': boolean;
    'investor-matching': boolean;
    'competitor-report': boolean;
    'team-analysis': boolean;
    'pitch-deck-ai': boolean;
    'growth-projections': boolean;
  };
  transactionHistory?: TokenTransaction[];
  error?: string;
}

export class GetUserTokenInfo {
  constructor(private tokenService: TokenService) {}

  async execute(request: GetUserTokenInfoRequest): Promise<GetUserTokenInfoResponse> {
    try {
      // Get token balance
      const tokenBalance = await this.tokenService.getUserTokenBalance(request.userId);
      
      // Get feature access
      const featureAccess = await this.tokenService.getUserFeatureAccess(request.userId);
      
      // Get transaction history if requested
      let transactionHistory: TokenTransaction[] | undefined;
      if (request.includeTransactionHistory) {
        transactionHistory = await this.tokenService.getTransactionHistory(
          request.userId,
          request.transactionLimit
        );
      }

      return {
        success: true,
        tokenBalance: tokenBalance.getBalance(),
        featureAccess: featureAccess.toFeatureAccess().features,
        transactionHistory
      };
    } catch (error) {
      return {
        success: false,
        tokenBalance: 0,
        featureAccess: {
          'ai-market-analysis': false,
          'investor-matching': false,
          'competitor-report': false,
          'team-analysis': false,
          'pitch-deck-ai': false,
          'growth-projections': false
        },
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
} 