import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import fs from 'fs';

let testEnv: any;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-gutcheck',
    firestore: { rules: fs.readFileSync('firestore.rules', 'utf8') },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

function authedCtx(uid: string, roles: string[], orgIds: string[], email_verified = true, suspended = false) {
  return { uid, token: { roles, orgIds, email_verified, suspended } };
}

describe('Multi-tenant isolation', () => {
  test('partner can read in own org, not others', async () => {
    const partner = testEnv.authenticatedContext('partner1', authedCtx('partner1', ['partner'], ['orgA']).token);
    const dbA = partner.firestore();
    const refA = dbA.doc('orgs/orgA/founders/f1');
    
    // seed as admin
    const admin = testEnv.authenticatedContext('admin', authedCtx('admin', ['admin'], ['orgA']).token).firestore();
    await admin.doc('orgs/orgA/founders/f1').set({ name: 'HENRI', ownerUid: 'u123' });

    await assertSucceeds(refA.get());

    const other = testEnv.authenticatedContext('partner2', authedCtx('partner2', ['partner'], ['orgB']).token).firestore();
    await assertFails(other.doc('orgs/orgA/founders/f1').get());
  });

  test('admin can write audit, partner cannot delete audit', async () => {
    const admin = testEnv.authenticatedContext('admin', { 
      uid: 'admin', 
      token: { roles: ['admin'], orgIds: ['orgA'], email_verified: true }
    }).firestore();
    
    await assertSucceeds(admin.doc('orgs/orgA/audit/e1').set({ 
      type: 'TEST', 
      at: new Date().toISOString() 
    }));

    const partner = testEnv.authenticatedContext('p', { 
      uid: 'p', 
      token: { roles: ['partner'], orgIds: ['orgA'], email_verified: true }
    }).firestore();
    
    await assertFails(partner.doc('orgs/orgA/audit/e1').delete());
  });

  test('security_admin can approve role requests', async () => {
    const securityAdmin = testEnv.authenticatedContext('secAdmin', { 
      uid: 'secAdmin', 
      token: { roles: ['security_admin'], orgIds: ['orgA'], email_verified: true }
    }).firestore();
    
    await assertSucceeds(securityAdmin.doc('orgs/orgA/role_change_requests/req1').update({ 
      status: 'approved',
      reviewedBy: 'secAdmin',
      reviewedAt: new Date()
    }));
  });

  test('regular admin cannot approve role requests', async () => {
    const admin = testEnv.authenticatedContext('admin', { 
      uid: 'admin', 
      token: { roles: ['admin'], orgIds: ['orgA'], email_verified: true }
    }).firestore();
    
    await assertFails(admin.doc('orgs/orgA/role_change_requests/req1').update({ 
      status: 'approved' 
    }));
  });
});

describe('User profile access', () => {
  test('user can read own profile', async () => {
    const user = testEnv.authenticatedContext('user1', { 
      uid: 'user1', 
      token: { roles: ['henri'], orgIds: [], email_verified: true }
    }).firestore();
    
    await assertSucceeds(user.doc('users/user1').get());
  });

  test('user cannot read other user profile', async () => {
    const user = testEnv.authenticatedContext('user1', { 
      uid: 'user1', 
      token: { roles: ['henri'], orgIds: [], email_verified: true }
    }).firestore();
    
    await assertFails(user.doc('users/user2').get());
  });
});

