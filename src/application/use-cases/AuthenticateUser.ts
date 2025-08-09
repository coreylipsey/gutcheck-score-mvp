import { IAuthRepository, AuthUser } from '../../domain/repositories/IAuthRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';

export class AuthenticateUser {
  constructor(
    private authRepository: IAuthRepository,
    private userRepository: IUserRepository
  ) {}

  async signUp(email: string, password: string, displayName?: string): Promise<AuthUser> {
    const authUser = await this.authRepository.signUp(email, password, displayName);
    
    // Create user in Firestore if they don't exist
    const existingUser = await this.userRepository.findById(authUser.uid);
    if (!existingUser) {
      await this.userRepository.create({
        id: authUser.uid,
        email: authUser.email || '',
        name: authUser.displayName || '',
        createdAt: new Date(),
        assessmentHistory: []
      });
    }
    
    return authUser;
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    const authUser = await this.authRepository.signIn(email, password);
    
    // Ensure user exists in Firestore
    const existingUser = await this.userRepository.findById(authUser.uid);
    if (!existingUser) {
      await this.userRepository.create({
        id: authUser.uid,
        email: authUser.email || '',
        name: authUser.displayName || '',
        createdAt: new Date(),
        assessmentHistory: []
      });
    }
    
    return authUser;
  }

  async signInWithGoogle(): Promise<AuthUser> {
    const authUser = await this.authRepository.signInWithGoogle();
    
    // Ensure user exists in Firestore
    const existingUser = await this.userRepository.findById(authUser.uid);
    if (!existingUser) {
      await this.userRepository.create({
        id: authUser.uid,
        email: authUser.email || '',
        name: authUser.displayName || '',
        createdAt: new Date(),
        assessmentHistory: []
      });
    }
    
    return authUser;
  }

  async signOut(): Promise<void> {
    return this.authRepository.signOut();
  }

  async resetPassword(email: string): Promise<void> {
    return this.authRepository.resetPassword(email);
  }

  getCurrentUser(): AuthUser | null {
    return this.authRepository.getCurrentUser();
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    return this.authRepository.onAuthStateChanged(callback);
  }

  getLastError() {
    return this.authRepository.getLastError();
  }

  clearError(): void {
    this.authRepository.clearError();
  }
}