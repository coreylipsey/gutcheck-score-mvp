'use client';

import { useState, useEffect, Suspense } from 'react';
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

function AuthPageContent() {
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

  // If in reset mode, show the reset form
  if (mode === 'reset') {
    return <PasswordResetForm
      onSubmit={handleResetSubmit}
      onBack={handleBackToLogin}
      loading={loading}
      success={resetSuccess}
    />;
  }

  // Otherwise show the main auth form
  return (
    <AuthForm
      mode={mode}
      onSubmit={handleAuthSubmit}
      onGoogleSignIn={handleGoogleSignIn}
      onModeChange={handleModeChange}
      onResetPassword={handleResetMode}
      loading={loading}
      error={error}
    />
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-8 lg:gap-16 items-start lg:items-center">
          <div className="lg:block space-y-8 order-2 lg:order-1">
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0A1F44] leading-tight">
                  Welcome Back
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed">
                  Access your entrepreneurial profile and continue building your reputation ledger.
                </p>
              </div>
            </div>
          </div>
          <div className="w-full max-w-md mx-auto order-1 lg:order-2">
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#147AFF] mx-auto mb-4"></div>
                <p className="text-gray-600">Loading authentication...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
} 