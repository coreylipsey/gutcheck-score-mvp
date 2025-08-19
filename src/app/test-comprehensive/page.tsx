'use client';

import { PersonalizedInsights } from '@/components/results/PersonalizedInsights';
import { AssessmentSessionDTO } from '@/domain/dtos/AssessmentSessionDTO';

export default function TestComprehensivePage() {
  // Mock data to test Comprehensive Analysis
  const mockSessionData: AssessmentSessionDTO = {
    id: 'test-session',
    sessionId: 'test-session',
    userId: undefined,
    responses: [],
    scores: {
      overallScore: 72,
      personalBackground: 15,
      entrepreneurialSkills: 18,
      resources: 12,
      behavioralMetrics: 10,
      growthVision: 17,
    },
    starRating: 3,
    categoryBreakdown: {
      personalBackground: 15,
      entrepreneurialSkills: 18,
      resources: 12,
      behavioralMetrics: 10,
      growthVision: 17,
    },
    geminiFeedback: {
      feedback: "Based on your assessment, you scored 72 out of 100. Your strongest area is Entrepreneurial Skills, while Resources could use more attention.",
      competitiveAdvantage: {
        category: "Entrepreneurial Skills",
        score: "18/25",
        summary: "You demonstrate strong entrepreneurial capabilities and strategic thinking.",
        specificStrengths: [
          "Excellent problem-solving approach to business challenges",
          "Strong strategic planning and goal-setting abilities",
          "Consistent learning and skill development habits",
          "Effective time management and prioritization skills"
        ]
      },
      growthOpportunity: {
        category: "Resources",
        score: "12/20",
        summary: "There are opportunities to strengthen your resource base and network connections.",
        specificWeaknesses: [
          "Limited access to funding sources and capital",
          "Network connections could be more diverse and strategic",
          "Mentorship relationships need development",
          "Resource allocation could be more optimized"
        ]
      },
      scoreProjection: {
        currentScore: 72,
        projectedScore: 78,
        improvementPotential: 6
      },
      comprehensiveAnalysis: "Your Gutcheck Score of 72/100 places you in the Emerging Traction category, indicating strong potential for growth. Your assessment reveals a balanced entrepreneurial profile with clear strengths and growth areas. The AI analysis suggests focusing on strategic development while leveraging your existing capabilities. You've built a solid foundation in entrepreneurial skills, but your resource network could be expanded to accelerate your growth trajectory. Consider developing more strategic partnerships and exploring diverse funding opportunities to unlock your full potential.",
      nextSteps: "Focus on building strategic partnerships, exploring funding opportunities, and developing mentorship relationships to accelerate your entrepreneurial journey."
    },
    createdAt: new Date(),
    completedAt: new Date(),
    isAnonymous: true,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Comprehensive Analysis Test
          </h1>
          <p className="text-gray-600">
            Testing the Comprehensive Analysis section with mock data
          </p>
        </div>
        
        <PersonalizedInsights sessionData={mockSessionData} />
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            Test Results
          </h2>
          <p className="text-blue-800">
            If you can see the Comprehensive Analysis section above with the mock text, 
            then the component is working correctly. The text should be: 
            "Your Gutcheck Score of 72/100 places you in the Emerging Traction category..."
          </p>
        </div>
      </div>
    </div>
  );
}
