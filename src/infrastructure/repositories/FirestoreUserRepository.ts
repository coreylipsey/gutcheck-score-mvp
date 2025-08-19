import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { FirestoreUser } from '../../types/firestore';

export class FirestoreUserRepository implements IUserRepository {
  async create(userData: Omit<User, 'id'> & { id: string }): Promise<void> {
    const userRef = doc(db, 'users', userData.id);
    const user: FirestoreUser = {
      email: userData.email || '',
      displayName: userData.profile?.name || '',
      createdAt: userData.createdAt,
      assessmentCount: userData.assessments.length
    };
    
    await setDoc(userRef, user);
  }

  async findById(userId: string): Promise<User | null> {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return null;
    }
    
    const data = userDoc.data() as FirestoreUser;
    return {
      userId: userId,
      email: data.email,
      createdAt: data.createdAt instanceof Date ? data.createdAt : data.createdAt.toDate(),
      assessments: [], // Would need to load separately if needed
      profile: data.displayName ? { name: data.displayName } : undefined
    };
  }

  async updateAssessmentCount(userId: string, newCount: number): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      assessmentCount: newCount
    });
  }
}