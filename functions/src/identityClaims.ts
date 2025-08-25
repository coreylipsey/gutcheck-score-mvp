import * as admin from 'firebase-admin';
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export interface UserClaims {
  roles: string[];
  orgId?: string;
  scopes: string[];
  entitlements: string[];
  partnerId?: string;
  lastUpdated: number;
}

export interface UserRole {
  userId: string;
  email: string;
  roles: string[];
  orgId?: string;
  partnerId?: string;
  scopes: string[];
  entitlements: string[];
  partnerData?: {
    organizationName: string;
    organizationType: string;
    role: string;
    cohortsCount: number;
  };
  henriData?: {
    assessmentCount: number;
    lastAssessmentDate?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Sync Firestore roles to Firebase Custom Claims
export const syncUserClaims = onCall(async (request) => {
  try {
    const { userId } = request.data;
    
    if (!userId) {
      throw new HttpsError('invalid-argument', 'User ID is required');
    }

    // Get user role from Firestore
    const userRoleDoc = await db.collection('userRoles').doc(userId).get();
    
    if (!userRoleDoc.exists) {
      throw new HttpsError('not-found', 'User role not found');
    }

    const userRole = userRoleDoc.data() as UserRole;
    
    // Build custom claims
    const claims: UserClaims = {
      roles: userRole.roles || ['henri'],
      orgId: userRole.orgId,
      scopes: userRole.scopes || [],
      entitlements: userRole.entitlements || [],
      partnerId: userRole.partnerId,
      lastUpdated: Date.now()
    };

    // Set custom claims on Firebase Auth user
    await admin.auth().setCustomUserClaims(userId, claims);

    // Log the claim update for audit
    await db.collection('auditTrail').add({
      event: 'claims_updated',
      userId,
      claims,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      triggeredBy: request.auth?.uid || 'system'
    });

    return {
      success: true,
      claims,
      message: 'User claims updated successfully'
    };

  } catch (error) {
    console.error('Error syncing user claims:', error);
    throw new HttpsError('internal', 'Failed to sync user claims');
  }
});

// Automatically sync claims when user role changes
export const onRoleChange = onDocumentUpdated('userRoles/{userId}', async (event) => {
  try {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();
    const userId = event.params.userId;

    if (!beforeData || !afterData) {
      console.log('No data found - skipping claim sync');
      return;
    }

    // Check if roles, orgId, or scopes changed
    const rolesChanged = JSON.stringify(beforeData.roles) !== JSON.stringify(afterData.roles);
    const orgChanged = beforeData.orgId !== afterData.orgId;
    const scopesChanged = JSON.stringify(beforeData.scopes) !== JSON.stringify(afterData.scopes);

    if (rolesChanged || orgChanged || scopesChanged) {
      console.log(`Role change detected for user ${userId}, syncing claims`);

      // Build new claims
      const claims: UserClaims = {
        roles: afterData.roles || ['henri'],
        orgId: afterData.orgId,
        scopes: afterData.scopes || [],
        entitlements: afterData.entitlements || [],
        partnerId: afterData.partnerId,
        lastUpdated: Date.now()
      };

      // Update Firebase Auth claims
      await admin.auth().setCustomUserClaims(userId, claims);

      // Log the automatic claim update
      await db.collection('auditTrail').add({
        event: 'claims_auto_synced',
        userId,
        claims,
        changes: {
          rolesChanged,
          orgChanged,
          scopesChanged
        },
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        triggeredBy: 'system'
      });

      console.log(`Claims synced for user ${userId}`);
    }

  } catch (error) {
    console.error('Error in onRoleChange:', error);
    
    // Log the error for monitoring
    await db.collection('auditTrail').add({
      event: 'claims_sync_error',
      userId: event.params.userId,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      triggeredBy: 'system'
    });
  }
});

// Create new user role with claims
export const createUserRole = onDocumentCreated('userRoles/{userId}', async (event) => {
  try {
    const userRole = event.data?.data() as UserRole;
    const userId = event.params.userId;

    if (!userRole) {
      console.log('No user role data found - skipping claim creation');
      return;
    }

    console.log(`Creating claims for new user ${userId}`);

    // Build initial claims
    const claims: UserClaims = {
      roles: userRole.roles || ['henri'],
      orgId: userRole.orgId,
      scopes: userRole.scopes || [],
      entitlements: userRole.entitlements || [],
      partnerId: userRole.partnerId,
      lastUpdated: Date.now()
    };

    // Set initial claims
    await admin.auth().setCustomUserClaims(userId, claims);

    // Log the claim creation
    await db.collection('auditTrail').add({
      event: 'claims_created',
      userId,
      claims,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      triggeredBy: 'system'
    });

    console.log(`Initial claims created for user ${userId}`);

  } catch (error) {
    console.error('Error creating initial claims:', error);
    
    // Log the error
    await db.collection('auditTrail').add({
      event: 'claims_creation_error',
      userId: event.params.userId,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      triggeredBy: 'system'
    });
  }
});

// Get current user claims
export const getCurrentUserClaims = onCall(async (request) => {
  try {
    const userId = request.auth?.uid;
    
    if (!userId) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Get user from Firebase Auth to get current claims
    const userRecord = await admin.auth().getUser(userId);
    
    return {
      claims: userRecord.customClaims || {},
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        emailVerified: userRecord.emailVerified
      }
    };

  } catch (error) {
    console.error('Error getting user claims:', error);
    throw new HttpsError('internal', 'Failed to get user claims');
  }
});

// Force refresh claims (for admin use)
export const refreshUserClaims = onCall(async (request) => {
  try {
    const { userId } = request.data;
    const adminUserId = request.auth?.uid;
    
    if (!userId) {
      throw new HttpsError('invalid-argument', 'User ID is required');
    }

    // Check if caller is admin
    const adminUserRecord = await admin.auth().getUser(adminUserId!);
    const adminClaims = adminUserRecord.customClaims as UserClaims;
    
    if (!adminClaims?.roles?.includes('admin')) {
      throw new HttpsError('permission-denied', 'Only admins can refresh claims');
    }

    // Get user role from Firestore
    const userRoleDoc = await db.collection('userRoles').doc(userId).get();
    
    if (!userRoleDoc.exists) {
      throw new HttpsError('not-found', 'User role not found');
    }

    const userRole = userRoleDoc.data() as UserRole;
    
    // Build new claims
    const claims: UserClaims = {
      roles: userRole.roles || ['henri'],
      orgId: userRole.orgId,
      scopes: userRole.scopes || [],
      entitlements: userRole.entitlements || [],
      partnerId: userRole.partnerId,
      lastUpdated: Date.now()
    };

    // Update claims
    await admin.auth().setCustomUserClaims(userId, claims);

    // Log the admin-triggered refresh
    await db.collection('auditTrail').add({
      event: 'claims_refreshed_by_admin',
      userId,
      claims,
      adminUserId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      triggeredBy: adminUserId
    });

    return {
      success: true,
      claims,
      message: 'Claims refreshed successfully'
    };

  } catch (error) {
    console.error('Error refreshing user claims:', error);
    throw new HttpsError('internal', 'Failed to refresh user claims');
  }
});
