import { AssessmentSessionDTO } from "@/domain/dtos/AssessmentSessionDTO";
import { TrendingUp, Users, Target, Zap, Lightbulb } from "lucide-react";
import { useState } from "react";

interface CategoryBreakdownProps {
  sessionData: AssessmentSessionDTO;
}

interface CategoryData {
  name: string;
  score: number;
  max: number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
  questions: string[];
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

export function CategoryBreakdown({ sessionData }: CategoryBreakdownProps) {
  const [showCategoryDetails, setShowCategoryDetails] = useState<string | null>(null);

  const categories: CategoryData[] = [
    {
      name: "Personal Foundation", // Changed from "Personal Background"
      score: sessionData.scores.personalBackground,
      max: 20,
      icon: Users,
      description: "Your starting point, foundational experience, and initial context for entrepreneurship",
      questions: [
        "Business Size",
        "Personal Motivation",
        "Previous Business Attempts"
      ]
    },
    {
      name: "Entrepreneurial Skills",
      score: sessionData.scores.entrepreneurialSkills,
      max: 25,
      icon: Lightbulb,
      description: "Key entrepreneurial traits, knowledge, and habits",
      questions: [
        "Business Acumen",
        "Milestones Achieved",
        "Resilience and Adaptability"
      ]
    },
    {
      name: "Resources", // Official category name
      score: sessionData.scores.resources,
      max: 20,
      icon: Target,
      description: "Available capital, connections, and support systems for business growth",
      questions: [
        "Access to startup capital and funding",
        "Professional network strength",
        "Mentor and advisor relationships"
      ]
    },
    {
      name: "Behavioral Metrics", // Official category name
      score: sessionData.scores.behavioralMetrics,
      max: 15,
      icon: TrendingUp,
      description: "Patterns in decision-making, risk tolerance, and execution style",
      questions: [
        "Risk tolerance and decision-making style",
        "Execution patterns and follow-through",
        "Learning from failures and setbacks"
      ]
    },
    {
      name: "Growth & Vision", // Official category name
      score: sessionData.scores.growthVision,
      max: 20,
      icon: Zap,
      description: "Long-term vision, growth mindset, and strategic thinking",
      questions: [
        "Long-term vision and strategic thinking",
        "Growth mindset and scalability focus",
        "Market opportunity identification"
      ]
    }
  ];

  // Find top strength category
  const topStrength = categories.reduce((top, current) => {
    const topPercentage = (top.score / top.max) * 100;
    const currentPercentage = (current.score / current.max) * 100;
    return currentPercentage > topPercentage ? current : top;
  });

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold" style={{ color: '#0A1F44' }}>
          Category Performance Breakdown
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Detailed analysis of your performance across five key entrepreneurial dimensions
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const percentage = Math.round((category.score / category.max) * 100);
          const performance = getPerformanceLevel(category.score, category.max);
          const isTopStrength = category.name === topStrength.name;
          const isShowingDetails = showCategoryDetails === category.name;

          return (
            <div
              key={category.name}
              className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              aria-label={`${category.name}: ${category.score} out of ${category.max} points, ${performance.label}`}
            >
              {/* Category Header */}
              <div className="flex items-center space-x-4 mb-6">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center border-2 relative cursor-pointer group"
                  style={{ 
                    backgroundColor: performance.color + '15',
                    borderColor: performance.color
                  }}
                  onMouseEnter={() => setShowCategoryDetails(category.name)}
                  onMouseLeave={() => setShowCategoryDetails(null)}
                >
                  <category.icon 
                    className="w-8 h-8" 
                    style={{ color: performance.color }} 
                  />
                  {/* Removed HelpCircle icon as it's no longer imported */}
                  
                  {/* Hover tooltip with category details */}
                  {isShowingDetails && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50">
                      <h4 className="font-semibold mb-2" style={{ color: '#0A1F44' }}>
                        {category.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                        {category.description}
                      </p>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-2">Assessment Areas:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {category.questions.map((question, qIndex) => (
                            <li key={qIndex} className="flex items-start space-x-2">
                              <div className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></div>
                              <span>{question}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold" style={{ color: '#0A1F44' }}>
                    {category.name}
                  </h3>
                  {isTopStrength && (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Top Strength
                    </span>
                  )}
                </div>
              </div>

              {/* Score Display */}
              <div className="mb-6">
                <div className="text-2xl font-bold" style={{ color: '#0A1F44' }}>
                  {Math.round(category.score)}/{category.max}
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                  <div
                    className="h-3 rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      backgroundColor: performance.color,
                      width: `${percentage}%`
                    }}
                  />
                </div>
              </div>

              {/* Performance Level */}
              <div className="text-center">
                <span 
                  className="text-sm font-medium px-3 py-1 rounded-full"
                  style={{ 
                    backgroundColor: performance.color + '15',
                    color: performance.color
                  }}
                >
                  {performance.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Additional context note */}
      <div className="text-center">
        <p className="text-sm text-gray-500 italic">
          Hover over category icons to see detailed assessment areas and explanations
        </p>
      </div>
    </div>
  );
}
