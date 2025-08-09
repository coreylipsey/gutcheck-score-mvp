import { User } from '../entities/User';

export interface IUserRepository {
  create(user: Omit<User, 'id'> & { id: string }): Promise<void>;
  findById(userId: string): Promise<User | null>;
  updateAssessmentCount(userId: string, newCount: number): Promise<void>;
} 