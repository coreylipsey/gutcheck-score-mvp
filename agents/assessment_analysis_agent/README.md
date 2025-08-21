# Assessment Analysis Agent

Phase 1 Pilot: AI Agent for Gutcheck.AI Entrepreneurial Assessment Analysis

## Overview

This agent analyzes entrepreneurial assessments using Google ADK and provides comprehensive scoring, insights, and recommendations. It uses **exact locked scoring logic** and **mission-critical AI prompts** from the existing codebase.

## Features

- ✅ **Exact Scoring Logic**: Uses locked scoring maps, category weights, and normalization formulas
- ✅ **Mission-Critical Prompts**: Uses exact AI prompts for open-ended question scoring
- ✅ **No Fallback Logic**: Throws errors instead of using generic responses
- ✅ **AI-Generated Feedback**: All user-facing content is AI-generated, no hardcoded text
- ✅ **Proper ADK Structure**: Follows Google ADK discovery patterns

## Setup

1. **Set API Key**: Add your Google API key to `.env`
2. **Install Dependencies**: `pip install -r ../requirements.txt`
3. **Test**: `python ../test_adk_agent.py`

## Usage

### Via ADK CLI
```bash
# Interactive web interface
adk web

# Direct terminal interaction
adk run assessment_analysis_agent
```

### Via Python
```python
from assessment_analysis_agent.agent import root_agent
import json

# Sample assessment data
session_data = {
    "session_id": "test_001",
    "responses": [...],
    "industry": "Technology",
    "location": "San Francisco, CA",
    "business_stage": "Early Growth"
}

# Run analysis
result = await root_agent.run(json.dumps(session_data))
analysis = json.loads(result)
```

## Input Format

The agent expects JSON input with:
- `session_id`: Unique identifier
- `responses`: Array of question responses
- `industry`: User's industry
- `location`: User's location  
- `business_stage`: Current business stage

## Output Format

Returns JSON with:
- `overall_score`: 0-100 assessment score
- `category_scores`: Scores by category with insights
- `question_scores`: Individual question scores
- `key_insights`: Top insights about the entrepreneur
- `recommendations`: Actionable recommendations
- `competitive_advantage`: Competitive advantage analysis
- `growth_opportunity`: Growth opportunity analysis

## Scoring Logic

- **Multiple Choice**: Uses exact scoring maps from `src/utils/scoring.ts`
- **Multi-Select**: Completion percentage × 5 (minimum -1 for 0%)
- **Likert**: Direct scoring (Q19 uses inverted scoring)
- **Open-Ended**: AI scoring using mission-critical prompts from `functions/src/index.ts`

## Category Weights

- Personal Background: 20%
- Entrepreneurial Skills: 25%
- Resources: 20%
- Behavioral Metrics: 15%
- Growth & Vision: 20%

## Minimum Score

The minimum possible score is ~35 points (achieved through specific adjustments to Q11, Q9, and Q19).
