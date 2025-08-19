/**
 * Sophisticated scoring system for Gutcheck categories
 * Supports multiple approaches: fixed thresholds, category-specific, and percentile-based
 */

export interface CategoryThresholds {
  exceptional: number;
  strong: number;
  developing: number;
  // Below developing = "Needs Focus"
}

export interface ScoreDescriptor {
  label: "Exceptional" | "Strong" | "Developing" | "Needs Focus";
  color: string;
  percentile?: number; // Optional percentile ranking
}

// Category-specific thresholds based on difficulty and expected performance
export const CATEGORY_THRESHOLDS: Record<string, CategoryThresholds> = {
  "Personal Background": {
    exceptional: 85, // 17/20 points
    strong: 70,      // 14/20 points  
    developing: 45   // 9/20 points
  },
  "Entrepreneurial Skills": {
    exceptional: 80, // 20/25 points (higher max, so higher threshold)
    strong: 60,      // 15/25 points
    developing: 36   // 9/25 points
  },
  "Resources": {
    exceptional: 75, // 15/20 points (hardest category)
    strong: 50,      // 10/20 points
    developing: 30   // 6/20 points
  },
  "Behavioral Metrics": {
    exceptional: 87, // 13/15 points (smaller scale)
    strong: 67,      // 10/15 points
    developing: 40   // 6/15 points
  },
  "Growth & Vision": {
    exceptional: 80, // 16/20 points
    strong: 60,      // 12/20 points
    developing: 35   // 7/20 points
  }
};

// Brand colors for each level
const DESCRIPTOR_COLORS = {
  "Exceptional": "#19C2A0",
  "Strong": "#19C2A0", 
  "Developing": "#FFC700",
  "Needs Focus": "#FF6B00"
} as const;

/**
 * Get score descriptor using category-specific thresholds
 */
export function getCategorySpecificDescriptor(
  categoryName: string,
  score: number,
  maxScore: number
): ScoreDescriptor {
  const percentage = (score / maxScore) * 100;
  const thresholds = CATEGORY_THRESHOLDS[categoryName];
  
  if (!thresholds) {
    // Show error if category not found
    throw new Error(`Category thresholds not found for: ${categoryName}. Please ensure scoring configuration is complete.`);
  }
  
  let label: ScoreDescriptor['label'];
  if (percentage >= thresholds.exceptional) {
    label = "Exceptional";
  } else if (percentage >= thresholds.strong) {
    label = "Strong";
  } else if (percentage >= thresholds.developing) {
    label = "Developing";
  } else {
    label = "Needs Focus";
  }
  
  return {
    label,
    color: DESCRIPTOR_COLORS[label]
  };
}

/**
 * Generic percentage-based descriptor (fallback)
 */
export function getGenericDescriptor(percentage: number): ScoreDescriptor {
  let label: ScoreDescriptor['label'];
  if (percentage >= 86) {
    label = "Exceptional";
  } else if (percentage >= 61) {
    label = "Strong";
  } else if (percentage >= 31) {
    label = "Developing";
  } else {
    label = "Needs Focus";
  }
  
  return {
    label,
    color: DESCRIPTOR_COLORS[label]
  };
}

/**
 * Percentile-based descriptor (for when you have population data)
 * This is the gold standard but requires collecting data first
 */
export function getPercentileDescriptor(
  percentile: number
): ScoreDescriptor {
  let label: ScoreDescriptor['label'];
  if (percentile >= 90) {
    label = "Exceptional"; // Top 10%
  } else if (percentile >= 75) {
    label = "Strong";      // Top 25%
  } else if (percentile >= 25) {
    label = "Developing";  // Middle 50%
  } else {
    label = "Needs Focus"; // Bottom 25%
  }
  
  return {
    label,
    color: DESCRIPTOR_COLORS[label],
    percentile
  };
}

/**
 * Future: Standard deviation-based scoring
 * Use when you have mean and std dev for each category
 */
export function getStandardDeviationDescriptor(
  zScore: number
): ScoreDescriptor {
  let label: ScoreDescriptor['label'];
  if (zScore >= 1.5) {
    label = "Exceptional";   // ~93rd percentile
  } else if (zScore >= 0.5) {
    label = "Strong";        // ~69th percentile
  } else if (zScore >= -0.5) {
    label = "Developing";    // ~31st percentile
  } else {
    label = "Needs Focus";   // Below 31st percentile
  }
  
  return {
    label,
    color: DESCRIPTOR_COLORS[label]
  };
}
