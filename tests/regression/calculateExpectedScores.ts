// Helper script to calculate expected scores based on actual scoring maps
import { AssessmentCategory } from '../../src/domain/value-objects/Category';

// Actual scoring maps from ScoringService
const scoringMaps: Record<string, number[]> = {
  'q1': [3, 4, 5], // Idea stage=3, Early ops=4, Established=5
  'q2': [3, 4, 5], // Solo=3, Small team=4, Large team=5
  'q4': [5, 4, 3], // Still running=5, Failed=4, First time=3
  'q5': [5, 4, 3, 2], // Market opportunity=5, Income=4, Independence=3, Other=2
  'q6': [5, 4, 3, 2], // Excellent=5, Good=4, Fair=3, Poor=2
  'q7': [5, 4, 3, 2], // Daily=5, Weekly=4, Monthly=3, Rarely=2
  'q11': [2, 3, 4, 5, 0], // Lack funding=2, Limited mentorship=3, Access customers=4, Scaling=5, Other=0
  'q12': [5, 4, 3], // Sufficient=5, Not enough=4, Self-funded=3
  'q13': [5, 4, 3], // Very strong=5, Moderate=4, Weak=3
  'q14': [5, 3], // Yes=5, No=3
  'q15': [5, 4, 3, 2], // Weekly=5, Monthly=4, Occasionally=3, Rarely=2
  'q16': [2, 3, 4, 5], // 1-10 hours=2, 11-20=3, 21-40=4, 40+=5
  'q17': [5, 4, 3], // Prioritize=5, Occasionally=4, No routine=3
  'q20': [5, 4, 3], // Restarted=5, Haven't restarted=4, No=3
  'q21': [3, 4, 5], // Small-scale=3, Regional=4, Global=5
  'q22': [3, 4, 5, 2], // Bootstrapping=3, Loans/grants=4, Investments=5, Unsure=2
  'q24': [4, 5, 3, 2], // 1-5 jobs=4, 6+ jobs=5, No=3, Not sure=2
  'q25': [5, 3, 2], // Yes=5, No=3, Not sure=2
};

// Category weights
const categoryWeights = {
  personalBackground: 20,
  entrepreneurialSkills: 25,
  resources: 20,
  behavioralMetrics: 15,
  growthVision: 20,
};

// Question categories
const questionCategories: Record<string, AssessmentCategory> = {
  'q1': 'personalBackground',
  'q2': 'personalBackground',
  'q4': 'personalBackground',
  'q5': 'personalBackground',
  'q6': 'entrepreneurialSkills',
  'q7': 'entrepreneurialSkills',
  'q11': 'resources',
  'q12': 'resources',
  'q13': 'resources',
  'q14': 'resources',
  'q15': 'resources',
  'q16': 'behavioralMetrics',
  'q17': 'behavioralMetrics',
  'q20': 'behavioralMetrics',
  'q21': 'growthVision',
  'q22': 'growthVision',
  'q24': 'growthVision',
  'q25': 'growthVision',
};

function calculateExpectedScore(responses: Array<{questionId: string, response: string}>) {
  const categoryScores: Record<AssessmentCategory, number> = {
    personalBackground: 0,
    entrepreneurialSkills: 0,
    resources: 0,
    behavioralMetrics: 0,
    growthVision: 0,
  };

  const categoryCounts: Record<AssessmentCategory, number> = {
    personalBackground: 0,
    entrepreneurialSkills: 0,
    resources: 0,
    behavioralMetrics: 0,
    growthVision: 0,
  };

  // Calculate raw scores for each response
  for (const response of responses) {
    const questionId = response.questionId;
    const category = questionCategories[questionId];
    const scoringMap = scoringMaps[questionId];
    
    if (!category || !scoringMap) {
      console.warn(`Missing category or scoring map for question ${questionId}`);
      continue;
    }

    // Find the option index
    const options = getOptionsForQuestion(questionId);
    const optionIndex = options.indexOf(response.response);
    
    if (optionIndex === -1) {
      console.warn(`Response "${response.response}" not found in options for question ${questionId}`);
      continue;
    }

    const rawScore = scoringMap[optionIndex];
    categoryScores[category] += rawScore;
    categoryCounts[category]++;
  }

  // Calculate normalized scores
  const normalizedScores: Record<AssessmentCategory, number> = {
    personalBackground: 0,
    entrepreneurialSkills: 0,
    resources: 0,
    behavioralMetrics: 0,
    growthVision: 0,
  };

  for (const [category, totalScore] of Object.entries(categoryScores)) {
    const count = categoryCounts[category as AssessmentCategory];
    if (count > 0) {
      // Normalize: (Raw Score / 5) × (Category Weight / 5)
      const avgScore = totalScore / count;
      const normalizedScore = (avgScore / 5) * (categoryWeights[category as AssessmentCategory] / 5);
      normalizedScores[category as AssessmentCategory] = Math.round(normalizedScore);
    }
  }

  // Calculate overall score
  const overallScore = Object.values(normalizedScores).reduce((sum, score) => sum + score, 0);

  return {
    categoryScores: normalizedScores,
    overallScore: Math.round(overallScore)
  };
}

