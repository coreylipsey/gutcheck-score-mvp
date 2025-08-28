// Google Analytics 4 Tracking for Gutcheck.AI
// This provides comprehensive analytics for partner and cohort management

import { getAnalytics, logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let analytics: any = null;

// Initialize analytics only on client side
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Analytics initialization failed:', error);
  }
}

// Track custom events
export const trackEvent = (
  eventName: string,
  parameters: Record<string, any> = {}
) => {
  if (analytics) {
    try {
      logEvent(analytics, eventName, parameters);
    } catch (error) {
      console.warn('Failed to track event:', error);
    }
  }
};

// Partner Analytics Events
export const partnerAnalytics = {
  // Partner onboarding
  partnerCreated: (partnerData: {
    partnerId: string;
    partnerName: string;
    partnerEmail: string;
    organizationType: string;
  }) => {
    trackEvent('partner_created', {
      partner_id: partnerData.partnerId,
      partner_name: partnerData.partnerName,
      partner_email: partnerData.partnerEmail,
      organization_type: partnerData.organizationType,
      event_category: 'partner_management',
    });
  },

  // Cohort creation
  cohortCreated: (cohortData: {
    cohortId: string;
    partnerId: string;
    cohortName: string;
    targetSize: number;
  }) => {
    trackEvent('cohort_created', {
      cohort_id: cohortData.cohortId,
      partner_id: cohortData.partnerId,
      cohort_name: cohortData.cohortName,
      target_size: cohortData.targetSize,
      event_category: 'cohort_management',
    });
  },

  // Assessment events
  assessmentStarted: (assessmentData: {
    sessionId: string;
    partnerId?: string;
    cohortId?: string;
    userId: string;
  }) => {
    trackEvent('assessment_started', {
      session_id: assessmentData.sessionId,
      partner_id: assessmentData.partnerId || 'direct',
      cohort_id: assessmentData.cohortId || 'direct',
      user_id: assessmentData.userId,
      event_category: 'assessment',
    });
  },

  assessmentCompleted: (assessmentData: {
    sessionId: string;
    partnerId?: string;
    cohortId?: string;
    userId: string;
    overallScore: number;
    consentForML: boolean;
  }) => {
    trackEvent('assessment_completed', {
      session_id: assessmentData.sessionId,
      partner_id: assessmentData.partnerId || 'direct',
      cohort_id: assessmentData.cohortId || 'direct',
      user_id: assessmentData.userId,
      overall_score: assessmentData.overallScore,
      consent_for_ml: assessmentData.consentForML,
      event_category: 'assessment',
    });
  },

  // Dashboard access
  dashboardAccessed: (userData: {
    userId: string;
    userRole: string;
    partnerId?: string;
  }) => {
    trackEvent('dashboard_accessed', {
      user_id: userData.userId,
      user_role: userData.userRole,
      partner_id: userData.partnerId || 'none',
      event_category: 'user_engagement',
    });
  },

  // Partner dashboard specific
  partnerDashboardViewed: (partnerData: {
    partnerId: string;
    partnerName: string;
    cohortsCount: number;
    totalAssessments: number;
  }) => {
    trackEvent('partner_dashboard_viewed', {
      partner_id: partnerData.partnerId,
      partner_name: partnerData.partnerName,
      cohorts_count: partnerData.cohortsCount,
      total_assessments: partnerData.totalAssessments,
      event_category: 'partner_analytics',
    });
  },

  // Cohort analytics
  cohortAnalyticsViewed: (cohortData: {
    cohortId: string;
    partnerId: string;
    cohortName: string;
    completionRate: number;
    averageScore: number;
  }) => {
    trackEvent('cohort_analytics_viewed', {
      cohort_id: cohortData.cohortId,
      partner_id: cohortData.partnerId,
      cohort_name: cohortData.cohortName,
      completion_rate: cohortData.completionRate,
      average_score: cohortData.averageScore,
      event_category: 'cohort_analytics',
    });
  },

  // User role changes
  userRoleChanged: (roleData: {
    userId: string;
    oldRole: string;
    newRole: string;
    changedBy: string;
  }) => {
    trackEvent('user_role_changed', {
      user_id: roleData.userId,
      old_role: roleData.oldRole,
      new_role: roleData.newRole,
      changed_by: roleData.changedBy,
      event_category: 'user_management',
    });
  },
};

// Set user properties for segmentation
export const setUserProperties = (userData: {
  userId: string;
  userRole: string;
  partnerId?: string;
  partnerName?: string;
}) => {
  if (analytics) {
    try {
      setUserId(analytics, userData.userId);
      setUserProperties(analytics, {
        user_role: userData.userRole,
        partner_id: userData.partnerId || 'none',
        partner_name: userData.partnerName || 'none',
      });
    } catch (error) {
      console.warn('Failed to set user properties:', error);
    }
  }
};

// Track conversion funnels
export const funnelAnalytics = {
  // Partner onboarding funnel
  partnerOnboardingStep: (step: string, partnerId?: string) => {
    trackEvent('partner_onboarding_step', {
      step,
      partner_id: partnerId || 'unknown',
      event_category: 'conversion_funnel',
    });
  },

  // Assessment completion funnel
  assessmentStep: (step: string, sessionId: string) => {
    trackEvent('assessment_step', {
      step,
      session_id: sessionId,
      event_category: 'conversion_funnel',
    });
  },
};

// Performance tracking
export const performanceAnalytics = {
  // Page load times
  pageLoadTime: (pageName: string, loadTime: number) => {
    trackEvent('page_load_time', {
      page_name: pageName,
      load_time_ms: loadTime,
      event_category: 'performance',
    });
  },

  // API response times
  apiResponseTime: (endpoint: string, responseTime: number) => {
    trackEvent('api_response_time', {
      endpoint,
      response_time_ms: responseTime,
      event_category: 'performance',
    });
  },
};

// Error tracking
export const errorAnalytics = {
  // JavaScript errors
  jsError: (error: Error, context?: string) => {
    trackEvent('js_error', {
      error_message: error.message,
      error_stack: error.stack,
      context: context || 'unknown',
      event_category: 'errors',
    });
  },

  // API errors
  apiError: (endpoint: string, statusCode: number, errorMessage: string) => {
    trackEvent('api_error', {
      endpoint,
      status_code: statusCode,
      error_message: errorMessage,
      event_category: 'errors',
    });
  },
};
