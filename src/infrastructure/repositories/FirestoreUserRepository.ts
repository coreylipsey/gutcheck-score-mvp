import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { FirestoreUser } from '../../types/firestore';

export class FirestoreUserRepository implements IUserRepository {
  async create(userData: Omit<User, 'id'> & { id: string }): Promise<void> {
    const userRef = doc(db, 'users', userData.id);
    const firestoreUser: FirestoreUser = {
      email: userData.email,
      displayName: userData.name,
      createdAt: userData.createdAt,
      assessmentCount: userData.assessmentHistory.length
    };
    
    await setDoc(userRef, firestoreUser);
  }

  async findById(userId: string): Promise<User | null> {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return null;
    }
    
    const data = userDoc.data() as FirestoreUser;
    return {
      id: userId,
      email: data.email,
      name: data.displayName || '',
      createdAt: data.createdAt,
      assessmentHistory: [] // Would need to load separately if needed
    };
  }

  async updateAssessmentCount(userId: string, newCount: number): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      assessmentCount: newCount
    });
  }
}