function getOptionsForQuestion(questionId: string): string[] {
  const optionsMap: Record<string, string[]> = {
    'q1': ['Idea stage', 'Early operations', 'Established business with revenue'],
    'q2': ['Solo founder', 'Small team (2-5 people)', 'Large team (6+ people)'],
    'q4': ['Still running and growing', 'Failed but learned from it', 'First time entrepreneur'],
    'q5': ['Market opportunity and growth potential', 'Income and financial stability', 'Independence and flexibility', 'Other'],
    'q6': ['Excellent', 'Good', 'Fair', 'Poor'],
    'q7': ['Daily', 'Weekly', 'Monthly', 'Rarely'],
    'q11': ['Lack funding', 'Limited mentorship', 'Access to customers', 'Scaling and expanding', 'Other'],
    'q12': ['Sufficient for current needs', 'Not enough', 'Self-funded'],
    'q13': ['Very strong', 'Moderate', 'Weak'],
    'q14': ['Yes', 'No'],
    'q15': ['Weekly', 'Monthly', 'Occasionally', 'Rarely'],
    'q16': ['1-10 hours per week', '11-20 hours per week', '21-40 hours per week', '40+ hours per week'],
    'q17': ['Prioritize and maintain routine', 'Occasionally maintain routine', 'No routine'],
    'q20': ['Yes, I\'ve restarted and learned', 'Haven\'t restarted yet', 'No'],
    'q21': ['Small-scale', 'Regional scale', 'Global scale'],
    'q22': ['Bootstrapping', 'Loans and grants', 'Investment funding', 'Unsure'],
    'q24': ['1-5 jobs', '6+ jobs', 'No', 'Not sure'],
    'q25': ['Yes', 'No', 'Not sure'],
  };
  
  return optionsMap[questionId] || [];
}

// Test the golden vectors
console.log('Calculating expected scores for golden vectors...\n');

const testResponses = [
  // G-001 (High performer)
  { questionId: 'q1', response: 'Established business with revenue' },
  { questionId: 'q2', response: 'Small team (2-5 people)' },
  { questionId: 'q4', response: 'Still running and growing' },
  { questionId: 'q5', response: 'Market opportunity and growth potential' },
  { questionId: 'q6', response: 'Excellent' },
  { questionId: 'q7', response: 'Daily' },
  { questionId: 'q11', response: 'Scaling and expanding' },
  { questionId: 'q12', response: 'Sufficient for current needs' },
  { questionId: 'q13', response: 'Very strong' },
  { questionId: 'q14', response: 'Yes' },
  { questionId: 'q15', response: 'Weekly' },
  { questionId: 'q16', response: '40+ hours per week' },
  { questionId: 'q17', response: 'Prioritize and maintain routine' },
  { questionId: 'q20', response: 'Yes, I\'ve restarted and learned' },
  { questionId: 'q21', response: 'Global scale' },
  { questionId: 'q22', response: 'Investment funding' },
  { questionId: 'q24', response: '6+ jobs' },
  { questionId: 'q25', response: 'Yes' },
];

const result = calculateExpectedScore(testResponses);
console.log('G-001 Expected Scores:');
console.log('Category Scores:', result.categoryScores);
console.log('Overall Score:', result.overallScore);
