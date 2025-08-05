import { AssessmentCategory } from '../../domain/value-objects/Category';
import { AssessmentResponse } from '../../domain/entities/Assessment';
import { IAIScoringService } from '../../domain/repositories/IAIScoringService';
import { ScoringService } from '../services/ScoringService';

export interface AssessmentScores {
  personalBackground: number;
  entrepreneurialSkills: number;
  resources: number;
  behavioralMetrics: number;
  growthVision: number;
  overallScore: number;
}

export class CalculateAssessmentScore {
  constructor(
    private readonly scoringService: ScoringService,
    private readonly aiService: IAIScoringService
  ) {}

  async execute(responses: AssessmentResponse[]): Promise<AssessmentScores> {
    const categoryScores: Record<AssessmentCategory, number> = {
      personalBackground: 0,
      entrepreneurialSkills: 0,
      resources: 0,
      behavioralMetrics: 0,
      growthVision: 0,
    };

    // Group responses by category
    const responsesByCategory = this.groupResponsesByCategory(responses);

    // Calculate scores for each category
    for (const [category, categoryResponses] of Object.entries(responsesByCategory)) {
      const categoryScore = await this.scoringService.calculateCategoryScore(
        categoryResponses,
        category as AssessmentCategory
      );
      categoryScores[category as AssessmentCategory] = categoryScore;
    }

    const overallScore = this.calculateOverallScore(categoryScores);
    
    return {
      ...categoryScores,
      overallScore
    };
  }

  private groupResponsesByCategory(responses: AssessmentResponse[]): Record<AssessmentCategory, AssessmentResponse[]> {
    const grouped: Record<AssessmentCategory, AssessmentResponse[]> = {
      personalBackground: [],
      entrepreneurialSkills: [],
      resources: [],
      behavioralMetrics: [],
      growthVision: [],
    };

    responses.forEach(response => {
      grouped[response.category].push(response);
    });

    return grouped;
  }

  private calculateOverallScore(categoryScores: Record<AssessmentCategory, number>): number {
    return Object.values(categoryScores).reduce((sum, score) => sum + score, 0);
  }
} 