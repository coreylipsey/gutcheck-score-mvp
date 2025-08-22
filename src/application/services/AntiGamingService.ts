export interface GamingDetectionResult {
  isSuspicious: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  reasons: string[];
  shouldBlock: boolean;
}

export interface AnonymousSession {
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  completedAt: Date;
  score: number;
  responsePattern: string; // Hash of response pattern for comparison
}

export class AntiGamingService {
  private static readonly MAX_ANONYMOUS_ASSESSMENTS_PER_IP = 3; // Per 30 days
  private static readonly MAX_ANONYMOUS_ASSESSMENTS_PER_DEVICE = 2; // Per 30 days
  private static readonly SUSPICIOUS_SCORE_THRESHOLD = 85; // Very high scores are suspicious
  private static readonly MIN_TIME_BETWEEN_ASSESSMENTS = 7 * 24 * 60 * 60 * 1000; // 7 days minimum

  /**
   * Check if an anonymous assessment should be allowed
   */
  static async checkAnonymousAssessment(
    ipAddress: string,
    userAgent: string,
    deviceFingerprint?: string
  ): Promise<GamingDetectionResult> {
    const reasons: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    // Check IP-based frequency
    const ipAssessments = await this.getAnonymousAssessmentsByIP(ipAddress);
    if (ipAssessments.length >= this.MAX_ANONYMOUS_ASSESSMENTS_PER_IP) {
      reasons.push(`Too many assessments from this IP (${ipAssessments.length}/${this.MAX_ANONYMOUS_ASSESSMENTS_PER_IP})`);
      riskLevel = 'high';
    }

    // Check device-based frequency (if fingerprint available)
    if (deviceFingerprint) {
      const deviceAssessments = await this.getAnonymousAssessmentsByDevice(deviceFingerprint);
      if (deviceAssessments.length >= this.MAX_ANONYMOUS_ASSESSMENTS_PER_DEVICE) {
        reasons.push(`Too many assessments from this device (${deviceAssessments.length}/${this.MAX_ANONYMOUS_ASSESSMENTS_PER_DEVICE})`);
        riskLevel = 'high';
      }
    }

    // Check recent assessment timing
    const recentAssessment = await this.getMostRecentAnonymousAssessment(ipAddress);
    if (recentAssessment) {
      const timeSinceLast = Date.now() - recentAssessment.completedAt.getTime();
      if (timeSinceLast < this.MIN_TIME_BETWEEN_ASSESSMENTS) {
        reasons.push('Assessment completed too recently');
        riskLevel = 'medium';
      }
    }

    const isSuspicious = reasons.length > 0;
    const shouldBlock = riskLevel === 'high';

    return {
      isSuspicious,
      riskLevel,
      reasons,
      shouldBlock
    };
  }

  /**
   * Analyze assessment responses for gaming patterns
   */
  static analyzeResponsePattern(
    responses: Array<{ questionId: string; response: string | number | string[] }>,
    score: number
  ): GamingDetectionResult {
    const reasons: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    // Check for suspiciously high scores
    if (score >= this.SUSPICIOUS_SCORE_THRESHOLD) {
      reasons.push(`Unusually high score (${score}/100)`);
      riskLevel = 'medium';
    }

    // Check for response consistency (same answers across multiple assessments)
    const responseHash = this.generateResponseHash(responses);
    const isDuplicatePattern = this.checkForDuplicatePattern(responseHash);
    if (isDuplicatePattern) {
      reasons.push('Duplicate response pattern detected');
      riskLevel = 'high';
    }

    // Check for suspicious response timing (too fast completion)
    // This would be implemented with actual timing data

    const isSuspicious = reasons.length > 0;
    const shouldBlock = riskLevel === 'high';

    return {
      isSuspicious,
      riskLevel,
      reasons,
      shouldBlock
    };
  }

  /**
   * Record anonymous assessment for tracking
   */
  static async recordAnonymousAssessment(
    sessionId: string,
    ipAddress: string,
    userAgent: string,
    deviceFingerprint: string | null,
    score: number,
    responses: Array<{ questionId: string; response: string | number | string[] }>,
    completionTime: number // Time taken to complete in milliseconds
  ): Promise<void> {
    const anonymousSession: AnonymousSession = {
      sessionId,
      ipAddress,
      userAgent,
      createdAt: new Date(),
      completedAt: new Date(),
      score,
      responsePattern: this.generateResponseHash(responses)
    };

    // Store in Firestore for tracking
    await this.storeAnonymousSession(anonymousSession);
  }

  /**
   * Generate hash of response pattern for comparison
   */
  private static generateResponseHash(responses: Array<{ questionId: string; response: string | number | string[] }>): string {
    const sortedResponses = responses
      .sort((a, b) => a.questionId.localeCompare(b.questionId))
      .map(r => `${r.questionId}:${JSON.stringify(r.response)}`)
      .join('|');
    
    // Simple hash function (in production, use a proper crypto hash)
    let hash = 0;
    for (let i = 0; i < sortedResponses.length; i++) {
      const char = sortedResponses.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  /**
   * Check for duplicate response patterns
   */
  private static checkForDuplicatePattern(responseHash: string): boolean {
    // This would check against stored patterns in Firestore
    // For now, return false (implement with actual data)
    return false;
  }

  // Firestore methods
  private static async getAnonymousAssessmentsByIP(ipAddress: string): Promise<AnonymousSession[]> {
    const { FirestoreAnonymousSessionRepository } = await import('../../infrastructure/repositories/FirestoreAnonymousSessionRepository');
    const repository = new FirestoreAnonymousSessionRepository();
    return repository.getAssessmentsByIP(ipAddress);
  }

  private static async getAnonymousAssessmentsByDevice(deviceFingerprint: string): Promise<AnonymousSession[]> {
    const { FirestoreAnonymousSessionRepository } = await import('../../infrastructure/repositories/FirestoreAnonymousSessionRepository');
    const repository = new FirestoreAnonymousSessionRepository();
    return repository.getAssessmentsByDevice(deviceFingerprint);
  }

  private static async getMostRecentAnonymousAssessment(ipAddress: string): Promise<AnonymousSession | null> {
    const { FirestoreAnonymousSessionRepository } = await import('../../infrastructure/repositories/FirestoreAnonymousSessionRepository');
    const repository = new FirestoreAnonymousSessionRepository();
    return repository.getMostRecentByIP(ipAddress);
  }

  private static async storeAnonymousSession(session: AnonymousSession, deviceFingerprint?: string): Promise<void> {
    const { FirestoreAnonymousSessionRepository } = await import('../../infrastructure/repositories/FirestoreAnonymousSessionRepository');
    const repository = new FirestoreAnonymousSessionRepository();
    await repository.storeSession(session, deviceFingerprint);
  }
} 