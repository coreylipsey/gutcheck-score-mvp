'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuthContext } from '../presentation/providers/AuthProvider';
import { DashboardService } from './services/DashboardService';

export default function Home() {
  const { user, logout } = useAuthContext();
  const [assessmentLimits, setAssessmentLimits] = useState<{
    canTakeAssessment: boolean;
    nextAvailableDate: string | null;
    daysUntilNextAssessment: number | null;
    lastAssessmentDate: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check assessment limits for logged-in users
  useEffect(() => {
    const checkAssessmentLimits = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const dashboardService = DashboardService.getInstance();
          const data = await dashboardService.getDashboardData(user.uid);
          setAssessmentLimits(data.assessmentLimits);
        } catch (error) {
          console.error('Error checking assessment limits:', error);
          // If there's an error, allow the assessment to proceed
          setAssessmentLimits({
            canTakeAssessment: true,
            nextAvailableDate: null,
            daysUntilNextAssessment: null,
            lastAssessmentDate: null
          });
        }
        setIsLoading(false);
      }
    };

    checkAssessmentLimits();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#147AFF] to-[#19C2A0] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs sm:text-sm">G</span>
                </div>
                <span className="text-xl sm:text-2xl font-bold text-[#0A1F44]">Gutcheck.AI</span>
              </Link>
            </div>
            <nav className="flex space-x-4 sm:space-x-8">
              <Link href="/assessment" className="text-sm sm:text-base text-gray-500 hover:text-gray-900 whitespace-nowrap">
                Take Assessment
              </Link>
              {user ? (
                <>
                  <Link href="/dashboard" className="text-sm sm:text-base text-gray-500 hover:text-gray-900 whitespace-nowrap">
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="text-sm sm:text-base text-gray-500 hover:text-gray-900 whitespace-nowrap"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link href="/auth" className="text-sm sm:text-base text-gray-500 hover:text-gray-900 whitespace-nowrap">
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Discover Your
            <span className="text-blue-600"> Entrepreneurial Potential</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Take the Gutcheck.AI assessment to get your personalized entrepreneurial readiness score, 
            AI-powered insights, and actionable next steps to accelerate your business growth.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            {user && assessmentLimits && !assessmentLimits.canTakeAssessment ? (
              <button
                disabled
                className="inline-flex items-center px-8 py-4 border border-gray-300 text-lg font-medium rounded-lg text-gray-400 bg-gray-100 cursor-not-allowed focus:outline-none transition-colors"
              >
                {isLoading ? 'Checking...' : `Available in ${assessmentLimits.daysUntilNextAssessment} days`}
              </button>
            ) : (
              <Link
                href="/assessment"
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Start Assessment
              </Link>
            )}
            {user && (
              <Link
                href="/dashboard"
                className="inline-flex items-center px-8 py-4 border border-gray-300 text-lg font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                View Dashboard
              </Link>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What You&apos;ll Get
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Personalized Score</h3>
              <p className="text-gray-600">
                Get your Gutcheck.AI score across 5 key entrepreneurial dimensions with detailed breakdowns.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">AI-Powered Insights</h3>
              <p className="text-gray-600">
                Receive personalized feedback, strengths analysis, and actionable next steps powered by AI.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 mb-4">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Action Plan</h3>
              <p className="text-gray-600">
                Get specific recommendations for mentorship, funding opportunities, and learning resources.
              </p>
            </div>
          </div>
        </div>

        {/* Assessment Preview */}
        <div className="mt-20 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Assessment Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">5</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">25</div>
              <div className="text-sm text-gray-600">Questions</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">15</div>
              <div className="text-sm text-gray-600">Minutes</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">4</div>
              <div className="text-sm text-gray-600">AI-Evaluated</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">100</div>
              <div className="text-sm text-gray-600">Max Score</div>
            </div>
          </div>
        </div>
      </main>

      </div>
    </div>
  );
}
