'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { setUserProperties, partnerAnalytics, funnelAnalytics } from '@/lib/analytics';
import { useAuthContext } from './AuthProvider';

interface GoogleAnalyticsContextType {
  trackPartnerCreated: (partnerData: any) => void;
  trackCohortCreated: (cohortData: any) => void;
  trackAssessmentStarted: (assessmentData: any) => void;
  trackAssessmentCompleted: (assessmentData: any) => void;
  trackDashboardAccessed: (userData: any) => void;
  trackPartnerDashboardViewed: (partnerData: any) => void;
  trackCohortAnalyticsViewed: (cohortData: any) => void;
  trackPartnerOnboardingStep: (step: string, partnerId?: string) => void;
  trackAssessmentStep: (step: string, sessionId: string) => void;
}

const GoogleAnalyticsContext = createContext<GoogleAnalyticsContextType | undefined>(undefined);

export const useGoogleAnalytics = () => {
  const context = useContext(GoogleAnalyticsContext);
  if (context === undefined) {
    throw new Error('useGoogleAnalytics must be used within a GoogleAnalyticsProvider');
  }
  return context;
};

interface GoogleAnalyticsProviderProps {
  children: ReactNode;
}

export const GoogleAnalyticsProvider = ({ children }: GoogleAnalyticsProviderProps) => {
  const { user } = useAuthContext();

  // Set user properties when user changes
  useEffect(() => {
    if (user) {
      setUserProperties({
        userId: user.uid,
        userRole: 'user', // This will be updated when we get user roles
        partnerId: 'none',
        partnerName: 'none',
      });
    }
  }, [user]);

  const trackPartnerCreated = (partnerData: any) => {
    partnerAnalytics.partnerCreated(partnerData);
  };

  const trackCohortCreated = (cohortData: any) => {
    partnerAnalytics.cohortCreated(cohortData);
  };

  const trackAssessmentStarted = (assessmentData: any) => {
    partnerAnalytics.assessmentStarted(assessmentData);
  };

  const trackAssessmentCompleted = (assessmentData: any) => {
    partnerAnalytics.assessmentCompleted(assessmentData);
  };

  const trackDashboardAccessed = (userData: any) => {
    partnerAnalytics.dashboardAccessed(userData);
  };

  const trackPartnerDashboardViewed = (partnerData: any) => {
    partnerAnalytics.partnerDashboardViewed(partnerData);
  };

  const trackCohortAnalyticsViewed = (cohortData: any) => {
    partnerAnalytics.cohortAnalyticsViewed(cohortData);
  };

  const trackPartnerOnboardingStep = (step: string, partnerId?: string) => {
    funnelAnalytics.partnerOnboardingStep(step, partnerId);
  };

  const trackAssessmentStep = (step: string, sessionId: string) => {
    funnelAnalytics.assessmentStep(step, sessionId);
  };

  const value: GoogleAnalyticsContextType = {
    trackPartnerCreated,
    trackCohortCreated,
    trackAssessmentStarted,
    trackAssessmentCompleted,
    trackDashboardAccessed,
    trackPartnerDashboardViewed,
    trackCohortAnalyticsViewed,
    trackPartnerOnboardingStep,
    trackAssessmentStep,
  };

  return (
    <GoogleAnalyticsContext.Provider value={value}>
      {children}
    </GoogleAnalyticsContext.Provider>
  );
};
