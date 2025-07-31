import { Award, Target, TrendingUp } from "lucide-react";
import { FirestoreAssessmentSession } from "@/types/firestore";

interface PersonalizedInsightsProps {
  sessionData: FirestoreAssessmentSession;
}

// Helper function to determine performance level and color
const getPerformanceLevel = (score: number, max: number) => {
  const percentage = (score / max) * 100;
  
  if (percentage >= 80) {
    return { label: 'Strong', color: '#19C2A0' }; // Green
  } else if (percentage >= 60) {
    return { label: 'Developing', color: '#FFC700' }; // Yellow
  } else {
    return { label: 'Needs Work', color: '#FF6B00' }; // Red
  }
};

export function PersonalizedInsights({ sessionData }: PersonalizedInsightsProps) {
  const categories = [
    { name: "Personal Background", score: sessionData.scores.personalBackground, max: 20 },
    { name: "Entrepreneurial Skills", score: sessionData.scores.entrepreneurialSkills, max: 25 },
    { name: "Resources", score: sessionData.scores.resources, max: 20 },
    { name: "Behavioral Metrics", score: sessionData.scores.behavioralMetrics, max: 15 },
    { name: "Growth & Vision", score: sessionData.scores.growthVision, max: 20 }
  ];

  // Find top strength and focus area
  const topStrength = categories.reduce((top, current) => {
    const topPercentage = (top.score / top.max) * 100;
    const currentPercentage = (current.score / current.max) * 100;
    return currentPercentage > topPercentage ? current : top;
  });

  const focusArea = categories.reduce((lowest, current) => {
    const lowestPercentage = (lowest.score / lowest.max) * 100;
    const currentPercentage = (current.score / current.max) * 100;
    return currentPercentage < lowestPercentage ? current : lowest;
  });

  const topStrengthPerformance = getPerformanceLevel(topStrength.score, topStrength.max);
  const focusAreaPerformance = getPerformanceLevel(focusArea.score, focusArea.max);

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold" style={{ color: '#0A1F44' }}>
          Personalized AI Insights
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          AI-powered analysis of your entrepreneurial profile with actionable recommendations
        </p>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top Strength Card */}
        <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-3xl p-8 border border-green-200 min-h-48 flex flex-col">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-green-100">
              <Award className="w-6 h-6" style={{ color: '#19C2A0' }} />
            </div>
            <h3 className="text-xl font-semibold" style={{ color: '#0A1F44' }}>
              Your Top Strength
            </h3>
          </div>
          
          <div className="flex-1">
            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-2" style={{ color: '#0A1F44' }}>
                {topStrength.name}
              </h4>
              <div className="flex items-center space-x-2 mb-3">
                <span 
                  className="px-3 py-1 text-sm font-medium rounded-full"
                  style={{ 
                    backgroundColor: topStrengthPerformance.color + '15',
                    color: topStrengthPerformance.color
                  }}
                >
                  {topStrengthPerformance.label}
                </span>
              </div>
            </div>
            
            <p className="text-gray-700 leading-relaxed">
              {sessionData.geminiFeedback?.strengths ||
              `Your ${topStrength.name.toLowerCase()} demonstrates exceptional capabilities.
              This area represents your strongest competitive advantage and should be
              leveraged in your entrepreneurial journey. Consider how you can showcase
              this strength to investors, partners, and customers.`}
            </p>
          </div>
        </div>

        {/* Focus Area Card */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-8 border border-orange-200 min-h-48 flex flex-col">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-orange-100">
              <Target className="w-6 h-6" style={{ color: '#FF6B00' }} />
            </div>
            <h3 className="text-xl font-semibold" style={{ color: '#0A1F44' }}>
              Priority Focus Area
            </h3>
          </div>
          
          <div className="flex-1">
            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-2" style={{ color: '#0A1F44' }}>
                {focusArea.name}
              </h4>
              <div className="flex items-center space-x-2 mb-3">
                <span 
                  className="px-3 py-1 text-sm font-medium rounded-full"
                  style={{ 
                    backgroundColor: focusAreaPerformance.color + '15',
                    color: focusAreaPerformance.color
                  }}
                >
                  {focusAreaPerformance.label}
                </span>
              </div>
            </div>
            
            <p className="text-gray-700 leading-relaxed">
              {sessionData.geminiFeedback?.focusAreas ||
              `Your ${focusArea.name.toLowerCase()} presents the greatest opportunity for growth.
              Focusing on this area will have the most significant impact on your overall
              entrepreneurial readiness. Consider targeted development strategies and
              seek mentorship in this domain.`}
            </p>
          </div>
        </div>
      </div>

      {/* Comprehensive Analysis */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-200">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-100">
            <TrendingUp className="w-6 h-6" style={{ color: '#147AFF' }} />
          </div>
          <h3 className="text-xl font-semibold" style={{ color: '#0A1F44' }}>
            Comprehensive Analysis
          </h3>
        </div>
        
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            Your Gutcheck Score of {Math.round(sessionData.scores.overall)}/100 places you in the
            <strong style={{ color: '#0A1F44' }}> {sessionData.starRating === 1 ? 'Early Spark' :
             sessionData.starRating === 2 ? 'Developing Potential' :
             sessionData.starRating === 3 ? 'Emerging Traction' :
             sessionData.starRating === 4 ? 'Strong Execution' : 'Visionary Leader'} </strong>
            category, indicating {sessionData.starRating <= 2 ? 'a foundation for growth with significant development opportunities' :
            sessionData.starRating === 3 ? 'solid progress with measurable business development' :
            sessionData.starRating === 4 ? 'advanced entrepreneurial capabilities with proven results' :
            'exceptional entrepreneurial mastery with innovative leadership potential'}.
          </p>
          
          <p>
            {sessionData.geminiFeedback?.feedback ||
            "Your assessment reveals a balanced entrepreneurial profile with clear strengths and growth areas. " +
            "The AI analysis suggests focusing on strategic development while leveraging your existing capabilities. " +
            "Consider how your top strength in " + topStrength.name.toLowerCase() + " can complement your development needs in " +
            focusArea.name.toLowerCase() + " to create a more comprehensive entrepreneurial foundation."}
          </p>
        </div>
      </div>
    </div>
  );
}
