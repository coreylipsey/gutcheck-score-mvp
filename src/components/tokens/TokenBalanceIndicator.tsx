'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/presentation/providers/AuthProvider';
import { TokenPresentationService } from '@/presentation/services/TokenPresentationService';
import { Coins, Plus, Lock } from 'lucide-react';

interface TokenBalanceIndicatorProps {
  onPurchaseClick?: () => void;
  className?: string;
}

export function TokenBalanceIndicator({ onPurchaseClick, className = '' }: TokenBalanceIndicatorProps) {
  const { user } = useAuthContext();
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadTokenBalance();
    }
  }, [user?.uid]);

  const loadTokenBalance = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);
      
      const tokenService = TokenPresentationService.getInstance();
      const result = await tokenService.getTokenBalance(user.uid);

      if (!result.error) {
        setTokenBalance(result.balance);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error loading token balance:', err);
      setError('Failed to load token balance');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseClick = () => {
    setShowComingSoon(true);
    // Hide the overlay after 3 seconds
    setTimeout(() => {
      setShowComingSoon(false);
    }, 3000);
  };

  if (!user) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 ${className} relative`}>
      {/* Token Balance Pill - Matching the design */}
      <div className="flex items-center space-x-2 bg-gradient-to-r from-[#147AFF]/10 to-[#19C2A0]/10 rounded-full px-4 py-2 border border-[#147AFF]/20">
        <Coins className="w-4 h-4 text-[#147AFF]" />
        <span className="text-[#0A1F44] font-medium">
          {loading ? (
            <div className="animate-pulse bg-gray-200 h-4 w-8 rounded"></div>
          ) : error ? (
            <span className="text-red-500">Error</span>
          ) : (
            (tokenBalance ?? 0).toLocaleString()
          )}
        </span>
        <span className="bg-[#19C2A0]/10 text-[#19C2A0] border-0 px-2 py-1 rounded-full text-xs font-medium">
          Tokens
        </span>
        <button
          onClick={handlePurchaseClick}
          className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white border-0 h-6 w-6 p-0 rounded-full flex items-center justify-center"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Coming Soon Overlay */}
      {showComingSoon && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-full flex items-center justify-center z-10">
          <div className="text-center p-2">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 mb-2">
              <Lock className="h-4 w-4 text-gray-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Coming Soon
            </h3>
            <p className="text-xs text-gray-600 max-w-32">
              Token purchasing will be available soon
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 