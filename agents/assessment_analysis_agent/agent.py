"""
Phase 1 Pilot: Assessment Analysis Agent
Gutcheck.AI - Instant entrepreneurial assessment analysis using Google ADK
FOLLOWS PROPER ADK PATTERNS FROM CRASH COURSE
USES EXACT LOCKED SCORING LOGIC AND MISSION-CRITICAL PROMPTS - NO MODIFICATIONS ALLOWED
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

# 🔒 LOCKED QUESTION TYPE MAPPING - EXACT COPY FROM ScoringInfrastructureService.ts
QUESTION_TYPE_MAP = {
    'q3': 'entrepreneurialJourney',
    'q8': 'businessChallenge', 
    'q18': 'setbacksResilience',
    'q23': 'finalVision'
}

# 🔒 LOCKED ASSESSMENT QUESTIONS - EXACT COPY FROM src/domain/entities/Assessment.ts
ASSESSMENT_QUESTIONS = [
    # SECTION 1: Personal and Professional Background
    {'id': 'q1', 'text': 'What stage is your business currently in?', 'category': 'personalBackground', 'type': 'multipleChoice', 'options': ['Idea/Concept stage', 'Early operations with a few customers', 'Established and generating consistent revenue'], 'weight': 4},
    {'id': 'q2', 'text': 'Do you currently have any team members or collaborators?', 'category': 'personalBackground', 'type': 'multipleChoice', 'options': ['Solo entrepreneur', 'Small team (2–5 people)', 'Larger team (6+ people)'], 'weight': 4},
    {'id': 'q3', 'text': 'Tell me about your entrepreneurial journey so far.', 'category': 'personalBackground', 'type': 'openEnded', 'weight': 4},
    {'id': 'q4', 'text': 'Have you previously tried to start a business?', 'category': 'personalBackground', 'type': 'multipleChoice', 'options': ['Yes – it\'s still running', 'Yes – it failed', 'No – this is my first'], 'weight': 4},
    {'id': 'q5', 'text': 'What best describes your motivation for starting your business?', 'category': 'personalBackground', 'type': 'multipleChoice', 'options': ['I saw a market opportunity', 'I needed income to support myself or my family', 'I wanted independence or flexibility', 'Other'], 'weight': 4},
    
    # SECTION 2: Entrepreneurial Skills and Readiness
    {'id': 'q6', 'text': 'How would you rate your financial literacy?', 'category': 'entrepreneurialSkills', 'type': 'multipleChoice', 'options': ['Excellent: I can confidently manage budgets, forecasts, and financial analysis', 'Good: I understand basic budgeting and cash flow management', 'Fair: I need help understanding financial documents', 'Poor: I avoid managing finances whenever possible'], 'weight': 5},
    {'id': 'q7', 'text': 'How frequently do you dedicate time to professional learning (e.g., reading business books, taking courses)?', 'category': 'entrepreneurialSkills', 'type': 'multipleChoice', 'options': ['Daily', 'Weekly', 'Monthly', 'Rarely or never'], 'weight': 5},
    {'id': 'q8', 'text': 'Describe a time when you faced a major business challenge and how you addressed it.', 'category': 'entrepreneurialSkills', 'type': 'openEnded', 'weight': 5},
    {'id': 'q9', 'text': 'Which of the following milestones have you completed?', 'category': 'entrepreneurialSkills', 'type': 'multiSelect', 'options': ['Business registration', 'EIN or tax ID obtained', 'Business bank account opened', 'First paying customer', 'Applied for a loan, grant, or accelerator'], 'weight': 5},
    {'id': 'q10', 'text': 'Do you feel you have the skills to build a successful business?', 'category': 'entrepreneurialSkills', 'type': 'likert', 'weight': 5},
    
    # SECTION 3: Resources and Challenges
    {'id': 'q11', 'text': 'What is the primary challenge you\'re facing in your entrepreneurial journey?', 'category': 'resources', 'type': 'multipleChoice', 'options': ['Lack of funding', 'Limited mentorship or guidance', 'Access to customers/markets', 'Difficulty scaling operations', 'Other'], 'weight': 4},
    {'id': 'q12', 'text': 'Do you have access to startup capital or funding?', 'category': 'resources', 'type': 'multipleChoice', 'options': ['Yes, and it\'s sufficient for my current needs', 'Yes, but it\'s not enough for my goals', 'No, I am entirely self-funded'], 'weight': 4},
    {'id': 'q13', 'text': 'How strong is your professional network in supporting your business growth?', 'category': 'resources', 'type': 'multipleChoice', 'options': ['Very strong: I can access mentors, investors, and industry contacts', 'Moderate: I have a few key connections', 'Weak: I need to build my network significantly'], 'weight': 4},
    {'id': 'q14', 'text': 'Do you believe there are good opportunities to start or grow a business in your area?', 'category': 'resources', 'type': 'multipleChoice', 'options': ['Yes', 'No'], 'weight': 4},
    {'id': 'q15', 'text': 'How often do you track progress toward your business goals?', 'category': 'resources', 'type': 'multipleChoice', 'options': ['Weekly – I review goals and progress regularly', 'Monthly – I check in on big milestones', 'Occasionally – I track informally when I remember', 'Rarely or never – I focus on daily tasks more than long-term plans'], 'weight': 4},
    
    # SECTION 4: Behavioral and Commitment Metrics
    {'id': 'q16', 'text': 'How many hours per week do you dedicate to your business?', 'category': 'behavioralMetrics', 'type': 'multipleChoice', 'options': ['1–10 hours', '11–20 hours', '21–40 hours', 'More than 40 hours'], 'weight': 3},
    {'id': 'q17', 'text': 'Do you have a regular health or fitness routine?', 'category': 'behavioralMetrics', 'type': 'multipleChoice', 'options': ['Yes, I prioritize physical well-being', 'Somewhat, I exercise occasionally', 'No, I do not have a fitness routine'], 'weight': 3},
    {'id': 'q18', 'text': 'How do you typically handle setbacks?', 'category': 'behavioralMetrics', 'type': 'openEnded', 'weight': 3},
    {'id': 'q19', 'text': 'Does fear of failure prevent you from taking bold steps in your business?', 'category': 'behavioralMetrics', 'type': 'likert', 'weight': 3},
    {'id': 'q20', 'text': 'Have you ever shut down a business and tried again?', 'category': 'behavioralMetrics', 'type': 'multipleChoice', 'options': ['Yes – and restarted', 'Yes – but haven\'t restarted yet', 'No'], 'weight': 3},
    
    # SECTION 5: Growth and Vision
    {'id': 'q21', 'text': 'Where do you see your business in five years?', 'category': 'growthVision', 'type': 'multipleChoice', 'options': ['A stable, small-scale operation', 'A growing business with regional impact', 'A scalable business with national or global reach'], 'weight': 4},
    {'id': 'q22', 'text': 'How do you plan to fund your business growth?', 'category': 'growthVision', 'type': 'multipleChoice', 'options': ['Bootstrapping with personal funds', 'Seeking investments (e.g., angel, VC)', 'Applying for loans or grants', 'Unsure'], 'weight': 4},
    {'id': 'q23', 'text': 'What is your ultimate vision for your business?', 'category': 'growthVision', 'type': 'openEnded', 'weight': 4},
    {'id': 'q24', 'text': 'Do you expect your business to create jobs in the next 3 years?', 'category': 'growthVision', 'type': 'multipleChoice', 'options': ['Yes – 1 to 5 jobs', 'Yes – more than 6 jobs', 'No', 'Not sure'], 'weight': 4},
    {'id': 'q25', 'text': 'Is your product or service new or different from what\'s commonly available in your market?', 'category': 'growthVision', 'type': 'multipleChoice', 'options': ['Yes', 'No', 'Not sure'], 'weight': 4},
]

class AssessmentResponse(BaseModel):
    """Individual assessment question response"""
    question_id: str = Field(description="Question identifier")
    question_text: str = Field(description="Question text")
    response: str | int | list[str] = Field(description="User's response (string, int, or list)")
    question_type: str = Field(description="Type: multipleChoice, multiSelect, likert, openEnded")
    category: str = Field(description="Assessment category")

class AssessmentSession(BaseModel):
    """Complete assessment session data with pre-calculated scores"""
    session_id: str = Field(description="Unique session identifier")
    user_id: str = Field(description="User identifier")
    responses: List[AssessmentResponse] = Field(description="All assessment responses")
    industry: str = Field(description="User's industry")
    location: str = Field(description="User's location")
    # Pre-calculated scores from existing system
    overall_score: float = Field(description="Overall assessment score (0-100)")
    category_scores: Dict[str, float] = Field(description="Scores for each category")
    question_scores: Dict[str, float] = Field(description="Individual question scores")

class AssessmentAnalysis(BaseModel):
    """AI-generated analysis and insights"""
    key_insights: List[str] = Field(description="Key insights about the entrepreneur")
    recommendations: List[str] = Field(description="Actionable recommendations")
    competitive_advantage: str = Field(description="Competitive advantage analysis")
    growth_opportunity: str = Field(description="Growth opportunity analysis")
    comprehensive_analysis: str = Field(description="Comprehensive narrative analysis")
    category_insights: List[Dict[str, Any]] = Field(description="Detailed insights for each category")

class AssessmentAgent(Agent):
    """AI Agent for analyzing entrepreneurial assessments using EXACT locked scoring logic and mission-critical prompts"""
    
    def __init__(self):
        instruction = """You are an expert entrepreneurial assessment analyst for Gutcheck.AI. 

