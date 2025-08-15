import { Award, Target, TrendingUp, Lightbulb, Zap } from "lucide-react";
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

  // Mock data for demonstration (in real app, this would come from AI analysis)
  const topStrengthDetails = {
    impact: "+40% funding likelihood",
    summary: "Your execution capabilities put you in the top 28% of tech entrepreneurs in Colorado.",
    specificStrengths: [
      "Strategic problem-solving approach (demonstrates handling cash flow crisis)",
      "Strong network utilization (leveraged friend's support effectively)",
      "Growth mindset (weekly professional learning commitment)",
      "Resilience and adaptability (bounced back from business challenges)"
    ]
  };

  const focusAreaDetails = {
    impact: "Biggest opportunity for score improvement",
    summary: "Inconsistent habits are holding you back from reaching your full potential.",
    specificWeaknesses: [
      "Goal tracking happens 'occasionally' vs systematic approach",
      "Time dedication varies (1-10 hours) without structure",
      "Recovery from setbacks relies on resilience vs strategic planning",
      "Business planning lacks formal processes and documentation"
    ]
  };

  // Score improvement potential
  const potentialScoreIncrease = 8; // Based on implementing top recommendations
  const newScoreProjection = Math.round(sessionData.scores.overall) + potentialScoreIncrease;

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
            Following these recommendations could increase your score to {newScoreProjection}
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
                  {topStrength.name}
                </p>
                <span className="text-xs px-2 py-1 bg-green-200 text-green-800 rounded-full">
                  {Math.round(topStrength.score)}/{topStrength.max}
                </span>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {topStrengthDetails.impact}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <p className="text-gray-700 leading-relaxed font-medium mb-4">
              {topStrengthDetails.summary}
            </p>
            
            {/* Specific strengths list */}
            <div className="bg-white/60 rounded-lg p-4">
              <h4 className="font-semibold text-sm text-gray-800 mb-3 flex items-center">
                <Lightbulb className="w-4 h-4 mr-2" />
                What makes you stand out:
              </h4>
              <ul className="space-y-2">
                {topStrengthDetails.specificStrengths.map((strength, index) => (
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
                  {focusArea.name}
                </p>
                <span className="text-xs px-2 py-1 bg-orange-200 text-orange-800 rounded-full">
                  {Math.round(focusArea.score)}/{focusArea.max}
                </span>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {focusAreaDetails.impact}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <p className="text-gray-700 leading-relaxed font-medium mb-4">
              {focusAreaDetails.summary}
            </p>
            
            {/* Areas for improvement list */}
            <div className="bg-white/60 rounded-lg p-4">
              <h4 className="font-semibold text-sm text-gray-800 mb-3 flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                Areas holding you back:
              </h4>
              <ul className="space-y-2">
                {focusAreaDetails.specificWeaknesses.map((weakness, index) => (
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
          <p>
            Your Gutcheck Score of {Math.round(sessionData.scores.overall)}/100 places you in the
            <strong style={{ color: '#0A1F44' }}> {sessionData.starRating === 1 ? 'Early Spark' :
             sessionData.starRating === 2 ? 'Developing Potential' :
             sessionData.starRating === 3 ? 'Emerging Traction' :
             sessionData.starRating === 4 ? 'Investment Ready' : 'Visionary Leader'} </strong>
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
