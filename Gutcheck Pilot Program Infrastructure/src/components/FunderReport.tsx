import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, Eye, Calendar, Users, TrendingUp, Award, FileText } from 'lucide-react';

interface FunderReportProps {
  reportData: {
    partner: string;
    reportTitle: string;
    period: string;
    generatedDate: string;
    cohorts: Array<{
      name: string;
      participants: number;
      completed: number;
      avgScore: number;
      outcomes: {
        breakthrough: number;
        growth: number;
        stagnation: number;
      };
    }>;
    insights: {
      executive_summary: string;
      key_findings: string[];
      recommendations: string[];
      risk_assessment: string;
    };
  };
}

export function FunderReport({ reportData }: FunderReportProps) {
  const totalParticipants = reportData.cohorts.reduce((sum, cohort) => sum + cohort.participants, 0);
  const totalCompleted = reportData.cohorts.reduce((sum, cohort) => sum + cohort.completed, 0);
  const avgScore = reportData.cohorts.reduce((sum, cohort) => sum + cohort.avgScore, 0) / reportData.cohorts.length;
  
  const totalOutcomes = reportData.cohorts.reduce((totals, cohort) => ({
    breakthrough: totals.breakthrough + cohort.outcomes.breakthrough,
    growth: totals.growth + cohort.outcomes.growth,
    stagnation: totals.stagnation + cohort.outcomes.stagnation
  }), { breakthrough: 0, growth: 0, stagnation: 0 });

  const scoreDistribution = [
    { range: '90-100', count: Math.floor(totalCompleted * 0.15), color: '#19C2A0' },
    { range: '80-89', count: Math.floor(totalCompleted * 0.25), color: '#147AFF' },
    { range: '70-79', count: Math.floor(totalCompleted * 0.35), color: '#FFC700' },
    { range: '60-69', count: Math.floor(totalCompleted * 0.20), color: '#FF6B00' },
    { range: '50-59', count: Math.floor(totalCompleted * 0.05), color: '#d4183d' },
  ];

  const outcomeData = [
    { name: 'Breakthrough', value: totalOutcomes.breakthrough, color: '#19C2A0' },
    { name: 'Growth', value: totalOutcomes.growth, color: '#147AFF' },
    { name: 'Stagnation', value: totalOutcomes.stagnation, color: '#FF6B00' },
  ];

  const cohortPerformance = reportData.cohorts.map(cohort => ({
    name: cohort.name.replace(/\s+/g, '\n'),
    avgScore: cohort.avgScore,
    completionRate: (cohort.completed / cohort.participants) * 100,
    participants: cohort.participants
  }));

  const timelineData = [
    { month: 'Week 1', assessments: 12, engagement: 95 },
    { month: 'Week 2', assessments: 24, engagement: 88 },
    { month: 'Week 3', assessments: 18, engagement: 92 },
    { month: 'Week 4', assessments: 8, engagement: 78 },
  ];

  return (
    <div className="max-w-4xl mx-auto bg-white">
      {/* Report Header */}
      <div className="bg-gradient-to-r from-[#0A1F44] to-[#147AFF] text-white p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Gutcheck.AI</h1>
              <p className="text-blue-200">Partner Performance Report</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">Report ID: GC-{reportData.partner.replace(/\s+/g, '-').toLowerCase()}-{new Date().getFullYear()}</div>
            <div className="text-sm opacity-75">Generated: {reportData.generatedDate}</div>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-2">{reportData.reportTitle}</h2>
          <div className="flex items-center gap-4 text-blue-200">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {reportData.partner}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {reportData.period}
            </span>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Executive Summary */}
        <section>
          <h3 className="text-xl font-bold text-[#0A1F44] mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-[#19C2A0]" />
            Executive Summary
          </h3>
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-700 leading-relaxed mb-6">
                {reportData.insights.executive_summary}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-[#19C2A0]/10 rounded-lg">
                  <div className="text-2xl font-bold text-[#19C2A0]">{totalParticipants}</div>
                  <div className="text-sm text-gray-600">Total Participants</div>
                </div>
                <div className="text-center p-4 bg-[#147AFF]/10 rounded-lg">
                  <div className="text-2xl font-bold text-[#147AFF]">{totalCompleted}</div>
                  <div className="text-sm text-gray-600">Assessments Completed</div>
                </div>
                <div className="text-center p-4 bg-[#FFC700]/10 rounded-lg">
                  <div className="text-2xl font-bold text-[#0A1F44]">{avgScore.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
                <div className="text-center p-4 bg-[#FF6B00]/10 rounded-lg">
                  <div className="text-2xl font-bold text-[#FF6B00]">{((totalCompleted / totalParticipants) * 100).toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Score Distribution */}
        <section>
          <h3 className="text-xl font-bold text-[#0A1F44] mb-4">Score Distribution Analysis</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Score Ranges</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Bar dataKey="count" fill="#147AFF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Outcome Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={outcomeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {outcomeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-4">
                  {outcomeData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Cohort Performance */}
        <section>
          <h3 className="text-xl font-bold text-[#0A1F44] mb-4">Cohort Performance Comparison</h3>
          <Card>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cohortPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                  />
                  <YAxis />
                  <Bar dataKey="avgScore" fill="#147AFF" name="Avg Score" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>

        {/* Engagement Timeline */}
        <section>
          <h3 className="text-xl font-bold text-[#0A1F44] mb-4">Engagement Timeline</h3>
          <Card>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Line 
                    type="monotone" 
                    dataKey="assessments" 
                    stroke="#19C2A0" 
                    strokeWidth={3}
                    dot={{ fill: '#19C2A0', strokeWidth: 2, r: 6 }}
                    name="Assessments Completed"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="engagement" 
                    stroke="#147AFF" 
                    strokeWidth={3}
                    dot={{ fill: '#147AFF', strokeWidth: 2, r: 6 }}
                    name="Engagement Rate %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>

        {/* Key Findings */}
        <section>
          <h3 className="text-xl font-bold text-[#0A1F44] mb-4">Key Findings & Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#19C2A0]" />
                  Key Findings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {reportData.insights.key_findings.map((finding, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-[#19C2A0] rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{finding}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#147AFF]" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {reportData.insights.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-[#147AFF] rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Risk Assessment */}
        <section>
          <h3 className="text-xl font-bold text-[#0A1F44] mb-4">Risk Assessment</h3>
          <Card>
            <CardContent className="p-6">
              <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
                <p className="text-gray-700">{reportData.insights.risk_assessment}</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Report Footer */}
        <section className="border-t pt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p>This report was generated using Gutcheck.AI's proprietary scoring algorithm.</p>
              <p>For questions about methodology or data interpretation, contact support@gutcheck.ai</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
              <Button className="bg-[#147AFF] hover:bg-[#147AFF]/90">
                <Download className="h-4 w-4 mr-1" />
                Download PDF
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}