**IMPORTANT: You expect JSON input with assessment session data and pre-calculated scores, not conversational queries.**

**Expected Input Format:**
```json
{
  "session_id": "unique_session_id",
  "responses": [
    {
      "question_id": "q1",
      "question_text": "What stage is your business currently in?",
      "response": "Early operations with a few customers",
      "question_type": "multipleChoice",
      "category": "personalBackground"
    }
  ],
  "industry": "Technology & Software",
  "location": "California",
  "overall_score": 78,
  "category_scores": [...],
  "question_scores": [...]
}
```

**Your Role:**
- Generate AI-powered insights and recommendations based on pre-calculated scores
- Provide comprehensive analysis of entrepreneurial potential
- Create actionable recommendations for improvement
- Analyze competitive advantages and growth opportunities
- Return structured JSON output for the report page

**Output Format:**
```json
{
  "key_insights": [...],
  "recommendations": [...],
  "competitive_advantage": "...",
  "growth_opportunity": "...",
  "category_insights": [...]
}
```

**Do NOT engage in conversation. Process JSON input and return JSON output only.**"""
        
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
    
    def _handle_conversational_query(self, query: str) -> str:
        """Handle conversational queries for testing and debugging"""
        query_lower = query.lower()
        
        if "hello" in query_lower or "hi" in query_lower:
            return "Hello! I'm the Gutcheck.AI Assessment Analysis Agent. I'm designed to process assessment data and provide scoring and insights. For testing, you can send me JSON assessment data, or ask me about my capabilities."
        
        elif "json" in query_lower or "format" in query_lower or "input" in query_lower:
            return """I expect JSON input with assessment session data like this:

