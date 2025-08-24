export enum ErrorCode {
  // Authentication errors
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  
  // Assessment errors
  ASSESSMENT_NOT_FOUND = 'ASSESSMENT_NOT_FOUND',
  ASSESSMENT_ALREADY_COMPLETED = 'ASSESSMENT_ALREADY_COMPLETED',
  ASSESSMENT_FREQUENCY_LIMIT = 'ASSESSMENT_FREQUENCY_LIMIT',
  INVALID_ASSESSMENT_DATA = 'INVALID_ASSESSMENT_DATA',
  
  // Token errors
  INSUFFICIENT_TOKENS = 'INSUFFICIENT_TOKENS',
  TOKEN_PURCHASE_FAILED = 'TOKEN_PURCHASE_FAILED',
  TOKEN_TRANSACTION_FAILED = 'TOKEN_TRANSACTION_FAILED',
  
  // AI/External service errors
  AI_SERVICE_UNAVAILABLE = 'AI_SERVICE_UNAVAILABLE',
  AI_GENERATION_FAILED = 'AI_GENERATION_FAILED',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  
  // Database errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  DATA_NOT_FOUND = 'DATA_NOT_FOUND',
  DATA_VALIDATION_ERROR = 'DATA_VALIDATION_ERROR',
  
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  
  // Generic errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR'
}

export interface ErrorDetails {
  code: ErrorCode;
  message: string;
  context?: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export class ApplicationError extends Error {
  public readonly code: ErrorCode;
  public readonly context?: string;
  public readonly timestamp: Date;
  public readonly userId?: string;
  public readonly sessionId?: string;
  public readonly metadata?: Record<string, any>;
  public readonly isOperational: boolean;

  constructor(
    code: ErrorCode,
    message: string,
    context?: string,
    userId?: string,
    sessionId?: string,
    metadata?: Record<string, any>,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = 'ApplicationError';
    this.code = code;
    this.context = context;
    this.timestamp = new Date();
    this.userId = userId;
    this.sessionId = sessionId;
    this.metadata = metadata;
    this.isOperational = isOperational;
  }

  toJSON(): ErrorDetails {
    return {
      code: this.code,
      message: this.message,
      context: this.context,
      timestamp: this.timestamp,
      userId: this.userId,
      sessionId: this.sessionId,
      metadata: this.metadata
    };
  }

  static fromError(error: Error, code: ErrorCode = ErrorCode.UNKNOWN_ERROR, context?: string): ApplicationError {
    return new ApplicationError(
      code,
      error.message,
      context,
      undefined,
      undefined,
      { originalError: error.name },
      false
    );
  }
}

// Specific error classes for better type safety
export class AuthenticationError extends ApplicationError {
  constructor(message: string, context?: string, userId?: string) {
    super(ErrorCode.AUTHENTICATION_FAILED, message, context, userId);
    this.name = 'AuthenticationError';
  }
}

export class AssessmentError extends ApplicationError {
  constructor(code: ErrorCode, message: string, context?: string, sessionId?: string) {
    super(code, message, context, undefined, sessionId);
    this.name = 'AssessmentError';
  }
}

export class TokenError extends ApplicationError {
  constructor(code: ErrorCode, message: string, context?: string, userId?: string) {
    super(code, message, context, userId);
    this.name = 'TokenError';
  }
}

export class AIServiceError extends ApplicationError {
  constructor(message: string, context?: string, metadata?: Record<string, any>) {
    super(ErrorCode.AI_SERVICE_UNAVAILABLE, message, context, undefined, undefined, metadata);
    this.name = 'AIServiceError';
  }
}

export class DatabaseError extends ApplicationError {
  constructor(message: string, context?: string, metadata?: Record<string, any>) {
    super(ErrorCode.DATABASE_ERROR, message, context, undefined, undefined, metadata);
    this.name = 'DatabaseError';
  }
}
