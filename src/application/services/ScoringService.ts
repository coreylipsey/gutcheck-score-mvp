import { AssessmentCategory } from '../../domain/value-objects/Category';
import { AssessmentResponse } from '../../domain/entities/Assessment';
import { Question } from '../../domain/entities/Question';
import { ASSESSMENT_QUESTIONS, CATEGORY_WEIGHTS } from '../../domain/entities/Assessment';
import { IAIScoringService } from '../../domain/repositories/IAIScoringService';

// 🔒 SCORING LOGIC LOCKING MECHANISM
// ===================================
//
// CRITICAL: This file contains the scoring logic that MUST match the assessment
// questions exactly. Any changes to scoring maps or logic will affect the
// validity of all assessment results.
//
// LOCKED ELEMENTS:
// - Scoring maps for multiple-choice questions
// - Scoring logic for different question types
// - Category weight calculations
// - Question weight calculations
//
// TO UNLOCK FOR CHANGES:
// 1. Remove this comment block
// 2. Make the required changes
// 3. Add a new comment block with the date and reason for changes
// 4. Ensure changes align with Assessment.ts questions
// 5. Test thoroughly to ensure scoring accuracy is maintained
//
// LAST VALIDATED: 2025-01-27 - Clean Architecture refactor completion
// VALIDATION STATUS: ✅ All scoring logic matches original assessment questions

export class ScoringService {
  constructor(private readonly aiService: IAIScoringService) {}

  async calculateCategoryScore(
    responses: AssessmentResponse[],
    category: AssessmentCategory
  ): Promise<number> {
    let totalScore = 0;
    let totalWeight = 0;

    for (const response of responses) {
      const question = this.findQuestionById(response.questionId);
      if (!question || question.category !== category) continue;

      const score = await this.calculateQuestionScore(question, response);
      totalScore += score * question.weight;
      totalWeight += question.weight;
    }

    if (totalWeight === 0) return 0;

    const averageScore = totalScore / totalWeight;
    const categoryWeight = CATEGORY_WEIGHTS[category];
    
    return this.normalizeScore(averageScore, categoryWeight);
  }

  private async calculateQuestionScore(question: Question, response: AssessmentResponse): Promise<number> {
    switch (question.type) {
      case 'multipleChoice':
        return this.scoreMultipleChoice(question, response.response as string);
      case 'multiSelect':
        return this.scoreMultiSelect(question, response.response as string[]);
      case 'likert':
        return this.scoreLikert(response.response as number);
      case 'openEnded':
        return await this.scoreOpenEndedWithAI(question, response.response as string);
      default:
        return 0;
    }
  }

  private scoreMultipleChoice(question: Question, response: string): number {
    if (!question.options) return 0;
    
    const optionIndex = question.options.indexOf(response);
    if (optionIndex === -1) return 0;
    
    // Define scoring maps for each question based on the framework
    const scoringMaps: Record<string, number[]> = {
      // SECTION 1: Personal Background
      'q1': [3, 4, 5], // Idea stage=3, Early ops=4, Established=5
      'q2': [3, 4, 5], // Solo=3, Small team=4, Large team=5
      'q4': [5, 4, 3], // Still running=5, Failed=4, First time=3
      'q5': [5, 4, 3, 2], // Market opportunity=5, Income=4, Independence=3, Other=2
      
      // SECTION 2: Entrepreneurial Skills
      'q6': [5, 4, 3, 2], // Excellent=5, Good=4, Fair=3, Poor=2
      'q7': [5, 4, 3, 2], // Daily=5, Weekly=4, Monthly=3, Rarely=2
      
      // SECTION 3: Resources
      'q11': [2, 3, 4, 5, 1], // Lack funding=2, Limited mentorship=3, Access customers=4, Scaling=5, Other=1
      'q12': [5, 4, 3], // Sufficient=5, Not enough=4, Self-funded=3
      'q13': [5, 4, 3], // Very strong=5, Moderate=4, Weak=3
      'q14': [5, 3], // Yes=5, No=3
      'q15': [5, 4, 3, 2], // Weekly=5, Monthly=4, Occasionally=3, Rarely=2
      
      // SECTION 4: Behavioral Metrics
      'q16': [2, 3, 4, 5], // 1-10 hours=2, 11-20=3, 21-40=4, 40+=5
      'q17': [5, 4, 3], // Prioritize=5, Occasionally=4, No routine=3
      'q20': [5, 4, 3], // Restarted=5, Haven't restarted=4, No=3
      
      // SECTION 5: Growth & Vision
      'q21': [3, 4, 5], // Small-scale=3, Regional=4, Global=5
      'q22': [3, 4, 5, 2], // Bootstrapping=3, Loans/grants=4, Investments=5, Unsure=2
      'q24': [4, 5, 3, 2], // 1-5 jobs=4, 6+ jobs=5, No=3, Not sure=2
      'q25': [5, 3, 2], // Yes=5, No=3, Not sure=2
    };
    
    const scoringMap = scoringMaps[question.id];
    if (scoringMap && scoringMap[optionIndex] !== undefined) {
      return scoringMap[optionIndex];
    }
    
    // Fallback: reverse the current logic (last option = highest score)
    const score = optionIndex + 1;
    return Math.max(1, Math.min(5, score));
  }

  private scoreLikert(response: number): number {
    return Math.max(1, Math.min(5, response));
  }

  private scoreMultiSelect(question: Question, responses: string[]): number {
    if (!question.options) return 0;

    const completedCount = responses.length;
    const totalOptions = question.options.length;

    const completionPercentage = completedCount / totalOptions;
    const normalizedScore = completionPercentage * 5;

    return Math.round(normalizedScore);
  }

  private async scoreOpenEndedWithAI(question: Question, response: string): Promise<number> {
    if (!this.validateOpenEndedResponse(response, question.minCharacters || 100)) {
      return 0;
    }

    try {
      const result = await this.aiService.scoreOpenEndedResponse(
        question.id,
        response,
        question.text
      );
      return result.score;
    } catch (error) {
      console.error('AI scoring failed:', error);
      return 3; // Fallback score
    }
  }

  private validateOpenEndedResponse(response: string, minCharacters: number = 100): boolean {
    if (response.trim().length < minCharacters) {
      return false;
    }

    const trimmedResponse = response.trim();
    const nonsensePatterns = [
      /^[a-z\s]+$/i, // Only letters and spaces
      /^(.)\1+$/, // Repeated characters
      /^[0-9\s]+$/, // Only numbers and spaces
      /^[^\w\s]+$/, // Only special characters
    ];

    for (const pattern of nonsensePatterns) {
      if (pattern.test(trimmedResponse)) {
        return false;
      }
    }

    const wordCount = trimmedResponse.split(/\s+/).length;
    if (wordCount < 15) {
      return false;
    }

    return true;
  }

  private normalizeScore(rawScore: number, categoryWeight: number): number {
    return (rawScore / 5) * (categoryWeight / 5);
  }

  private findQuestionById(questionId: string): Question | undefined {
    return ASSESSMENT_QUESTIONS.find(q => q.id === questionId);
  }
} 