import { detectSensitiveInfo } from './utils';

export interface ModerationResult {
  status: 'APPROVED' | 'FLAGGED' | 'REJECTED';
  issues: ModerationIssue[];
  requiresHumanReview: boolean;
  recommendedAction: string;
}

export interface ModerationIssue {
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  text: string;
  suggestion: string;
}

/**
 * Moderate letter content for public/shared publication
 */
export function moderateLetter(
  content: string,
  isPublic: boolean = false
): ModerationResult {
  const issues: ModerationIssue[] = [];

  // Step 1: Detect sensitive personal information
  const sensitiveData = detectSensitiveInfo(content);

  sensitiveData.forEach((item) => {
    let severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
    let suggestion = '';

    switch (item.type) {
      case 'EMAIL':
        severity = 'HIGH';
        suggestion = 'Remove email address to protect privacy';
        break;
      case 'PHONE':
        severity = 'HIGH';
        suggestion = 'Remove phone number to protect privacy';
        break;
      case 'ADDRESS':
        severity = 'HIGH';
        suggestion = 'Remove physical address to protect privacy';
        break;
      case 'SCHOOL':
        severity = 'HIGH';
        suggestion = 'Remove school name to protect minor privacy';
        break;
      case 'COURT_CASE':
        severity = 'HIGH';
        suggestion = 'Remove court case number to maintain confidentiality';
        break;
      case 'MINOR_DETAILS':
        severity = 'MEDIUM';
        suggestion = 'Remove specific identifying details about minors';
        break;
      case 'THREAT':
        severity = 'HIGH';
        suggestion = 'Content contains potentially threatening language';
        break;
      case 'HARASSMENT':
        severity = 'HIGH';
        suggestion = 'Content contains potentially harassing language';
        break;
      default:
        severity = 'MEDIUM';
    }

    issues.push({
      type: item.type,
      severity,
      text: item.text,
      suggestion,
    });
  });

  // Step 2: Check for harassment/threats patterns
  const harassmentPatterns = [
    /kill|harm|hurt|destroy|death|abuse|assault/gi,
    /you're worthless|you're a bad|you're evil/gi,
  ];

  let threatLevel = false;
  harassmentPatterns.forEach((pattern) => {
    if (pattern.test(content)) {
      threatLevel = true;
    }
  });

  if (threatLevel) {
    issues.push({
      type: 'THREAT',
      severity: 'HIGH',
      text: 'Potential threatening or harmful language detected',
      suggestion: 'Revise language to focus on your feelings rather than accusations',
    });
  }

  // Step 3: Determine moderation status
  let status: 'APPROVED' | 'FLAGGED' | 'REJECTED' = 'APPROVED';
  let requiresHumanReview = false;

  const highIssuCount = issues.filter((i) => i.severity === 'HIGH').length;
  const mediumIssueCount = issues.filter((i) => i.severity === 'MEDIUM').length;

  if (highIssuCount > 3 || threatLevel) {
    status = 'REJECTED';
    requiresHumanReview = true;
  } else if (highIssuCount > 0 || mediumIssueCount > 2) {
    status = 'FLAGGED';
    requiresHumanReview = true;
  }

  return {
    status,
    issues,
    requiresHumanReview,
    recommendedAction:
      status === 'APPROVED'
        ? 'Ready to publish'
        : status === 'FLAGGED'
          ? 'Please address flagged items before publishing'
          : 'This content needs revision before it can be published',
  };
}

/**
 * Calculate content quality score (0-100)
 */
export function calculateQualityScore(content: string): number {
  let score = 100;

  // Penalize very short content
  if (content.length < 100) score -= 20;
  if (content.length < 50) score -= 30;

  // Penalize excessive caps
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (capsRatio > 0.3) score -= 10;

  // Penalize excessive punctuation
  const punctRatio = (content.match(/[!?]{2,}/g) || []).length;
  if (punctRatio > 5) score -= 10;

  // Reward substantial length
  if (content.length > 500) score += 10;
  if (content.length > 1000) score += 10;

  return Math.max(0, Math.min(100, score));
}

/**
 * Extract summary of content for moderation review
 */
export function extractContentSummary(
  content: string,
  wordLimit: number = 50
): string {
  const words = content.split(/\s+/);
  return words.slice(0, wordLimit).join(' ') + (words.length > wordLimit ? '...' : '');
}
