import { Container } from './container';
import { FirestoreAssessmentRepository } from '../repositories/FirestoreAssessmentRepository';
import { FirestoreUserRepository } from '../repositories/FirestoreUserRepository';
import { FirebaseAuthRepository } from '../repositories/FirebaseAuthRepository';
import { GeminiAIService } from '../services/GeminiAIService';
import { ScoringService } from '../../application/services/ScoringService';
import { CalculateAssessmentScore } from '../../application/use-cases/CalculateAssessmentScore';
import { SaveAssessmentSession } from '../../application/use-cases/SaveAssessmentSession';
import { GenerateAIFeedback } from '../../application/use-cases/GenerateAIFeedback';
import { AuthenticateUser } from '../../application/use-cases/AuthenticateUser';

export function setupDependencies(): void {
  const container = Container.getInstance();

  // Register infrastructure services
  container.register('IAIScoringService', () => 
    new GeminiAIService(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '')
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

  // Register application services
  container.register('ScoringService', () => 
    new ScoringService(container.resolve('IAIScoringService'))
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

  container.register('AuthenticateUser', () => 
    new AuthenticateUser(
      container.resolve('IAuthRepository'),
      container.resolve('IUserRepository')
    )
  );
} 