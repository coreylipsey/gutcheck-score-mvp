import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { AdminDashboard } from './components/AdminDashboard';
import { ShareableScoreBadge } from './components/ShareableScoreBadge';
import { FunderReport } from './components/FunderReport';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Toaster } from './components/ui/sonner';
import { BarChart3, Share2, FileText, Settings } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Sample data for the score badge
  const sampleScoreData = {
    overallScore: 87,
    categories: {
      execution: 92,
      market: 78,
      team: 85,
      traction: 82,
      scalability: 88
    },
    entrepreneurName: 'Alex Rodriguez',
    timestamp: 'Aug 24, 2025',
    rank: 'Top 15%'
  };

  // Sample data for the funder report
  const sampleReportData = {
    partner: 'Queens College',
    reportTitle: 'Q3 2025 Entrepreneurship Program Assessment',
    period: 'July - September 2025',
    generatedDate: 'August 24, 2025',
    cohorts: [
      {
        name: 'Fall 2025 Entrepreneurs',
        participants: 24,
        completed: 18,
        avgScore: 79.3,
        outcomes: {
          breakthrough: 6,
          growth: 8,
          stagnation: 4
        }
      },
      {
        name: 'Summer Pilot Cohort',
        participants: 12,
        completed: 12,
        avgScore: 82.7,
        outcomes: {
          breakthrough: 4,
          growth: 5,
          stagnation: 3
        }
      }
    ],
    insights: {
      executive_summary: "The Queens College pilot program demonstrates strong entrepreneurial potential within their student cohort. With an overall completion rate of 83% and average Gutcheck Score of 81.0, participants exceed national benchmarks. The program successfully identified 10 breakthrough-potential entrepreneurs who warrant immediate funding consideration and accelerated support.",
      key_findings: [
        "83% completion rate exceeds industry standard of 65%",
        "Average Gutcheck Score of 81.0 indicates high execution potential",
        "28% of participants scored in breakthrough category (90+)",
        "Strong correlation between team dynamics scores and eventual outcomes",
        "Technical founders showed 15% higher completion rates"
      ],
      recommendations: [
        "Expand program to accommodate 50+ participants per cohort",
        "Implement advanced coaching for breakthrough-category entrepreneurs",
        "Create direct funder introduction pathway for 90+ scores",
        "Develop industry-specific assessment modules",
        "Establish alumni mentorship program for scaling support"
      ],
      risk_assessment: "Low program risk with high institutional support. Key risk factors: limited industry diversity in current cohort, potential capacity constraints for scaling, and need for additional funding pipeline development. Recommended mitigation: diversify recruitment channels and establish corporate partnership tracks."
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#147AFF] to-[#19C2A0] rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#0A1F44]">Gutcheck.AI</h1>
                <p className="text-sm text-gray-600">Pilot Program Infrastructure</p>
              </div>
            </div>
            <Badge variant="outline" className="border-[#19C2A0] text-[#19C2A0]">
              Sprint Week: Aug 25-30, 2025
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200">
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center gap-2 data-[state=active]:bg-[#147AFF] data-[state=active]:text-white"
            >
              <BarChart3 className="h-4 w-4" />
              Admin Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="badge" 
              className="flex items-center gap-2 data-[state=active]:bg-[#19C2A0] data-[state=active]:text-white"
            >
              <Share2 className="h-4 w-4" />
              Score Badge
            </TabsTrigger>
            <TabsTrigger 
              value="report" 
              className="flex items-center gap-2 data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white"
            >
              <FileText className="h-4 w-4" />
              Funder Report
            </TabsTrigger>
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-2 data-[state=active]:bg-[#0A1F44] data-[state=active]:text-white"
            >
              <Settings className="h-4 w-4" />
              System Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <AdminDashboard />
          </TabsContent>

          <TabsContent value="badge" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#0A1F44] mb-2">Shareable Score Badge</h2>
                <p className="text-gray-600">
                  Entrepreneurs can share their Gutcheck Score across social platforms to increase visibility
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-[#0A1F44]">Detailed View</h3>
                  <ShareableScoreBadge scoreData={sampleScoreData} variant="detailed" />
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-[#0A1F44]">Compact View</h3>
                  <ShareableScoreBadge scoreData={sampleScoreData} variant="compact" />
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-[#0A1F44]">Social Media View</h3>
                  <ShareableScoreBadge scoreData={sampleScoreData} variant="social" />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="report" className="space-y-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#0A1F44] mb-2">Funder-Ready Auto Report</h2>
                <p className="text-gray-600">
                  Professional reports with AI-generated insights for partners and funders
                </p>
              </div>
              
              <FunderReport reportData={sampleReportData} />
            </div>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#0A1F44] mb-2">System Overview</h2>
                <p className="text-gray-600">
                  Complete pilot program infrastructure for partner onboarding and data collection
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#19C2A0] rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">1</span>
                      </div>
                      One-Click Cohort Creation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Partners can create new cohorts in under 5 minutes with automatic URL generation and welcome email templates.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#19C2A0] rounded-full" />
                        <span>3-field form (Partner, Cohort, Participants)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#19C2A0] rounded-full" />
                        <span>Auto-generated assessment URLs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#19C2A0] rounded-full" />
                        <span>Professional welcome email templates</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#147AFF] rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">2</span>
                      </div>
                      Real-time Monitoring
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Live dashboard tracking completion rates, engagement metrics, and outcome data for ML pipeline.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#147AFF] rounded-full" />
                        <span>Partner & cohort status tracking</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#147AFF] rounded-full" />
                        <span>Completion rate monitoring</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#147AFF] rounded-full" />
                        <span>Outcome tagging (breakthrough/growth/stagnation)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#FF6B00] rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">3</span>
                      </div>
                      Shareable Score System
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Entrepreneurs can share verified scores on social platforms, increasing visibility and network effects.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#FF6B00] rounded-full" />
                        <span>Retro-futuristic radar chart design</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#FF6B00] rounded-full" />
                        <span>LinkedIn & Twitter integration</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#FF6B00] rounded-full" />
                        <span>Multiple format variants</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#0A1F44] rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">4</span>
                      </div>
                      Funder Reports
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Auto-generated professional reports with AI insights for institutional partners and funders.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#0A1F44] rounded-full" />
                        <span>Executive summary with AI insights</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#0A1F44] rounded-full" />
                        <span>Data visualizations & charts</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#0A1F44] rounded-full" />
                        <span>PDF export for sharing</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gradient-to-r from-[#0A1F44] to-[#147AFF] text-white">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Technical Architecture</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Frontend</h4>
                      <ul className="text-sm opacity-90 space-y-1">
                        <li>• React + TypeScript</li>
                        <li>• Tailwind CSS v4</li>
                        <li>• Shadcn/ui components</li>
                        <li>• Recharts for visualizations</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Backend (Recommended)</h4>
                      <ul className="text-sm opacity-90 space-y-1">
                        <li>• Supabase for data storage</li>
                        <li>• Real-time subscriptions</li>
                        <li>• Row-level security</li>
                        <li>• Auto-generated APIs</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Features</h4>
                      <ul className="text-sm opacity-90 space-y-1">
                        <li>• Partner management</li>
                        <li>• Cohort tracking</li>
                        <li>• Outcome tagging</li>
                        <li>• Report generation</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}