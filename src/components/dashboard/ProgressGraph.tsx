'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AssessmentHistory } from '@/app/dashboard/page';

interface ProgressGraphProps {
  assessments: AssessmentHistory[];
}

export function ProgressGraph({ assessments }: ProgressGraphProps) {
  // Transform assessment data for the chart
  const chartData = assessments.map(assessment => {
    const date = new Date(assessment.completedAt);
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      score: assessment.overallScore,
      sessionId: assessment.sessionId,
      date: assessment.completedAt,
    };
  });

  // Sort by date to ensure chronological order
  chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate trend
  const getTrend = () => {
    if (chartData.length < 2) return 'stable';
    const firstScore = chartData[0].score;
    const lastScore = chartData[chartData.length - 1].score;
    if (lastScore > firstScore) return 'up';
    if (lastScore < firstScore) return 'down';
    return 'stable';
  };

  const trend = getTrend();
  const trendText = {
    up: '📈 Growing Strong',
    down: '📉 Room for Improvement',
    stable: '📊 Maintaining Progress'
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-blue-600 font-bold">{payload[0].value}/100</p>
          <p className="text-sm text-gray-500">Assessment Score</p>
        </div>
      );
    }
    return null;
  };

  if (assessments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No assessments yet
          </h3>
          <p className="text-gray-500">
            Take your first assessment to start tracking your progress.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Your Progress</h3>
          <p className="text-gray-600">Monthly assessment scores over time</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-500">Trend</p>
          <p className="text-lg font-bold text-blue-600">{trendText[trend]}</p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              domain={[35, 100]}
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
          Y-axis range: 35-100 points | Monthly assessments
        </p>
      </div>
    </div>
  );
} 