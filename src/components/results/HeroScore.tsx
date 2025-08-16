import { Award, Info, Target, Star, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { FirestoreAssessmentSession } from "@/types/firestore";
import { FicoStyleGauge } from "./FicoStyleGauge";

interface HeroScoreProps {
  sessionData: FirestoreAssessmentSession;
}

export function HeroScore({ sessionData }: HeroScoreProps) {
  const [showStarDefinitions, setShowStarDefinitions] = useState(false);
  const [showFullInsights, setShowFullInsights] = useState(false);
  
  const overallScore = Math.round(sessionData.scores.overallScore);
  const maxScore = 100;
  const minScore = 35;
  
  // Updated star rating thresholds with new non-prescriptive system
  const starThresholds = [
    { 
      stars: 1, 
      min: 35, 
      max: 49, 
      name: "Early Spark",
      label: "Early Spark",
      creditLabel: "Poor",
      color: "#FF6B00",
      percentile: "Bottom 16%",
      description: "Initial signals of entrepreneurial intent and foundation."
    },
    { 
      stars: 2, 
      min: 50, 
      max: 64, 
      name: "Forming Potential",
      label: "Forming Potential",
      creditLabel: "Fair",
      color: "#FFC700",
      percentile: "17th-36th percentile",
      description: "Building momentum, developing skills, and early traction."
    },
    { 
      stars: 3, 
      min: 65, 
      max: 79, 
      name: "Emerging Traction",
      label: "Emerging Traction",
      creditLabel: "Good",
      color: "#147AFF",
      percentile: "37th-66th percentile",
      description: "Solid signals of growth and structured progress."
    },
    { 
      stars: 4, 
      min: 80, 
      max: 89, 
      name: "Established Signals",
      label: "Established Signals",
      creditLabel: "Very Good",
      color: "#19C2A0",
      percentile: "67th-86th percentile",
      description: "Strong, consistent execution patterns with clear growth capacity."
    },
    { 
      stars: 5, 
      min: 90, 
      max: 100, 
      name: "Transformative Trajectory",
      label: "Transformative Trajectory",
      creditLabel: "Excellent",
      color: "#0A1F44",
      percentile: "87th-100th percentile",
      description: "Exceptional indicators of scalability, leadership, and ecosystem impact."
    }
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

  // Mock data for demonstration (in real app, this would come from user data)
  const scorePercentile = 72;
  const averageScore = 52;
  const lastUpdated = new Date().toLocaleDateString('en-US', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });

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
        {/* FICO-Style Speedometer - REPLACED THE CIRCULAR WHEEL */}
        <div className="flex-shrink-0">
          <FicoStyleGauge 
            score={overallScore}
            maxScore={maxScore}
            minScore={minScore}
            currentTier={currentStar}
            starTiers={starThresholds}
          />
        </div>

        {/* Score Insights - COMPLETELY UNTOUCHED */}
        <div className="space-y-6 max-w-md">
          {/* Assessment Results - NO CHANGES */}
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
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 transition-all duration-300 ${
                      star <= currentStar.stars 
                        ? 'fill-current text-yellow-400' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="font-semibold text-lg" style={{ color: '#0A1F44' }}>
                {currentStar.label}
              </p>
              <div className="inline-block px-4 py-2 rounded-full text-lg font-bold text-white shadow-sm"
                   style={{ backgroundColor: currentStar.color }}>
                {currentStar.creditLabel}
              </div>
              <p className="text-sm text-gray-600">
                Score: {currentStar.min}-{currentStar.max}
              </p>
            </div>

            {/* Hover Overlay with Definitions */}
            {showStarDefinitions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50">
                <h4 className="font-semibold mb-3 text-center" style={{ color: '#0A1F44' }}>
                  5-Star Rating System
                </h4>
                <div className="space-y-3">
                  {starThresholds.map((def, index) => (
                    <div key={index} className="text-sm">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                star <= def.stars 
                                  ? 'fill-current text-yellow-400' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-medium" style={{ color: '#0A1F44' }}>
                          {def.label}
                        </span>
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-bold text-white shadow-sm"
                              style={{ backgroundColor: def.color }}>
                          {def.creditLabel}
                        </span>
                      </div>
                      <p className="text-gray-600 ml-6 text-xs">{def.description}</p>
                      <p className="text-gray-500 ml-6 text-xs">
                        Score: {def.min}–{def.max}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Key Insights - Expandable */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100">
                <Info className="w-5 h-5" style={{ color: '#147AFF' }} />
              </div>
              <h3 className="text-lg font-semibold" style={{ color: '#0A1F44' }}>
                Key Insights
              </h3>
            </div>
            
            <div className="space-y-3">
              <p className="text-gray-700 leading-relaxed">
                {sessionData.geminiFeedback?.feedback ? (
                  showFullInsights ? (
                    sessionData.geminiFeedback.feedback
                  ) : (
                    <>
                      {sessionData.geminiFeedback.feedback.split(' ').slice(0, 15).join(' ')}...
                    </>
                  )
                ) : (
                  "Strong foundation with growth opportunities ahead."
                )}
              </p>
              
              {sessionData.geminiFeedback?.feedback && (
                <button
                  onClick={() => setShowFullInsights(!showFullInsights)}
                  className="flex items-center space-x-1 text-sm font-medium transition-colors duration-200"
                  style={{ color: '#147AFF' }}
                >
                  <span>{showFullInsights ? 'Show less' : 'Read more'}</span>
                  {showFullInsights ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Next Star Goal - NO CHANGES */}
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
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= nextStar.stars 
                            ? 'fill-current text-yellow-400' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
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
