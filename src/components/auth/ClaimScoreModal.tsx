'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '../../presentation/providers/AuthProvider';

interface ClaimScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimSuccess: () => void;
  sessionId?: string;
}

export function ClaimScoreModal({ isOpen, onClose, onClaimSuccess, sessionId }: ClaimScoreModalProps) {
  const [loading, setLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const { user } = useAuthContext();

  useEffect(() => {
    if (isOpen && user) {
      // Check if there are any anonymous sessions to claim
      checkForAnonymousSessions();
    }
  }, [isOpen, user]);

  const checkForAnonymousSessions = async () => {
    // This would check localStorage or make an API call to find anonymous sessions
    // For now, we'll use the sessionId prop
  };

  const handleClaimScore = async () => {
    if (!user || !sessionId) return;

    setLoading(true);
    try {
      // Call API to link the session to the user
      const response = await fetch('/api/auth/claim-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          userId: user.uid,
        }),
      });

      if (response.ok) {
        setClaimed(true);
        onClaimSuccess();
      } else {
        throw new Error('Failed to claim score');
      }
    } catch (error) {
      console.error('Error claiming score:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
        {!claimed ? (
          <>
            <div className="text-center mb-8">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-[#147AFF] to-[#19C2A0] mb-6">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#0A1F44] mb-3">
                Claim Your Gutcheck Score
              </h3>
              <p className="text-gray-600 text-lg">
                We found an assessment you completed. Would you like to link it to your account to track your progress?
              </p>
            </div>

            <div className="bg-gradient-to-r from-[#147AFF]/10 to-[#19C2A0]/10 border border-[#147AFF]/20 rounded-2xl p-6 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-[#147AFF] mt-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-bold text-[#0A1F44] mb-3">
                    What happens when you claim your score?
                  </h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#19C2A0] rounded-full mr-3"></span>
                      Your assessment results will be saved to your account
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#19C2A0] rounded-full mr-3"></span>
                      You can track your progress over time
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#19C2A0] rounded-full mr-3"></span>
                      Get personalized insights and recommendations
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#19C2A0] rounded-full mr-3"></span>
                      Access to your assessment history
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#147AFF] focus:ring-offset-2 transition-all font-semibold"
              >
                Maybe Later
              </button>
              <button
                onClick={handleClaimScore}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-[#147AFF] to-[#19C2A0] text-white px-6 py-3 rounded-xl hover:from-[#147AFF]/90 hover:to-[#19C2A0]/90 focus:outline-none focus:ring-2 focus:ring-[#147AFF] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Claiming...
                  </div>
                ) : (
                  'Claim My Score'
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-[#19C2A0] to-[#147AFF] mb-6">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#0A1F44] mb-3">
              Score Claimed Successfully!
            </h3>
            <p className="text-gray-600 mb-8 text-lg">
              Your Gutcheck Score has been linked to your account. You can now track your progress and access your assessment history.
            </p>
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-[#147AFF] to-[#19C2A0] text-white px-8 py-3 rounded-xl hover:from-[#147AFF]/90 hover:to-[#19C2A0]/90 focus:outline-none focus:ring-2 focus:ring-[#147AFF] focus:ring-offset-2 transition-all font-bold shadow-lg"
            >
              Continue to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 