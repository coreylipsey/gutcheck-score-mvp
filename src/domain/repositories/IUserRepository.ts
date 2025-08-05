import { User } from '../entities/User';

export interface IUserRepository {
  create(userId: string, email?: string, displayName?: string): Promise<void>;
  findById(userId: string): Promise<User | null>;
  updateAssessmentCount(userId: string, newCount: number): Promise<void>;
} 