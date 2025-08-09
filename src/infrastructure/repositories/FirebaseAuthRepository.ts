import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  AuthError as FirebaseAuthError,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { IAuthRepository, AuthUser, AuthError } from '../../domain/repositories/IAuthRepository';

export class FirebaseAuthRepository implements IAuthRepository {
  private currentUser: AuthUser | null = null;
  private lastError: AuthError | null = null;

  async signUp(email: string, password: string, displayName?: string): Promise<AuthUser> {
    try {
      this.clearError();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      const authUser = this.mapFirebaseUser(userCredential.user);
      this.currentUser = authUser;
      return authUser;
    } catch (err: unknown) {
      const authError = this.handleFirebaseError(err);
      this.lastError = authError;
      throw authError;
    }
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      this.clearError();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const authUser = this.mapFirebaseUser(userCredential.user);
      this.currentUser = authUser;
      return authUser;
    } catch (err: unknown) {
      const authError = this.handleFirebaseError(err);
      this.lastError = authError;
      throw authError;
    }
  }

  async signInWithGoogle(): Promise<AuthUser> {
    try {
      this.clearError();
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const authUser = this.mapFirebaseUser(userCredential.user);
      this.currentUser = authUser;
      return authUser;
    } catch (err: unknown) {
      const authError = this.handleFirebaseError(err);
      this.lastError = authError;
      throw authError;
    }
  }

  async signOut(): Promise<void> {
    try {
      this.clearError();
      await signOut(auth);
      this.currentUser = null;
    } catch (err: unknown) {
      const authError = this.handleFirebaseError(err);
      this.lastError = authError;
      throw authError;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      this.clearError();
      await sendPasswordResetEmail(auth, email);
    } catch (err: unknown) {
      const authError = this.handleFirebaseError(err);
      this.lastError = authError;
      throw authError;
    }
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const authUser = this.mapFirebaseUser(firebaseUser);
        this.currentUser = authUser;
        callback(authUser);
      } else {
        this.currentUser = null;
        callback(null);
      }
    });
  }

  getLastError(): AuthError | null {
    return this.lastError;
  }

  clearError(): void {
    this.lastError = null;
  }

  private mapFirebaseUser(firebaseUser: FirebaseUser): AuthUser {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      emailVerified: firebaseUser.emailVerified,
    };
  }

  private handleFirebaseError(err: unknown): AuthError {
    const firebaseError = err as FirebaseAuthError;
    return {
      code: firebaseError.code,
      message: this.getErrorMessage(firebaseError.code),
    };
  }

  private getErrorMessage(code: string): string {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
}