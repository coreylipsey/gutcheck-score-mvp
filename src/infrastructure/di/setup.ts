import { Container } from './container';
import { FirestoreAssessmentRepository } from '../repositories/FirestoreAssessmentRepository';
import { FirestoreUserRepository } from '../repositories/FirestoreUserRepository';
import { FirebaseAuthRepository } from '../repositories/FirebaseAuthRepository';
import { FirestoreTokenRepository } from '../repositories/FirestoreTokenRepository';
import { GeminiAssessmentService } from '../services/GeminiAssessmentService';
import { ScoringService } from '../../application/services/ScoringService';
import { TokenService } from '../../application/services/TokenService';
import { CalculateAssessmentScore } from '../../application/use-cases/CalculateAssessmentScore';
import { SaveAssessmentSession } from '../../application/use-cases/SaveAssessmentSession';
import { GenerateAIFeedback } from '../../application/use-cases/GenerateAIFeedback';
import { CalculateQuestionScores } from '../../application/use-cases/CalculateQuestionScores';
import { AuthenticateUser } from '../../application/use-cases/AuthenticateUser';
import { PurchaseTokens } from '../../application/use-cases/PurchaseTokens';
import { SpendTokensForFeature } from '../../application/use-cases/SpendTokensForFeature';
import { GetUserTokenInfo } from '../../application/use-cases/GetUserTokenInfo';

export function setupDependencies(): void {
  const container = Container.getInstance();

  // Register infrastructure services
  // Use Gemini Assessment Service (restored from ADK)
  container.register('IAIScoringService', () => 
    new GeminiAssessmentService()
  );

  container.register('IAssessmentRepository', () => 
    new FirestoreAssessmentRepository()
  );

  container.register('IUserRepository', () => 
    new FirestoreUserRepository()
  );

  container.register('IAuthRepository', () => 
    new FirebaseAuthRepository()
  );

  container.register('ITokenRepository', () => 
    new FirestoreTokenRepository()
  );

  // Register application services
  container.register('ScoringService', () => 
    new ScoringService(container.resolve('IAIScoringService'))
  );

  container.register('TokenService', () => 
    new TokenService(container.resolve('ITokenRepository'))
  );

  // Register use cases
  container.register('CalculateAssessmentScore', () => 
    new CalculateAssessmentScore(
      container.resolve('ScoringService'),
      container.resolve('IAIScoringService')
    )
  );

  container.register('SaveAssessmentSession', () => 
    new SaveAssessmentSession(container.resolve('IAssessmentRepository'))
  );

  container.register('GenerateAIFeedback', () => 
    new GenerateAIFeedback(container.resolve('IAIScoringService'))
  );

  container.register('CalculateQuestionScores', () => 
    new CalculateQuestionScores(container.resolve('IAIScoringService'))
  );

  container.register('AuthenticateUser', () => 
    new AuthenticateUser(
      container.resolve('IAuthRepository'),
      container.resolve('IUserRepository')
    )
  );

  // Register token use cases
  container.register('PurchaseTokens', () => 
    new PurchaseTokens(container.resolve('TokenService'))
  );

  container.register('SpendTokensForFeature', () => 
    new SpendTokensForFeature(container.resolve('TokenService'))
  );

  container.register('GetUserTokenInfo', () => 
    new GetUserTokenInfo(container.resolve('TokenService'))
  );
} 