import { User } from '../entities/User';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
}

export interface AuthError {
  code: string;
  message: string;
}

export interface IAuthRepository {
  // Core authentication operations
  signUp(email: string, password: string, displayName?: string): Promise<AuthUser>;
  signIn(email: string, password: string): Promise<AuthUser>;
  signInWithGoogle(): Promise<AuthUser>;
  signOut(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  
  // User state management
  getCurrentUser(): AuthUser | null;
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void;
  
  // Error handling
  getLastError(): AuthError | null;
  clearError(): void;
}