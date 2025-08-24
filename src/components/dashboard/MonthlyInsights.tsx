'use client';

import Link from 'next/link';
import { AssessmentHistoryDTO } from '@/application/services/DashboardService';

interface MonthlyInsightsProps {
  lastAssessment: AssessmentHistoryDTO | null;
  canTakeAssessment: boolean;
  daysUntilNextAssessment: number;
}

export function MonthlyInsights({ lastAssessment, canTakeAssessment, daysUntilNextAssessment }: MonthlyInsightsProps) {
  const getInsights = () => {
    if (!lastAssessment) {
      return {
        title: "Ready to Start Your Journey?",
        message: "Take your first assessment to get personalized insights and recommendations for your entrepreneurial growth.",
        actions: [
          "Complete the 25-question assessment",
          "Get your personalized score",
          "Receive actionable recommendations"
        ]
      };
    }

    // Use AI-generated feedback if available, otherwise show error
    if (lastAssessment.geminiFeedback) {
      const feedback = lastAssessment.geminiFeedback;
      
      // Use the growth opportunity summary as the main message
      const message = feedback.growthOpportunity?.summary || feedback.feedback || 
        "Your AI feedback is being generated. Please check back in a few minutes for personalized insights.";
      
      // Use the specific weaknesses as actions, or parse next steps
      let actions: string[] = [];
      
      if (feedback.growthOpportunity?.specificWeaknesses) {
        actions = feedback.growthOpportunity.specificWeaknesses.slice(0, 3);
      } else if (feedback.nextSteps) {
        // Handle structured nextSteps data
        if (typeof feedback.nextSteps === 'object' && feedback.nextSteps.mentorship && feedback.nextSteps.funding && feedback.nextSteps.learning) {
          // Use titles from structured nextSteps
          actions = [
            feedback.nextSteps.mentorship.title,
            feedback.nextSteps.funding.title,
            feedback.nextSteps.learning.title
          ].slice(0, 3);
        } else if (typeof feedback.nextSteps === 'string') {
          // Fallback for old string format
          const steps = (feedback.nextSteps as string).split('\n').filter((step: string) =>
            step.trim().length > 0
          );
          
          actions = steps.slice(0, 3).map((step: string) => {
            // Remove bullet points and clean up
            return step.replace(/^[-•*]\s*/, '').trim();
          });
        }
      }
      
      // Show error if no specific actions found
      if (actions.length === 0) {
        actions = ["AI feedback is being generated. Please check back in a few minutes."];
      }

      return {
        title: `Your Personalized Insights`,
        message: message,
        actions: actions
      };
    }

    // Show error if no AI feedback available
    return {
      title: "AI Feedback Being Generated",
      message: "Your personalized AI feedback is being generated. This may take a few moments. Please check back in a few minutes for your complete analysis.",
      actions: [
        "Refresh the page to check for updated insights",
        "Take a new assessment to get fresh analysis",
        "Contact support if feedback doesn't appear within 5 minutes"
      ]
    };
  };

  const insights = getInsights();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Monthly Insights</h3>
          <p className="text-gray-600">Personalized recommendations for your growth</p>
        </div>
        {!canTakeAssessment && daysUntilNextAssessment && (
          <div className="text-right">
            <p className="text-sm font-medium text-gray-500">Next Assessment</p>
            <p className="text-lg font-bold text-blue-600">{daysUntilNextAssessment} days</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">{insights.title}</h4>
          <p className="text-gray-700 mb-4">{insights.message}</p>
        </div>

        <div>
          <h5 className="font-medium text-gray-900 mb-3">Recommended Actions:</h5>
          <ul className="space-y-2">
            {insights.actions.map((action, index) => (
              <li key={index} className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                <span className="text-gray-700">{action}</span>
              </li>
            ))}
          </ul>
        </div>

        {lastAssessment && (
          <Link 
            href={`/assessment/results?sessionId=${lastAssessment.sessionId}`}
            className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <h5 className="font-medium text-gray-900 mb-2">Your Last Assessment</h5>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Score: {lastAssessment.overallScore}/100</p>
                <p className="text-sm text-gray-600">Completed: {lastAssessment.completedAt}</p>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  lastAssessment.overallScore >= 80 ? 'bg-green-100 text-green-800' :
                  lastAssessment.overallScore >= 60 ? 'bg-blue-100 text-blue-800' :
                  lastAssessment.overallScore >= 40 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {lastAssessment.overallScore >= 80 ? 'Excellent' :
                   lastAssessment.overallScore >= 60 ? 'Strong' :
                   lastAssessment.overallScore >= 40 ? 'Good' : 'Developing'}
                </div>
              </div>
            </div>
          </Link>
        )}

        {canTakeAssessment && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Ready for your next assessment!
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Take your monthly assessment to track your progress and get updated insights.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 