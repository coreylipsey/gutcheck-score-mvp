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
  orgIds: string[];      // multi-tenant support
  scopes: string[];      // optional fine-grained
  entitlements: string[];// plan/features
  suspended?: boolean;
  email_verified?: boolean;
  claims_ver: number;    // version tracking
  lastUpdated: number;
}

export interface UserRole {
  userId: string;
  email: string;
  roles: string[];
  orgIds: string[];      // multi-tenant support
  scopes: string[];
  entitlements: string[];
  suspended?: boolean;
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

type RoleDoc = {
  roles?: string[];
  orgIds?: string[];      // multi-tenant support
  scopes?: string[];      // optional fine-grained
  entitlements?: string[];// plan/features
  suspended?: boolean;
};

async function setClaims(uid: string, data: RoleDoc) {
  const { 
    roles = [], 
    orgIds = [], 
    scopes = [], 
    entitlements = [], 
    suspended = false 
  } = data;

  // Merge with current claims to retain system fields if needed
  const currentUser = await admin.auth().getUser(uid).catch(() => null);
  const baseClaims: any = currentUser?.customClaims ?? {};

  const nextClaims = {
    ...baseClaims,
    roles,
    orgIds,
    scopes,
    entitlements,
    suspended,
    // bump a version to help clients know to refresh
    claims_ver: (baseClaims.claims_ver || 0) + 1,
    lastUpdated: Date.now()
  };

  await admin.auth().setCustomUserClaims(uid, nextClaims);

  // Annotation in Firestore for audit/search convenience
  await db.collection('admin_claims_shadow').doc(uid).set({
    uid, 
    roles, 
    orgIds, 
    scopes, 
    entitlements, 
    suspended,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    claims_ver: nextClaims.claims_ver,
  }, { merge: true });

  // Force token refresh next client call
  await admin.auth().updateUser(uid, { disabled: false });

  return nextClaims;
}

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

    // Check if roles, orgIds, or scopes changed
    const rolesChanged = JSON.stringify(beforeData.roles) !== JSON.stringify(afterData.roles);
    const orgIdsChanged = JSON.stringify(beforeData.orgIds) !== JSON.stringify(afterData.orgIds);
    const scopesChanged = JSON.stringify(beforeData.scopes) !== JSON.stringify(afterData.scopes);
    const suspendedChanged = beforeData.suspended !== afterData.suspended;

    if (rolesChanged || orgIdsChanged || scopesChanged || suspendedChanged) {
      console.log(`Role change detected for user ${userId}, syncing claims`);

      // Build new claims
      const claims = await setClaims(userId, {
        roles: afterData.roles || [],
        orgIds: afterData.orgIds || [],
        scopes: afterData.scopes || [],
        entitlements: afterData.entitlements || [],
        suspended: afterData.suspended || false
      });

      // Append a tamper-evident audit event under each org
      const batch = db.batch();
      (afterData.orgIds ?? []).forEach((orgId: string) => {
        const ref = db.doc(`orgs/${orgId}/audit/${db.collection('_').doc().id}`);
        batch.set(ref, {
          type: 'CLAIMS_UPDATED',
          uid: userId,
          roles: afterData.roles ?? [],
          orgIds: afterData.orgIds ?? [],
          actor: 'system:onRoleChange',
          at: admin.firestore.FieldValue.serverTimestamp(),
          claims_ver: claims.claims_ver
        }, { merge: true });
      });
      await batch.commit();

      console.log(`Claims synced for user ${userId}, version ${claims.claims_ver}`);
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
    const claims = await setClaims(userId, {
      roles: userRole.roles || ['henri'],
      orgIds: userRole.orgIds || [],
      scopes: userRole.scopes || [],
      entitlements: userRole.entitlements || [],
      suspended: userRole.suspended || false
    });

    // Log the claim creation
    await db.collection('auditTrail').add({
      event: 'claims_created',
      userId,
      claims,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      triggeredBy: 'system'
    });

    console.log(`Initial claims created for user ${userId}, version ${claims.claims_ver}`);

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

// Sync Firestore roles to Firebase Custom Claims (legacy support)
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
    const claims = await setClaims(userId, {
      roles: userRole.roles || ['henri'],
      orgIds: userRole.orgIds || [],
      scopes: userRole.scopes || [],
      entitlements: userRole.entitlements || [],
      suspended: userRole.suspended || false
    });

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
    
    if (!adminClaims?.roles?.includes('admin') && !adminClaims?.roles?.includes('security_admin')) {
      throw new HttpsError('permission-denied', 'Admin privileges required');
    }

    // Get user role from Firestore
    const userRoleDoc = await db.collection('userRoles').doc(userId).get();
    
    if (!userRoleDoc.exists) {
      throw new HttpsError('not-found', 'User role not found');
    }

    const userRole = userRoleDoc.data() as UserRole;
    
    // Build new claims
    const claims = await setClaims(userId, {
      roles: userRole.roles || ['henri'],
      orgIds: userRole.orgIds || [],
      scopes: userRole.scopes || [],
      entitlements: userRole.entitlements || [],
      suspended: userRole.suspended || false
    });

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

// Optional HTTPS callable for admin-triggered refresh (legacy support)
export const refreshClaims = onCall(async (request) => {
  try {
    const { uid } = request.data;
    
    if (!request.auth?.token?.roles?.includes('admin') && !request.auth?.token?.roles?.includes('security_admin')) {
      throw new HttpsError('permission-denied', 'Admin privileges required');
    }
    
    const snap = await db.doc(`userRoles/${uid}`).get();
    if (!snap.exists) {
      throw new HttpsError('not-found', 'Role doc missing');
    }
    
    const userRole = snap.data() as UserRole;
    const claims = await setClaims(uid, {
      roles: userRole.roles || [],
      orgIds: userRole.orgIds || [],
      scopes: userRole.scopes || [],
      entitlements: userRole.entitlements || [],
      suspended: userRole.suspended || false
    });
    
    return { 
      ok: true, 
      claims_ver: claims.claims_ver 
    };
  } catch (error) {
    console.error('Error in refreshClaims:', error);
    throw new HttpsError('internal', 'Failed to refresh claims');
  }
});
