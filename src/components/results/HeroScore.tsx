import { Award, Info, Target } from "lucide-react";
import { useState } from "react";
import { FirestoreAssessmentSession } from "@/types/firestore";

interface HeroScoreProps {
  sessionData: FirestoreAssessmentSession;
}

export function HeroScore({ sessionData }: HeroScoreProps) {
  const [showStarDefinitions, setShowStarDefinitions] = useState(false);
  
  const overallScore = Math.round(sessionData.scores.overallScore);
  const maxScore = 100;
  
  // Star rating thresholds
  const starThresholds = [
    { stars: 1, min: 0, max: 19, label: "Early Spark" },
    { stars: 2, min: 20, max: 39, label: "Developing Potential" },
    { stars: 3, min: 40, max: 59, label: "Emerging Traction" },
    { stars: 4, min: 60, max: 79, label: "Strong Execution" },
    { stars: 5, min: 80, max: 100, label: "Visionary Leader" }
  ];

  // Calculate current star rating and next threshold
  const getCurrentStarInfo = (score: number) => {
    for (const threshold of starThresholds) {
      if (score >= threshold.min && score <= threshold.max) {
        return threshold;
      }
    }
    return starThresholds[0]; // fallback
  };

  const getNextStarInfo = (score: number) => {
    const currentIndex = starThresholds.findIndex(t => score >= t.min && score <= t.max);
    if (currentIndex < starThresholds.length - 1) {
      return starThresholds[currentIndex + 1];
    }
    return null; // Already at max
  };

  const currentStar = getCurrentStarInfo(overallScore);
  const nextStar = getNextStarInfo(overallScore);
  const pointsToNext = nextStar ? Math.max(1, nextStar.min - overallScore) : 0;

  // Calculate progress to next star (proportional meter)
  const getProgressToNextStar = () => {
    if (!nextStar) return 100; // Already at max
    const currentRange = nextStar.min - currentStar.min;
    const currentProgress = overallScore - currentStar.min;
    return Math.min((currentProgress / currentRange) * 100, 100);
  };

  // Dynamic color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "#19C2A0"; // Green
    if (score >= 60) return "#FFC700"; // Yellow
    return "#FF6B00"; // Red
  };
  
  const scoreColor = getScoreColor(overallScore);
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (overallScore / maxScore) * circumference;

  const starDefinitions = [
    {
      stars: 1,
      label: "Early Spark",
      definition: "You've just begun your entrepreneurial journey with initial ideas and motivation."
    },
    {
      stars: 2,
      label: "Developing Potential", 
      definition: "You're on your way with some foundational skills and early business concepts."
    },
    {
      stars: 3,
      label: "Emerging Traction",
      definition: "You're demonstrating solid progress with measurable business development."
    },
    {
      stars: 4,
      label: "Strong Execution",
      definition: "You're exhibiting advanced entrepreneurial capabilities and proven results."
    },
    {
      stars: 5,
      label: "Visionary Leader",
      definition: "Exceptional entrepreneurial mastery with innovative leadership and market impact."
    }
  ];

  return (
    <div className="text-center space-y-8">
      {/* Hero Title */}
      <div className="space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold" style={{ color: '#0A1F44' }}>
          Your Gutcheck Score
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          A comprehensive assessment of your entrepreneurial readiness and fundability potential
        </p>
      </div>

      {/* Score Visualization */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
        {/* Main Score Circle */}
        <div className="relative">
          <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 200 200" aria-label={`Gutcheck score: ${overallScore}/100`}>
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke="#f3f4f6"
              strokeWidth="12"
              fill="transparent"
            />
            {/* Progress circle */}
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke={scoreColor}
              strokeWidth="12"
              fill="transparent"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-2000 ease-out"
            />
          </svg>
          
          {/* Score display in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl font-bold" style={{ color: scoreColor }}>
              {overallScore}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              /100
            </div>
          </div>
        </div>

        {/* Score Insights */}
        <div className="space-y-6 max-w-md">
          {/* Star Rating Assessment Results */}
          <div 
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition-all duration-300 relative"
            onMouseEnter={() => setShowStarDefinitions(true)}
            onMouseLeave={() => setShowStarDefinitions(false)}
            aria-label={`${currentStar.stars} out of 5 stars: ${currentStar.label}`}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: '#FFC700' + '20' }}>
                <Award className="w-5 h-5" style={{ color: '#FFC700' }} />
              </div>
              <h3 className="text-lg font-semibold" style={{ color: '#0A1F44' }}>
                Assessment Results
              </h3>
            </div>
            
            {/* Star Rating Display */}
            <div className="text-center space-y-2">
              <div className="text-2xl">
                {'⭐'.repeat(currentStar.stars)}
              </div>
              <p className="font-semibold" style={{ color: '#0A1F44' }}>
                {currentStar.label}
              </p>
            </div>

            {/* Hover Overlay with Definitions */}
            {showStarDefinitions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-10">
                <h4 className="font-semibold mb-3 text-center" style={{ color: '#0A1F44' }}>
                  Star Rating Definitions
                </h4>
                <div className="space-y-2">
                  {starDefinitions.map((def, index) => (
                    <div key={index} className="text-xs">
                      <div className="flex items-center space-x-2 mb-1">
                        <span>{'⭐'.repeat(def.stars)}</span>
                        <span className="font-medium" style={{ color: '#0A1F44' }}>
                          {def.label}
                        </span>
                      </div>
                      <p className="text-gray-600 ml-6">{def.definition}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Key Insights - Executive summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 min-h-24">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100">
                <Info className="w-5 h-5" style={{ color: '#147AFF' }} />
              </div>
              <h3 className="text-lg font-semibold" style={{ color: '#0A1F44' }}>
                Key Insights
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {sessionData.geminiFeedback?.feedback ? 
                sessionData.geminiFeedback.feedback.split(' ').slice(0, 8).join(' ') + '...' :
                "Strong foundation with growth opportunities ahead."
              }
            </p>
          </div>

          {/* Next Star Goal */}
          <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-6 border border-green-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100">
                <Target className="w-5 h-5" style={{ color: '#19C2A0' }} />
              </div>
              <h3 className="text-lg font-semibold" style={{ color: '#0A1F44' }}>
                Next Star Goal
              </h3>
            </div>
            
            {nextStar ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Progress to {nextStar.stars} Stars</span>
                  <span className="font-semibold" style={{ color: '#19C2A0' }}>
                    {'⭐'.repeat(nextStar.stars)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      backgroundColor: '#19C2A0',
                      width: `${getProgressToNextStar()}%`
                    }}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  <strong style={{ color: '#19C2A0' }}>{pointsToNext} point{pointsToNext !== 1 ? 's' : ''}</strong> to next star
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-2xl mb-2">🏆</div>
                <p className="font-semibold" style={{ color: '#19C2A0' }}>
                  Maximum Star Level Achieved!
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  You&apos;ve reached the pinnacle of entrepreneurial excellence
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
