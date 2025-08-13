'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  displayName: z.string().min(2, 'Name must be at least 2 characters').optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

interface AuthFormProps {
  mode: 'login' | 'register';
  onSubmit: (data: LoginFormData | RegisterFormData) => Promise<void>;
  onModeChange: () => void;
  onForgotPassword?: () => void;
  onGoogleSignIn?: () => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export function AuthForm({ mode, onSubmit, onModeChange, onForgotPassword, onGoogleSignIn, loading = false, error }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData | RegisterFormData>({
    resolver: zodResolver(mode === 'login' ? loginSchema : registerSchema),
  });

  const handleFormSubmit = async (data: LoginFormData | RegisterFormData) => {
    try {
      await onSubmit(data);
      reset();
    } catch {
      // Error is handled by the parent component
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-8 lg:gap-16 items-start lg:items-center">
        
        {/* Welcome Panel */}
        <div className="lg:block space-y-8 order-2 lg:order-1">
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-[#0A1F44] leading-tight">
                {mode === 'login' ? 'Welcome Back' : 'Join Gutcheck.AI'}
              </h1>
              <p className="text-lg lg:text-xl text-gray-600 leading-relaxed">
                {mode === 'login' 
                  ? 'Access your entrepreneurial profile and continue building your reputation ledger. Your Gutcheck Score is waiting for you.'
                  : 'Start building your entrepreneurial reputation ledger. We make the entrepreneurially invisible, investable.'
                }
              </p>
            </div>

            {/* Brand Tagline */}
            <div className="bg-gradient-to-r from-[#147AFF] to-[#19C2A0] text-white p-6 rounded-2xl">
              <h2 className="text-xl lg:text-2xl font-bold mb-2">FICO Score for Entrepreneurs</h2>
              <p className="text-[#0A1F44]/90 font-medium">
                {mode === 'login' 
                  ? 'Your entrepreneurial potential, quantified and visible.'
                  : "Show them what they can't see."
                }
              </p>
            </div>
          </div>

          {/* Value Proposition Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 lg:p-8 shadow-lg">
            <h3 className="font-bold text-[#0A1F44] text-lg mb-6">
              {mode === 'login' ? 'Your Progress Awaits' : "What You'll Unlock"}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Assessments Completed</span>
                <span className="font-semibold text-[#147AFF]">
                  {mode === 'login' ? 'Ready to sync' : 'Track your progress'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Gutcheck Score</span>
                <span className="font-semibold text-[#19C2A0]">
                  {mode === 'login' ? 'Ready to calculate' : 'Monitor growth'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Growth Insights</span>
                <span className="font-semibold text-[#FF6B00]">
                  {mode === 'login' ? 'Ready to unlock' : 'AI-powered guidance'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Form */}
        <div className="w-full max-w-md mx-auto order-1 lg:order-2">
          <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-[#0A1F44] mb-3">
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </h2>
              <p className="text-gray-600">
                {mode === 'login' 
                  ? 'Access your entrepreneurial profile'
                  : 'Start your entrepreneurial journey'
                }
              </p>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
              {mode === 'register' && (
                <div className="space-y-2">
                  <label htmlFor="displayName" className="block text-sm font-semibold text-[#0A1F44]">
                    Full Name
                  </label>
                  <input
                    {...register('displayName')}
                    type="text"
                    id="displayName"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-[#147AFF] focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                  />
                  {errors.displayName && (
                    <p className="text-sm text-red-600">{errors.displayName.message}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-[#0A1F44]">
                  Email Address
                </label>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-[#147AFF] focus:border-transparent transition-all"
                  placeholder="you@company.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-semibold text-[#0A1F44]">
                    Password
                  </label>
                  {mode === 'login' && onForgotPassword && (
                    <button
                      type="button"
                      onClick={onForgotPassword}
                      className="text-sm text-[#147AFF] hover:text-[#147AFF]/80 font-semibold"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-[#147AFF] focus:border-transparent transition-all pr-12"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              {mode === 'register' && (
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#0A1F44]">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      {...register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-[#147AFF] focus:border-transparent transition-all pr-12"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#147AFF] to-[#19C2A0] text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-[#147AFF]/90 hover:to-[#19C2A0]/90 focus:outline-none focus:ring-2 focus:ring-[#147AFF] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
                  </div>
                ) : (
                  mode === 'login' ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-8 mb-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>
            </div>

            {/* Google Sign-In Button */}
            {onGoogleSignIn && (
              <button
                type="button"
                onClick={onGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 rounded-xl bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#147AFF] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold mb-6"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
              </button>
            )}

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={onModeChange}
                  className="text-[#147AFF] hover:text-[#147AFF]/80 font-semibold underline"
                >
                  {mode === 'login' ? 'Create account' : 'Sign in'}
                </button>
              </p>
            </div>

            <div className="mt-6 text-xs text-center text-gray-500">
              <p>
                Secure authentication powered by enterprise-grade security
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 