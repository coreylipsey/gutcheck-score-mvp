import { Container } from './container';
import { FirestoreAssessmentRepository } from '../repositories/FirestoreAssessmentRepository';
import { FirestorePartnerRepository } from '../repositories/FirestorePartnerRepository';
import { FirestoreUserRepository } from '../repositories/FirestoreUserRepository';
import { FirebaseAuthRepository } from '../repositories/FirebaseAuthRepository';
import { FirestoreTokenRepository } from '../repositories/FirestoreTokenRepository';
import { GeminiAssessmentService } from '../services/GeminiAssessmentService';
import { LoggingService } from '../services/LoggingService';
import { ErrorHandlerService } from '../services/ErrorHandlerService';
import { ScoringService } from '../../application/services/ScoringService';
import { TokenService } from '../../application/services/TokenService';
import { DashboardService } from '../../application/services/DashboardService';
import { CalculateAssessmentScore } from '../../application/use-cases/CalculateAssessmentScore';
import { SaveAssessmentSession } from '../../application/use-cases/SaveAssessmentSession';
import { CreatePartnerCohort } from '../../application/use-cases/CreatePartnerCohort';
import { GetPilotMetrics } from '../../application/use-cases/GetPilotMetrics';
import { GenerateAIFeedback } from '../../application/use-cases/GenerateAIFeedback';
import { CalculateQuestionScores } from '../../application/use-cases/CalculateQuestionScores';
import { AuthenticateUser } from '../../application/use-cases/AuthenticateUser';
import { PurchaseTokens } from '../../application/use-cases/PurchaseTokens';
import { SpendTokensForFeature } from '../../application/use-cases/SpendTokensForFeature';
import { GetUserTokenInfo } from '../../application/use-cases/GetUserTokenInfo';

export function setupDependencies(): void {
  const container = Container.getInstance();

  // Register infrastructure services
  container.register('ILoggingService', () => 
    LoggingService.getInstance()
  );

  container.register('IErrorHandlerService', () => 
    ErrorHandlerService.getInstance()
  );
  // Use Gemini Assessment Service (restored from ADK)
  container.register('IAIScoringService', () => 
    new GeminiAssessmentService()
  );

  container.register('IAssessmentRepository', () => 
    new FirestoreAssessmentRepository()
  );

  container.register('IPartnerRepository', () => 
    new FirestorePartnerRepository()
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

  container.register('DashboardService', () => 
    DashboardService.getInstance()
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

  container.register('CreatePartnerCohort', () => 
    new CreatePartnerCohort(container.resolve('IPartnerRepository'))
  );

  container.register('GetPilotMetrics', () => 
    new GetPilotMetrics(container.resolve('IAssessmentRepository'))
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