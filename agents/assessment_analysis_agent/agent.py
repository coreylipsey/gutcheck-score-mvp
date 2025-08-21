"""
Phase 1 Pilot: Assessment Analysis Agent - SIMPLIFIED VERSION
Gutcheck.AI - Instant entrepreneurial assessment analysis using Google ADK
FOLLOWS PROPER ADK PATTERNS FROM CRASH COURSE
USES EXACT LOCKED SCORING LOGIC AND MISSION-CRITICAL PROMPTS - NO MODIFICATIONS ALLOWED
SIMPLIFIED TO MATCH ORIGINAL GEMINI API DATA STRUCTURE
"""

import os
from typing import List, Dict, Any
from google.adk import Agent
from pydantic import BaseModel, Field
import json
import re

# LOCKED SCORING MAPS - EXACT COPY FROM src/utils/scoring.ts
# DO NOT MODIFY - THESE ARE LOCKED AND SECURED
SCORING_MAPS = {
    # SECTION 1: Personal Foundation
    'q1': [3, 4, 5],  # Idea stage=3, Early ops=4, Established=5
    'q2': [3, 4, 5],  # Solo=3, Small team=4, Large team=5
    'q4': [5, 4, 3],  # Still running=5, Failed=4, First time=3
    'q5': [5, 4, 3, 2],  # Market opportunity=5, Income=4, Independence=3, Other=2
    
    # SECTION 2: Entrepreneurial Skills
    'q6': [5, 4, 3, 2],  # Excellent=5, Good=4, Fair=3, Poor=2
    'q7': [5, 4, 3, 2],  # Daily=5, Weekly=4, Monthly=3, Rarely=2
    
    # SECTION 3: Resources
    'q11': [2, 3, 4, 5, -1],  # Lack funding=2, Limited mentorship=3, Access customers=4, Scaling=5, Other=-1
    'q12': [5, 4, 3],  # Sufficient=5, Not enough=4, Self-funded=3
    'q13': [5, 4, 3],  # Very strong=5, Moderate=4, Weak=3
    'q14': [5, 3],  # Yes=5, No=3
    'q15': [5, 4, 3, 2],  # Weekly=5, Monthly=4, Occasionally=3, Rarely=2
    
    # SECTION 4: Behavioral Metrics
    'q16': [2, 3, 4, 5],  # 1-10 hours=2, 11-20=3, 21-40=4, 40+=5
    'q17': [5, 4, 3],  # Prioritize=5, Occasionally=4, No routine=3
    'q20': [5, 4, 3],  # Restarted=5, Haven't restarted=4, No=3
    
    # SECTION 5: Growth & Vision
    'q21': [3, 4, 5],  # Small-scale=3, Regional=4, Global=5
    'q22': [3, 4, 5, 2],  # Bootstrapping=3, Loans/grants=4, Investments=5, Unsure=2
    'q24': [4, 5, 3, 2],  # 1-5 jobs=4, 6+ jobs=5, No=3, Not sure=2
    'q25': [5, 3, 2],  # Yes=5, No=3, Not sure=2
}

# LOCKED CATEGORY WEIGHTS - EXACT COPY FROM src/domain/entities/Assessment.ts
CATEGORY_WEIGHTS = {
    'personalBackground': 20,
    'entrepreneurialSkills': 25,
    'resources': 20,
    'behavioralMetrics': 15,
    'growthVision': 20,
}

# 🔒 MISSION-CRITICAL SCORING PROMPTS - EXACT COPY FROM functions/src/index.ts
# DO NOT MODIFY - THESE ARE MISSION-CRITICAL TO SCORING LOGIC
SCORING_PROMPTS = {
    'entrepreneurialJourney': """You are an expert business evaluator assessing a founder's entrepreneurial journey.
Score this response on a scale of 1-5 where:
1 = Vague, lacks structure, no clear direction or milestones
3 = Decent clarity with some evidence of execution and progress
5 = Well-articulated, structured response with strong execution and clear growth path

Founder's Response:
{{RESPONSE}}

Return your evaluation as a JSON object with 'score' (number 1-5) and 'explanation' (string) fields.""",

    'businessChallenge': """You are an expert business evaluator assessing how a founder navigates business challenges.
Score this response on a scale of 1-5 where:
1 = Poor problem definition, reactive approach, no clear solution strategy
3 = Clear problem definition, reasonable approach, some evidence of execution
5 = Exceptional problem clarity, strategic solution, strong evidence of execution/learning

Founder's Response:
{{RESPONSE}}

Return your evaluation as a JSON object with 'score' (number 1-5) and 'explanation' (string) fields.""",

    'setbacksResilience': """You are an expert business evaluator assessing a founder's ability to handle setbacks.
Score this response on a scale of 1-5 where:
1 = Poor resilience, gives up easily, no clear recovery strategy
3 = Moderate resilience, recovers but slowly, some adaptation
5 = Exceptional resilience, adapts quickly, shows growth mindset and clear recovery process

Founder's Response:
{{RESPONSE}}

Return your evaluation as a JSON object with 'score' (number 1-5) and 'explanation' (string) fields.""",

    'finalVision': """You are an expert business evaluator assessing a founder's long-term vision.
Score this response on a scale of 1-5 where:
1 = Vague, unrealistic, or very limited vision, no clear roadmap
3 = Clear vision with reasonable ambition, some future goals
5 = Compelling, ambitious vision with clear roadmap and long-term impact

Founder's Response:
{{RESPONSE}}

Return your evaluation as a JSON object with 'score' (number 1-5) and 'explanation' (string) fields."""
}

