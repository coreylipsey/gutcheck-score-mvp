import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Users, TrendingUp, FileText, Plus, ExternalLink, Eye } from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'pending' | 'inactive';
  cohortsCount: number;
  createdAt: string;
}

interface Cohort {
  id: string;
  name: string;
  partnerId: string;
  partnerName: string;
  participants: number;
  completed: number;
  assessmentUrl: string;
  status: 'active' | 'completed' | 'draft';
  createdAt: string;
  outcomes: {
    breakthrough: number;
    growth: number;
    stagnation: number;
  };
}

export function AdminDashboard() {
  const [partners] = useState<Partner[]>([
    {
      id: 'qc-001',
      name: 'Queens College',
      email: 'ying.zhou@qc.cuny.edu',
      status: 'active',
      cohortsCount: 2,
      createdAt: '2025-08-20'
    },
    {
      id: 'hu-002',
      name: 'Howard University',
      email: 'entrepreneurship@howard.edu',
      status: 'pending',
      cohortsCount: 0,
      createdAt: '2025-08-22'
    }
  ]);

  const [cohorts] = useState<Cohort[]>([
    {
      id: 'qc-fall-2025',
      name: 'Fall 2025 Entrepreneurs',
      partnerId: 'qc-001',
      partnerName: 'Queens College',
      participants: 24,
      completed: 18,
      assessmentUrl: 'https://app.gutcheck.ai/assess/qc-fall-2025',
      status: 'active',
      createdAt: '2025-08-25',
      outcomes: {
        breakthrough: 6,
        growth: 8,
        stagnation: 4
      }
    },
    {
      id: 'qc-summer-2025',
      name: 'Summer Pilot Cohort',
      partnerId: 'qc-001',
      partnerName: 'Queens College',
      participants: 12,
      completed: 12,
      assessmentUrl: 'https://app.gutcheck.ai/assess/qc-summer-2025',
      status: 'completed',
      createdAt: '2025-06-15',
      outcomes: {
        breakthrough: 4,
        growth: 5,
        stagnation: 3
      }
    }
  ]);

  const [newCohort, setNewCohort] = useState({
    partnerName: '',
    cohortName: '',
    expectedParticipants: ''
  });

  const totalParticipants = cohorts.reduce((sum, cohort) => sum + cohort.participants, 0);
  const totalCompleted = cohorts.reduce((sum, cohort) => sum + cohort.completed, 0);
  const completionRate = totalParticipants > 0 ? (totalCompleted / totalParticipants) * 100 : 0;

  const handleCreateCohort = () => {
    // Mock cohort creation - in real app would call API
    const cohortId = `${newCohort.partnerName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    const assessmentUrl = `https://app.gutcheck.ai/assess/${cohortId}`;
    
    console.log('Creating cohort:', {
      ...newCohort,
      cohortId,
      assessmentUrl
    });

    // Reset form
    setNewCohort({
      partnerName: '',
      cohortName: '',
      expectedParticipants: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1F44] to-[#147AFF] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl text-white mb-2">Gutcheck Pilot Operations</h1>
            <p className="text-blue-200">Infrastructure for partner-embedded scoring & outcome tracking</p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
            <div className="w-2 h-2 bg-[#19C2A0] rounded-full animate-pulse"></div>
            <span className="text-white text-sm">Live Monitoring</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/95 backdrop-blur-sm border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Active Partners</CardTitle>
              <Users className="h-4 w-4 text-[#147AFF]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{partners.filter(p => p.status === 'active').length}</div>
              <p className="text-xs text-muted-foreground">
                +1 pending activation
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Participants</CardTitle>
              <TrendingUp className="h-4 w-4 text-[#19C2A0]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{totalParticipants}</div>
              <p className="text-xs text-muted-foreground">
                Across {cohorts.length} cohorts
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Completion Rate</CardTitle>
              <FileText className="h-4 w-4 text-[#FF6B00]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{completionRate.toFixed(1)}%</div>
              <Progress value={completionRate} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">ML-Ready Data</CardTitle>
              <div className="w-2 h-2 bg-[#19C2A0] rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{totalCompleted}</div>
              <p className="text-xs text-muted-foreground">
                Assessments completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="cohorts" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm">
            <TabsTrigger value="cohorts" className="text-white data-[state=active]:bg-white data-[state=active]:text-[#0A1F44]">
              Cohort Management
            </TabsTrigger>
            <TabsTrigger value="create" className="text-white data-[state=active]:bg-white data-[state=active]:text-[#0A1F44]">
              Create New
            </TabsTrigger>
            <TabsTrigger value="partners" className="text-white data-[state=active]:bg-white data-[state=active]:text-[#0A1F44]">
              Partners
            </TabsTrigger>
            <TabsTrigger value="reports" className="text-white data-[state=active]:bg-white data-[state=active]:text-[#0A1F44]">
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cohorts" className="space-y-4">
            <div className="grid gap-4">
              {cohorts.map((cohort) => (
                <Card key={cohort.id} className="bg-white/95 backdrop-blur-sm border-0">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {cohort.name}
                          <Badge variant={cohort.status === 'active' ? 'default' : cohort.status === 'completed' ? 'secondary' : 'outline'}>
                            {cohort.status}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{cohort.partnerName} • Created {cohort.createdAt}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Assessment Link
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Participants</p>
                        <p className="text-xl">{cohort.participants}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Completed</p>
                        <p className="text-xl">{cohort.completed}</p>
                        <Progress value={(cohort.completed / cohort.participants) * 100} className="h-2 mt-1" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Breakthrough</p>
                        <p className="text-xl text-[#19C2A0]">{cohort.outcomes.breakthrough}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Growth</p>
                        <p className="text-xl text-[#147AFF]">{cohort.outcomes.growth}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Stagnation</p>
                        <p className="text-xl text-[#FF6B00]">{cohort.outcomes.stagnation}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <Card className="bg-white/95 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-[#19C2A0]" />
                  One-Click Cohort Creation
                </CardTitle>
                <CardDescription>
                  Create a new cohort in under 5 minutes. Assessment URL and welcome email generated automatically.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="partner-name">Partner Name</Label>
                    <Input
                      id="partner-name"
                      placeholder="e.g., Queens College"
                      value={newCohort.partnerName}
                      onChange={(e) => setNewCohort(prev => ({ ...prev, partnerName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cohort-name">Cohort Name</Label>
                    <Input
                      id="cohort-name"
                      placeholder="e.g., Fall 2025 Entrepreneurs"
                      value={newCohort.cohortName}
                      onChange={(e) => setNewCohort(prev => ({ ...prev, cohortName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="participants">Expected Participants</Label>
                    <Input
                      id="participants"
                      type="number"
                      placeholder="e.g., 25"
                      value={newCohort.expectedParticipants}
                      onChange={(e) => setNewCohort(prev => ({ ...prev, expectedParticipants: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4">
                  <div className="text-sm text-muted-foreground">
                    Auto-generates: Assessment URL • Welcome email template • Partner dashboard access
                  </div>
                  <Button 
                    onClick={handleCreateCohort}
                    disabled={!newCohort.partnerName || !newCohort.cohortName}
                    className="bg-[#19C2A0] hover:bg-[#19C2A0]/90"
                  >
                    Create Cohort
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="partners" className="space-y-4">
            <div className="grid gap-4">
              {partners.map((partner) => (
                <Card key={partner.id} className="bg-white/95 backdrop-blur-sm border-0">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#147AFF] to-[#19C2A0] rounded-lg flex items-center justify-center text-white">
                          {partner.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="font-medium">{partner.name}</h3>
                          <p className="text-sm text-muted-foreground">{partner.email}</p>
                          <p className="text-sm text-muted-foreground">
                            {partner.cohortsCount} cohorts • Joined {partner.createdAt}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={partner.status === 'active' ? 'default' : partner.status === 'pending' ? 'secondary' : 'outline'}
                          className={partner.status === 'active' ? 'bg-[#19C2A0]' : ''}
                        >
                          {partner.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card className="bg-white/95 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle>Funder-Ready Auto-Reports</CardTitle>
                <CardDescription>
                  Generate professional reports for partners and funders with AI-powered insights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Queens College Q3 2025 Report</h4>
                      <p className="text-sm text-muted-foreground">36 participants • 2 cohorts • Generated Aug 24, 2025</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button size="sm" className="bg-[#147AFF] hover:bg-[#147AFF]/90">
                        Download PDF
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center p-8 border-2 border-dashed rounded-lg">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-2">Generate comprehensive reports</p>
                      <Button className="bg-[#19C2A0] hover:bg-[#19C2A0]/90">
                        <Plus className="h-4 w-4 mr-1" />
                        Create New Report
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}