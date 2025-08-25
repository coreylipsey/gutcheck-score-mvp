'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthContext } from '@/presentation/providers/AuthProvider';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { initializeApp } from 'firebase/app';
import { 
  Users, 
  Shield, 
  UserPlus, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  Settings
} from 'lucide-react';

// Initialize Firebase for client-side
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

interface UserRole {
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

interface RoleChangeRequest {
  id: string;
  userId: string;
  email: string;
  requestedRoles: string[];
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  reason?: string;
}

export default function AdminRoles() {
  const { user } = useAuthContext();
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [roleRequests, setRoleRequests] = useState<RoleChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [newRole, setNewRole] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUserRoles();
    fetchRoleRequests();
  }, []);

  const fetchUserRoles = async () => {
    try {
      // This would call a Cloud Function to get all user roles
      // For now, using mock data
      setUserRoles([
        {
          userId: 'user1',
          email: 'john@example.com',
          roles: ['henri'],
          scopes: [],
          entitlements: [],
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z'
        },
        {
          userId: 'user2',
          email: 'partner@university.edu',
          roles: ['henri', 'partner'],
          partnerId: 'partner1',
          scopes: ['cohort_management'],
          entitlements: ['basic_analytics'],
          partnerData: {
            organizationName: 'Example University',
            organizationType: 'university',
            role: 'program_director',
            cohortsCount: 2
          },
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z'
        }
      ]);
    } catch (error) {
      console.error('Error fetching user roles:', error);
    }
  };

  const fetchRoleRequests = async () => {
    try {
      // This would call a Cloud Function to get pending role requests
      setRoleRequests([
        {
          id: 'req1',
          userId: 'user3',
          email: 'newpartner@college.edu',
          requestedRoles: ['partner'],
          requestedBy: 'user3',
          requestedAt: '2025-01-01T10:00:00Z',
          status: 'pending'
        }
      ]);
    } catch (error) {
      console.error('Error fetching role requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRoles: string[]) => {
    try {
      setSubmitting(true);
      
      // This would call a Cloud Function to change user roles
      console.log(`Changing roles for user ${userId} to:`, newRoles);
      
      // Refresh the user roles list
      await fetchUserRoles();
      setSelectedUser(null);
      setNewRole('');
      
    } catch (error) {
      console.error('Error changing user roles:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleRequest = async (requestId: string, approved: boolean) => {
    try {
      setSubmitting(true);
      
      // This would call a Cloud Function to approve/reject role requests
      console.log(`${approved ? 'Approving' : 'Rejecting'} role request ${requestId}`);
      
      // Refresh the role requests list
      await fetchRoleRequests();
      
    } catch (error) {
      console.error('Error handling role request:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const refreshUserClaims = async (userId: string) => {
    try {
      const refreshUserClaims = httpsCallable(functions, 'refreshUserClaims');
      await refreshUserClaims({ userId });
      console.log(`Claims refreshed for user ${userId}`);
    } catch (error) {
      console.error('Error refreshing user claims:', error);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-[#0A1F44] to-[#147AFF] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="mt-4 text-white">Loading admin panel...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[#0A1F44] to-[#147AFF] p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl text-white mb-2">Identity & Role Management</h1>
              <p className="text-blue-200">Enterprise-grade access control and audit trail</p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <Shield className="w-4 h-4 text-white" />
              <span className="text-white text-sm">Admin Access</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/95 backdrop-blur-sm border-0 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{userRoles.length}</p>
                </div>
                <Users className="w-6 h-6 text-[#147AFF]" />
              </div>
            </div>
            
            <div className="bg-white/95 backdrop-blur-sm border-0 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Partners</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {userRoles.filter(u => u.roles.includes('partner')).length}
                  </p>
                </div>
                <Shield className="w-6 h-6 text-[#19C2A0]" />
              </div>
            </div>
            
            <div className="bg-white/95 backdrop-blur-sm border-0 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {roleRequests.filter(r => r.status === 'pending').length}
                  </p>
                </div>
                <Clock className="w-6 h-6 text-[#FF6B00]" />
              </div>
            </div>
            
            <div className="bg-white/95 backdrop-blur-sm border-0 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Admins</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {userRoles.filter(u => u.roles.includes('admin')).length}
                  </p>
                </div>
                <Settings className="w-6 h-6 text-[#0A1F44]" />
              </div>
            </div>
          </div>

          {/* Role Management */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Roles */}
            <div className="bg-white/95 backdrop-blur-sm border-0 rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">User Roles</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {userRoles.map((userRole) => (
                    <div key={userRole.userId} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{userRole.email}</p>
                          <p className="text-sm text-gray-600">ID: {userRole.userId}</p>
                        </div>
                        <button
                          onClick={() => refreshUserClaims(userRole.userId)}
                          className="p-2 text-gray-500 hover:text-gray-700"
                          title="Refresh claims"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {userRole.roles.map((role) => (
                          <span
                            key={role}
                            className={`px-2 py-1 text-xs rounded-full ${
                              role === 'admin' ? 'bg-red-100 text-red-800' :
                              role === 'partner' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                      
                      {userRole.partnerData && (
                        <div className="text-sm text-gray-600">
                          <p>Organization: {userRole.partnerData.organizationName}</p>
                          <p>Role: {userRole.partnerData.role}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Role Requests */}
            <div className="bg-white/95 backdrop-blur-sm border-0 rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Role Requests</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {roleRequests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{request.email}</p>
                          <p className="text-sm text-gray-600">Requested: {new Date(request.requestedAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleRoleRequest(request.id, true)}
                                disabled={submitting}
                                className="p-2 bg-green-100 text-green-800 rounded-full hover:bg-green-200"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRoleRequest(request.id, false)}
                                disabled={submitting}
                                className="p-2 bg-red-100 text-red-800 rounded-full hover:bg-red-200"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {request.status === 'approved' && (
                            <span className="text-green-600 text-sm">✓ Approved</span>
                          )}
                          {request.status === 'rejected' && (
                            <span className="text-red-600 text-sm">✗ Rejected</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {request.requestedRoles.map((role) => (
                          <span
                            key={role}
                            className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {roleRequests.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No pending role requests</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Audit Trail */}
          <div className="bg-white/95 backdrop-blur-sm border-0 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Audit Events</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Claims updated for user partner@university.edu</span>
                  <span className="text-gray-400">2 minutes ago</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">Role request approved for newpartner@college.edu</span>
                  <span className="text-gray-400">1 hour ago</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-600">User john@example.com promoted to partner</span>
                  <span className="text-gray-400">3 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
