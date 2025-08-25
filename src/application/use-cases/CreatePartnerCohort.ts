import { IPartnerRepository } from '../../domain/repositories/IPartnerRepository';
import { CreateCohortData, CohortResult } from '../../domain/repositories/IPartnerRepository';

export class CreatePartnerCohort {
  constructor(
    private readonly partnerRepository: IPartnerRepository
  ) {}

  async execute(data: CreateCohortData): Promise<CohortResult> {
    // Validate input data
    this.validateCohortData(data);

    // Create cohort using repository
    const cohort = await this.partnerRepository.createCohort(data);

    // Generate assessment URL
    const assessmentUrl = this.partnerRepository.generateAssessmentUrl(cohort.id);

    // Generate welcome email template
    const welcomeEmail = this.generateWelcomeEmail(cohort, assessmentUrl);

    return {
      cohortId: cohort.id,
      assessmentUrl,
      welcomeEmail
    };
  }

  private validateCohortData(data: CreateCohortData): void {
    if (!data.partnerName || !data.cohortName || !data.partnerEmail) {
      throw new Error('Partner name, cohort name, and email are required');
    }

    if (data.expectedParticipants <= 0) {
      throw new Error('Expected participants must be greater than 0');
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.partnerEmail)) {
      throw new Error('Invalid email format');
    }
  }

  private generateWelcomeEmail(cohort: any, assessmentUrl: string): string {
    return `
Dear ${cohort.partnerName} Team,

Your Gutcheck.AI pilot cohort "${cohort.cohortName}" has been successfully created!

📋 Cohort Details:
- Cohort ID: ${cohort.id}
- Expected Participants: ${cohort.expectedParticipants}
- Assessment URL: ${assessmentUrl}

🚀 Next Steps:
1. Share the assessment URL with your participants
2. Monitor completion rates in your dashboard
3. Tag outcomes as participants progress

📊 Dashboard Access:
Visit your partner dashboard to track progress and generate reports.

Need help? Contact us at support@gutcheck.ai

Best regards,
The Gutcheck.AI Team
    `.trim();
  }
}
