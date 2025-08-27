'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthContext } from '@/presentation/providers/AuthProvider';
import { 
  ArrowLeft,
  TrendingUp,
  Target,
  Lightbulb,
  Users,
  Award
} from 'lucide-react';

interface ParticipantReport {
  sessionId: string;
  participantName: string;
  participantEmail: string;
  completedAt: string;
  overallScore: number;
  categoryScores: {
    [key: string]: number;
  };
  responses: {
    [key: string]: string;
  };
  feedback: {
    keyInsights?: string;
    competitiveAdvantage?: string;
    growthOpportunity?: string;
    nextSteps?: string;
  };
}

function ParticipantReport() {
  const params = useParams();
  const partnerId = params.partnerId as string;
  const cohortId = params.cohortId as string;
  const sessionId = params.sessionId as string;
  const { user } = useAuthContext();
  
  const [report, setReport] = useState<ParticipantReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParticipantReport = async () => {
      try {
        // Fetch participant report data
        const response = await fetch(`/api/partner/dashboard/${partnerId}/cohort/${cohortId}/participant/${sessionId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch participant report');
        }
        
        const data = await response.json();
        setReport(data.report);
      } catch (error) {
        console.error('Error fetching participant report:', error);
        // For now, use mock data
        setReport({
          sessionId: sessionId,
          participantName: 'Alex Rodriguez',
          participantEmail: 'alex.rodriguez@email.com',
          completedAt: '2025-08-25T10:30:00Z',
          overallScore: 87,
          categoryScores: {
            'Market Understanding': 85,
            'Execution Capability': 90,
            'Team & Resources': 82,
            'Financial Acumen': 88,
            'Risk Management': 85,
            'Innovation & Adaptability': 89
          },
          responses: {
            'entrepreneurialJourney': 'I started my first business at 19, a small e-commerce store that grew to $50K in revenue. After graduating, I co-founded a tech startup that raised $500K in seed funding. We pivoted twice based on market feedback and eventually found product-market fit.',
            'businessChallenge': 'Our biggest challenge was customer acquisition cost. We initially spent $200 per customer but through A/B testing and optimization, we reduced it to $45 while maintaining quality leads.',
            'setbacksResilience': 'When our main investor pulled out last minute, we had to lay off half our team. Instead of giving up, we restructured the business, focused on profitability, and bootstrapped our way to break-even in 6 months.',
            'finalVision': 'I want to build a platform that democratizes access to entrepreneurial education and resources. My vision is to help 100,000 entrepreneurs launch successful businesses in the next 10 years.'
          },
          feedback: {
            keyInsights: 'Alex demonstrates strong execution capability with a proven track record of building and scaling businesses. Their resilience in the face of setbacks shows exceptional adaptability.',
            competitiveAdvantage: 'Deep experience in e-commerce and tech startups, with proven ability to pivot and adapt to market changes. Strong track record of fundraising and team management.',
            growthOpportunity: 'Could benefit from more structured financial planning and risk assessment frameworks. Consider developing stronger market research methodologies.',
            nextSteps: 'Focus on building a more robust financial model and developing systematic approaches to market validation. Consider mentorship in scaling operations.'
          }
        });
      } finally {
        setLoading(false);
      }
    };

    if (partnerId && cohortId && sessionId) {
      fetchParticipantReport();
    }
  }, [partnerId, cohortId, sessionId]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 90) return 'bg-green-50';
    if (score >= 80) return 'bg-blue-50';
    if (score >= 70) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-[#0A1F44] to-[#147AFF] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="mt-4 text-white">Loading participant report...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!report) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-[#0A1F44] to-[#147AFF] flex items-center justify-center">
          <div className="text-center text-white">
            <p>Participant report not found</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[#0A1F44] to-[#147AFF] p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header with back button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a 
                href={`/partner/dashboard/${partnerId}/cohort/${cohortId}`} 
                className="flex items-center gap-2 text-white hover:text-blue-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Cohort
              </a>
              <div>
                <h1 className="text-3xl text-white mb-2">{report.participantName}</h1>
                <p className="text-blue-200">Assessment Report</p>
              </div>
            </div>
          </div>

          {/* Overall Score Card */}
          <div className="bg-white/95 backdrop-blur-sm border-0 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Overall Score</h2>
              <span className="text-sm text-gray-600">
                Completed: {new Date(report.completedAt).toLocaleDateString()}
              </span>
            </div>
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getScoreBackground(report.overallScore)} ${getScoreColor(report.overallScore)}`}>
                <span className="text-3xl font-bold">{report.overallScore}</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">{report.participantEmail}</p>
            </div>
          </div>

          {/* Category Scores */}
          <div className="bg-white/95 backdrop-blur-sm border-0 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Category Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(report.categoryScores).map(([category, score]) => (
                <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="font-medium text-gray-900">{category}</span>
                  <span className={`font-semibold ${getScoreColor(score)}`}>{score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Insights */}
          {report.feedback.keyInsights && (
            <div className="bg-white/95 backdrop-blur-sm border-0 rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <h2 className="text-xl font-semibold text-gray-900">Key Insights</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">{report.feedback.keyInsights}</p>
            </div>
          )}

          {/* Competitive Advantage */}
          {report.feedback.competitiveAdvantage && (
            <div className="bg-white/95 backdrop-blur-sm border-0 rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Competitive Advantage</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">{report.feedback.competitiveAdvantage}</p>
            </div>
          )}

          {/* Growth Opportunity */}
          {report.feedback.growthOpportunity && (
            <div className="bg-white/95 backdrop-blur-sm border-0 rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Growth Opportunity</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">{report.feedback.growthOpportunity}</p>
            </div>
          )}

          {/* Next Steps */}
          {report.feedback.nextSteps && (
            <div className="bg-white/95 backdrop-blur-sm border-0 rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900">Recommended Next Steps</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">{report.feedback.nextSteps}</p>
            </div>
          )}

          {/* Assessment Responses */}
          <div className="bg-white/95 backdrop-blur-sm border-0 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Assessment Responses</h2>
            <div className="space-y-4">
              {Object.entries(report.responses).map(([question, response]) => (
                <div key={question} className="border-l-4 border-[#147AFF] pl-4">
                  <h3 className="font-medium text-gray-900 mb-2 capitalize">
                    {question.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{response}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default ParticipantReport;