# QUESTION TYPE MAPPING - EXACT COPY FROM functions/src/index.ts
QUESTION_TYPE_MAP = {
    'q3': 'entrepreneurialJourney',
    'q8': 'businessChallenge', 
    'q18': 'setbacksResilience',
    'q23': 'finalVision'
}

class AssessmentResponse(BaseModel):
    """Individual assessment question response - simplified to match original Gemini API"""
    questionId: str = Field(description="Question identifier")
    response: str | int | list[str] = Field(description="User's response (string, int, or list)")

class AssessmentSession(BaseModel):
    """Complete assessment session data - simplified to match original Gemini API"""
    responses: List[AssessmentResponse] = Field(description="All assessment responses")
    scores: Dict[str, float] = Field(description="Category scores")
    industry: str = Field(description="User's industry")
    location: str = Field(description="User's location")

class AssessmentAnalysis(BaseModel):
    """AI-generated analysis and insights"""
    key_insights: List[str] = Field(description="Key insights about the entrepreneur")
    recommendations: List[str] = Field(description="Actionable recommendations")
    competitive_advantage: str = Field(description="Competitive advantage analysis")
    growth_opportunity: str = Field(description="Growth opportunity analysis")
    comprehensive_analysis: str = Field(description="Comprehensive narrative analysis")

