'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  AlertTriangle,
  RefreshCw,
  Plus,
  Shield
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

interface AssessmentData {
  sessionId: string;
  userId: string;
  partnerId: string;
  cohortId: string;
  overallScore: number;
  starRating: number;
  completedAt: string;
  consentForML: boolean;
}

interface OutcomeData {
  sessionId: string;
  outcomeTag: string;
  outcomeNotes: string;
  taggedBy: string;
  taggedAt: string;
  partnerId: string;
  cohortId: string;
  userScore: number;
}

interface DashboardMetrics {
  totalPartners: number;
  totalCohorts: number;
  totalAssessments: number;
  totalOutcomes: number;
  averageCompletionRate: number;
  averageScore: number;
  recentAssessments: number;
  pendingOutcomes: number;
  totalParticipants: number;
  totalCompleted: number;
}

function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalPartners: 0,
    totalCohorts: 0,
    totalAssessments: 0,
    totalOutcomes: 0,
    averageCompletionRate: 0,
    averageScore: 0,
    recentAssessments: 0,
    pendingOutcomes: 0,
    totalParticipants: 0,
    totalCompleted: 0
  });
  const [partners, setPartners] = useState<PartnerData[]>([]);
  const [cohorts, setCohorts] = useState<CohortData[]>([]);
  const [recentAssessments, setRecentAssessments] = useState<AssessmentData[]>([]);
  const [recentOutcomes, setRecentOutcomes] = useState<OutcomeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('cohorts');
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const { user } = useAuthContext();
  const router = useRouter();

  // Check admin access
  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        setHasAdminAccess(false);
        setAccessChecked(true);
        return;
      }

      try {
        const getUserRole = httpsCallable(functions, 'getUserRole');
        const response = await getUserRole({ userId: user.uid });
        const data = response.data as any;
        
        if (data.success && data.userRole) {
          const roles = data.userRole.roles || [];
          const isAdmin = roles.includes('admin');
          setHasAdminAccess(isAdmin);
          
          if (!isAdmin) {
            // Redirect non-admin users
            router.push('/dashboard');
          }
        } else {
          setHasAdminAccess(false);
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error checking admin access:', error);
        setHasAdminAccess(false);
        router.push('/dashboard');
      } finally {
        setAccessChecked(true);
      }
    };

    checkAdminAccess();
  }, [user, router]);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      
      // Call the admin dashboard API endpoint
      const response = await fetch('/api/admin/dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const data = await response.json();
      
      setMetrics(data.metrics);
      setPartners(data.partners);
      setCohorts(data.cohorts);
      setRecentAssessments(data.recentAssessments);
      setRecentOutcomes(data.recentOutcomes);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const MetricCard = ({ 
    title, 
    value, 
    icon, 
    subtitle,
    progress
  }: { 
    title: string; 
    value: string | number; 
    icon: React.ReactNode; 
    subtitle?: string;
    progress?: number;
  }) => (
    <div className="bg-white/95 backdrop-blur-sm border-0 rounded-lg shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
            {progress !== undefined && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-[#147AFF] to-[#19C2A0] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          <div className="p-3 rounded-full bg-gradient-to-br from-[#147AFF] to-[#19C2A0] text-white">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );

  const DataTable = ({ 
    title, 
    data, 
    columns 
  }: { 
    title: string; 
    data: any[]; 
    columns: { key: string; label: string; render?: (value: any, row?: any) => React.ReactNode }[];
  }) => (
    <div className="bg-white/95 backdrop-blur-sm border-0 rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Check access before rendering
  if (!accessChecked) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-[#0A1F44] to-[#147AFF] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="mt-4 text-white">Checking admin access...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!hasAdminAccess) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-[#0A1F44] to-[#147AFF] flex items-center justify-center">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white/95 backdrop-blur-sm border-0 rounded-lg shadow-sm p-8">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600 mb-6">You do not have permission to access the admin dashboard.</p>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-[#147AFF] text-white rounded-md hover:bg-[#0A1F44] transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-[#0A1F44] to-[#147AFF] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="mt-4 text-white">Loading admin dashboard...</p>
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
              <h1 className="text-3xl text-white mb-2">Gutcheck Pilot Operations</h1>
              <p className="text-blue-200">Infrastructure for partner-embedded scoring & outcome tracking</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="w-2 h-2 bg-[#19C2A0] rounded-full animate-pulse"></div>
                <span className="text-white text-sm">Live Monitoring</span>
              </div>
              <button
                onClick={fetchDashboardData}
                disabled={refreshing}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard
              title="Active Partners"
              value={partners.filter(p => p.status === 'active').length}
              icon={<Users className="w-4 h-4" />}
              subtitle={`+${partners.filter(p => p.status === 'pending').length} pending activation`}
            />
            <MetricCard
              title="Total Participants"
              value={metrics.totalParticipants}
              icon={<TrendingUp className="w-4 h-4" />}
              subtitle={`Across ${cohorts.length} cohorts`}
            />
            <MetricCard
              title="Completion Rate"
              value={`${metrics.averageCompletionRate.toFixed(1)}%`}
              icon={<FileText className="w-4 h-4" />}
              progress={metrics.averageCompletionRate}
            />
            <MetricCard
              title="ML-Ready Data"
              value={metrics.totalCompleted}
              icon={<div className="w-2 h-2 bg-white rounded-full" />}
              subtitle="Assessments completed"
            />
          </div>

          {/* Main Content Tabs */}
          <div className="space-y-4">
            <div className="flex space-x-1 bg-white/10 backdrop-blur-sm rounded-lg p-1">
              {[
                { id: 'cohorts', label: 'Cohort Management', icon: <Shield className="w-4 h-4" /> },
                { id: 'create', label: 'Create New', icon: <Plus className="w-4 h-4" /> },
                { id: 'partners', label: 'Partners', icon: <Users className="w-4 h-4" /> },
                { id: 'analytics', label: 'Analytics', icon: <Activity className="w-4 h-4" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-[#0A1F44]'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'cohorts' && (
              <div className="space-y-6">
                <DataTable
                  title="Active Cohorts"
                  data={cohorts}
                  columns={[
                    { key: 'cohortName', label: 'Cohort Name' },
                    { key: 'partnerId', label: 'Partner' },
                    { key: 'completedAssessments', label: 'Completed', render: (value, row) => (
                      <span className="font-semibold">{value}/{row.totalAssessments}</span>
                    )},
                    { key: 'completionRate', label: 'Completion %', render: (value) => (
                      <span className="font-semibold">{value.toFixed(1)}%</span>
                    )},
                    { key: 'averageScore', label: 'Avg Score', render: (value) => (
                      <span className="font-semibold">{value.toFixed(1)}</span>
                    )},
                    { key: 'status', label: 'Status', render: (value) => (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        value === 'active' ? 'bg-green-100 text-green-800' :
                        value === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {value}
                      </span>
                    )},
                    { key: 'assessmentUrl', label: 'Actions', render: (value) => (
                      <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#147AFF] hover:text-[#0A1F44]"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View
                      </a>
                    )},
                  ]}
                />
              </div>
            )}

            {activeTab === 'partners' && (
              <div className="space-y-6">
                <DataTable
                  title="Active Partners"
                  data={partners}
                  columns={[
                    { key: 'partnerName', label: 'Partner Name' },
                    { key: 'partnerEmail', label: 'Email' },
                    { key: 'cohortsCount', label: 'Cohorts' },
                    { key: 'status', label: 'Status', render: (value) => (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        value === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {value}
                      </span>
                    )},
                    { key: 'createdAt', label: 'Created', render: (value) => (
                      <span className="text-sm">{new Date(value).toLocaleDateString()}</span>
                    )},
                  ]}
                />
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DataTable
                  title="Recent Assessments"
                  data={recentAssessments.slice(0, 10)}
                  columns={[
                    { key: 'sessionId', label: 'Session ID', render: (value) => (
                      <span className="font-mono text-xs">{value.slice(0, 8)}...</span>
                    )},
                    { key: 'partnerId', label: 'Partner', render: (value) => (
                      <span className="text-sm">{value}</span>
                    )},
                    { key: 'overallScore', label: 'Score', render: (value) => (
                      <span className="font-semibold">{value}</span>
                    )},
                    { key: 'completedAt', label: 'Date', render: (value) => (
                      <span className="text-sm">{new Date(value).toLocaleDateString()}</span>
                    )},
                    { key: 'consentForML', label: 'ML Consent', render: (value) => (
                      <span className={`px-2 py-1 text-xs rounded-full ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {value ? 'Yes' : 'No'}
                      </span>
                    )},
                  ]}
                />

                <DataTable
                  title="Recent Outcomes"
                  data={recentOutcomes.slice(0, 10)}
                  columns={[
                    { key: 'sessionId', label: 'Session ID', render: (value) => (
                      <span className="font-mono text-xs">{value.slice(0, 8)}...</span>
                    )},
                    { key: 'outcomeTag', label: 'Outcome', render: (value) => (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        value === 'breakthrough' ? 'bg-green-100 text-green-800' :
                        value === 'stagnation' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {value}
                      </span>
                    )},
                    { key: 'taggedBy', label: 'Tagged By', render: (value) => (
                      <span className="text-sm">{value}</span>
                    )},
                    { key: 'taggedAt', label: 'Date', render: (value) => (
                      <span className="text-sm">{new Date(value).toLocaleDateString()}</span>
                    )},
                  ]}
                />
              </div>
            )}

            {activeTab === 'create' && (
              <div className="bg-white/95 backdrop-blur-sm border-0 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Cohort</h3>
                <p className="text-gray-600 mb-4">
                  Use the partner onboarding form to create new cohorts and generate assessment links.
                </p>
                <div className="space-y-3">
                  <a
                    href="/partner"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#147AFF] to-[#19C2A0] text-white rounded-md hover:opacity-90 transition-opacity"
                  >
                    <Plus className="w-4 h-4" />
                    Go to Partner Onboarding
                  </a>
                  <a
                    href="/admin/roles"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    Manage User Roles
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default AdminDashboard;
