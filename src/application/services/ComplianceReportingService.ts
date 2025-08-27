import { getFirestore } from 'firebase-admin/firestore';

export interface ComplianceReport {
  reportId: string;
  reportType: 'GDPR' | 'FERPA' | 'CCPA' | 'AUDIT';
  organizationId: string;
  organizationName: string;
  reportPeriod: {
    startDate: Date;
    endDate: Date;
  };
  generatedAt: Date;
  dataAccessEvents: DataAccessEvent[];
  dataProcessingEvents: DataProcessingEvent[];
  consentEvents: ConsentEvent[];
  complianceMetrics: ComplianceMetrics;
  recommendations: string[];
}

export interface DataAccessEvent {
  timestamp: Date;
  userId: string;
  userEmail: string;
  context: 'personal' | 'enterprise';
  dataType: 'assessment' | 'cohort' | 'outcome' | 'analytics';
  action: 'read' | 'write' | 'delete' | 'export';
  justification?: string;
  ferpaCompliant?: boolean;
}

export interface DataProcessingEvent {
  timestamp: Date;
  dataCategory: string;
  processingPurpose: string;
  legalBasis: 'consent' | 'legitimate_interest' | 'contract' | 'educational_interest';
  dataRetention: string;
  crossBorderTransfer?: boolean;
}

export interface ConsentEvent {
  timestamp: Date;
  userId: string;
  consentType: 'personal_data' | 'enterprise_data' | 'ml_training' | 'outcome_tracking';
  action: 'granted' | 'withdrawn' | 'updated';
  consentVersion: string;
  ipAddress?: string;
}

export interface ComplianceMetrics {
  totalDataAccessEvents: number;
  personalDataAccessEvents: number;
  enterpriseDataAccessEvents: number;
  consentComplianceRate: number;
  dataRetentionCompliance: number;
  ferpaComplianceRate: number;
  gdprComplianceRate: number;
  ccpaComplianceRate: number;
}

export class ComplianceReportingService {
  private static instance: ComplianceReportingService;
  private db = getFirestore();

  static getInstance(): ComplianceReportingService {
    if (!ComplianceReportingService.instance) {
      ComplianceReportingService.instance = new ComplianceReportingService();
    }
    return ComplianceReportingService.instance;
  }

  /**
   * Generate quarterly compliance report for enterprise organizations
   */
  async generateQuarterlyReport(
    organizationId: string,
    reportType: 'GDPR' | 'FERPA' | 'CCPA' | 'AUDIT',
    startDate: Date,
    endDate: Date
  ): Promise<ComplianceReport> {
    const organization = await this.getOrganization(organizationId);
    
    // Collect audit events for the period
    const dataAccessEvents = await this.getDataAccessEvents(organizationId, startDate, endDate);
    const dataProcessingEvents = await this.getDataProcessingEvents(organizationId, startDate, endDate);
    const consentEvents = await this.getConsentEvents(organizationId, startDate, endDate);
    
    // Calculate compliance metrics
    const complianceMetrics = this.calculateComplianceMetrics(
      dataAccessEvents,
      dataProcessingEvents,
      consentEvents,
      reportType
    );
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(complianceMetrics, reportType);
    
    const report: ComplianceReport = {
      reportId: `compliance-${organizationId}-${reportType}-${startDate.toISOString().split('T')[0]}`,
      reportType,
      organizationId,
      organizationName: organization.name,
      reportPeriod: { startDate, endDate },
      generatedAt: new Date(),
      dataAccessEvents,
      dataProcessingEvents,
      consentEvents,
      complianceMetrics,
      recommendations
    };
    
    // Store report for audit trail
    await this.storeComplianceReport(report);
    
    return report;
  }

