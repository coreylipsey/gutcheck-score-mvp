'use client';

import { useState, useEffect } from 'react';
import { Container } from '../../infrastructure/di/container';
import { AuthenticateUser } from '../../application/use-cases/AuthenticateUser';
import { AuthUser, AuthError } from '../../domain/repositories/IAuthRepository';

export function useAuthClean() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  // Get the use case from dependency injection
  const authenticateUser = Container.getInstance().resolve<AuthenticateUser>('AuthenticateUser');

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authenticateUser.onAuthStateChanged((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [authenticateUser]);

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      setError(null);
      const user = await authenticateUser.signUp(email, password, displayName);
      return user;
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      throw authError;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const user = await authenticateUser.signIn(email, password);
      return user;
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      throw authError;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const user = await authenticateUser.signInWithGoogle();
      return user;
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      throw authError;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await authenticateUser.signOut();
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      throw authError;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await authenticateUser.resetPassword(email);
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      throw authError;
    }
  };

  const clearError = () => {
    setError(null);
    authenticateUser.clearError();
  };

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    resetPassword,
    clearError,
  };
}