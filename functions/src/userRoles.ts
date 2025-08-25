import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export interface UserRole {
  userId: string;
  email: string;
  roles: string[]; // 'henri', 'partner', 'admin'
  partnerId?: string; // If user is a partner
  henriData?: {
    assessmentCount: number;
    lastAssessmentDate?: string;
  };
  partnerData?: {
    organizationName: string;
    organizationType: string;
    role: string;
    cohortsCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Get or create user role
export const getUserRole = onCall(async (request) => {
  try {
    const { userId } = request.data;
    
    if (!userId) {
      throw new HttpsError('invalid-argument', 'User ID is required');
    }

    // Get user role from Firestore
    const userRoleDoc = await db.collection('userRoles').doc(userId).get();
    
    if (userRoleDoc.exists) {
      return userRoleDoc.data() as UserRole;
    }

    // Create new user role (default to HENRI)
    const newUserRole: UserRole = {
      userId,
      email: request.auth?.token.email || '',
      roles: ['henri'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.collection('userRoles').doc(userId).set(newUserRole);
    
    return newUserRole;

  } catch (error) {
    console.error('Error getting user role:', error);
    throw new HttpsError('internal', 'Failed to get user role');
  }
});

// Promote user to partner role
export const promoteToPartner = onCall(async (request) => {
  try {
    const { userId, partnerData } = request.data;
    
    if (!userId || !partnerData) {
      throw new HttpsError('invalid-argument', 'User ID and partner data are required');
    }

    // Check if user has existing assessment data
    const assessmentSessions = await db.collection('assessmentSessions')
      .where('userId', '==', userId)
      .get();

    const hasAssessmentData = !assessmentSessions.empty;

    // Update user role
    const userRoleRef = db.collection('userRoles').doc(userId);
    const userRoleDoc = await userRoleRef.get();

    let userRole: UserRole;
    
    if (userRoleDoc.exists) {
      userRole = userRoleDoc.data() as UserRole;
      userRole.roles = [...new Set([...userRole.roles, 'partner'])];
      userRole.partnerData = partnerData;
      userRole.updatedAt = new Date().toISOString();
    } else {
      userRole = {
        userId,
        email: request.auth?.token.email || '',
        roles: ['henri', 'partner'],
        partnerData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    await userRoleRef.set(userRole);

    return {
      success: true,
      userRole,
      hasAssessmentData,
      warning: hasAssessmentData ? 
        'User has existing assessment data. Consider using a separate account for partner activities.' : 
        null
    };

  } catch (error) {
    console.error('Error promoting user to partner:', error);
    throw new HttpsError('internal', 'Failed to promote user to partner');
  }
});

// Check if user can access partner features
export const checkPartnerAccess = onCall(async (request) => {
  try {
    const { userId } = request.data;
    
    if (!userId) {
      throw new HttpsError('invalid-argument', 'User ID is required');
    }

    const userRoleDoc = await db.collection('userRoles').doc(userId).get();
    
    if (!userRoleDoc.exists) {
      return { hasAccess: false, reason: 'User role not found' };
    }

    const userRole = userRoleDoc.data() as UserRole;
    const hasPartnerRole = userRole.roles.includes('partner');
    const hasAdminRole = userRole.roles.includes('admin');

    return {
      hasAccess: hasPartnerRole || hasAdminRole,
      userRole,
      reason: hasPartnerRole || hasAdminRole ? null : 'User does not have partner role'
    };

  } catch (error) {
    console.error('Error checking partner access:', error);
    throw new HttpsError('internal', 'Failed to check partner access');
  }
});

// Get user's assessment history (for identity management)
export const getUserAssessmentHistory = onCall(async (request) => {
  try {
    const { userId } = request.data;
    
    if (!userId) {
      throw new HttpsError('invalid-argument', 'User ID is required');
    }

    const assessmentSessions = await db.collection('assessmentSessions')
      .where('userId', '==', userId)
      .orderBy('completedAt', 'desc')
      .limit(10)
      .get();

    const assessments = assessmentSessions.docs.map(doc => ({
      sessionId: doc.id,
      ...doc.data()
    }));

    return {
      assessmentCount: assessments.length,
      assessments,
      hasAssessmentData: assessments.length > 0
    };

  } catch (error) {
    console.error('Error getting user assessment history:', error);
    throw new HttpsError('internal', 'Failed to get user assessment history');
  }
});

// Create separate partner account
export const createPartnerAccount = onCall(async (request) => {
  try {
    const { partnerEmail, partnerData } = request.data;
    
    if (!partnerEmail || !partnerData) {
      throw new HttpsError('invalid-argument', 'Partner email and data are required');
    }

    // Check if partner email already exists
    const existingPartner = await db.collection('userRoles')
      .where('email', '==', partnerEmail)
      .where('roles', 'array-contains', 'partner')
      .get();

    if (!existingPartner.empty) {
      throw new HttpsError('already-exists', 'Partner account already exists for this email');
    }

    // Create new partner account
    const partnerId = `partner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newPartnerRole: UserRole = {
      userId: partnerId,
      email: partnerEmail,
      roles: ['partner'],
      partnerData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.collection('userRoles').doc(partnerId).set(newPartnerRole);

    return {
      success: true,
      partnerId,
      userRole: newPartnerRole,
      message: 'Partner account created successfully. Please sign in with the partner email.'
    };

  } catch (error) {
    console.error('Error creating partner account:', error);
    throw new HttpsError('internal', 'Failed to create partner account');
  }
});
