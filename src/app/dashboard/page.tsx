'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthContext } from '@/presentation/providers/AuthProvider';
import { Container } from '@/infrastructure/di/container';
import { IAssessmentRepository } from '@/domain/repositories/IAssessmentRepository';

interface AssessmentHistory {
  sessionId: string;
  completedAt: string;
  overallScore: number;
}

function DashboardContent() {
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentHistory[]>([]);
  const { user, logout } = useAuthContext();

  useEffect(() => {
    const fetchUserAssessments = async () => {
      if (user?.uid) {
        try {
          // Use Clean Architecture - get repository from DI container
          const assessmentRepository = Container.getInstance().resolve<IAssessmentRepository>('IAssessmentRepository');
          const sessions = await assessmentRepository.findByUserId(user.uid);
          
          const assessments = sessions.map(session => ({
            sessionId: session.sessionId,
            completedAt: session.completedAt?.toLocaleDateString() || new Date().toLocaleDateString(),
            overallScore: session.scores.overallScore
          }));
          setAssessmentHistory(assessments);
        } catch (error) {
          console.error('Error fetching user assessments:', error);
          
          // Fallback to localStorage if Firestore fails
          const sessionId = localStorage.getItem('sessionId');
          const responsesData = localStorage.getItem('responsesData');
          
          if (sessionId && responsesData) {
            try {
              const parsedData = JSON.parse(responsesData);
              setAssessmentHistory([{
                sessionId,
                completedAt: new Date().toLocaleDateString(),
                overallScore: parsedData.scores?.overall || 0
              }]);
            } catch (localError) {
              console.error('Error parsing localStorage data:', localError);
            }
          }
        }
      }
    };

    fetchUserAssessments();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard
              </h1>
              {user && (
                <p className="text-sm text-gray-600 mt-1">
                  Welcome back, {user.displayName || user.email}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/assessment"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
              >
                Take New Assessment
              </Link>
              <button
                onClick={logout}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to Your Gutcheck Score™ Dashboard
          </h2>
          <p className="text-gray-600 mb-6">
            Track your entrepreneurial growth and access your assessment results, insights, and personalized recommendations.
          </p>
          
          {assessmentHistory.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No assessments yet
              </h3>
              <p className="text-gray-500 mb-4">
                Take your first Gutcheck Score™ assessment to get started.
              </p>
              <Link
                href="/assessment"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
              >
                Start Your First Assessment
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Recent Assessments
              </h3>
              {assessmentHistory.map((assessment) => (
                <div
                  key={assessment.sessionId}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">
                        Assessment completed on {assessment.completedAt}
                      </p>
                      <p className="text-sm text-gray-500">
                        Session ID: {assessment.sessionId}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        {assessment.overallScore}/100
                      </p>
                      <Link
                        href={`/assessment/results?sessionId=${assessment.sessionId}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View Results
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Take Assessment
              </h3>
              <p className="text-gray-600 mb-4">
                Complete the 25-question assessment to get your personalized score.
              </p>
              <Link
                href="/assessment"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
              >
                Start Assessment
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                View Results
              </h3>
              <p className="text-gray-600 mb-4">
                See your detailed score breakdown and AI-generated insights.
              </p>
              <Link
                href="/assessment/results"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
              >
                View Results
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 mb-4">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Track Progress
              </h3>
              <p className="text-gray-600 mb-4">
                Monitor your entrepreneurial growth over time with multiple assessments.
              </p>
              <button
                disabled
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-400 bg-gray-100 cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
} 