import { Award, Target, TrendingUp, Lightbulb, Zap } from "lucide-react";
import { AssessmentSessionDTO } from "@/domain/dtos/AssessmentSessionDTO";

interface PersonalizedInsightsProps {
  sessionData: AssessmentSessionDTO;
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
  // Debug logging
  console.log('PersonalizedInsights received sessionData:', {
    hasGeminiFeedback: !!sessionData.geminiFeedback,
    comprehensiveAnalysis: sessionData.geminiFeedback?.comprehensiveAnalysis ? 'present' : 'missing',
    competitiveAdvantage: sessionData.geminiFeedback?.competitiveAdvantage ? 'present' : 'missing',
    growthOpportunity: sessionData.geminiFeedback?.growthOpportunity ? 'present' : 'missing',
    scoreProjection: sessionData.geminiFeedback?.scoreProjection ? 'present' : 'missing'
  });
  
  if (sessionData.geminiFeedback?.comprehensiveAnalysis) {
    console.log('Comprehensive Analysis in component, length:', sessionData.geminiFeedback.comprehensiveAnalysis.length);
  }
  
  // Check if AI feedback is available
  if (!sessionData.geminiFeedback) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold" style={{ color: '#0A1F44' }}>
            AI Feedback Not Available
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            AI feedback is missing. Please ensure AI feedback was generated properly for this assessment.
          </p>
        </div>
      </div>
    );
  }

  const categories = [
    { name: "Personal Foundation", score: sessionData.scores.personalBackground, max: 20 },
    { name: "Entrepreneurial Skills", score: sessionData.scores.entrepreneurialSkills, max: 25 },
    { name: "Resources & Network", score: sessionData.scores.resources, max: 20 },
    { name: "Behavioral Patterns", score: sessionData.scores.behavioralMetrics, max: 15 },
    { name: "Vision & Growth", score: sessionData.scores.growthVision, max: 20 }
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

  // Check if AI feedback is available
  const competitiveAdvantage = sessionData.geminiFeedback?.competitiveAdvantage;
  const growthOpportunity = sessionData.geminiFeedback?.growthOpportunity;
  const scoreProjection = sessionData.geminiFeedback?.scoreProjection;
  const comprehensiveAnalysis = sessionData.geminiFeedback?.comprehensiveAnalysis;
  
  // If core AI fields are missing, show loading message
  if (!competitiveAdvantage || !growthOpportunity || !scoreProjection) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold" style={{ color: '#0A1F44' }}>
            AI Feedback Generation In Progress
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your personalized AI feedback is being generated. This may take a few moments. 
            Please refresh the page in a minute or two to see your complete analysis.
          </p>
          <div className="flex justify-center">
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold" style={{ color: '#0A1F44' }}>
          Your Personalized Action Plan
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          AI-powered insights with specific actions to improve your score
        </p>
        
        {/* Score improvement potential */}
        <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-full border border-green-200">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <span className="font-medium text-green-800">
            Following these recommendations could increase your score to {scoreProjection.projectedScore}
          </span>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Your Competitive Advantage Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-200 min-h-48 flex flex-col">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-green-100">
              <TrendingUp className="w-6 h-6" style={{ color: '#19C2A0' }} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold" style={{ color: '#0A1F44' }}>
                Your Competitive Advantage
              </h3>
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium" style={{ color: '#19C2A0' }}>
                  {competitiveAdvantage.category}
                </p>
                <span className="text-xs px-2 py-1 bg-green-200 text-green-800 rounded-full">
                  {competitiveAdvantage.score}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <p className="text-gray-700 leading-relaxed font-medium mb-4">
              {competitiveAdvantage.summary}
            </p>
            
            {/* Specific strengths list */}
            <div className="bg-white/60 rounded-lg p-4">
              <h4 className="font-semibold text-sm text-gray-800 mb-3 flex items-center">
                <Lightbulb className="w-4 h-4 mr-2" />
                What makes you stand out:
              </h4>
              <ul className="space-y-2">
                {competitiveAdvantage.specificStrengths.map((strength, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Biggest Growth Opportunity Card */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-8 border border-orange-200 min-h-48 flex flex-col">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-orange-100">
              <Target className="w-6 h-6" style={{ color: '#FF6B00' }} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold" style={{ color: '#0A1F44' }}>
                Biggest Growth Opportunity
              </h3>
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium" style={{ color: '#FF6B00' }}>
                  {growthOpportunity.category}
                </p>
                <span className="text-xs px-2 py-1 bg-orange-200 text-orange-800 rounded-full">
                  {growthOpportunity.score}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <p className="text-gray-700 leading-relaxed font-medium mb-4">
              {growthOpportunity.summary}
            </p>
            
            {/* Areas for improvement list */}
            <div className="bg-white/60 rounded-lg p-4">
              <h4 className="font-semibold text-sm text-gray-800 mb-3 flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                Areas holding you back:
              </h4>
              <ul className="space-y-2">
                {growthOpportunity.specificWeaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
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
          {comprehensiveAnalysis ? (
            <p>{comprehensiveAnalysis}</p>
          ) : (
            <div className="text-red-600">
              <p><strong>Debug Info:</strong></p>
              <p>comprehensiveAnalysis is missing from sessionData.geminiFeedback</p>
              <p>Available fields: {Object.keys(sessionData.geminiFeedback || {}).join(', ')}</p>
              <p>Raw geminiFeedback: {JSON.stringify(sessionData.geminiFeedback, null, 2)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
