import { BookOpen, Users, DollarSign, ArrowRight } from "lucide-react";
import { FirestoreAssessmentSession } from "@/types/firestore";
import Link from "next/link";

interface NextStepsProps {
  sessionData: FirestoreAssessmentSession;
}

interface ActionItem {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  category: "Learning" | "Mentorship" | "Funding";
  title: string;
  description: string;
  url?: string;
}

export function NextSteps({ sessionData }: NextStepsProps) {
  // Parse AI recommendations and extract URLs
  const parseAIRecommendations = (nextSteps: string) => {
    const lines = nextSteps.split('\n');
    const recommendations = {
      mentorship: { title: '', url: '' },
      funding: { title: '', url: '' },
      learning: { title: '', url: '' }
    };
    
    lines.forEach(line => {
      if (line.startsWith('Mentorship:')) {
        const content = line.replace('Mentorship:', '').trim();
        const urlMatch = content.match(/(https?:\/\/[^\s]+)/);
        if (urlMatch) {
          recommendations.mentorship.title = content.replace(urlMatch[0], '').trim();
          recommendations.mentorship.url = urlMatch[0];
        } else {
          recommendations.mentorship.title = content;
        }
      } else if (line.startsWith('Funding:')) {
        const content = line.replace('Funding:', '').trim();
        const urlMatch = content.match(/(https?:\/\/[^\s]+)/);
        if (urlMatch) {
          recommendations.funding.title = content.replace(urlMatch[0], '').trim();
          recommendations.funding.url = urlMatch[0];
        } else {
          recommendations.funding.title = content;
        }
      } else if (line.startsWith('Learning:')) {
        const content = line.replace('Learning:', '').trim();
        const urlMatch = content.match(/(https?:\/\/[^\s]+)/);
        if (urlMatch) {
          recommendations.learning.title = content.replace(urlMatch[0], '').trim();
          recommendations.learning.url = urlMatch[0];
        } else {
          recommendations.learning.title = content;
        }
      }
    });
    
    return recommendations;
  };

  const aiRecommendations = sessionData.geminiFeedback?.nextSteps ? 
    parseAIRecommendations(sessionData.geminiFeedback.nextSteps) : null;

  const actionItems: ActionItem[] = aiRecommendations ? [
    {
      icon: Users,
      category: "Mentorship",
      title: aiRecommendations.mentorship.title || "Find a Business Mentor",
      description: "Connect with experienced entrepreneurs who can guide your journey and provide insights.",
      url: aiRecommendations.mentorship.url
    },
    {
      icon: DollarSign,
      category: "Funding",
      title: aiRecommendations.funding.title || "Explore Funding Options", 
      description: "Research grants, accelerators, and early-stage investment opportunities.",
      url: aiRecommendations.funding.url
    },
    {
      icon: BookOpen,
      category: "Learning",
      title: aiRecommendations.learning.title || "Entrepreneurship Fundamentals",
      description: "Build core business knowledge through structured learning programs and courses.",
      url: aiRecommendations.learning.url
    }
  ] : [
    {
      icon: BookOpen,
      category: "Learning",
      title: "Entrepreneurship Fundamentals",
      description: "Build core business knowledge through structured learning programs and courses."
    },
    {
      icon: Users,
      category: "Mentorship", 
      title: "Find a Business Mentor",
      description: "Connect with experienced entrepreneurs who can guide your journey and provide insights."
    },
    {
      icon: DollarSign,
      category: "Funding",
      title: "Explore Funding Options",
      description: "Research grants, accelerators, and early-stage investment opportunities."
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Learning": return "#147AFF";
      case "Mentorship": return "#19C2A0";
      case "Funding": return "#FF6B00";
      default: return "#0A1F44";
    }
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold" style={{ color: '#0A1F44' }}>
          Recommended Next Steps
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Actionable recommendations to accelerate your entrepreneurial journey
        </p>
      </div>

      {/* Action Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {actionItems.map((item, index) => {
          const categoryColor = getCategoryColor(item.category);
          
          return (
            <div
              key={index}
              className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group cursor-pointer"
            >
              {/* Icon and Category */}
              <div className="flex items-center space-x-4 mb-6">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: categoryColor + '15' }}
                >
                  <item.icon className="w-6 h-6" style={{ color: categoryColor }} />
                </div>
                <div>
                  <span 
                    className="text-sm font-medium px-3 py-1 rounded-full"
                    style={{ 
                      backgroundColor: categoryColor + '15',
                      color: categoryColor
                    }}
                  >
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold" style={{ color: '#0A1F44' }}>
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* CTA Button */}
              <div className="mt-6">
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-sm font-medium group-hover:space-x-3 transition-all duration-300"
                    style={{ color: categoryColor }}
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                ) : (
                  <button 
                    className="flex items-center space-x-2 text-sm font-medium group-hover:space-x-3 transition-all duration-300"
                    style={{ color: categoryColor }}
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="text-center space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-200">
          <h3 className="text-xl font-semibold mb-4" style={{ color: '#0A1F44' }}>
            Ready to Take Action?
          </h3>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Your Gutcheck Score is more than a number—it&apos;s visibility. Share your results with investors,
            mentors, and partners who need to see what you&apos;re capable of.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="px-8 py-3 bg-white text-blue-600 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 border-2 border-blue-200 hover:border-blue-300"
            >
              View Dashboard
            </Link>
            <Link
              href="/assessment"
              className="px-8 py-3 rounded-2xl font-semibold text-white hover:shadow-lg transition-all duration-300"
              style={{ backgroundColor: '#147AFF' }}
            >
              Retake Assessment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