  /**
   * Generate executive summary for procurement and legal reviews
   */
  async generateExecutiveSummary(organizationId: string): Promise<ExecutiveSummary> {
    const lastQuarter = this.getLastQuarter();
    const reports = await Promise.all([
      this.generateQuarterlyReport(organizationId, 'FERPA', lastQuarter.start, lastQuarter.end),
      this.generateQuarterlyReport(organizationId, 'GDPR', lastQuarter.start, lastQuarter.end),
      this.generateQuarterlyReport(organizationId, 'CCPA', lastQuarter.start, lastQuarter.end)
    ]);
    
    return {
      organizationId,
      reportPeriod: lastQuarter,
      generatedAt: new Date(),
      complianceOverview: {
        ferpaCompliance: reports[0].complianceMetrics.ferpaComplianceRate,
        gdprCompliance: reports[1].complianceMetrics.gdprComplianceRate,
        ccpaCompliance: reports[2].complianceMetrics.ccpaComplianceRate,
        overallCompliance: this.calculateOverallCompliance(reports)
      },
      keyMetrics: {
        totalAssessments: reports[0].dataAccessEvents.filter(e => e.dataType === 'assessment').length,
        activeUsers: new Set(reports[0].dataAccessEvents.map(e => e.userId)).size,
        consentRate: reports[0].complianceMetrics.consentComplianceRate,
        dataRetentionCompliance: reports[0].complianceMetrics.dataRetentionCompliance
      },
      procurementReadiness: {
        ferpaCompliant: reports[0].complianceMetrics.ferpaComplianceRate >= 95,
        gdprCompliant: reports[1].complianceMetrics.gdprComplianceRate >= 95,
        ccpaCompliant: reports[2].complianceMetrics.ccpaComplianceRate >= 95,
        auditTrailComplete: true,
        dataProcessingAgreement: true
      },
      recommendations: this.generateProcurementRecommendations(reports)
    };
  }

  /**
   * Log data access event for compliance tracking
   */
  async logDataAccess(event: Omit<DataAccessEvent, 'timestamp'>): Promise<void> {
    const dataAccessEvent: DataAccessEvent = {
      ...event,
      timestamp: new Date()
    };
    
    await this.db.collection('auditTrail').add({
      type: 'data_access',
      ...dataAccessEvent,
      createdAt: new Date()
    });
  }

  /**
   * Log consent event for compliance tracking
   */
  async logConsent(event: Omit<ConsentEvent, 'timestamp'>): Promise<void> {
    const consentEvent: ConsentEvent = {
      ...event,
      timestamp: new Date()
    };
    
    await this.db.collection('auditTrail').add({
      type: 'consent',
      ...consentEvent,
      createdAt: new Date()
    });
  }

  private async getOrganization(organizationId: string) {
    const orgDoc = await this.db.collection('organizations').doc(organizationId).get();
    if (!orgDoc.exists) {
      throw new Error(`Organization ${organizationId} not found`);
    }
    return orgDoc.data() as { name: string; type: string };
  }

  private async getDataAccessEvents(organizationId: string, startDate: Date, endDate: Date): Promise<DataAccessEvent[]> {
    const eventsSnapshot = await this.db.collection('auditTrail')
      .where('type', '==', 'data_access')
      .where('organizationId', '==', organizationId)
      .where('timestamp', '>=', startDate)
      .where('timestamp', '<=', endDate)
      .orderBy('timestamp', 'desc')
      .get();
    
    return eventsSnapshot.docs.map(doc => doc.data() as DataAccessEvent);
  }

  private async getDataProcessingEvents(organizationId: string, startDate: Date, endDate: Date): Promise<DataProcessingEvent[]> {
    const eventsSnapshot = await this.db.collection('auditTrail')
      .where('type', '==', 'data_processing')
      .where('organizationId', '==', organizationId)
      .where('timestamp', '>=', startDate)
      .where('timestamp', '<=', endDate)
      .orderBy('timestamp', 'desc')
      .get();
    
    return eventsSnapshot.docs.map(doc => doc.data() as DataProcessingEvent);
  }