{
  "session_id": "test_001",
  "responses": [
    {
      "question_id": "q1",
      "question_text": "What stage is your business currently in?",
      "response": "Early operations with a few customers",
      "question_type": "multipleChoice",
      "category": "personalBackground"
    }
  ],
  "industry": "Technology & Software",
  "location": "California"
}

I'll return structured JSON with scores, insights, and recommendations."""
        
        elif "test" in query_lower or "sample" in query_lower:
            return "I can process assessment data and provide comprehensive scoring and insights. To test me, send JSON assessment data in the format I described."
        
        else:
            return "I'm the Gutcheck.AI Assessment Analysis Agent. I process assessment data and provide scoring and insights. Send me JSON assessment data to see me in action!"
    
    async def _analyze_assessment(self, session: AssessmentSession) -> AssessmentAnalysis:
        """Generate AI-powered insights and analysis based on pre-calculated scores"""
        # Convert dictionary to list format for processing
        category_scores_list = [{"category": cat, "score": score} for cat, score in session.category_scores.items()]
        
        # Find highest and lowest scoring categories from actual data
        sorted_categories = sorted(category_scores_list, key=lambda x: x['score'], reverse=True)
        highest_category = sorted_categories[0]
        lowest_category = sorted_categories[-1]
        
        # Calculate potential improvement impact
        lowest_weight = CATEGORY_WEIGHTS.get(lowest_category['category'], 20)
        improvement_potential = round((100 - lowest_category['score']) * (lowest_weight / 100) * 0.5)
        
        # Use ACTUAL star rating calculation from codebase
        def get_star_rating(score):
            # From src/utils/scoring.ts getStarRating function
            if score >= 90: return "5-star"  # Transformative Trajectory
            elif score >= 80: return "4-star"  # Established Signals
            elif score >= 65: return "3-star"  # Emerging Traction
            elif score >= 50: return "2-star"  # Forming Potential
            else: return "1-star"  # Early Spark
        
        def get_score_description(score):
            # Based on actual score ranges from codebase
            if score >= 90: return "transformative trajectory"
            elif score >= 80: return "established signals"
            elif score >= 65: return "emerging traction"
            elif score >= 50: return "forming potential"
            else: return "early spark"
        
        def get_category_display_name(category):
            display_names = {
                'personalBackground': 'Personal Background',
                'entrepreneurialSkills': 'Entrepreneurial Skills', 
                'resources': 'Resources',
                'behavioralMetrics': 'Behavioral Metrics',
                'growthVision': 'Growth Vision'
            }
            return display_names.get(category, category)
        
        # Key Insights - based on actual 5-star scoring system
        key_insights = [
            f"Your {get_category_display_name(highest_category['category'])} score of {highest_category['score']:.0f}/100 represents {get_star_rating(highest_category['score'])} performance among {session.industry} entrepreneurs",
            f"Improving {get_category_display_name(lowest_category['category'])} could boost your overall score by {improvement_potential} points",
            f"Your overall score of {session.overall_score:.0f}/100 indicates {get_score_description(session.overall_score)} entrepreneurial potential"
        ]
        
        # Recommendations - based on actual weak areas
        recommendations = [
            f"Focus on systematic improvement in {get_category_display_name(lowest_category['category'])} through targeted skill development",
            f"Leverage your {get_category_display_name(highest_category['category'])} strengths to address weaker areas",
            f"Prioritize the {lowest_weight}% weight of {get_category_display_name(lowest_category['category'])} in your development plan"
        ]
        
        # Find specific strengths and weaknesses based on ACTUAL star rating thresholds
        # 4+ star performance (80+ score) = strengths, 1-star performance (<50 score) = weaknesses
        strengths = [cat for cat in category_scores_list if cat['score'] >= 80]
        weaknesses = [cat for cat in category_scores_list if cat['score'] < 50]
        
        # Competitive Advantage - based on actual 5-star scoring system
        strength_points = []
        for strength in strengths[:3]:  # Top 3 strengths
            strength_points.append(f"• {get_category_display_name(strength['category'])} {get_star_rating(strength['score'])} performance with {strength['score']:.0f}/100 score")
        
        competitive_advantage = f"""Your {get_category_display_name(highest_category['category'])} capabilities represent {get_star_rating(highest_category['score'])} performance among {session.industry} entrepreneurs in {session.location}.

What makes you stand out:
{chr(10).join(strength_points) if strength_points else f"• {get_category_display_name(highest_category['category'])} {get_star_rating(highest_category['score'])} performance with {highest_category['score']:.0f}/100 score"}
• Industry expertise in {session.industry}
• Location advantage in {session.location} market"""
        
        # Growth Opportunity - based on actual 5-star scoring system
        weakness_points = []
        for weakness in weaknesses:
            weakness_points.append(f"• {get_category_display_name(weakness['category'])} {get_star_rating(weakness['score'])} performance needs development")
        
        growth_opportunity = f"""Your {get_category_display_name(lowest_category['category'])} area represents your biggest growth opportunity.

Areas for improvement:
{chr(10).join(weakness_points) if weakness_points else f"• {get_category_display_name(lowest_category['category'])} {get_star_rating(lowest_category['score'])} performance optimization"}
• Potential {improvement_potential}-point overall score improvement
• {lowest_weight}% category weight makes this high-impact for overall performance"""
        
        # Comprehensive Analysis - based on actual 5-star scoring system
        score_category = "Established Signals" if session.overall_score >= 70 else "Developing Signals"
        
        comprehensive_analysis = f"""Your Gutcheck Score of {session.overall_score:.0f}/100 represents {get_score_description(session.overall_score)} in entrepreneurial readiness. Your {get_category_display_name(highest_category['category'])} performance of {highest_category['score']:.0f}/100 represents {get_star_rating(highest_category['score'])} capabilities, while your {get_category_display_name(lowest_category['category'])} score of {lowest_category['score']:.0f}/100 represents {get_star_rating(lowest_category['score'])} performance.

With {len(strengths)} categories achieving 4+ star performance (80+/100) and {len(weaknesses)} areas at 1-star performance (<50/100), your profile shows {'strong foundational skills with focused improvement areas' if len(strengths) >= len(weaknesses) else 'developing capabilities with significant growth potential'}.

The {lowest_weight}% weight of {get_category_display_name(lowest_category['category'])} makes improvement in this area particularly impactful for your overall entrepreneurial effectiveness in the {session.industry} sector."""
        
        # Category Insights - based on actual 5-star scoring system
        category_insights = []
        for cat_score in category_scores_list:
            score = cat_score['score']
            category = cat_score['category']
            weight = CATEGORY_WEIGHTS.get(category, 20)
            
            if score >= 90:  # 5-star performance
                insight = f"{get_star_rating(score)} {get_category_display_name(category)} performance - leverage this {weight}% strength"
            elif score >= 80:  # 4-star performance
                insight = f"{get_star_rating(score)} {get_category_display_name(category)} performance - strong {weight}% foundation"
            elif score >= 65:  # 3-star performance
                insight = f"{get_star_rating(score)} {get_category_display_name(category)} performance with {weight}% category weight"
            elif score >= 50:  # 2-star performance
                insight = f"{get_star_rating(score)} {get_category_display_name(category)} performance needs development - {weight}% impact"
            else:  # 1-star performance
                insight = f"{get_star_rating(score)} {get_category_display_name(category)} performance - priority improvement area with {weight}% weight"
            
            category_insights.append({
                "category": category,
                "score": score,
                "insights": [insight]
            })
        
        return AssessmentAnalysis(
            key_insights=key_insights,
            recommendations=recommendations,
            competitive_advantage=competitive_advantage,
            growth_opportunity=growth_opportunity,
            comprehensive_analysis=comprehensive_analysis,
            category_insights=category_insights
        )
    
    async def _generate_insights(self, session: AssessmentSession, question_scores: List[Dict[str, Any]], category_scores: List[Dict[str, Any]]) -> List[str]:
        """Generate key insights from the assessment using AI"""
        prompt = f"""
        Based on this entrepreneurial assessment, generate 3-5 key insights about the entrepreneur's profile.
        
        Industry: {session.industry}
        Location: {session.location}
        
        Category Scores:
        {[f"{cat['category']}: {cat['score']:.1f}/100" for cat in category_scores]}
        
        Generate insights that are:
        - Specific and actionable
        - Based on the assessment data
        - Relevant to their industry and stage
        - Focused on entrepreneurial potential
        
        Return as a JSON array of insight strings.
        """
        
        async for result in self.canonical_model.generate_content_async(prompt):
            response_text = result if isinstance(result, str) else result.text
            break  # Take the first result
        
        # Parse JSON response
        json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
        
        if not json_match:
            raise ValueError("AI response could not be parsed as JSON for insights")
        
        insights = json.loads(json_match.group())
        return insights
    
    async def _generate_recommendations(self, session: AssessmentSession, category_scores: List[Dict[str, Any]]) -> List[str]:
        """Generate actionable recommendations using AI"""
        prompt = f"""
        Based on this entrepreneurial assessment, generate 3-5 specific, actionable recommendations.
        
        Industry: {session.industry}
        
        Category Scores:
        {[f"{cat['category']}: {cat['score']:.1f}/100" for cat in category_scores]}
        
        Focus on practical next steps that will help improve their entrepreneurial score.
        
        Return as a JSON array of recommendation strings.
        """
        
        async for result in self.canonical_model.generate_content_async(prompt):
            response_text = result if isinstance(result, str) else result.text
            break  # Take the first result
        
        # Parse JSON response
        json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
        
        if not json_match:
            raise ValueError("AI response could not be parsed as JSON for recommendations")
        
        recommendations = json.loads(json_match.group())
        return recommendations
    
    async def _analyze_competitive_advantage(self, session: AssessmentSession, category_scores: List[Dict[str, Any]]) -> str:
        """Analyze competitive advantages using AI"""
        prompt = f"""
        Based on this assessment, identify the entrepreneur's key competitive advantages.
        
        Industry: {session.industry}
        Location: {session.location}
        Category Scores: {[f"{cat['category']}: {cat['score']:.1f}/100" for cat in category_scores]}
        
        Focus on what makes them unique and competitive in their market.
        
        Return as a single string analysis.
        """
        
        async for result in self.canonical_model.generate_content_async(prompt):
            return (result if isinstance(result, str) else result.text).strip()
    
    async def _analyze_growth_opportunity(self, session: AssessmentSession, category_scores: List[Dict[str, Any]]) -> str:
        """Analyze growth opportunities using AI"""
        prompt = f"""
        Based on this assessment, identify the biggest growth opportunity for this entrepreneur.
        
        Industry: {session.industry}
        Category Scores: {[f"{cat['category']}: {cat['score']:.1f}/100" for cat in category_scores]}
        
        Focus on the most impactful area for improvement and growth.
        
        Return as a single string analysis.
        """
        
        async for result in self.canonical_model.generate_content_async(prompt):
            return (result if isinstance(result, str) else result.text).strip()
    
    async def _generate_category_insights(self, category_scores: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate insights for each category using AI"""
        category_insights = []
        
        for category_score in category_scores:
            category = category_score['category']
            score = category_score['score']
            
            prompt = f"""
            Based on the assessment score for the {category} category ({score:.1f}/100), generate 1-2 specific insights.
            
            Focus on what this score reveals about this entrepreneur's {category} strengths and areas for improvement.
            
            Return as a JSON array of insight strings.
            """
            
            async for result in self.canonical_model.generate_content_async(prompt):
                response_text = result if isinstance(result, str) else result.text
                break  # Take the first result
            
            # Parse JSON response
            json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
            
            if not json_match:
                insights = [f"Category {category} scored {score:.1f}/100"]
            else:
                insights = json.loads(json_match.group())
            
            category_insights.append({
                "category": category,
                "score": score,
                "insights": insights
            })
        
        return category_insights

# 🔑 REQUIRED: Define root_agent for ADK discovery
root_agent = AssessmentAgent()
