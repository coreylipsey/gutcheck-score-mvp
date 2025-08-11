'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AssessmentQuestion from '@/components/AssessmentQuestion';
import { ASSESSMENT_QUESTIONS } from '@/domain/entities/Assessment';
import { AssessmentResponse } from '@/domain/entities/Assessment';
import { useAssessment } from '@/presentation/hooks/useAssessment';
import { useAuthContext } from '@/presentation/providers/AuthProvider';

export default function AssessmentPage() {
  const router = useRouter();
  const { calculateScores, generateAIFeedback, saveSession, error } = useAssessment();
  const { user } = useAuthContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState('');
  const [industry, setIndustry] = useState('');

  // Step 0 is location/industry, then questions start at step 1
  const isLocationStep = currentStep === 0;
  const currentQuestion = isLocationStep ? null : ASSESSMENT_QUESTIONS[currentStep - 1];
  const totalQuestions = ASSESSMENT_QUESTIONS.length + 1; // +1 for location step
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
    if (isLocationStep) {
      return location.trim() && industry.trim();
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
      
      // Generate AI feedback
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
      
      // Calculate star rating using proper function
      const starRating = scores.overallScore >= 80 ? 5 : 
                        scores.overallScore >= 60 ? 4 : 
                        scores.overallScore >= 40 ? 3 : 
                        scores.overallScore >= 20 ? 2 : 1;
      
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gutcheck.AI Assessment
          </h1>
          <p className="text-gray-600">
            {isLocationStep ? 'Step 1 of 2: Business Information' : `Question ${currentStep} of ${totalQuestions}`}
          </p>
        </div>

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
        {isLocationStep ? (
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
