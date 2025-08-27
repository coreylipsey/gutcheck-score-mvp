'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthContext } from '@/presentation/providers/AuthProvider';
import { DashboardService } from '@/application/services/DashboardService';
import { ProgressGraph } from '@/components/dashboard/ProgressGraph';
import { MonthlyInsights } from '@/components/dashboard/MonthlyInsights';
import { TokenBalanceIndicator } from '@/components/tokens/TokenBalanceIndicator';
import { TokenPurchaseModal } from '@/components/tokens/TokenPurchaseModal';
import { FeatureCard } from '@/components/tokens/FeatureCard';
import { TransactionHistory } from '@/components/tokens/TransactionHistory';
import { Brain, TrendingUp, Users, FileText, Zap, Target } from 'lucide-react';
import { ComingSoonOverlay } from '@/components/dashboard/ComingSoonOverlay';

import { AssessmentHistoryDTO } from '@/application/services/DashboardService';

function DashboardContent() {
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentHistoryDTO[]>([]);
  const [assessmentLimits, setAssessmentLimits] = useState<{
    canTakeAssessment: boolean;
    nextAvailableDate: string | null;
    daysUntilNextAssessment: number | null;
    lastAssessmentDate: string | null;
  }>({
    canTakeAssessment: true,
    nextAvailableDate: null,
    daysUntilNextAssessment: null,
    lastAssessmentDate: null
  });
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [featureAccess, setFeatureAccess] = useState<{
    'ai-market-analysis': boolean;
    'investor-matching': boolean;
    'competitor-report': boolean;
    'team-analysis': boolean;
    'pitch-deck-ai': boolean;
    'growth-projections': boolean;
  }>({
    'ai-market-analysis': false,
    'investor-matching': false,
    'competitor-report': false,
    'team-analysis': false,
    'pitch-deck-ai': false,
    'growth-projections': false
  });
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const { user, logout } = useAuthContext();

  // Features array matching the design
  const features = [
    {
      id: 'ai-market-analysis',
      title: 'AI Market Analysis Agent',
      description: 'Get comprehensive market analysis powered by AI to understand your competitive landscape and opportunities.',
      cost: 25,
      icon: <Brain className="w-6 h-6" />,
      category: 'AI Agent' as const,
      benefits: ['Market size analysis', 'Competitor mapping', 'Opportunity identification', 'Real-time data'],
      popular: true
    },
    {
      id: 'investor-matching',
      title: 'Investor Matching Algorithm',
      description: 'Advanced algorithm that matches your startup profile with the most suitable investors based on your sector and stage.',
      cost: 35,
      icon: <Target className="w-6 h-6" />,
      category: 'AI Agent' as const,
      benefits: ['Personalized investor list', 'Match scoring', 'Contact information', 'Investment patterns']
    },
    {
      id: 'competitor-report',
      title: 'Premium Competitor Report',
      description: 'Deep dive analysis of your top competitors including funding history, team analysis, and strategic insights.',
      cost: 15,
      icon: <TrendingUp className="w-6 h-6" />,
      category: 'Premium Insights' as const,
      benefits: ['Funding timeline', 'Team analysis', 'Strategic moves', 'Market positioning']
    },
    {
      id: 'team-analysis',
      title: 'Team Dynamics Analysis',
      description: 'Comprehensive analysis of your team composition and recommendations for strengthening key areas.',
      cost: 20,
      icon: <Users className="w-6 h-6" />,
      category: 'Premium Insights' as const,
      benefits: ['Skill gap analysis', 'Team chemistry', 'Hiring recommendations', 'Role optimization']
    },
    {
      id: 'pitch-deck-ai',
      title: 'AI Pitch Deck Optimizer',
      description: 'AI-powered analysis and optimization of your pitch deck with investor feedback simulation.',
      cost: 30,
      icon: <FileText className="w-6 h-6" />,
      category: 'AI Agent' as const,
      benefits: ['Content analysis', 'Structure optimization', 'Investor simulation', 'Improvement suggestions']
    },
    {
      id: 'growth-projections',
      title: 'Advanced Growth Projections',
      description: 'Sophisticated financial modeling and growth projections based on your industry and business model.',
      cost: 40,
      icon: <Zap className="w-6 h-6" />,
      category: 'Advanced Analytics' as const,
      benefits: ['Revenue modeling', 'Growth scenarios', 'Market validation', 'Funding timeline']
    }
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        try {
          const dashboardService = DashboardService.getInstance();
          const dashboardData = await dashboardService.getDashboardData(user.uid);
          
          setAssessmentHistory(dashboardData.assessmentHistory);
          setAssessmentLimits(dashboardData.assessmentLimits);
          setTokenBalance(dashboardData.tokenBalance);
          setFeatureAccess(dashboardData.featureAccess);
        } catch (error) {
          console.error('Error fetching user data:', error);
          
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

    fetchUserData();
  }, [user]);

  const handlePurchaseSuccess = () => {
    // Refresh token balance after successful purchase
    if (user?.uid) {
      const dashboardService = DashboardService.getInstance();
      dashboardService.refreshTokenData(user.uid).then(data => {
        setTokenBalance(data.tokenBalance);
        setFeatureAccess(data.featureAccess);
      });
    }
  };

  const handleFeatureUnlock = () => {
    // Refresh token balance and feature access after unlocking
    if (user?.uid) {
      const dashboardService = DashboardService.getInstance();
      dashboardService.refreshTokenData(user.uid).then(data => {
        setTokenBalance(data.tokenBalance);
        setFeatureAccess(data.featureAccess);
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-6">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#147AFF] to-[#19C2A0] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs sm:text-sm">G</span>
                </div>
                <span className="text-lg sm:text-xl font-bold text-[#0A1F44]">Gutcheck.AI</span>
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Dashboard
                </h1>
                {user && (
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    Welcome back, {user.displayName || user.email}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-4 w-full sm:w-auto">
              <TokenBalanceIndicator 
                onPurchaseClick={() => setShowPurchaseModal(true)}
              />
              {assessmentLimits.canTakeAssessment ? (
                <Link
                  href="/assessment"
                  className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 whitespace-nowrap w-full sm:w-auto"
                >
                  Take New Assessment
                </Link>
              ) : (
                <button
                  disabled
                  className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-lg text-gray-400 bg-gray-100 cursor-not-allowed whitespace-nowrap w-full sm:w-auto"
                >
                  Take New Assessment
                </button>
              )}
              <button
                onClick={logout}
                className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 whitespace-nowrap w-full sm:w-auto"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            Welcome to Your Gutcheck.AI Dashboard
          </h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            Track your entrepreneurial growth with monthly assessments and personalized insights.
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 sm:mb-8">
            <ProgressGraph assessments={assessmentHistory} />
            <MonthlyInsights 
              lastAssessment={assessmentHistory[0]}
              canTakeAssessment={assessmentLimits.canTakeAssessment}
              daysUntilNextAssessment={assessmentLimits.daysUntilNextAssessment || 0}
            />
          </div>
        </div>

        {/* Token Features Section */}
        <ComingSoonOverlay
          title="Premium Features Coming Soon"
          description="Our advanced AI-powered features are launching soon."
        >
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl text-[#0A1F44] font-bold mb-2 sm:mb-0">
                Premium Features
              </h2>
              <span className="bg-[#147AFF]/10 text-[#147AFF] border-[#147AFF] px-3 py-1 rounded-full text-sm font-medium">
                {features.filter(f => tokenBalance >= f.cost).length} Available
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {features.map((feature) => (
                <FeatureCard
                  key={feature.id}
                  feature={feature}
                  tokenBalance={tokenBalance}
                  isUnlocked={featureAccess[feature.id as keyof typeof featureAccess] || false}
                  onUnlockSuccess={handleFeatureUnlock}
                />
              ))}
            </div>
          </div>
        </ComingSoonOverlay>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Monthly Assessment
              </h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                {assessmentLimits.canTakeAssessment 
                  ? "Take your monthly assessment to track your progress."
                  : `Next assessment available in ${assessmentLimits.daysUntilNextAssessment} days.`
                }
              </p>
              <Link
                href={assessmentLimits.canTakeAssessment ? "/assessment" : "#"}
                className={`inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-lg ${
                  assessmentLimits.canTakeAssessment
                    ? "border-transparent text-white bg-blue-600 hover:bg-blue-700"
                    : "border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed"
                }`}
                onClick={(e) => !assessmentLimits.canTakeAssessment && e.preventDefault()}
              >
                {assessmentLimits.canTakeAssessment ? "Take Assessment" : "Not Available"}
              </Link>
            </div>
          </div>

          <ComingSoonOverlay
            title="Progress Tracking Coming Soon"
            description="Advanced progress tracking and analytics will be available soon."
          >
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 mb-4">
                  <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Track Progress
                </h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                  Monitor your entrepreneurial growth over time with multiple assessments.
                </p>
                <button
                  disabled
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-400 bg-gray-100 cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </div>
            </div>
          </ComingSoonOverlay>
        </div>

        {/* Transaction History */}
        <ComingSoonOverlay
          title="Transaction History Coming Soon"
          description="View your token purchase history and spending patterns."
        >
          <TransactionHistory />
        </ComingSoonOverlay>
      </main>

      {/* Token Purchase Modal */}
      <TokenPurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onPurchaseSuccess={handlePurchaseSuccess}
      />
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