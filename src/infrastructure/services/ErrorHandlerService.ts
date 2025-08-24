import { ApplicationError, ErrorCode, AIServiceError, DatabaseError, TokenError, AssessmentError } from '../../domain/errors/ApplicationError';
import { ILoggingService } from './LoggingService';

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    userMessage?: string;
  };
}

export interface IErrorHandlerService {
  handleError(error: Error | ApplicationError, context?: string): ErrorResponse;
  handleAndLogError(error: Error | ApplicationError, context?: string): ErrorResponse;
  isOperationalError(error: Error | ApplicationError): boolean;
}

export class ErrorHandlerService implements IErrorHandlerService {
  private static instance: ErrorHandlerService;
  private logger: ILoggingService;

  private constructor() {
    // Import here to avoid circular dependency
    const { LoggingService } = require('./LoggingService');
    this.logger = LoggingService.getInstance();
  }

  static getInstance(): ErrorHandlerService {
    if (!ErrorHandlerService.instance) {
      ErrorHandlerService.instance = new ErrorHandlerService();
    }
    return ErrorHandlerService.instance;
  }

  handleError(error: Error | ApplicationError, context?: string): ErrorResponse {
    const appError = this.normalizeError(error, context);
    
    return {
      success: false,
      error: {
        code: appError.code,
        message: appError.message,
        userMessage: this.getUserFriendlyMessage(appError.code)
      }
    };
  }

  handleAndLogError(error: Error | ApplicationError, context?: string): ErrorResponse {
    const appError = this.normalizeError(error, context);
    
    // Log the error
    this.logger.error(
      appError.message,
      appError,
      context || appError.context,
      appError.metadata
    );

    return this.handleError(appError, context);
  }

  isOperationalError(error: Error | ApplicationError): boolean {
    const appError = this.normalizeError(error);
    return appError.isOperational;
  }

  private normalizeError(error: Error | ApplicationError, context?: string): ApplicationError {
    if (error instanceof ApplicationError) {
      return error;
    }

    // Convert generic errors to ApplicationError
    if (error.name === 'FirebaseError') {
      return new DatabaseError(error.message, context, { originalError: error });
    }

    if (error.message.includes('network') || error.message.includes('fetch')) {
      return new ApplicationError(ErrorCode.NETWORK_ERROR, error.message, context);
    }

    if (error.message.includes('timeout')) {
      return new ApplicationError(ErrorCode.TIMEOUT_ERROR, error.message, context);
    }

    return ApplicationError.fromError(error, ErrorCode.UNKNOWN_ERROR, context);
  }

  private getUserFriendlyMessage(code: ErrorCode): string {
    const userMessages: Record<ErrorCode, string> = {
      [ErrorCode.AUTHENTICATION_FAILED]: 'Please log in again to continue.',
      [ErrorCode.UNAUTHORIZED]: 'You are not authorized to perform this action.',
      [ErrorCode.INVALID_CREDENTIALS]: 'Invalid email or password. Please try again.',
      
      [ErrorCode.ASSESSMENT_NOT_FOUND]: 'Assessment not found. Please try again.',
      [ErrorCode.ASSESSMENT_ALREADY_COMPLETED]: 'This assessment has already been completed.',
      [ErrorCode.ASSESSMENT_FREQUENCY_LIMIT]: 'Please wait before taking another assessment.',
      [ErrorCode.INVALID_ASSESSMENT_DATA]: 'Invalid assessment data. Please try again.',
      
      [ErrorCode.INSUFFICIENT_TOKENS]: 'You don\'t have enough tokens for this feature.',
      [ErrorCode.TOKEN_PURCHASE_FAILED]: 'Token purchase failed. Please try again.',
      [ErrorCode.TOKEN_TRANSACTION_FAILED]: 'Token transaction failed. Please try again.',
      
      [ErrorCode.AI_SERVICE_UNAVAILABLE]: 'AI service is temporarily unavailable. Please try again later.',
      [ErrorCode.AI_GENERATION_FAILED]: 'Failed to generate AI feedback. Please try again.',
      [ErrorCode.EXTERNAL_SERVICE_ERROR]: 'External service error. Please try again later.',
      
      [ErrorCode.DATABASE_ERROR]: 'Database error. Please try again.',
      [ErrorCode.DATA_NOT_FOUND]: 'Data not found. Please try again.',
      [ErrorCode.DATA_VALIDATION_ERROR]: 'Data validation error. Please check your input.',
      
      [ErrorCode.NETWORK_ERROR]: 'Network error. Please check your connection and try again.',
      [ErrorCode.TIMEOUT_ERROR]: 'Request timed out. Please try again.',
      
      [ErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
      [ErrorCode.VALIDATION_ERROR]: 'Validation error. Please check your input.',
      [ErrorCode.CONFIGURATION_ERROR]: 'Configuration error. Please contact support.'
    };

    return userMessages[code] || 'An unexpected error occurred. Please try again.';
  }
}
