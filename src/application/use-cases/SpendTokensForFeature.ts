import { TokenService } from '../services/TokenService';

export interface SpendTokensForFeatureRequest {
  userId: string;
  featureName: string;
}

export interface SpendTokensForFeatureResponse {
  success: boolean;
  newBalance: number;
  featureUnlocked: boolean;
  error?: string;
}

export class SpendTokensForFeature {
  constructor(private tokenService: TokenService) {}

  async execute(request: SpendTokensForFeatureRequest): Promise<SpendTokensForFeatureResponse> {
    try {
      const result = await this.tokenService.spendTokensForFeature(
        request.userId,
        request.featureName
      );

      return {
        success: result.success,
        newBalance: result.newBalance.getBalance(),
        featureUnlocked: result.success
      };
    } catch (error) {
      console.error('Error spending tokens for feature:', error);
      return {
        success: false,
        newBalance: 0,
        featureUnlocked: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
} 