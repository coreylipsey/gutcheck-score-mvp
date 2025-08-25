export interface Partner {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'pending' | 'inactive';
  createdAt: Date;
}

export interface Cohort {
  id: string;
  name: string;
  partnerId: string;
  partnerName: string;
  expectedParticipants: number;
  assessmentUrl: string;
  status: 'active' | 'completed' | 'draft';
  createdAt: Date;
}

export interface CreateCohortData {
  partnerName: string;
  cohortName: string;
  partnerEmail: string;
  expectedParticipants: number;
}

export interface CohortResult {
  cohortId: string;
  assessmentUrl: string;
  welcomeEmail: string;
}

export interface IPartnerRepository {
  createCohort(data: CreateCohortData): Promise<Cohort>;
  findCohortById(cohortId: string): Promise<Cohort | null>;
  findCohortsByPartner(partnerId: string): Promise<Cohort[]>;
  updateCohortStatus(cohortId: string, status: Cohort['status']): Promise<void>;
  generateAssessmentUrl(cohortId: string, partnerId?: string): string;
}