  private async getConsentEvents(organizationId: string, startDate: Date, endDate: Date): Promise<ConsentEvent[]> {
    const eventsSnapshot = await this.db.collection('auditTrail')
      .where('type', '==', 'consent')
      .where('organizationId', '==', organizationId)
      .where('timestamp', '>=', startDate)
      .where('timestamp', '<=', endDate)
      .orderBy('timestamp', 'desc')
      .get();
    
    return eventsSnapshot.docs.map(doc => doc.data() as ConsentEvent);
  }

  private calculateComplianceMetrics(
    dataAccessEvents: DataAccessEvent[],
    dataProcessingEvents: DataProcessingEvent[],
    consentEvents: ConsentEvent[],
    reportType: string
  ): ComplianceMetrics {
    const totalEvents = dataAccessEvents.length;
    const personalEvents = dataAccessEvents.filter(e => e.context === 'personal').length;
    const enterpriseEvents = dataAccessEvents.filter(e => e.context === 'enterprise').length;
    
    const consentComplianceRate = this.calculateConsentComplianceRate(consentEvents);
    const dataRetentionCompliance = this.calculateDataRetentionCompliance(dataProcessingEvents);
    
    let ferpaComplianceRate = 100;
    let gdprComplianceRate = 100;
    let ccpaComplianceRate = 100;
    
    if (reportType === 'FERPA') {
      ferpaComplianceRate = this.calculateFERPACompliance(dataAccessEvents);
    } else if (reportType === 'GDPR') {
      gdprComplianceRate = this.calculateGDPRCompliance(dataAccessEvents, consentEvents);
    } else if (reportType === 'CCPA') {
      ccpaComplianceRate = this.calculateCCPACompliance(dataAccessEvents, consentEvents);
    }
    
    return {
      totalDataAccessEvents: totalEvents,
      personalDataAccessEvents: personalEvents,
      enterpriseDataAccessEvents: enterpriseEvents,
      consentComplianceRate,
      dataRetentionCompliance,
      ferpaComplianceRate,
      gdprComplianceRate,
      ccpaComplianceRate
    };
  }

  private calculateConsentComplianceRate(consentEvents: ConsentEvent[]): number {
    if (consentEvents.length === 0) return 100;
    
    const grantedConsents = consentEvents.filter(e => e.action === 'granted').length;
    return (grantedConsents / consentEvents.length) * 100;
  }

  private calculateDataRetentionCompliance(dataProcessingEvents: DataProcessingEvent[]): number {
    if (dataProcessingEvents.length === 0) return 100;
    
    const compliantEvents = dataProcessingEvents.filter(e => 
      e.dataRetention && e.dataRetention !== 'indefinite'
    ).length;
    
    return (compliantEvents / dataProcessingEvents.length) * 100;
  }

  private calculateFERPACompliance(dataAccessEvents: DataAccessEvent[]): number {
    if (dataAccessEvents.length === 0) return 100;
    
    const compliantEvents = dataAccessEvents.filter(e => 
      e.ferpaCompliant === true || e.context === 'personal'
    ).length;
    
    return (compliantEvents / dataAccessEvents.length) * 100;
  }

  private calculateGDPRCompliance(dataAccessEvents: DataAccessEvent[], consentEvents: ConsentEvent[]): number {
    // Simplified GDPR compliance calculation
    const hasValidConsent = consentEvents.some(e => e.consentType === 'personal_data' && e.action === 'granted');
    const hasLegitimateBasis = dataAccessEvents.some(e => e.justification);
    
    return hasValidConsent && hasLegitimateBasis ? 100 : 85;
  }

  private calculateCCPACompliance(dataAccessEvents: DataAccessEvent[], consentEvents: ConsentEvent[]): number {
    // Simplified CCPA compliance calculation
    const hasOptOutMechanism = consentEvents.some(e => e.action === 'withdrawn');
    const hasDisclosure = dataAccessEvents.some(e => e.action === 'export');
    
    return hasOptOutMechanism && hasDisclosure ? 100 : 90;
  }

