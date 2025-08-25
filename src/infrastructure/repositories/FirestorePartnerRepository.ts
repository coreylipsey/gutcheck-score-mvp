import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  updateDoc,
  Timestamp,
  limit
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { IPartnerRepository, Partner, Cohort, CreateCohortData } from '../../domain/repositories/IPartnerRepository';

export class FirestorePartnerRepository implements IPartnerRepository {
  async createCohort(data: CreateCohortData): Promise<Cohort> {
    // Generate unique IDs
    const partnerId = this.generatePartnerId(data.partnerName);
    const cohortId = this.generateCohortId(data.cohortName);
    
    // Create partner if doesn't exist
    const partner: Partner = {
      id: partnerId,
      name: data.partnerName,
      email: data.partnerEmail,
      status: 'active',
      createdAt: new Date()
    };

    // Create cohort
    const cohort: Cohort = {
      id: cohortId,
      name: data.cohortName,
      partnerId: partnerId,
      partnerName: data.partnerName,
      expectedParticipants: data.expectedParticipants,
      assessmentUrl: this.generateAssessmentUrl(cohortId, partnerId),
      status: 'active',
      createdAt: new Date()
    };

    // Save to Firestore
    await addDoc(collection(db, 'partners'), {
      ...partner,
      createdAt: Timestamp.fromDate(partner.createdAt)
    });

    await addDoc(collection(db, 'cohorts'), {
      ...cohort,
      createdAt: Timestamp.fromDate(cohort.createdAt)
    });

    return cohort;
  }

  async findCohortById(cohortId: string): Promise<Cohort | null> {
    const q = query(
      collection(db, 'cohorts'),
      where('id', '==', cohortId),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      id: data.id,
      name: data.name,
      partnerId: data.partnerId,
      partnerName: data.partnerName,
      expectedParticipants: data.expectedParticipants,
      assessmentUrl: data.assessmentUrl,
      status: data.status,
      createdAt: data.createdAt?.toDate() || new Date()
    };
  }

  async findCohortsByPartner(partnerId: string): Promise<Cohort[]> {
    const q = query(
      collection(db, 'cohorts'),
      where('partnerId', '==', partnerId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.id,
        name: data.name,
        partnerId: data.partnerId,
        partnerName: data.partnerName,
        expectedParticipants: data.expectedParticipants,
        assessmentUrl: data.assessmentUrl,
        status: data.status,
        createdAt: data.createdAt?.toDate() || new Date()
      };
    });
  }

  async updateCohortStatus(cohortId: string, status: Cohort['status']): Promise<void> {
    const q = query(
      collection(db, 'cohorts'),
      where('id', '==', cohortId),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      throw new Error('Cohort not found');
    }
    
    const doc = querySnapshot.docs[0];
    await updateDoc(doc.ref, { status });
  }

  generateAssessmentUrl(cohortId: string, partnerId?: string): string {
    if (partnerId) {
      return `https://gutcheck-score-mvp.web.app/assessment?partner_id=${partnerId}&cohort_id=${cohortId}`;
    }
    return `https://gutcheck-score-mvp.web.app/assessment?cohort_id=${cohortId}`;
  }

  private generatePartnerId(partnerName: string): string {
    return partnerName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36);
  }

  private generateCohortId(cohortName: string): string {
    return cohortName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36);
  }
}
