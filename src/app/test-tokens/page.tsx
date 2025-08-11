'use client';

import { useState } from 'react';
import { TokenBalanceIndicator } from '@/components/tokens/TokenBalanceIndicator';
import { TokenPurchaseModal } from '@/components/tokens/TokenPurchaseModal';
import { FeatureCard } from '@/components/tokens/FeatureCard';
import { TransactionHistory } from '@/components/tokens/TransactionHistory';
import { Brain, TrendingUp, Users, FileText, Zap, Target } from 'lucide-react';

export default function TestTokensPage() {
  const [tokenBalance, setTokenBalance] = useState(50);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [featureAccess, setFeatureAccess] = useState({
    'ai-market-analysis': false,
    'investor-matching': false,
    'competitor-report': false,
    'team-analysis': false,
    'pitch-deck-ai': false,
    'growth-projections': false
  });

  // Features array for testing
  const features = [
    {
      id: 'ai-market-analysis',
      title: 'AI Market Analysis Agent',
      description: 'Get comprehensive market analysis powered by AI to understand your competitive landscape and opportunities.',
      cost: 25,
      icon: <Brain className="w-6 h-6" />,
      category: 'AI Agent' as const,
      benefits: ['Market size analysis', 'Competitor mapping', 'Opportunity identification', 'Real-time data'],
      popular: true
    },
    {
      id: 'investor-matching',
      title: 'Investor Matching Algorithm',
      description: 'Advanced algorithm that matches your startup profile with the most suitable investors based on your sector and stage.',
      cost: 35,
      icon: <Target className="w-6 h-6" />,
      category: 'AI Agent' as const,
      benefits: ['Personalized investor list', 'Match scoring', 'Contact information', 'Investment patterns']
    },
    {
      id: 'competitor-report',
      title: 'Premium Competitor Report',
      description: 'Deep dive analysis of your top competitors including funding history, team analysis, and strategic insights.',
      cost: 15,
      icon: <TrendingUp className="w-6 h-6" />,
      category: 'Premium Insights' as const,
      benefits: ['Funding timeline', 'Team analysis', 'Strategic moves', 'Market positioning']
    },
    {
      id: 'team-analysis',
      title: 'Team Dynamics Analysis',
      description: 'Comprehensive analysis of your team composition and recommendations for strengthening key areas.',
      cost: 20,
      icon: <Users className="w-6 h-6" />,
      category: 'Premium Insights' as const,
      benefits: ['Skill gap analysis', 'Team chemistry', 'Hiring recommendations', 'Role optimization']
    },
    {
      id: 'pitch-deck-ai',
      title: 'AI Pitch Deck Optimizer',
      description: 'AI-powered analysis and optimization of your pitch deck with investor feedback simulation.',
      cost: 30,
      icon: <FileText className="w-6 h-6" />,
      category: 'AI Agent' as const,
      benefits: ['Content analysis', 'Structure optimization', 'Investor simulation', 'Improvement suggestions']
    },
    {
      id: 'growth-projections',
      title: 'Advanced Growth Projections',
      description: 'Sophisticated financial modeling and growth projections based on your industry and business model.',
      cost: 40,
      icon: <Zap className="w-6 h-6" />,
      category: 'Advanced Analytics' as const,
      benefits: ['Revenue modeling', 'Growth scenarios', 'Market validation', 'Funding timeline']
    }
  ];

  const handlePurchaseClick = () => {
    setShowPurchaseModal(true);
  };

  const handlePurchaseSuccess = () => {
    setTokenBalance(prev => prev + 100); // Add 100 tokens for testing
    setShowPurchaseModal(false);
  };

  const handleFeatureUnlock = (featureId: string) => {
    const feature = features.find(f => f.id === featureId);
    if (feature && tokenBalance >= feature.cost) {
      setTokenBalance(prev => prev - feature.cost);
      setFeatureAccess(prev => ({
        ...prev,
        [featureId]: true
      }));
      return true;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Token System Test Page</h1>
        
        {/* Token Balance Indicator */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Token Balance</h2>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-[#147AFF]/10 to-[#19C2A0]/10 rounded-full px-4 py-2 border border-[#147AFF]/20">
              <span className="text-[#0A1F44] font-medium">
                {tokenBalance.toLocaleString()}
              </span>
              <span className="bg-[#19C2A0]/10 text-[#19C2A0] border-0 px-2 py-1 rounded-full text-xs font-medium">
                Tokens
              </span>
              <button
                onClick={handlePurchaseClick}
                className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white border-0 h-6 w-6 p-0 rounded-full flex items-center justify-center"
              >
                <span className="text-xs">+</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl text-[#0A1F44] font-bold">
              Premium Features
            </h2>
            <span className="bg-[#147AFF]/10 text-[#147AFF] border-[#147AFF] px-3 py-1 rounded-full text-sm font-medium">
              {features.filter(f => tokenBalance >= f.cost).length} Available
            </span>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <FeatureCard
                key={feature.id}
                feature={feature}
                tokenBalance={tokenBalance}
                isUnlocked={featureAccess[feature.id as keyof typeof featureAccess] || false}
                onUnlockSuccess={() => handleFeatureUnlock(feature.id)}
              />
            ))}
          </div>
        </div>

        {/* Token Purchase Modal */}
        <TokenPurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          onPurchaseSuccess={handlePurchaseSuccess}
        />
      </div>
    </div>
  );
} 