'use client';
import { ShareScoreButton } from '@/components/results/ShareScoreButton';
import { DownloadReportButton } from '@/components/results/DownloadReportButton';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ResultsContent() {
  const searchParams = useSearchParams();
  // Mock data for testing - in real app this would come from the session
  const mockScore = 85;
  const mockStars = 4.2;
  const mockPartner = 'Queens College';
  const mockCohort = 'Alpha-Fall25';
  const mockUserId = 'test-user-123';

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-center text-gray-800">Your Gutcheck Score</h1>
      
      {/* Score Display */}
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-6 md:mb-8">
        <div className="text-center mb-6 md:mb-8">
          <div className="text-5xl md:text-7xl font-bold text-blue-600 mb-3 md:mb-4">{mockScore}</div>
          <div className="text-2xl md:text-3xl text-yellow-500 mb-4 md:mb-6">
            {'★'.repeat(Math.floor(mockStars))}{'☆'.repeat(5 - Math.floor(mockStars))}
          </div>
          <p className="text-gray-600 text-base md:text-lg">
            {mockPartner} • {mockCohort}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="border-t pt-6 md:pt-8">
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-800">Share Your Results</h2>
          <div className="space-y-4">
            <ShareScoreButton
              score={mockScore}
              stars={mockStars}
              partner={mockPartner}
              cohort={mockCohort}
              userId={mockUserId}
            />
          </div>
        </div>
      </div>

      {/* Partner Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-800">Partner Tools</h2>
        <p className="text-gray-600 mb-4 md:mb-6">
          Generate reports and analytics for your cohort.
        </p>
        <DownloadReportButton 
          partner={mockPartner} 
          cohort={mockCohort} 
        />
      </div>

      {/* Debug Info */}
      <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
        <p>Session: {searchParams.get('sess') || 'No session ID'}</p>
        <p>Partner: {searchParams.get('partner_id') || 'No partner ID'}</p>
        <p>Cohort: {searchParams.get('cohort_id') || 'No cohort ID'}</p>
      </div>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
