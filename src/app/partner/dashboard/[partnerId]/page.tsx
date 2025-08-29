'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthContext } from '@/presentation/providers/AuthProvider';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { initializeApp } from 'firebase/app';
import { 
  Users, 
  TrendingUp, 
  FileText,
  Activity,
  ExternalLink,
  AlertTriangle
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

interface PartnerData {
  partnerId: string;
  partnerName: string;
  partnerEmail: string;
  status: string;
  createdAt: string;
  cohortsCount: number;
}

interface CohortData {
  cohortId: string;
  partnerId: string;
  cohortName: string;
  totalAssessments: number;
  completedAssessments: number;
  completionRate: number;
  averageScore: number;
  taggedOutcomes: number;
  status: 'active' | 'completed' | 'draft';
  assessmentUrl: string;
}

interface DashboardMetrics {
  totalParticipants: number;
  totalCompleted: number;
  averageScore: number;
  completionRate: number;
}

function PartnerDashboard() {
  const params = useParams();
  const router = useRouter();
  const partnerId = params.partnerId as string;
  const { user } = useAuthContext();
  
  const [partner, setPartner] = useState<PartnerData | null>(null);
  const [cohorts, setCohorts] = useState<CohortData[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalParticipants: 0,
    totalCompleted: 0,
    averageScore: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    const checkPartnerAccess = async () => {
      if (!user) return;

      try {
        console.log('Checking partner access for user:', user.uid);
        const checkPartnerAccess = httpsCallable(functions, 'checkPartnerAccess');
        const response = await checkPartnerAccess({ userId: user.uid });
        const data = response.data as any;
        
        console.log('Partner access response:', data);
        
        if (!data.hasAccess) {
          console.log('User does not have partner access');
          setError('You do not have access to partner features. Please contact support.');
          setHasAccess(false);
          return;
        }

        // Check if user has access to this specific partner
        // Instead of relying on organizationName, we'll check if the partner exists
        // and the user has partner role (which means they can access partner dashboards)
        if (data.userRole?.roles?.includes('partner') || data.userRole?.roles?.includes('admin')) {
          console.log('User has partner role, allowing access to partner dashboard');
          setHasAccess(true);
        } else {
          console.log('User does not have partner role');
          setError('You do not have access to partner features. Please contact support.');
          setHasAccess(false);
        }
      } catch (error) {
        console.error('Error checking partner access:', error);
        setError('Failed to verify partner access.');
        setHasAccess(false);
      }
    };

    checkPartnerAccess();
  }, [user, partnerId]);

  useEffect(() => {
    const fetchPartnerDashboardData = async () => {
      console.log('Fetching partner dashboard data. hasAccess:', hasAccess);
      if (!hasAccess) return;

      try {
        console.log('Making API call to fetch partner dashboard data');
        // Fetch partner-specific data
        const response = await fetch(`/api/partner/dashboard/${partnerId}`);
        console.log('API response status:', response.status);
        console.log('API response headers:', response.headers);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API response error:', errorText);
          throw new Error(`Failed to fetch partner dashboard data: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Partner dashboard data received:', data);
        
        if (!data.partner) {
          console.error('No partner data in response:', data);
          throw new Error('No partner data received from API');
        }
        
        setPartner(data.partner);
        setCohorts(data.cohorts || []);
        setMetrics(data.metrics || {
          totalParticipants: 0,
          totalCompleted: 0,
          averageScore: 0,
          completionRate: 0
        });
      } catch (error) {
        console.error('Error fetching partner dashboard data:', error);
        setError(`Failed to load partner dashboard data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };

    if (hasAccess && partnerId) {
      fetchPartnerDashboardData();
    }
  }, [partnerId, hasAccess]);

  const MetricCard = ({ 
    title, 
    value, 
    icon, 
    color = "blue"
  }: { 
    title: string; 
    value: string | number; 
    icon: React.ReactNode; 
    color?: string;
  }) => {
    const colorClasses = {
      green: 'bg-green-50 text-green-600',
      blue: 'bg-blue-50 text-blue-600',
      yellow: 'bg-yellow-50 text-yellow-600',
      orange: 'bg-orange-50 text-orange-600'
    };

    return (
      <div className="bg-white/95 backdrop-blur-sm border-0 rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
            <div className={`p-3 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
              {icon}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-[#0A1F44] to-[#147AFF] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="mt-4 text-white">Loading partner dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error && hasAccess === false) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-[#0A1F44] to-[#147AFF] flex items-center justify-center">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white/95 backdrop-blur-sm border-0 rounded-lg shadow-sm p-8">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600 mb-6">{error || 'You do not have access to this partner dashboard.'}</p>
              <button
                onClick={() => router.push('/partner')}
                className="px-4 py-2 bg-[#147AFF] text-white rounded-md hover:bg-[#0A1F44] transition-colors"
              >
                Go to Partner Onboarding
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[#0A1F44] to-[#147AFF] p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl text-white mb-2">{partner?.partnerName} Dashboard</h1>
              <p className="text-blue-200">Program Management & Analytics</p>
            </div>
          </div>

          {/* 4 Metric Boxes (from Funder Report design) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard
              title="Total Participants"
              value={metrics.totalParticipants}
              icon={<Users className="w-4 h-4" />}
              color="green"
            />
            <MetricCard
              title="Total Assessments Completed"
              value={metrics.totalCompleted}
              icon={<FileText className="w-4 h-4" />}
              color="blue"
            />
            <MetricCard
              title="Average Score"
              value={metrics.averageScore.toFixed(1)}
              icon={<TrendingUp className="w-4 h-4" />}
              color="yellow"
            />
            <MetricCard
              title="Completion Rate"
              value={`${metrics.completionRate.toFixed(1)}%`}
              icon={<Activity className="w-4 h-4" />}
              color="orange"
            />
          </div>

          {/* Active Cohorts Table */}
          <div className="bg-white/95 backdrop-blur-sm border-0 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Your Cohorts</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cohort Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completion %
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cohorts.map((cohort) => (
                    <tr key={cohort.cohortId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {cohort.cohortName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {cohort.completedAssessments}/{cohort.totalAssessments}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {cohort.completionRate.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {cohort.averageScore.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          cohort.status === 'active' ? 'bg-green-100 text-green-800' :
                          cohort.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {cohort.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <a
                          href={`/partner/dashboard/${partnerId}/cohort/${cohort.cohortId}`}
                          className="inline-flex items-center gap-1 text-[#147AFF] hover:text-[#0A1F44]"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Analytics
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default PartnerDashboard;
