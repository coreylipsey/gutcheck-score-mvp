import { Timestamp } from 'firebase/firestore';

export class PartnerMetadata {
  constructor(
    public readonly partnerId: string,
    public readonly cohortId: string,
    public readonly partnerName: string,
    public readonly cohortName: string,
    public readonly createdAt: Date
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.partnerId || !this.cohortId) {
      throw new Error('Partner metadata must include partnerId and cohortId');
    }
    if (!this.partnerName || !this.cohortName) {
      throw new Error('Partner metadata must include partnerName and cohortName');
    }
  }

  static create(
    partnerId: string,
    cohortId: string,
    partnerName: string,
    cohortName: string
  ): PartnerMetadata {
    return new PartnerMetadata(
      partnerId,
      cohortId,
      partnerName,
      cohortName,
      new Date()
    );
  }

  toFirestore(): Record<string, unknown> {
    return {
      partnerId: this.partnerId,
      cohortId: this.cohortId,
      partnerName: this.partnerName,
      cohortName: this.cohortName,
      createdAt: Timestamp.fromDate(this.createdAt)
    };
  }

  static fromFirestore(data: Record<string, unknown>): PartnerMetadata {
    return new PartnerMetadata(
      data.partnerId as string,
      data.cohortId as string,
      data.partnerName as string,
      data.cohortName as string,
      (data.createdAt as Timestamp).toDate()
    );
  }
}
