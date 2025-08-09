'use client';

import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  AuthError as FirebaseAuthError
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createUser, getUser } from '@/lib/firestore';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
}

export interface AuthError {
  code: string;
  message: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const authUser: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          emailVerified: firebaseUser.emailVerified,
        };
        setUser(authUser);
        
        // Check if user exists in Firestore, create if not
        const existingUser = await getUser(firebaseUser.uid);
        if (!existingUser) {
          await createUser(firebaseUser.uid, firebaseUser.email || undefined, firebaseUser.displayName || undefined);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      // Create user in Firestore
      await createUser(userCredential.user.uid, email, displayName);
      
      return userCredential.user;
    } catch (err: unknown) {
      const firebaseError = err as FirebaseAuthError;
      const authError: AuthError = {
        code: firebaseError.code,
        message: getErrorMessage(firebaseError.code),
      };
      setError(authError);
      throw authError;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err: unknown) {
      const firebaseError = err as FirebaseAuthError;
      const authError: AuthError = {
        code: firebaseError.code,
        message: getErrorMessage(firebaseError.code),
      };
      setError(authError);
      throw authError;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (err: unknown) {
      const firebaseError = err as FirebaseAuthError;
      const authError: AuthError = {
        code: firebaseError.code,
        message: getErrorMessage(firebaseError.code),
      };
      setError(authError);
      throw authError;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err: unknown) {
      const firebaseError = err as FirebaseAuthError;
      const authError: AuthError = {
        code: firebaseError.code,
        message: getErrorMessage(firebaseError.code),
      };
      setError(authError);
      throw authError;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Check if user exists in Firestore, create if not
      const existingUser = await getUser(userCredential.user.uid);
      if (!existingUser) {
        await createUser(
          userCredential.user.uid, 
          userCredential.user.email || undefined, 
          userCredential.user.displayName || undefined
        );
      }
      
      return userCredential.user;
    } catch (err: unknown) {
      const firebaseError = err as FirebaseAuthError;
      const authError: AuthError = {
        code: firebaseError.code,
        message: getErrorMessage(firebaseError.code),
      };
      setError(authError);
      throw authError;
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    resetPassword,
    clearError,
  };
}

function getErrorMessage(code: string): string {
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