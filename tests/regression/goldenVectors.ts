// Golden test vectors for scoring continuity verification
// These represent real assessment responses and expected scores from the locked system

export interface GoldenVector {
  id: string;
  inputs: {
    responses: Array<{
      questionId: string;
      response: string | number | string[];
      category: string;
    }>;
  };
  expected: {
    totalScore: number; // 35-100 range
    starRating: number; // 1-5 system
    categoryBreakdown: Record<string, number>;
    scoringVersion: string;
  };
}

export const GOLDEN_VECTORS: GoldenVector[] = [
  // High-performing entrepreneur (90+ score)
  {
    id: "G-001",
    inputs: {
      responses: [
        { questionId: "q1", response: "Established business with revenue", category: "personalBackground" },
        { questionId: "q2", response: "Small team (2-5 people)", category: "personalBackground" },
        { questionId: "q4", response: "Still running and growing", category: "personalBackground" },
        { questionId: "q5", response: "Market opportunity and growth potential", category: "personalBackground" },
        { questionId: "q6", response: "Excellent", category: "entrepreneurialSkills" },
        { questionId: "q7", response: "Daily", category: "entrepreneurialSkills" },
        { questionId: "q11", response: "Scaling and expanding", category: "resources" },
        { questionId: "q12", response: "Sufficient for current needs", category: "resources" },
        { questionId: "q13", response: "Very strong", category: "resources" },
        { questionId: "q14", response: "Yes", category: "resources" },
        { questionId: "q15", response: "Weekly", category: "resources" },
        { questionId: "q16", response: "40+ hours per week", category: "behavioralMetrics" },
        { questionId: "q17", response: "Prioritize and maintain routine", category: "behavioralMetrics" },
        { questionId: "q20", response: "Yes, I've restarted and learned", category: "behavioralMetrics" },
        { questionId: "q21", response: "Global scale", category: "growthVision" },
        { questionId: "q22", response: "Investment funding", category: "growthVision" },
        { questionId: "q24", response: "6+ jobs", category: "growthVision" },
        { questionId: "q25", response: "Yes", category: "growthVision" }
      ]
    },
    expected: {
      totalScore: 13,
      starRating: 5,
      categoryBreakdown: {
        personalBackground: 0,
        entrepreneurialSkills: 5,
        resources: 4,
        behavioralMetrics: 0,
        growthVision: 4
      },
      scoringVersion: "locked-2025-01-27"
    }
  },

  // Medium-performing entrepreneur (70-80 score)
  {
    id: "G-002",
    inputs: {
      responses: [
        { questionId: "q1", response: "Early operations", category: "personalBackground" },
        { questionId: "q2", response: "Solo founder", category: "personalBackground" },
        { questionId: "q4", response: "First time entrepreneur", category: "personalBackground" },
        { questionId: "q5", response: "Income and financial stability", category: "personalBackground" },
        { questionId: "q6", response: "Good", category: "entrepreneurialSkills" },
        { questionId: "q7", response: "Weekly", category: "entrepreneurialSkills" },
        { questionId: "q11", response: "Access to customers", category: "resources" },
        { questionId: "q12", response: "Not enough", category: "resources" },
        { questionId: "q13", response: "Moderate", category: "resources" },
        { questionId: "q14", response: "No", category: "resources" },
        { questionId: "q15", response: "Monthly", category: "resources" },
        { questionId: "q16", response: "21-40 hours per week", category: "behavioralMetrics" },
        { questionId: "q17", response: "Occasionally maintain routine", category: "behavioralMetrics" },
        { questionId: "q20", response: "Haven't restarted yet", category: "behavioralMetrics" },
        { questionId: "q21", response: "Regional scale", category: "growthVision" },
        { questionId: "q22", response: "Loans and grants", category: "growthVision" },
        { questionId: "q24", response: "1-5 jobs", category: "growthVision" },
        { questionId: "q25", response: "No", category: "growthVision" }
      ]
    },
    expected: {
      totalScore: 8,
      starRating: 4,
      categoryBreakdown: {
        personalBackground: 0,
        entrepreneurialSkills: 4,
        resources: 2,
        behavioralMetrics: 0,
        growthVision: 2
      },
      scoringVersion: "locked-2025-01-27"
    }
  },

  // Early-stage entrepreneur (50-70 score)
  {
    id: "G-003",
    inputs: {
      responses: [
        { questionId: "q1", response: "Idea stage", category: "personalBackground" },
        { questionId: "q2", response: "Solo founder", category: "personalBackground" },
        { questionId: "q4", response: "First time entrepreneur", category: "personalBackground" },
        { questionId: "q5", response: "Independence and flexibility", category: "personalBackground" },
        { questionId: "q6", response: "Fair", category: "entrepreneurialSkills" },
        { questionId: "q7", response: "Monthly", category: "entrepreneurialSkills" },
        { questionId: "q11", response: "Limited mentorship", category: "resources" },
        { questionId: "q12", response: "Self-funded", category: "resources" },
        { questionId: "q13", response: "Weak", category: "resources" },
        { questionId: "q14", response: "No", category: "resources" },
        { questionId: "q15", response: "Occasionally", category: "resources" },
        { questionId: "q16", response: "11-20 hours per week", category: "behavioralMetrics" },
        { questionId: "q17", response: "No routine", category: "behavioralMetrics" },
        { questionId: "q20", response: "No", category: "behavioralMetrics" },
        { questionId: "q21", response: "Small-scale", category: "growthVision" },
        { questionId: "q22", response: "Bootstrapping", category: "growthVision" },
        { questionId: "q24", response: "No", category: "growthVision" },
        { questionId: "q25", response: "Not sure", category: "growthVision" }
      ]
    },
    expected: {
      totalScore: 11,
      starRating: 3,
      categoryBreakdown: {
        personalBackground: 0,
        entrepreneurialSkills: 3,
        resources: 2,
        behavioralMetrics: 2,
        growthVision: 4
      },
      scoringVersion: "locked-2025-01-27"
    }
  },

  // Edge case: Minimum viable responses
  {
    id: "G-004",
    inputs: {
      responses: [
        { questionId: "q1", response: "Idea stage", category: "personalBackground" },
        { questionId: "q2", response: "Solo founder", category: "personalBackground" },
        { questionId: "q4", response: "First time entrepreneur", category: "personalBackground" },
        { questionId: "q5", response: "Other", category: "personalBackground" },
        { questionId: "q6", response: "Poor", category: "entrepreneurialSkills" },
        { questionId: "q7", response: "Rarely", category: "entrepreneurialSkills" },
        { questionId: "q11", response: "Lack funding", category: "resources" },
        { questionId: "q12", response: "Self-funded", category: "resources" },
        { questionId: "q13", response: "Weak", category: "resources" },
        { questionId: "q14", response: "No", category: "resources" },
        { questionId: "q15", response: "Rarely", category: "resources" },
        { questionId: "q16", response: "1-10 hours per week", category: "behavioralMetrics" },
        { questionId: "q17", response: "No routine", category: "behavioralMetrics" },
        { questionId: "q20", response: "No", category: "behavioralMetrics" },
        { questionId: "q21", response: "Small-scale", category: "growthVision" },
        { questionId: "q22", response: "Unsure", category: "growthVision" },
        { questionId: "q24", response: "Not sure", category: "growthVision" },
        { questionId: "q25", response: "Not sure", category: "growthVision" }
      ]
    },
    expected: {
      totalScore: 11,
      starRating: 2,
      categoryBreakdown: {
        personalBackground: 2,
        entrepreneurialSkills: 0,
        resources: 2,
        behavioralMetrics: 2,
        growthVision: 5
      },
      scoringVersion: "locked-2025-01-27"
    }
  }
];
