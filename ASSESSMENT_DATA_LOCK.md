# 🔒 Assessment Data Locking Mechanism

## Overview

This document describes the locking mechanism implemented to protect the core assessment data from accidental changes. The assessment questions, weights, and scoring logic are critical to the validity of all assessment results and must be carefully managed.

## Locked Elements

### 1. Assessment Questions (`src/domain/entities/Assessment.ts`)
- **All 25 questions** with their exact text, options, and structure
- **Question weights** within each category
- **Question types** (multipleChoice, multiSelect, openEnded, likert)
- **Validation prompts** for open-ended questions
- **Minimum character requirements** for open-ended questions

### 2. Category Weights
- **personalBackground**: 20%
- **entrepreneurialSkills**: 25%
- **resources**: 20%
- **behavioralMetrics**: 15%
- **growthVision**: 20%

### 3. Question Weights by Category
- **personalBackground**: 4% each (5 questions × 4% = 20%)
- **entrepreneurialSkills**: 5% each (5 questions × 5% = 25%)
- **resources**: 4% each (5 questions × 4% = 20%)
- **behavioralMetrics**: 3% each (5 questions × 3% = 15%)
- **growthVision**: 4% each (5 questions × 4% = 20%)

### 4. Scoring Logic (`src/application/services/ScoringService.ts`)
- **Scoring maps** for multiple-choice questions
- **Scoring algorithms** for different question types
- **Category weight calculations**
- **Overall score calculations**

## Validation System

The locking mechanism includes automatic validation that runs on module load:

### Data Integrity Checks
- ✅ Exactly 25 questions total
- ✅ Category weights sum to 100%
- ✅ Each category has exactly 5 questions
- ✅ Question weights match expected values
- ✅ All question IDs are unique and sequential

### Error Reporting
If any validation fails, the system will log detailed error messages:
```
❌ CRITICAL: Assessment must have exactly 25 questions
❌ CRITICAL: Category weights must sum to 100
❌ CRITICAL: Category personalBackground must have exactly 5 questions
❌ CRITICAL: Question q1 weight should be 4, got 5
```

## How to Unlock for Changes

### Step 1: Remove Lock Comments
Remove the locking comment blocks from:
- `src/domain/entities/Assessment.ts`
- `src/application/services/ScoringService.ts`

### Step 2: Make Required Changes
Make the necessary modifications to questions, weights, or scoring logic.

### Step 3: Update Documentation
Add a new comment block with:
- Date of changes
- Reason for changes
- Person who approved the changes
- Impact assessment

### Step 4: Update Related Files
Ensure changes are reflected in:
- `src/application/services/ScoringService.ts` (if question options changed)
- `src/utils/scoring.ts` (if scoring logic changed)
- Any other dependent files

### Step 5: Test Thoroughly
- Run the validation function: `validateAssessmentDataIntegrity()`
- Test scoring accuracy with known responses
- Verify all question types work correctly
- Check that category breakdowns are accurate

### Step 6: Re-lock the Data
Add new locking comments with updated validation date and status.

## Emergency Override

In case of critical issues, you can temporarily disable validation by commenting out the validation call:

```typescript
// Temporarily disabled for emergency fix
// validateAssessmentDataIntegrity();
```

**⚠️ WARNING**: Only use this for genuine emergencies and re-enable validation immediately after the fix.

## Change Approval Process

### Minor Changes (Text corrections, typos)
- Developer approval required
- Must maintain exact same scoring logic
- Update validation date

### Major Changes (New questions, weight changes)
- Product owner approval required
- Impact assessment required
- Full testing cycle required
- Update validation date and reason

### Critical Changes (Scoring algorithm changes)
- Executive approval required
- Full regression testing required
- Data migration plan required
- Update validation date, reason, and approval chain

## Validation History

| Date | Status | Validated By | Notes |
|------|--------|--------------|-------|
| 2025-01-27 | ✅ PASSED | Clean Architecture Refactor | All questions, weights, and scoring logic match original git history |

## Contact

For questions about the assessment data locking mechanism or to request changes, contact the development team with a detailed explanation of the proposed changes and their business justification.

---

**Remember**: The integrity of assessment data is critical to the validity of all user results. When in doubt, err on the side of caution and seek approval before making changes. 