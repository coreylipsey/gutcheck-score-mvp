/**
 * Generate a simple device fingerprint for anonymous user tracking
 * This is a basic implementation - in production, use a more sophisticated library
 */
export function generateDeviceFingerprint(): string {
  if (typeof window === 'undefined') {
    return 'server-side';
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return 'no-canvas';
  }

  // Create a unique fingerprint based on browser capabilities
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    (navigator as any).deviceMemory || 'unknown',
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    'webgl-' + ((ctx as any).getParameter((ctx as any).VENDOR) + (ctx as any).getParameter((ctx as any).RENDERER)).slice(0, 50)
  ].join('|');

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return hash.toString(36); // Convert to base36 for shorter string
}

/**
 * Get client IP address (this would need to be passed from the server)
 */
export function getClientIP(): string {
  // In a real implementation, this would be passed from the server
  // For now, return a placeholder
  return 'unknown';
}

/**
 * Get user agent string
 */
export function getUserAgent(): string {
  if (typeof window === 'undefined') {
    return 'server-side';
  }
  return navigator.userAgent;
} 