import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Share2, Copy, Download, Linkedin, Instagram, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ScoreData {
  overallScore: number;
  categories: {
    execution: number;
    market: number;
    team: number;
    traction: number;
    scalability: number;
  };
  entrepreneurName: string;
  timestamp: string;
  rank: string;
}

interface ShareableScoreBadgeProps {
  scoreData: ScoreData;
  variant?: 'compact' | 'detailed' | 'social';
}

export function ShareableScoreBadge({ 
  scoreData, 
  variant = 'detailed' 
}: ShareableScoreBadgeProps) {
  const [isSharing, setIsSharing] = useState(false);

  const maxScore = Math.max(...Object.values(scoreData.categories));
  const categoryData = Object.entries(scoreData.categories).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
    angle: (value / 100) * 360
  }));

  const handleShare = async (platform: string) => {
    setIsSharing(true);
    
    const shareText = `Just got my Gutcheck Score: ${scoreData.overallScore}/100! 🚀 Measuring entrepreneurial execution potential beyond the resume. #GutcheckScore #Entrepreneur`;
    const shareUrl = `https://gutcheck.ai/score/${scoreData.entrepreneurName.toLowerCase().replace(/\s+/g, '-')}`;

    try {
      switch (platform) {
        case 'linkedin':
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
          break;
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
          break;
        case 'copy':
          await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
          toast.success('Score details copied to clipboard!');
          break;
        default:
          break;
      }
    } catch (error) {
      toast.error('Failed to share score');
    } finally {
      setIsSharing(false);
    }
  };

  const RadarChart = () => (
    <div className="relative w-40 h-40 mx-auto">
      {/* Background circles */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#147AFF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#19C2A0" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        {/* Grid circles */}
        {[20, 40, 60, 80, 100].map((radius) => (
          <circle
            key={radius}
            cx="100"
            cy="100"
            r={radius * 0.7}
            fill="none"
            stroke="#147AFF"
            strokeWidth="1"
            strokeOpacity="0.2"
          />
        ))}
        
        {/* Grid lines */}
        {categoryData.map((_, index) => {
          const angle = (index * 72 - 90) * (Math.PI / 180);
          const x2 = 100 + Math.cos(angle) * 70;
          const y2 = 100 + Math.sin(angle) * 70;
          return (
            <line
              key={index}
              x1="100"
              y1="100"
              x2={x2}
              y2={y2}
              stroke="#147AFF"
              strokeWidth="1"
              strokeOpacity="0.2"
            />
          );
        })}
        
        {/* Data polygon */}
        <polygon
          points={categoryData.map((item, index) => {
            const angle = (index * 72 - 90) * (Math.PI / 180);
            const radius = (item.value / 100) * 70;
            const x = 100 + Math.cos(angle) * radius;
            const y = 100 + Math.sin(angle) * radius;
            return `${x},${y}`;
          }).join(' ')}
          fill="url(#radarGradient)"
          stroke="#19C2A0"
          strokeWidth="2"
        />
        
        {/* Data points */}
        {categoryData.map((item, index) => {
          const angle = (index * 72 - 90) * (Math.PI / 180);
          const radius = (item.value / 100) * 70;
          const x = 100 + Math.cos(angle) * radius;
          const y = 100 + Math.sin(angle) * radius;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="3"
              fill="#19C2A0"
              stroke="#0A1F44"
              strokeWidth="2"
            />
          );
        })}
      </svg>
      
      {/* Category labels */}
      {categoryData.map((item, index) => {
        const angle = (index * 72 - 90) * (Math.PI / 180);
        const labelRadius = 85;
        const x = 100 + Math.cos(angle) * labelRadius;
        const y = 100 + Math.sin(angle) * labelRadius;
        
        return (
          <div
            key={item.name}
            className="absolute text-xs font-medium text-[#0A1F44] transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${(x / 200) * 100}%`,
              top: `${(y / 200) * 100}%`,
            }}
          >
            {item.name}
          </div>
        );
      })}
    </div>
  );

  if (variant === 'compact') {
    return (
      <Card className="w-64 bg-gradient-to-br from-[#0A1F44] to-[#147AFF] text-white border-0">
        <CardContent className="p-4 text-center">
          <div className="text-3xl font-bold mb-1">{scoreData.overallScore}</div>
          <div className="text-sm opacity-90">Gutcheck Score</div>
          <div className="text-xs opacity-75 mt-2">{scoreData.entrepreneurName}</div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'social') {
    return (
      <Card className="w-80 bg-gradient-to-br from-[#0A1F44] via-[#147AFF] to-[#19C2A0] text-white border-0">
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <div className="text-4xl font-bold mb-2">{scoreData.overallScore}</div>
            <div className="text-lg">Gutcheck Score™</div>
            <div className="text-sm opacity-90">FICO Score for Entrepreneurs</div>
          </div>
          
          <div className="text-center">
            <div className="font-medium">{scoreData.entrepreneurName}</div>
            <div className="text-sm opacity-75">{scoreData.rank} • {scoreData.timestamp}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto bg-white border border-[#147AFF]/20 shadow-xl">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-[#147AFF] to-[#19C2A0] rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded" />
            </div>
            <span className="font-bold text-[#0A1F44]">Gutcheck.AI</span>
          </div>
          
          <div className="text-5xl font-bold text-[#0A1F44] mb-2">
            {scoreData.overallScore}
          </div>
          <div className="text-lg text-[#147AFF] mb-1">Gutcheck Score™</div>
          <div className="text-sm text-gray-600">FICO Score for Entrepreneurs</div>
        </div>

        <RadarChart />

        <div className="mt-6 space-y-3">
          {categoryData.map((category) => (
            <div key={category.name} className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#0A1F44]">{category.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#147AFF] to-[#19C2A0] transition-all duration-500"
                    style={{ width: `${category.value}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-[#0A1F44] w-8 text-right">
                  {category.value}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-medium text-[#0A1F44]">{scoreData.entrepreneurName}</div>
              <div className="text-sm text-gray-600">{scoreData.rank} • {scoreData.timestamp}</div>
            </div>
            <Badge className="bg-[#19C2A0] hover:bg-[#19C2A0]/90">
              Verified
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('linkedin')}
              disabled={isSharing}
              className="flex-1 border-[#147AFF] text-[#147AFF] hover:bg-[#147AFF] hover:text-white"
            >
              <Linkedin className="h-4 w-4 mr-1" />
              LinkedIn
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('twitter')}
              disabled={isSharing}
              className="flex-1 border-[#147AFF] text-[#147AFF] hover:bg-[#147AFF] hover:text-white"
            >
              <X className="h-4 w-4 mr-1" />
              Twitter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('copy')}
              disabled={isSharing}
              className="border-[#19C2A0] text-[#19C2A0] hover:bg-[#19C2A0] hover:text-white"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}