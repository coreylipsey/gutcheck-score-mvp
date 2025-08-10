export interface AssessmentLimits {
  canTakeAssessment: boolean;
  nextAvailableDate: Date | null;
  daysUntilNextAssessment: number | null;
  lastAssessmentDate: Date | null;
}

export class AssessmentFrequencyService {
  private static readonly DAYS_BETWEEN_ASSESSMENTS = 30; // One assessment per month

  static checkAssessmentLimits(assessments: Array<{ completedAt: string }>): AssessmentLimits {
    if (assessments.length === 0) {
      return {
        canTakeAssessment: true,
        nextAvailableDate: null,
        daysUntilNextAssessment: null,
        lastAssessmentDate: null
      };
    }

    // Get the most recent assessment
    const sortedAssessments = assessments
      .map(a => ({ ...a, completedAt: new Date(a.completedAt) }))
      .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());

    const lastAssessment = sortedAssessments[0];
    const now = new Date();
    const daysSinceLastAssessment = Math.floor(
      (now.getTime() - lastAssessment.completedAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    const canTakeAssessment = daysSinceLastAssessment >= this.DAYS_BETWEEN_ASSESSMENTS;
    
    if (canTakeAssessment) {
      return {
        canTakeAssessment: true,
        nextAvailableDate: null,
        daysUntilNextAssessment: null,
        lastAssessmentDate: lastAssessment.completedAt
      };
    } else {
      const nextAvailableDate = new Date(lastAssessment.completedAt);
      nextAvailableDate.setDate(nextAvailableDate.getDate() + this.DAYS_BETWEEN_ASSESSMENTS);
      
      const daysUntilNextAssessment = Math.ceil(
        (nextAvailableDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        canTakeAssessment: false,
        nextAvailableDate,
        daysUntilNextAssessment,
        lastAssessmentDate: lastAssessment.completedAt
      };
    }
  }

  static formatNextAssessmentDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  static getAssessmentStatusMessage(limits: AssessmentLimits): string {
    if (limits.canTakeAssessment) {
      return "You're ready to take your next monthly assessment!";
    }
    
    if (limits.daysUntilNextAssessment === 1) {
      return "You can take your next assessment tomorrow!";
    }
    
    return `You can take your next assessment in ${limits.daysUntilNextAssessment} days.`;
  }
} 