describe('Legacy assessment sessions', () => {
  test('user can read own assessment session', async () => {
    const user = testEnv.authenticatedContext('user1', { 
      uid: 'user1', 
      token: { roles: ['henri'], orgIds: [], email_verified: true }
    }).firestore();
    
    // Seed data
    const admin = testEnv.authenticatedContext('admin', { 
      uid: 'admin', 
      token: { roles: ['admin'], orgIds: [], email_verified: true }
    }).firestore();
    
    await admin.doc('assessmentSessions/session1').set({ 
      userId: 'user1',
      partnerMetadata: { partnerId: 'partner1' }
    });

    await assertSucceeds(user.doc('assessmentSessions/session1').get());
  });

  test('partner can read cohort assessment sessions', async () => {
    const partner = testEnv.authenticatedContext('partner1', { 
      uid: 'partner1', 
      token: { roles: ['partner'], orgIds: [], partnerId: 'partner1', email_verified: true }
    }).firestore();
    
    // Seed data
    const admin = testEnv.authenticatedContext('admin', { 
      uid: 'admin', 
      token: { roles: ['admin'], orgIds: [], email_verified: true }
    }).firestore();
    
    await admin.doc('assessmentSessions/session1').set({ 
      userId: 'user1',
      partnerMetadata: { partnerId: 'partner1' }
    });

    await assertSucceeds(partner.doc('assessmentSessions/session1').get());
  });
});

describe('Global admin access', () => {
  test('platform_admin can access admin collection', async () => {
    const platformAdmin = testEnv.authenticatedContext('platformAdmin', { 
      uid: 'platformAdmin', 
      token: { roles: ['platform_admin'], orgIds: [], email_verified: true }
    }).firestore();
    
    await assertSucceeds(platformAdmin.doc('admin/users/index').get());
  });

  test('regular admin cannot access admin collection', async () => {
    const admin = testEnv.authenticatedContext('admin', { 
      uid: 'admin', 
      token: { roles: ['admin'], orgIds: ['orgA'], email_verified: true }
    }).firestore();
    
    await assertFails(admin.doc('admin/users/index').get());
  });
});

describe('Authentication requirements', () => {
  test('unauthenticated user cannot access protected data', async () => {
    const unauthed = testEnv.unauthenticatedContext().firestore();
    
    await assertFails(unauthed.doc('orgs/orgA/founders/f1').get());
    await assertFails(unauthed.doc('users/user1').get());
    await assertFails(unauthed.doc('assessmentSessions/session1').get());
  });

  test('suspended user cannot access data', async () => {
    const suspendedUser = testEnv.authenticatedContext('suspended', { 
      uid: 'suspended', 
      token: { roles: ['henri'], orgIds: [], email_verified: true, suspended: true }
    }).firestore();
    
    await assertFails(suspendedUser.doc('users/suspended').get());
  });

  test('unverified email user cannot access data', async () => {
    const unverifiedUser = testEnv.authenticatedContext('unverified', { 
      uid: 'unverified', 
      token: { roles: ['henri'], orgIds: [], email_verified: false }
    }).firestore();
    
    await assertFails(unverifiedUser.doc('users/unverified').get());
  });
});

describe('Role-based access control', () => {
  test('henri can access basic features', async () => {
    const henri = testEnv.authenticatedContext('henri', { 
      uid: 'henri', 
      token: { roles: ['henri'], orgIds: [], email_verified: true }
    }).firestore();
    
    await assertSucceeds(henri.doc('users/henri').get());
    await assertSucceeds(henri.doc('userPreferences/henri').get());
  });

  test('partner can access partner features', async () => {
    const partner = testEnv.authenticatedContext('partner', { 
      uid: 'partner', 
      token: { roles: ['partner'], orgIds: ['orgA'], email_verified: true }
    }).firestore();
    
    await assertSucceeds(partner.doc('orgs/orgA/cohorts/cohort1').get());
    await assertSucceeds(partner.doc('orgs/orgA/founders/founder1').get());
  });

  test('analyst can access analysis features', async () => {
    const analyst = testEnv.authenticatedContext('analyst', { 
      uid: 'analyst', 
      token: { roles: ['analyst'], orgIds: ['orgA'], email_verified: true }
    }).firestore();
    
    await assertSucceeds(analyst.doc('orgs/orgA/founders/founder1').get());
    await assertSucceeds(analyst.doc('orgs/orgA/scores/score1').get());
  });
});
