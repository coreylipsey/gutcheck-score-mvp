'use client';

import { useState } from 'react';
import { Suspense } from 'react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { useAuthContext } from '@/presentation/providers/AuthProvider';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { initializeApp } from 'firebase/app';
import { 
  Users, 
  Target, 
  CheckCircle, 
  AlertTriangle,
  ExternalLink,
  Copy,
  Mail,
  Building
} from 'lucide-react';

// Initialize Firebase for client-side
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

interface CohortCreationResponse {
  success: boolean;
  partnerId: string;
  cohortId: string;
  assessmentUrl: string;
  welcomeEmail: string;
}

export default function PartnerOnboarding() {
  const { user } = useAuthContext();
  const [formData, setFormData] = useState({
    partnerName: '',
    cohortName: '',
    partnerEmail: '',
    expectedParticipants: '',
    organizationType: 'university', // university, incubator, accelerator, other
    role: 'program_director' // program_director, faculty, administrator, other
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<CohortCreationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showIdentityWarning, setShowIdentityWarning] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Check if user has existing assessment data
      if (user) {
        const getUserAssessmentHistory = httpsCallable(functions, 'getUserAssessmentHistory');
        const historyResponse = await getUserAssessmentHistory({ userId: user.uid });
        const historyData = historyResponse.data as any;
        
        if (historyData.hasAssessmentData) {
          setShowIdentityWarning(true);
          return;
        }
      }

      // Check partner access
      if (user) {
        const checkPartnerAccess = httpsCallable(functions, 'checkPartnerAccess');
        const accessResponse = await checkPartnerAccess({ userId: user.uid });
        const accessData = accessResponse.data as any;
        
        if (!accessData.hasAccess) {
          // Promote user to partner role
          const promoteToPartner = httpsCallable(functions, 'promoteToPartner');
          await promoteToPartner({
            userId: user.uid,
            partnerData: {
              organizationName: formData.partnerName,
              organizationType: formData.organizationType,
              role: formData.role,
              cohortsCount: 0
            }
          });
        }
      }

      const createPartnerCohort = httpsCallable(functions, 'createPartnerCohort');
      
      const response = await createPartnerCohort({
        partnerName: formData.partnerName,
        cohortName: formData.cohortName,
        partnerEmail: formData.partnerEmail,
        expectedParticipants: parseInt(formData.expectedParticipants),
        organizationType: formData.organizationType,
        role: formData.role
      });

      const data = response.data as CohortCreationResponse;
      setResult(data);

    } catch (error: any) {
      console.error('Error creating partner cohort:', error);
      setError(error.message || 'Failed to create partner cohort');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const sendWelcomeEmail = () => {
    if (result?.welcomeEmail) {
      const subject = encodeURIComponent('Welcome to Gutcheck.AI Partner Program');
      const body = encodeURIComponent(result.welcomeEmail);
      window.open(`mailto:${formData.partnerEmail}?subject=${subject}&body=${body}`);
    }
  };

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A1F44] to-[#147AFF] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/95 backdrop-blur-sm border-0 rounded-lg shadow-sm p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-[#147AFF] to-[#19C2A0] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Partner Cohort Created!</h1>
              <p className="text-gray-600">Your assessment link is ready to share with participants</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Cohort Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Cohort Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Partner:</span>
                      <span className="font-medium">{formData.partnerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cohort:</span>
                      <span className="font-medium">{formData.cohortName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expected Participants:</span>
                      <span className="font-medium">{formData.expectedParticipants}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Partner ID:</span>
                      <span className="font-mono text-sm">{result.partnerId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cohort ID:</span>
                      <span className="font-mono text-sm">{result.cohortId}</span>
                    </div>
                  </div>
                </div>

                {/* Assessment Link */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Link</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <a 
                        href={result.assessmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#147AFF] hover:text-[#0A1F44] truncate flex-1 mr-2"
                      >
                        {result.assessmentUrl}
                      </a>
                      <button
                        onClick={() => copyToClipboard(result.assessmentUrl)}
                        className="p-2 text-gray-500 hover:text-gray-700"
                        title="Copy link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Share this link with your cohort participants
                  </p>
                </div>
              </div>

              {/* Next Steps */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-[#19C2A0] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">1</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Share Assessment Link</p>
                        <p className="text-sm text-gray-600">Send the assessment link to your cohort participants</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-[#19C2A0] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">2</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Monitor Progress</p>
                        <p className="text-sm text-gray-600">Track completion rates and scores in your admin dashboard</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-[#19C2A0] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">3</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Tag Outcomes</p>
                        <p className="text-sm text-gray-600">Mark participant outcomes for ML model training</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={sendWelcomeEmail}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#147AFF] to-[#19C2A0] text-white rounded-md hover:opacity-90 transition-opacity"
                  >
                    <Mail className="w-4 h-4" />
                    Send Welcome Email
                  </button>
                  <a
                    href={`/partner/dashboard/${result.partnerId}`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <Building className="w-4 h-4" />
                    Go to Partner Dashboard
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1F44] to-[#147AFF] p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/95 backdrop-blur-sm border-0 rounded-lg shadow-sm p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#147AFF] to-[#19C2A0] rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Partner Onboarding</h1>
            <p className="text-gray-600">Create a cohort and get your assessment link</p>
          </div>

          {/* Identity Warning */}
          {showIdentityWarning && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-yellow-800">Identity Management Notice</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    We detected you have existing assessment data. To maintain data integrity, 
                    we recommend creating a separate partner account for cohort management. 
                    This ensures your personal assessment data remains separate from your cohort data.
                  </p>
                  <div className="mt-3 space-y-2">
                    <button
                      onClick={() => setShowIdentityWarning(false)}
                      className="text-sm text-yellow-800 underline hover:no-underline"
                    >
                      Continue with current account
                    </button>
                    <div className="text-sm text-yellow-700">
                      Or <a href="/auth" className="underline hover:no-underline">sign out</a> and create a new partner account
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#147AFF] focus:border-transparent"
                  placeholder="e.g., Queens College"
                />
              </div>

              <div>
                <label htmlFor="organizationType" className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Type *
                </label>
                <select
                  id="organizationType"
                  name="organizationType"
                  value={formData.organizationType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#147AFF] focus:border-transparent"
                >
                  <option value="university">University</option>
                  <option value="incubator">Incubator</option>
                  <option value="accelerator">Accelerator</option>
                  <option value="coworking">Coworking Space</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#147AFF] focus:border-transparent"
                  placeholder="e.g., Fall 2025 Entrepreneurs"
                />
              </div>

              <div>
                <label htmlFor="expectedParticipants" className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Participants *
                </label>
                <input
                  type="number"
                  id="expectedParticipants"
                  name="expectedParticipants"
                  value={formData.expectedParticipants}
                  onChange={handleInputChange}
                  required
                  min="1"
                  max="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#147AFF] focus:border-transparent"
                  placeholder="e.g., 25"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#147AFF] focus:border-transparent"
                  placeholder="your.email@organization.edu"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Role *
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#147AFF] focus:border-transparent"
                >
                  <option value="program_director">Program Director</option>
                  <option value="faculty">Faculty Member</option>
                  <option value="administrator">Administrator</option>
                  <option value="coordinator">Program Coordinator</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#147AFF] to-[#19C2A0] text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating Cohort...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4" />
                  Create Cohort & Get Assessment Link
                </>
              )}
            </button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
          </form>

          {/* Info Box */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">What happens next?</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• You'll receive a unique assessment link for your cohort</li>
              <li>• Share the link with your participants</li>
              <li>• Monitor progress and scores in your admin dashboard</li>
              <li>• Tag outcomes to contribute to ML model training</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
