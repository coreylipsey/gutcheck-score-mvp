import { User, Brain, DollarSign, TrendingUp, Rocket } from "lucide-react";
import { FirestoreAssessmentSession } from "@/types/firestore";

interface CategoryBreakdownProps {
  sessionData: FirestoreAssessmentSession;
}

interface CategoryData {
  name: string;
  score: number;
  max: number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
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
  const categories: CategoryData[] = [
    {
      name: "Personal Background",
      score: sessionData.scores.personalBackground,
      max: 20,
      icon: User
    },
    {
      name: "Entrepreneurial Skills",
      score: sessionData.scores.entrepreneurialSkills,
      max: 25,
      icon: Brain
    },
    {
      name: "Resources",
      score: sessionData.scores.resources,
      max: 20,
      icon: DollarSign
    },
    {
      name: "Behavioral Metrics",
      score: sessionData.scores.behavioralMetrics,
      max: 15,
      icon: TrendingUp
    },
    {
      name: "Growth & Vision",
      score: sessionData.scores.growthVision,
      max: 20,
      icon: Rocket
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
          Detailed analysis of your performance across key entrepreneurial dimensions
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const percentage = Math.round((category.score / category.max) * 100);
          const performance = getPerformanceLevel(category.score, category.max);
          const isTopStrength = category.name === topStrength.name;

          return (
            <div
              key={category.name}
              className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              aria-label={`${category.name}: ${category.score} out of ${category.max} points, ${performance.label}`}
            >
              {/* Category Header */}
              <div className="flex items-center space-x-4 mb-6">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center border-2"
                  style={{ 
                    backgroundColor: performance.color + '15',
                    borderColor: performance.color
                  }}
                >
                  <category.icon 
                    className="w-8 h-8" 
                    style={{ color: performance.color }} 
                  />
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
    </div>
  );
}