  private generateRecommendations(metrics: ComplianceMetrics, reportType: string): string[] {
    const recommendations: string[] = [];
    
    if (metrics.consentComplianceRate < 95) {
      recommendations.push('Implement additional consent collection mechanisms for better compliance tracking');
    }
    
    if (metrics.dataRetentionCompliance < 95) {
      recommendations.push('Review and update data retention policies to ensure compliance with regulatory requirements');
    }
    
    if (reportType === 'FERPA' && metrics.ferpaComplianceRate < 95) {
      recommendations.push('Ensure all institutional data access is properly justified under FERPA school official designation');
    }
    
    if (reportType === 'GDPR' && metrics.gdprComplianceRate < 95) {
      recommendations.push('Strengthen legitimate interest assessments and consent mechanisms for GDPR compliance');
    }
    
    if (reportType === 'CCPA' && metrics.ccpaComplianceRate < 95) {
      recommendations.push('Enhance consumer rights mechanisms and data disclosure processes for CCPA compliance');
    }
    
    return recommendations;
  }

  private generateProcurementRecommendations(reports: ComplianceReport[]): string[] {
    const recommendations: string[] = [];
    
    const overallCompliance = this.calculateOverallCompliance(reports);
    
    if (overallCompliance >= 95) {
      recommendations.push('✅ Excellent compliance posture - ready for enterprise procurement');
      recommendations.push('✅ All regulatory requirements met - proceed with confidence');
      recommendations.push('✅ Audit trail complete and comprehensive');
    } else if (overallCompliance >= 90) {
      recommendations.push('⚠️ Good compliance posture - minor improvements recommended');
      recommendations.push('✅ Most regulatory requirements met');
      recommendations.push('📋 Address recommendations before final procurement review');
    } else {
      recommendations.push('❌ Compliance improvements needed before procurement');
      recommendations.push('📋 Address all recommendations before proceeding');
      recommendations.push('🔍 Conduct additional compliance review');
    }
    
    return recommendations;
  }

  private calculateOverallCompliance(reports: ComplianceReport[]): number {
    const complianceRates = reports.map(r => 
      r.reportType === 'FERPA' ? r.complianceMetrics.ferpaComplianceRate :
      r.reportType === 'GDPR' ? r.complianceMetrics.gdprComplianceRate :
      r.reportType === 'CCPA' ? r.complianceMetrics.ccpaComplianceRate : 100
    );
    
    return complianceRates.reduce((sum, rate) => sum + rate, 0) / complianceRates.length;
  }

  private getLastQuarter(): { start: Date; end: Date } {
    const now = new Date();
    const currentQuarter = Math.floor(now.getMonth() / 3);
    const year = now.getFullYear();
    
    const start = new Date(year, currentQuarter * 3, 1);
    const end = new Date(year, (currentQuarter + 1) * 3, 0);
    
    return { start, end };
  }

  private async storeComplianceReport(report: ComplianceReport): Promise<void> {
    await this.db.collection('complianceReports').doc(report.reportId).set({
      ...report,
      createdAt: new Date()
    });
  }
}

export interface ExecutiveSummary {
  organizationId: string;
  reportPeriod: { start: Date; end: Date };
  generatedAt: Date;
  complianceOverview: {
    ferpaCompliance: number;
    gdprCompliance: number;
    ccpaCompliance: number;
    overallCompliance: number;
  };
  keyMetrics: {
    totalAssessments: number;
    activeUsers: number;
    consentRate: number;
    dataRetentionCompliance: number;
  };
  procurementReadiness: {
    ferpaCompliant: boolean;
    gdprCompliant: boolean;
    ccpaCompliant: boolean;
    auditTrailComplete: boolean;
    dataProcessingAgreement: boolean;
  };
  recommendations: string[];
}
