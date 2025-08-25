'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getFunctions, httpsCallable } from 'firebase/functions';

interface CohortFormData {
  partnerName: string;
  cohortName: string;
  partnerEmail: string;
  expectedParticipants: number;
}

export default function PartnerOnboardingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CohortFormData>({
    partnerName: '',
    cohortName: '',
    partnerEmail: '',
    expectedParticipants: 25
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    assessmentUrl?: string;
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
      const functions = getFunctions();
      const createPartnerCohort = httpsCallable(functions, 'createPartnerCohort');
      
      const response = await createPartnerCohort(formData);
      const data = response.data as any;

      if (data.success) {
        setResult({
          success: true,
          assessmentUrl: data.assessmentUrl,
          message: 'Cohort created successfully!'
        });
      } else {
        setResult({
          success: false,
          message: 'Failed to create cohort'
        });
      }
    } catch (error) {
      console.error('Error creating cohort:', error);
      setResult({
        success: false,
        message: 'Error creating cohort. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'expectedParticipants' ? parseInt(value) || 25 : value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Partner Onboarding
            </h1>
            <p className="text-gray-600">
              Create your pilot cohort and get started with Gutcheck.AI in minutes
            </p>
          </div>

          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="partnerName" className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name *
                </label>
                <input
                  type="text"
                  id="partnerName"
                  name="partnerName"
                  value={formData.partnerName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Queens College"
                />
              </div>

              <div>
                <label htmlFor="cohortName" className="block text-sm font-medium text-gray-700 mb-2">
                  Cohort Name *
                </label>
                <input
                  type="text"
                  id="cohortName"
                  name="cohortName"
                  value={formData.cohortName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Alpha-Fall25"
                />
              </div>

              <div>
                <label htmlFor="partnerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email *
                </label>
                <input
                  type="email"
                  id="partnerEmail"
                  name="partnerEmail"
                  value={formData.partnerEmail}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your-email@organization.edu"
                />
              </div>

              <div>
                <label htmlFor="expectedParticipants" className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Participants
                </label>
                <input
                  type="number"
                  id="expectedParticipants"
                  name="expectedParticipants"
                  value={formData.expectedParticipants}
                  onChange={handleInputChange}
                  min="1"
                  max="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Creating Cohort...' : 'Create Cohort & Get Assessment Link'}
              </button>
            </form>
          ) : (
            <div className="text-center">
              {result.success ? (
                <div className="space-y-6">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-900">Cohort Created Successfully!</h3>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Your Assessment Link:</h4>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={result.assessmentUrl}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                      />
                      <button
                        onClick={() => navigator.clipboard.writeText(result.assessmentUrl || '')}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Next Steps:</h4>
                    <ul className="text-sm text-gray-600 space-y-2 text-left max-w-md mx-auto">
                      <li>• Share the assessment link with your participants</li>
                      <li>• Monitor completion rates in your Google Sheets dashboard</li>
                      <li>• Tag outcomes as participants progress through your program</li>
                    </ul>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => {
                        setResult(null);
                        setFormData({
                          partnerName: '',
                          cohortName: '',
                          partnerEmail: '',
                          expectedParticipants: 25
                        });
                      }}
                      className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                    >
                      Create Another Cohort
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-900">Error Creating Cohort</h3>
                  <p className="text-gray-600">{result.message}</p>
                  
                  <button
                    onClick={() => setResult(null)}
                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
