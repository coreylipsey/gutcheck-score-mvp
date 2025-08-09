'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '../../presentation/providers/AuthProvider';
import { AuthForm } from '../../components/auth/AuthForm';
import { PasswordResetForm } from '../../components/auth/PasswordResetForm';

type AuthMode = 'login' | 'register' | 'reset';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  displayName: string;
}

type AuthFormData = LoginData | RegisterData;

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const { signIn, signUp, signInWithGoogle, resetPassword, error, clearError } = useAuthContext();
  const router = useRouter();

  const handleAuthSubmit = async (data: AuthFormData) => {
    setLoading(true);
    clearError();
    
    try {
      if (mode === 'login') {
        const loginData = data as LoginData;
        await signIn(loginData.email, loginData.password);
        router.push('/dashboard');
      } else if (mode === 'register') {
        const registerData = data as RegisterData;
        await signUp(registerData.email, registerData.password, registerData.displayName);
        router.push('/dashboard');
      }
    } catch {
      // Error is handled by the auth context
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    clearError();
    
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch {
      // Error is handled by the auth context
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (data: { email: string }) => {
    setLoading(true);
    clearError();
    
    try {
      await resetPassword(data.email);
      setResetSuccess(true);
    } catch {
      // Error is handled by the auth context
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = () => {
    clearError();
    if (mode === 'login') {
      setMode('register');
    } else if (mode === 'register') {
      setMode('login');
    }
  };

  const handleResetMode = () => {
    clearError();
    setResetSuccess(false);
    setMode('reset');
  };

  const handleBackToLogin = () => {
    clearError();
    setResetSuccess(false);
    setMode('login');
  };

  return (
    <>
      {mode === 'reset' ? (
        <PasswordResetForm
          onSubmit={handleResetSubmit}
          onBack={handleBackToLogin}
          loading={loading}
          error={error?.message || null}
          success={resetSuccess}
        />
      ) : (
        <AuthForm
          mode={mode}
          onSubmit={handleAuthSubmit}
          onModeChange={handleModeChange}
          onForgotPassword={handleResetMode}
          onGoogleSignIn={handleGoogleSignIn}
          loading={loading}
          error={error?.message || null}
        />
      )}
    </>
  );
} 