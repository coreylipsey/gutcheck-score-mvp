'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuthClean } from '../hooks/useAuthClean';
import { AuthUser, AuthError } from '../../domain/repositories/IAuthRepository';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: AuthError | null;
  signUp: (email: string, password: string, displayName?: string) => Promise<AuthUser>;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signInWithGoogle: () => Promise<AuthUser>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthClean();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
} 