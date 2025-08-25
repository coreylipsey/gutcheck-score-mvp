import { IAssessmentRepository } from '../../domain/repositories/IAssessmentRepository';

export interface PilotMetrics {
  totalAssessments: number;
  completedAssessments: number;
  completionRate: number;
  averageScore: number;
  scoreRanges: {
    '90-100': number;
    '80-89': number;
    '70-79': number;
    '60-69': number;
    '35-59': number;
  };
  starRatingDistribution: {
    '5-star': number;
    '4-star': number;
    '3-star': number;
    '2-star': number;
    '1-star': number;
  };
  outcomeDistribution: {
    breakthrough: number;
    growth: number;
    stagnation: number;
    pending: number;
  };
}

export class GetPilotMetrics {
  constructor(
    private readonly assessmentRepository: IAssessmentRepository
  ) {}

  async execute(partnerId: string, cohortId: string): Promise<PilotMetrics> {
    // Get all assessment sessions for this partner cohort
    const sessions = await this.assessmentRepository.findByPartnerCohort(partnerId, cohortId);

    // Calculate metrics using existing assessment data (no new scoring)
    const totalAssessments = sessions.length;
    const completedAssessments = sessions.filter(s => s.completedAt).length;
    const completionRate = totalAssessments > 0 ? (completedAssessments / totalAssessments) * 100 : 0;

    // Calculate average score using existing 35-100 range
    const completedSessions = sessions.filter(s => s.completedAt && s.scores.overallScore);
    const averageScore = completedSessions.length > 0 
      ? completedSessions.reduce((sum, s) => sum + s.scores.overallScore, 0) / completedSessions.length 
      : 0;

    // Calculate score ranges using existing 35-100 range
    const scoreRanges = this.calculateScoreRanges(completedSessions);

    // Calculate star rating distribution using existing 5-star system
    const starRatingDistribution = this.calculateStarRatingDistribution(completedSessions);

    // Calculate outcome distribution
    const outcomeDistribution = this.calculateOutcomeDistribution(sessions);

    return {
      totalAssessments,
      completedAssessments,
      completionRate,
      averageScore,
      scoreRanges,
      starRatingDistribution,
      outcomeDistribution
    };
  }

  private calculateScoreRanges(sessions: any[]): PilotMetrics['scoreRanges'] {
    const ranges = {
      '90-100': 0,
      '80-89': 0,
      '70-79': 0,
      '60-69': 0,
      '35-59': 0
    };

    sessions.forEach(session => {
      const score = session.scores.overallScore;
      if (score >= 90) ranges['90-100']++;
      else if (score >= 80) ranges['80-89']++;
      else if (score >= 70) ranges['70-79']++;
      else if (score >= 60) ranges['60-69']++;
      else if (score >= 35) ranges['35-59']++;
    });

    return ranges;
  }

  private calculateStarRatingDistribution(sessions: any[]): PilotMetrics['starRatingDistribution'] {
    const distribution = {
      '5-star': 0,
      '4-star': 0,
      '3-star': 0,
      '2-star': 0,
      '1-star': 0
    };

    sessions.forEach(session => {
      const rating = session.starRating;
      if (rating === 5) distribution['5-star']++;
      else if (rating === 4) distribution['4-star']++;
      else if (rating === 3) distribution['3-star']++;
      else if (rating === 2) distribution['2-star']++;
      else if (rating === 1) distribution['1-star']++;
    });

    return distribution;
  }

  private calculateOutcomeDistribution(sessions: any[]): PilotMetrics['outcomeDistribution'] {
    const distribution = {
      breakthrough: 0,
      growth: 0,
      stagnation: 0,
      pending: 0
    };

    sessions.forEach(session => {
      const outcome = session.outcomeTracking?.outcomeTag;
      if (outcome === 'breakthrough') distribution.breakthrough++;
      else if (outcome === 'no_growth') distribution.growth++;
      else if (outcome === 'stagnation') distribution.stagnation++;
      else distribution.pending++;
    });

    return distribution;
  }
}