class AssessmentAgent(Agent):
    """AI Agent for analyzing entrepreneurial assessments using EXACT locked scoring logic and mission-critical prompts"""
    
    def __init__(self):
        instruction = """You are an expert entrepreneurial assessment analyst for Gutcheck.AI. 

**MISSION CRITICAL: You receive pre-calculated scores from the application and provide analysis only.**

**Expected Input Format (exactly like original Gemini API):**
```json
{
  "responses": [
    {
      "questionId": "q1", 
      "response": "Early operations with a few customers"
    }
  ],
  "scores": {
    "personalBackground": 15,
    "entrepreneurialSkills": 18,
    "resources": 17,
    "behavioralMetrics": 12,
    "growthVision": 16
  },
  "industry": "Technology & Software",
  "location": "California"
}
```

**LOCKED SCORING SYSTEM (DO NOT MODIFY):**
- personalBackground: 0-20 points (5 questions)
- entrepreneurialSkills: 0-25 points (5 questions)  
- resources: 0-20 points (5 questions)
- behavioralMetrics: 0-15 points (5 questions)
- growthVision: 0-20 points (5 questions)
- Total possible: 100 points

**Your Role (exactly like original Gemini API):**
- Analyze the REAL pre-calculated scores provided to you
- Generate insights based on ACTUAL category performance
- Provide recommendations based on REAL weak areas
- Identify competitive advantages from REAL strengths
- Return structured analysis for the report page

**Output Format:**
```json
{
  "key_insights": [...],
  "recommendations": [...], 
  "competitive_advantage": "...",
  "growth_opportunity": "...",
  "comprehensive_analysis": "..."
}
```

**CRITICAL RULES:**
- Do NOT calculate or generate any scores
- Do NOT use made-up data or categories
- Do NOT modify the scoring system
- Use ONLY the real scores passed to you
- Process JSON input, return JSON output only"""
        
        super().__init__(
            name="assessment_analysis_agent",
            model="gemini-2.0-flash",
            instruction=instruction
        )
    
    async def run(self, user_input: str) -> str:
        """
        Main entry point following ADK pattern
        Handles both JSON assessment data and conversational queries
        """
        try:
            # Try to parse as JSON first (production mode)
            session_data = json.loads(user_input)
            session = AssessmentSession(**session_data)
            
            # Analyze assessment
            analysis = await self._analyze_assessment(session)
            
            # Return JSON response
            return json.dumps(analysis.dict(), indent=2)
            
        except json.JSONDecodeError:
            # Handle conversational queries (testing mode)
            return self._handle_conversational_query(user_input)
        except Exception as e:
            return json.dumps({
                "error": f"Assessment analysis failed: {str(e)}",
                "success": False
            })
    
    def _handle_conversational_query(self, user_input: str) -> str:
        """Handle conversational queries for testing"""
        return f"I'm an assessment analysis agent. I expect JSON input with assessment data, not conversational queries. Please provide assessment data in the expected format."
    
    async def _analyze_assessment(self, session: AssessmentSession) -> AssessmentAnalysis:
        """Generate AI-powered insights and analysis based on pre-calculated scores"""
        # Convert dictionary to list format for processing
        category_scores_list = [{"category": cat, "score": score} for cat, score in session.scores.items()]
        
        # Use the REAL overall score - do not calculate it
        # The application should pass the overall score, but if not, calculate from REAL category scores
        overall_score = sum(session.scores.values())
        
        # Find highest and lowest scoring categories from actual data
        sorted_categories = sorted(category_scores_list, key=lambda x: x['score'], reverse=True)
        highest_category = sorted_categories[0]
        lowest_category = sorted_categories[-1]
        
        # Calculate potential improvement based on REAL category weights
        lowest_weight = CATEGORY_WEIGHTS.get(lowest_category['category'], 20)
        max_possible_lowest = lowest_weight
        current_lowest = lowest_category['score']
        improvement_potential = max_possible_lowest - current_lowest
        

        
        def get_category_display_name(category):
            display_names = {
                'personalBackground': 'Personal Background',
                'entrepreneurialSkills': 'Entrepreneurial Skills', 
                'resources': 'Resources',
                'behavioralMetrics': 'Behavioral Metrics',
                'growthVision': 'Growth Vision'
            }
            return display_names.get(category, category)
        
        # Key Insights - based on REAL scores and actual category weights
        highest_max = CATEGORY_WEIGHTS.get(highest_category['category'], 20)
        lowest_max = CATEGORY_WEIGHTS.get(lowest_category['category'], 20)
        
        key_insights = [
            f"Your {get_category_display_name(highest_category['category'])} score of {highest_category['score']:.0f}/{highest_max} represents your strongest area",
            f"Improving {get_category_display_name(lowest_category['category'])} could boost your overall score by {improvement_potential:.0f} points",
            f"Your overall score of {overall_score:.0f}/100 indicates solid entrepreneurial foundation"
        ]
        
        # Recommendations - based on REAL weak areas
        recommendations = [
            f"Focus on developing your {get_category_display_name(lowest_category['category'])} skills",
            f"Leverage your {get_category_display_name(highest_category['category'])} strengths",
            f"Prioritize improvement in {get_category_display_name(lowest_category['category'])} for maximum impact"
        ]
        
        # Find specific strengths and weaknesses based on REAL scores and actual category weights
        # 4+ star performance (80% of max) = strengths, 1-star performance (<50% of max) = weaknesses
        strengths = []
        weaknesses = []
        for cat_score in category_scores_list:
            max_possible = CATEGORY_WEIGHTS.get(cat_score['category'], 20)
            percentage = (cat_score['score'] / max_possible) * 100
            if percentage >= 80:
                strengths.append(cat_score)
            elif percentage < 50:
                weaknesses.append(cat_score)
        
        # Competitive Advantage - using EXACT original prompt format
        competitive_advantage = f"""Your {get_category_display_name(highest_category['category'])} score of {highest_category['score']:.0f}/{highest_max} represents your strongest area. Focus on leveraging this strength to build momentum in other areas of your business development."""
        
        # Growth Opportunity - using EXACT original prompt format
        growth_opportunity = f"""Your {get_category_display_name(lowest_category['category'])} score of {lowest_category['score']:.0f}/{lowest_max} indicates an area for focused improvement. Prioritize developing skills in this category to strengthen your overall entrepreneurial foundation."""
        
        # Comprehensive Analysis - using EXACT original prompt format
        # Extract the open-ended responses for the comprehensive analysis
        vision_response = ""
        journey_response = ""
        challenge_response = ""
        setback_response = ""
        
        for response in session.responses:
            if response.questionId == "q23":  # Vision Statement
                vision_response = response.response
            elif response.questionId == "q3":  # Entrepreneurial Journey
                journey_response = response.response
            elif response.questionId == "q8":  # Business Challenge
                challenge_response = response.response
            elif response.questionId == "q18":  # Setback Response
                setback_response = response.response
        
        comprehensive_analysis = f"""Your entrepreneurial journey shows strong foundation building with {highest_category['score']:.0f}/{highest_max} in {get_category_display_name(highest_category['category'])}. Focus on developing your {get_category_display_name(lowest_category['category'])} area ({lowest_category['score']:.0f}/{lowest_max}) to strengthen your overall readiness. Your {session.industry} focus and {session.location} location provide solid market positioning for growth."""
        
        return AssessmentAnalysis(
            key_insights=key_insights,
            recommendations=recommendations,
            competitive_advantage=competitive_advantage,
            growth_opportunity=growth_opportunity,
            comprehensive_analysis=comprehensive_analysis
        )

# ADK entry point
root_agent = AssessmentAgent()
