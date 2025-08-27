'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthContext } from '@/presentation/providers/AuthProvider';
import { 
  Users, 
  TrendingUp, 
  FileText,
  Activity,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

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

interface ParticipantData {
  id: string;
  name: string;
  email: string;
  score: number;
  completedAt: string;
  sessionId: string;
}

interface CohortMetrics {
  totalParticipants: number;
  totalCompleted: number;
  averageScore: number;
  completionRate: number;
}

interface ScoreDistribution {
  range: string;
  count: number;
}

function CohortAnalytics() {
  const params = useParams();
  const partnerId = params.partnerId as string;
  const cohortId = params.cohortId as string;
  const { user } = useAuthContext();
  
  const [cohort, setCohort] = useState<CohortData | null>(null);
  const [participants, setParticipants] = useState<ParticipantData[]>([]);
  const [metrics, setMetrics] = useState<CohortMetrics>({
    totalParticipants: 0,
    totalCompleted: 0,
    averageScore: 0,
    completionRate: 0
  });
  const [scoreDistribution, setScoreDistribution] = useState<ScoreDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCohortData = async () => {
      try {
        // Fetch cohort-specific data
        const response = await fetch(`/api/partner/dashboard/${partnerId}/cohort/${cohortId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch cohort data');
        }
        
        const data = await response.json();
        setCohort(data.cohort);
        setParticipants(data.participants);
        setMetrics(data.metrics);
        setScoreDistribution(data.scoreDistribution);
      } catch (error) {
        console.error('Error fetching cohort data:', error);
        // For now, use mock data
        setCohort({
          cohortId: cohortId,
          partnerId: partnerId,
          cohortName: 'Fall 2025 Entrepreneurs',
          totalAssessments: 24,
          completedAssessments: 18,
          completionRate: 75.0,
          averageScore: 79.3,
          taggedOutcomes: 18,
          status: 'active',
          assessmentUrl: `https://gutcheck-score-mvp.web.app/assessment?partner_id=${partnerId}&cohort_id=${cohortId}`
        });
        setParticipants([
          {
            id: 'p1',
            name: 'Alex Rodriguez',
            email: 'alex.rodriguez@email.com',
            score: 87,
            completedAt: '2025-08-25',
            sessionId: 'session_123'
          },
          {
            id: 'p2',
            name: 'Maria Chen',
            email: 'maria.chen@email.com',
            score: 91,
            completedAt: '2025-08-24',
            sessionId: 'session_124'
          },
          {
            id: 'p3',
            name: 'David Kim',
            email: 'david.kim@email.com',
            score: 65,
            completedAt: '2025-08-23',
            sessionId: 'session_125'
          },
          {
            id: 'p4',
            name: 'Sarah Johnson',
            email: 'sarah.johnson@email.com',
            score: 82,
            completedAt: '2025-08-22',
            sessionId: 'session_126'
          },
          {
            id: 'p5',
            name: 'Michael Brown',
            email: 'michael.brown@email.com',
            score: 78,
            completedAt: '2025-08-21',
            sessionId: 'session_127'
          }
        ]);
        setMetrics({
          totalParticipants: 24,
          totalCompleted: 18,
          averageScore: 79.3,
          completionRate: 75.0
        });
        setScoreDistribution([
          { range: '90-100', count: 2 },
          { range: '80-89', count: 5 },
          { range: '70-79', count: 8 },
          { range: '60-69', count: 2 },
          { range: '50-59', count: 1 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (partnerId && cohortId) {
      fetchCohortData();
    }
  }, [partnerId, cohortId]);

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
            <p className="mt-4 text-white">Loading cohort analytics...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[#0A1F44] to-[#147AFF] p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header with back button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a 
                href={`/partner/dashboard/${partnerId}`} 
                className="flex items-center gap-2 text-white hover:text-blue-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </a>
              <div>
                <h1 className="text-3xl text-white mb-2">{cohort?.cohortName}</h1>
                <p className="text-blue-200">Cohort Analytics</p>
              </div>
            </div>
          </div>

          {/* 4 Metric Boxes (cohort-specific) */}
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

          {/* Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Participant List */}
            <div className="bg-white/95 backdrop-blur-sm border-0 rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Participants</h3>
                <p className="text-sm text-gray-600 mt-1">{participants.length} completed assessments</p>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {participants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                      <div>
                        <div className="font-medium text-gray-900">{participant.name}</div>
                        <div className="text-sm text-gray-600">{participant.email}</div>
                        <div className="text-xs text-gray-500">Completed: {new Date(participant.completedAt).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-[#147AFF] text-lg">{participant.score}</span>
                        <a
                          href={`/partner/dashboard/${partnerId}/cohort/${cohortId}/participant/${participant.sessionId}`}
                          className="inline-flex items-center gap-1 text-[#147AFF] hover:text-[#0A1F44] text-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Report
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Score Distribution Chart */}
            <div className="bg-white/95 backdrop-blur-sm border-0 rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Score Distribution</h3>
                <p className="text-sm text-gray-600 mt-1">Distribution of assessment scores</p>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Bar dataKey="count" fill="#147AFF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 text-center text-sm text-gray-600">
                  Score ranges show how many participants scored in each bracket
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default CohortAnalytics;
