'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AssessmentQuestion from '@/components/AssessmentQuestion';
import { ASSESSMENT_QUESTIONS } from '@/domain/entities/Assessment';
import { AssessmentResponse } from '@/domain/entities/Assessment';
import { useAssessment } from '@/presentation/hooks/useAssessment';
import { useAuthContext } from '@/presentation/providers/AuthProvider';
import { DashboardService } from '@/application/services/DashboardService';

export default function AssessmentPage() {
  const router = useRouter();
  const { calculateScores, generateAIFeedback, saveSession, error } = useAssessment();
  const { user } = useAuthContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState('');
  const [industry, setIndustry] = useState('');
  const [consentForML, setConsentForML] = useState(false);
  const [assessmentLimits, setAssessmentLimits] = useState<{
    canTakeAssessment: boolean;
    nextAvailableDate: string | null;
    daysUntilNextAssessment: number | null;
    lastAssessmentDate: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check assessment frequency limits
  useEffect(() => {
    const checkAssessmentLimits = async () => {
      if (user) {
        try {
          const dashboardService = DashboardService.getInstance();
          const data = await dashboardService.getDashboardData(user.uid);
          setAssessmentLimits(data.assessmentLimits);
        } catch (error) {
          console.error('Error checking assessment limits:', error);
          // If there's an error, allow the assessment to proceed
          setAssessmentLimits({
            canTakeAssessment: true,
            nextAvailableDate: null,
            daysUntilNextAssessment: null,
            lastAssessmentDate: null
          });
        }
      } else {
        // For anonymous users, allow assessment (they can claim later)
        setAssessmentLimits({
          canTakeAssessment: true,
          nextAvailableDate: null,
          daysUntilNextAssessment: null,
          lastAssessmentDate: null
        });
      }
      setIsLoading(false);
    };

    checkAssessmentLimits();
  }, [user]);

  // Step 0 is consent, Step 1 is location/industry, then questions start at step 2
  const isConsentStep = currentStep === 0;
  const isLocationStep = currentStep === 1;
  const currentQuestion = isLocationStep ? null : ASSESSMENT_QUESTIONS[currentStep - 2];
  const totalQuestions = ASSESSMENT_QUESTIONS.length + 2; // +1 for consent step, +1 for location step
  const progress = ((currentStep + 1) / totalQuestions) * 100;

  const handleResponse = (response: string | number | string[]) => {
    if (!currentQuestion) return;
    
    const newResponse: AssessmentResponse = {
      questionId: currentQuestion.id,
      response,
      category: currentQuestion.category,
      timestamp: new Date(),
    };

    setResponses(prev => {
      const existingIndex = prev.findIndex(r => r.questionId === currentQuestion.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newResponse;
        return updated;
      }
      return [...prev, newResponse];
    });
  };

  const canProceed = () => {
    if (isConsentStep) {
      return consentForML;
    }
    
    if (isLocationStep) {
      return location.trim() && industry.trim();
    }

    if (isConsentStep) {
      return true; // User can proceed regardless of consent choice
    }

    if (!currentQuestion) return false;
    
    const currentResponse = responses.find(r => r.questionId === currentQuestion.id);
    if (!currentResponse) return false;

    if (currentQuestion.type === 'openEnded') {
      const textResponse = currentResponse.response as string;
      if (currentQuestion.minCharacters) {
        // Simple validation: check minimum characters and basic content
        return textResponse.trim().length >= currentQuestion.minCharacters && 
               textResponse.trim().split(/\s+/).length >= 15;
      }
      return textResponse.trim().length > 0;
    }

    if (currentQuestion.type === 'multiSelect') {
      const selectedOptions = currentResponse.response as string[];
      return selectedOptions.length > 0;
    }

    return true;
  };

  const handleNext = () => {
    if (currentStep < totalQuestions - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Calculate scores using the new architecture
      const scores = await calculateScores(responses);
      
      // Generate enhanced AI feedback with new structure
      const geminiFeedback = await generateAIFeedback({
        responses,
        scores,
        industry,
        location,
      });
      
      // Generate session ID
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store session ID in localStorage for results page
      localStorage.setItem('sessionId', sessionId);
      
      // Calculate star rating using correct thresholds (matching HeroScore component)
      const starRating = scores.overallScore >= 90 ? 5 : 
                        scores.overallScore >= 80 ? 4 : 
                        scores.overallScore >= 65 ? 3 : 
                        scores.overallScore >= 50 ? 2 : 1;
      
      // Store responses data in localStorage as fallback
      localStorage.setItem('responsesData', JSON.stringify({
        responses,
        scores,
        starRating,
        categoryBreakdown: {
          personalBackground: scores.personalBackground,
          entrepreneurialSkills: scores.entrepreneurialSkills,
          resources: scores.resources,
          behavioralMetrics: scores.behavioralMetrics,
          growthVision: scores.growthVision,
        },
        geminiFeedback,
        location,
        industry,
      }));
      
      // Save session using the new architecture
      await saveSession({
        sessionId,
        responses,
        scores,
        starRating,
        categoryBreakdown: {
          personalBackground: scores.personalBackground,
          entrepreneurialSkills: scores.entrepreneurialSkills,
          resources: scores.resources,
          behavioralMetrics: scores.behavioralMetrics,
          growthVision: scores.growthVision,
        },
        consentForML,
        geminiFeedback,
        userId: user?.uid, // Use authenticated user ID if available
      });

      // Navigate to results
      router.push('/assessment/results');
    } catch (err) {
      console.error('Assessment submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderConsentStep = () => (
    <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Help Improve Our AI Model
        </h2>
        <p className="text-gray-600 mb-6">
          Your assessment responses can help us improve our AI model to better serve future entrepreneurs. 
          This data will be used anonymously for machine learning research.
        </p>
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="ml-consent"
            checked={consentForML}
            onChange={(e) => setConsentForML(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="ml-consent" className="text-sm text-gray-700">
            I Agree
          </label>
        </div>
      </div>
    </div>
  );

  const renderLocationStep = () => (
    <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Tell us about your business
        </h2>
        <p className="text-sm text-gray-500">
          This information helps us provide more personalized feedback and recommendations
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Where is your business located?
          </label>
          <select
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a location</option>
            <option value="Alabama">Alabama</option>
            <option value="Alaska">Alaska</option>
            <option value="Arizona">Arizona</option>
            <option value="Arkansas">Arkansas</option>
            <option value="California">California</option>
            <option value="Colorado">Colorado</option>
            <option value="Connecticut">Connecticut</option>
            <option value="Delaware">Delaware</option>
            <option value="District of Columbia">District of Columbia</option>
            <option value="Florida">Florida</option>
            <option value="Georgia">Georgia</option>
            <option value="Hawaii">Hawaii</option>
            <option value="Idaho">Idaho</option>
            <option value="Illinois">Illinois</option>
            <option value="Indiana">Indiana</option>
            <option value="Iowa">Iowa</option>
            <option value="Kansas">Kansas</option>
            <option value="Kentucky">Kentucky</option>
            <option value="Louisiana">Louisiana</option>
            <option value="Maine">Maine</option>
            <option value="Maryland">Maryland</option>
            <option value="Massachusetts">Massachusetts</option>
            <option value="Michigan">Michigan</option>
            <option value="Minnesota">Minnesota</option>
            <option value="Mississippi">Mississippi</option>
            <option value="Missouri">Missouri</option>
            <option value="Montana">Montana</option>
            <option value="Nebraska">Nebraska</option>
            <option value="Nevada">Nevada</option>
            <option value="New Hampshire">New Hampshire</option>
            <option value="New Jersey">New Jersey</option>
            <option value="New Mexico">New Mexico</option>
            <option value="New York">New York</option>
            <option value="North Carolina">North Carolina</option>
            <option value="North Dakota">North Dakota</option>
            <option value="Ohio">Ohio</option>
            <option value="Oklahoma">Oklahoma</option>
            <option value="Oregon">Oregon</option>
            <option value="Pennsylvania">Pennsylvania</option>
            <option value="Rhode Island">Rhode Island</option>
            <option value="South Carolina">South Carolina</option>
            <option value="South Dakota">South Dakota</option>
            <option value="Tennessee">Tennessee</option>
            <option value="Texas">Texas</option>
            <option value="Utah">Utah</option>
            <option value="Vermont">Vermont</option>
            <option value="Virginia">Virginia</option>
            <option value="Washington">Washington</option>
            <option value="West Virginia">West Virginia</option>
            <option value="Wisconsin">Wisconsin</option>
            <option value="Wyoming">Wyoming</option>
            <option value="American Samoa">American Samoa</option>
            <option value="Guam">Guam</option>
            <option value="Northern Mariana Islands">Northern Mariana Islands</option>
            <option value="Puerto Rico">Puerto Rico</option>
            <option value="U.S. Virgin Islands">U.S. Virgin Islands</option>
          </select>
        </div>

        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
            What industry is your business in?
          </label>
          <select
            id="industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select an industry</option>
            <option value="Technology & Software">Technology & Software</option>
            <option value="E-Commerce & Retail">E-Commerce & Retail</option>
            <option value="Healthcare & Biotech">Healthcare & Biotech</option>
            <option value="Finance & FinTech">Finance & FinTech</option>
            <option value="Real Estate & PropTech">Real Estate & PropTech</option>
            <option value="Education & EdTech">Education & EdTech</option>
            <option value="Food & Beverage">Food & Beverage</option>
            <option value="Manufacturing & Consumer Goods">Manufacturing & Consumer Goods</option>
            <option value="Creative & Media">Creative & Media</option>
            <option value="Transportation & Logistics">Transportation & Logistics</option>
            <option value="Energy & Sustainability">Energy & Sustainability</option>
            <option value="Professional Services (Consulting, Law, etc.)">Professional Services (Consulting, Law, etc.)</option>
            <option value="Government & Nonprofit">Government & Nonprofit</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking assessment availability...</p>
        </div>
      </div>
    );
  }

  // Show restriction message if assessment is not available
  if (assessmentLimits && !assessmentLimits.canTakeAssessment) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
                <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Assessment Not Available
              </h1>
              <p className="text-gray-600 mb-6">
                You can only take one assessment per month to ensure meaningful progress tracking and prevent assessment fatigue.
              </p>
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Last Assessment</p>
                    <p className="font-medium text-gray-900">{assessmentLimits.lastAssessmentDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Next Available</p>
                    <p className="font-medium text-blue-600">{assessmentLimits.nextAvailableDate}</p>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-lg font-medium text-gray-900">
                    {assessmentLimits.daysUntilNextAssessment} days remaining
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
                >
                  View Dashboard
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#147AFF] to-[#19C2A0] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">G</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-[#0A1F44]">Gutcheck.AI</span>
            </Link>
            <div className="text-right">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                Assessment
              </h1>
              <p className="text-sm text-gray-600">
                {isConsentStep ? 'Step 1 of 3: Data Consent' : isLocationStep ? 'Step 2 of 3: Business Information' : `Question ${currentStep - 1} of ${totalQuestions - 2}`}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {isConsentStep ? (
          renderConsentStep()
        ) : isLocationStep ? (
          renderLocationStep()
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {currentQuestion?.text}
              </h2>
              {currentQuestion?.section && (
                <p className="text-sm text-gray-500">
                  Section: {currentQuestion.section}
                </p>
              )}
            </div>

            <AssessmentQuestion
              question={currentQuestion!}
              value={responses.find(r => r.questionId === currentQuestion?.id)?.response}
              onChange={handleResponse}
            />
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed() || isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isSubmitting && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span>{isSubmitting ? 'Processing...' : currentStep === totalQuestions - 1 ? 'Submit Assessment' : 'Next'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
