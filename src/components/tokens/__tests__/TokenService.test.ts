import { TokenService } from '../../TokenService';
import { TokenEntity, FeatureAccessEntity } from '../../../domain/entities/Token';

// Mock repository for testing
const mockTokenRepository = {
  getTokenBalance: jest.fn(),
  updateTokenBalance: jest.fn(),
  createTokenBalance: jest.fn(),
  createTransaction: jest.fn(),
  getTransactionHistory: jest.fn(),
  getTransactionById: jest.fn(),
  createPurchase: jest.fn(),
  updatePurchaseStatus: jest.fn(),
  getPurchaseByStripeIntent: jest.fn(),
  getFeatureAccess: jest.fn(),
  updateFeatureAccess: jest.fn(),
  createFeatureAccess: jest.fn(),
  updateTokenBalanceAndCreateTransaction: jest.fn(),
};

describe('TokenService', () => {
  let tokenService: TokenService;

  beforeEach(() => {
    tokenService = new TokenService(mockTokenRepository as any);
    jest.clearAllMocks();
  });

  describe('getUserTokenBalance', () => {
    it('should create new token balance for new user', async () => {
      const userId = 'user123';
      mockTokenRepository.getTokenBalance.mockResolvedValue(null);
      mockTokenRepository.createTokenBalance.mockResolvedValue(undefined);

      const result = await tokenService.getUserTokenBalance(userId);

      expect(result.getBalance()).toBe(0);
      expect(mockTokenRepository.createTokenBalance).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          balance: 0,
        })
      );
    });

    it('should return existing token balance for existing user', async () => {
      const userId = 'user123';
      const existingBalance = {
        userId,
        balance: 100,
        lastUpdated: new Date(),
      };
      mockTokenRepository.getTokenBalance.mockResolvedValue(existingBalance);

      const result = await tokenService.getUserTokenBalance(userId);

      expect(result.getBalance()).toBe(100);
      expect(mockTokenRepository.createTokenBalance).not.toHaveBeenCalled();
    });
  });

  describe('getUserFeatureAccess', () => {
    it('should create new feature access for new user', async () => {
      const userId = 'user123';
      mockTokenRepository.getFeatureAccess.mockResolvedValue(null);
      mockTokenRepository.createFeatureAccess.mockResolvedValue(undefined);

      const result = await tokenService.getUserFeatureAccess(userId);

      expect(result.hasAccess('proBreakdown')).toBe(false);
      expect(mockTokenRepository.createFeatureAccess).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          features: expect.objectContaining({
            proBreakdown: false,
            aiAgent: false,
          }),
        })
      );
    });

    it('should return existing feature access for existing user', async () => {
      const userId = 'user123';
      const existingAccess = {
        userId,
        features: {
          proBreakdown: true,
          aiAgent: false,
          investorReady: false,
          batchScoring: false,
          analyticsModule: false,
          customModelEval: false,
        },
        lastUpdated: new Date(),
      };
      mockTokenRepository.getFeatureAccess.mockResolvedValue(existingAccess);

      const result = await tokenService.getUserFeatureAccess(userId);

      expect(result.hasAccess('proBreakdown')).toBe(true);
      expect(result.hasAccess('aiAgent')).toBe(false);
      expect(mockTokenRepository.createFeatureAccess).not.toHaveBeenCalled();
    });
  });

  describe('spendTokensForFeature', () => {
    it('should successfully unlock feature when user has enough tokens', async () => {
      const userId = 'user123';
      const currentBalance = TokenEntity.create(userId).addTokens(10);
      const currentFeatureAccess = FeatureAccessEntity.create(userId);

      mockTokenRepository.getTokenBalance.mockResolvedValue(currentBalance.toTokenBalance());
      mockTokenRepository.getFeatureAccess.mockResolvedValue(currentFeatureAccess.toFeatureAccess());
      mockTokenRepository.updateTokenBalanceAndCreateTransaction.mockResolvedValue(undefined);
      mockTokenRepository.updateFeatureAccess.mockResolvedValue(undefined);

      const result = await tokenService.spendTokensForFeature(userId, 'proBreakdown');

      expect(result.success).toBe(true);
      expect(result.newBalance.getBalance()).toBe(5); // 10 - 5 = 5
      expect(result.featureAccess.hasAccess('proBreakdown')).toBe(true);
    });

    it('should fail when user has insufficient tokens', async () => {
      const userId = 'user123';
      const currentBalance = TokenEntity.create(userId).addTokens(3); // Not enough for proBreakdown (5 tokens)
      const currentFeatureAccess = FeatureAccessEntity.create(userId);

      mockTokenRepository.getTokenBalance.mockResolvedValue(currentBalance.toTokenBalance());
      mockTokenRepository.getFeatureAccess.mockResolvedValue(currentFeatureAccess.toFeatureAccess());

      const result = await tokenService.spendTokensForFeature(userId, 'proBreakdown');

      expect(result.success).toBe(false);
      expect(result.newBalance.getBalance()).toBe(3);
      expect(result.featureAccess.hasAccess('proBreakdown')).toBe(false);
    });

    it('should fail when feature is already unlocked', async () => {
      const userId = 'user123';
      const currentBalance = TokenEntity.create(userId).addTokens(10);
      const currentFeatureAccess = FeatureAccessEntity.create(userId).unlockFeature('proBreakdown');

      mockTokenRepository.getTokenBalance.mockResolvedValue(currentBalance.toTokenBalance());
      mockTokenRepository.getFeatureAccess.mockResolvedValue(currentFeatureAccess.toFeatureAccess());

      const result = await tokenService.spendTokensForFeature(userId, 'proBreakdown');

      expect(result.success).toBe(false);
      expect(result.newBalance.getBalance()).toBe(10);
      expect(result.featureAccess.hasAccess('proBreakdown')).toBe(true);
    });
  });

  describe('getFeatureCosts', () => {
    it('should return all feature costs', () => {
      const costs = TokenService.getFeatureCosts();

      expect(costs.proBreakdown).toBeDefined();
      expect(costs.proBreakdown.cost).toBe(5);
      expect(costs.proBreakdown.category).toBe('retail');

      expect(costs.batchScoring).toBeDefined();
      expect(costs.batchScoring.cost).toBe(100);
      expect(costs.batchScoring.category).toBe('institutional');
    });

    it('should return specific feature cost', () => {
      const cost = TokenService.getFeatureCost('proBreakdown');

      expect(cost).toBeDefined();
      expect(cost?.cost).toBe(5);
      expect(cost?.name).toBe('Pro Score Breakdown');
    });

    it('should return null for unknown feature', () => {
      const cost = TokenService.getFeatureCost('unknownFeature');

      expect(cost).toBeNull();
    });
  });
}); 