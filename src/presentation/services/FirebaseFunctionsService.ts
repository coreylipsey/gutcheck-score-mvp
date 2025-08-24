export interface ClaimScoreRequest {
  sessionId: string;
  userId: string;
}

export interface ClaimScoreResponse {
  success: boolean;
  error?: {
    code: string;
    message: string;
    userMessage?: string;
  };
}

export interface IFirebaseFunctionsService {
  claimScore(request: ClaimScoreRequest): Promise<ClaimScoreResponse>;
}

export class FirebaseFunctionsService implements IFirebaseFunctionsService {
  private static instance: FirebaseFunctionsService;
  private errorHandler: any; // Will be imported dynamically

  private constructor() {
    // Import here to avoid circular dependency
    const { ErrorHandlerService } = require('../../infrastructure/services/ErrorHandlerService');
    this.errorHandler = ErrorHandlerService.getInstance();
  }

  static getInstance(): FirebaseFunctionsService {
    if (!FirebaseFunctionsService.instance) {
      FirebaseFunctionsService.instance = new FirebaseFunctionsService();
    }
    return FirebaseFunctionsService.instance;
  }

  async claimScore(request: ClaimScoreRequest): Promise<ClaimScoreResponse> {
    try {
      // Dynamically import Firebase to avoid SSR issues
      const { getFunctions, httpsCallable } = await import('firebase/functions');
      const functions = getFunctions();
      const claimScore = httpsCallable(functions, 'claimScore');

      const result = await claimScore({
        sessionId: request.sessionId,
        userId: request.userId,
      });

      const data = result.data as any;
      return {
        success: data.success || false,
        error: data.error
      };
    } catch (error) {
      const errorResponse = this.errorHandler.handleAndLogError(
        error instanceof Error ? error : new Error(String(error)),
        'FirebaseFunctionsService.claimScore'
      );
      return {
        success: false,
        error: errorResponse.error
      };
    }
  }
}
