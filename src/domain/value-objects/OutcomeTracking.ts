import { Timestamp } from 'firebase/firestore';

export type OutcomeTag = 'stagnation' | 'no_growth' | 'breakthrough' | 'pending';

export class OutcomeTracking {
  constructor(
    public readonly isReady: boolean,
    public readonly outcomeTag?: OutcomeTag,
    public readonly outcomeNotes?: string,
    public readonly taggedBy?: string,
    public readonly taggedAt?: Date
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.outcomeTag && (!this.taggedBy || !this.taggedAt)) {
      throw new Error('Outcome tag requires taggedBy and taggedAt');
    }
  }

  static createReady(): OutcomeTracking {
    return new OutcomeTracking(true);
  }

  static createWithOutcome(
    outcomeTag: OutcomeTag,
    outcomeNotes: string,
    taggedBy: string
  ): OutcomeTracking {
    return new OutcomeTracking(
      true,
      outcomeTag,
      outcomeNotes,
      taggedBy,
      new Date()
    );
  }

  toFirestore(): Record<string, unknown> {
    return {
      isReady: this.isReady,
      outcomeTag: this.outcomeTag,
      outcomeNotes: this.outcomeNotes,
      taggedBy: this.taggedBy,
      taggedAt: this.taggedAt ? Timestamp.fromDate(this.taggedAt) : undefined
    };
  }

  static fromFirestore(data: Record<string, unknown>): OutcomeTracking {
    return new OutcomeTracking(
      data.isReady as boolean,
      data.outcomeTag as OutcomeTag,
      data.outcomeNotes as string,
      data.taggedBy as string,
      data.taggedAt ? (data.taggedAt as Timestamp).toDate() : undefined
    );
  }
}
