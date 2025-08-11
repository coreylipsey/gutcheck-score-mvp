'use client';

import { useState } from 'react';
import { useAuthContext } from '@/presentation/providers/AuthProvider';
import { TokenPresentationService } from '@/presentation/services/TokenPresentationService';
import { Lock, Unlock, Brain, TrendingUp, Users, FileText, Zap, Target } from 'lucide-react';

interface FeatureCardProps {
  feature: {
    id: string;
    title: string;
    description: string;
    cost: number;
    icon: React.ReactNode;
    category: 'AI Agent' | 'Premium Insights' | 'Advanced Analytics';
    benefits: string[];
    popular?: boolean;
  };
  tokenBalance: number;
  isUnlocked: boolean;
  onUnlockSuccess?: () => void;
  className?: string;
}

export function FeatureCard({ 
  feature, 
  tokenBalance, 
  isUnlocked, 
  onUnlockSuccess,
  className = '' 
}: FeatureCardProps) {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = async () => {
    if (!user?.uid || isUnlocked) return;

    setLoading(true);
    setError(null);

    try {
      const tokenService = TokenPresentationService.getInstance();
      const result = await tokenService.unlockFeature(user.uid, feature.id);

      if (result.success) {
        onUnlockSuccess?.();
      } else {
        setError(result.error || 'Failed to unlock feature');
      }
    } catch (err) {
      console.error('Error unlocking feature:', err);
      setError('Failed to unlock feature');
    } finally {
      setLoading(false);
    }
  };

  const canAfford = tokenBalance >= feature.cost;
  const affordable = canAfford && !isUnlocked;

  return (
    <div 
      className={`relative transition-all duration-200 ${
        affordable 
          ? 'hover:shadow-lg border-[#147AFF]/20 hover:border-[#147AFF]/40' 
          : 'opacity-75 border-slate-200'
      } bg-white rounded-lg shadow-lg border-2 ${className}`}
    >
      {feature.popular && (
        <div className="absolute -top-2 left-4">
          <span className="bg-[#FF6B00] text-white border-0 px-2 py-1 rounded-full text-xs font-medium">
            Popular
          </span>
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              affordable 
                ? 'bg-[#147AFF]/10 text-[#147AFF]' 
                : 'bg-slate-100 text-slate-400'
            }`}>
              {feature.icon}
            </div>
            <div>
              <h3 className="text-lg text-[#0A1F44] font-semibold">
                {feature.title}
              </h3>
              <span className="bg-[#19C2A0]/10 text-[#19C2A0] border-0 px-2 py-1 rounded-full text-xs font-medium mt-1 inline-block">
                {feature.category}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {isUnlocked ? (
              <Unlock className="w-4 h-4 text-[#19C2A0]" />
            ) : (
              <Lock className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </div>

        <p className="text-slate-600 text-sm leading-relaxed mb-4">
          {feature.description}
        </p>

        <div className="space-y-2 mb-4">
          <p className="text-sm text-[#0A1F44] font-medium">What you'll get:</p>
          <ul className="text-sm text-slate-600 space-y-1">
            {feature.benefits.map((benefit, index) => (
              <li key={index} className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-[#19C2A0] rounded-full"></div>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center space-x-2">
            <span className="text-2xl text-[#0A1F44]">
              {feature.cost}
            </span>
            <span className="text-sm text-slate-500">tokens</span>
          </div>
          
          <button
            onClick={handleUnlock}
            disabled={!affordable || loading || !user}
            className={`${
              affordable
                ? 'bg-[#147AFF] hover:bg-[#147AFF]/90 text-white'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            } px-4 py-2 rounded-lg text-sm font-medium transition-all`}
          >
            {isUnlocked ? (
              'Feature Unlocked'
            ) : loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Unlocking...</span>
              </div>
            ) : (
              affordable ? 'Unlock Now' : 'Insufficient Tokens'
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 