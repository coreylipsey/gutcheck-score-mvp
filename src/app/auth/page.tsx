'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();

  // Get the redirect URL from query parameters
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const handleAuthSubmit = async (data: AuthFormData) => {
    setLoading(true);
    clearError();
    
    try {
      if (mode === 'login') {
        const loginData = data as LoginData;
        await signIn(loginData.email, loginData.password);
        router.push(redirectTo);
      } else if (mode === 'register') {
        const registerData = data as RegisterData;
        await signUp(registerData.email, registerData.password, registerData.displayName);
        router.push(redirectTo);
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
      router.push(redirectTo);
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
    <div className="min-h-screen bg-gradient-to-br from-[#0A1F44] to-[#147AFF] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white/95 backdrop-blur-sm border-0 rounded-lg shadow-sm p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#147AFF] to-[#19C2A0] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">G</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {mode === 'reset' ? 'Reset Password' : mode === 'register' ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-gray-600">
              {mode === 'reset' 
                ? 'Enter your email to reset your password'
                : mode === 'register' 
                ? 'Create your account to get started'
                : 'Sign in to your account'
              }
            </p>
          </div>

          {/* Auth Forms */}
          {mode === 'reset' ? (
            <PasswordResetForm
              onSubmit={handleResetSubmit}
              onBack={handleBackToLogin}
              loading={loading}
              success={resetSuccess}
            />
          ) : (
            <AuthForm
              mode={mode}
              onSubmit={handleAuthSubmit}
              onGoogleSignIn={handleGoogleSignIn}
              onModeChange={handleModeChange}
              onResetPassword={handleResetMode}
              loading={loading}
              error={error}
            />
          )}
        </div>
      </div>
    </div>
  );
} 