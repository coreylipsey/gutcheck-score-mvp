export interface UserProfile {
  name?: string;
  industry?: string;
  location?: string;
}

export interface User {
  userId: string;
  email?: string;
  createdAt: Date;
  assessments: string[]; // sessionIds
  profile?: UserProfile;
}

export class UserEntity {
  constructor(
    public readonly userId: string,
    public readonly email: string | undefined,
    public readonly createdAt: Date,
    public readonly assessments: string[],
    public readonly profile?: UserProfile
  ) {}

  static create(userId: string, email?: string): UserEntity {
    return new UserEntity(
      userId,
      email,
      new Date(),
      []
    );
  }

  static fromUser(user: User): UserEntity {
    return new UserEntity(
      user.userId,
      user.email,
      user.createdAt,
      user.assessments,
      user.profile
    );
  }

  toUser(): User {
    return {
      userId: this.userId,
      email: this.email,
      createdAt: this.createdAt,
      assessments: this.assessments,
      profile: this.profile
    };
  }

  addAssessment(sessionId: string): UserEntity {
    return new UserEntity(
      this.userId,
      this.email,
      this.createdAt,
      [...this.assessments, sessionId],
      this.profile
    );
  }

  updateProfile(profile: UserProfile): UserEntity {
    return new UserEntity(
      this.userId,
      this.email,
      this.createdAt,
      this.assessments,
      profile
    );
  }

  hasCompletedAssessments(): boolean {
    return this.assessments.length > 0;
  }

  getAssessmentCount(): number {
    return this.assessments.length;
  }
} 