'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const resetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ResetFormData = z.infer<typeof resetSchema>;

interface PasswordResetFormProps {
  onSubmit: (data: ResetFormData) => Promise<void>;
  onBack: () => void;
  loading?: boolean;
  error?: string | null;
  success?: boolean;
}

export function PasswordResetForm({ onSubmit, onBack, loading = false, error, success }: PasswordResetFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const handleFormSubmit = async (data: ResetFormData) => {
    try {
      await onSubmit(data);
      reset();
    } catch {
      // Error is handled by the parent component
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A1F44]/10 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-[#19C2A0] to-[#147AFF] mb-6">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#0A1F44] mb-3">Check Your Email</h2>
              <p className="text-gray-600 mb-8 text-lg">
                We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
              </p>
              <button
                onClick={onBack}
                className="bg-gradient-to-r from-[#147AFF] to-[#19C2A0] text-white px-8 py-3 rounded-xl hover:from-[#147AFF]/90 hover:to-[#19C2A0]/90 focus:outline-none focus:ring-2 focus:ring-[#147AFF] focus:ring-offset-2 transition-all font-bold shadow-lg"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1F44]/10 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#0A1F44] mb-3">Reset Password</h2>
            <p className="text-gray-600 text-lg">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
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
                  Sending Reset Link...
                </div>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={onBack}
              className="text-[#147AFF] hover:text-[#147AFF]/80 font-semibold underline"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 