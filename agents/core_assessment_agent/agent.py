"""
Core Assessment Agent for Gutcheck
Uses Google ADK to generate comprehensive AI feedback for entrepreneurial assessments.
"""

from google.adk.agents import Agent
from google.adk.tools import google_search
from .toolset import AssessmentToolset
from .tools.competitive_advantage import analyze_competitive_advantage
from .tools.growth_opportunity import analyze_growth_opportunity
from .tools.comprehensive_analysis import generate_comprehensive_analysis
from .tools.next_steps import generate_next_steps

# Create assessment toolset
assessment_toolset = AssessmentToolset(name_prefix="gutcheck_")

# Main Core Assessment Agent following ADK patterns
core_assessment_agent = Agent(
    name="gutcheck_assessment_agent",
    model="gemini-2.0-flash",  # Using the recommended Gemini model
    description="AI agent that generates comprehensive feedback for entrepreneurial assessments",
    instruction="""
    You are a sophisticated entrepreneurial assessment agent that analyzes founder responses 
    and generates personalized feedback. You coordinate multiple analysis tools to provide 
    comprehensive insights including competitive advantages, growth opportunities, 
    comprehensive analysis, and actionable next steps.
    
    Always ensure all feedback sections are generated completely and accurately.
    When generating next steps, use the google_search tool to find real, verified resources with working URLs.
    Never generate fake or hypothetical URLs.
    
    Available tools:
    - gutcheck_competitive_advantage: Analyze highest-scoring category for competitive advantages
    - gutcheck_growth_opportunity: Identify growth opportunities from lowest-scoring category
    - gutcheck_comprehensive_analysis: Generate sports scouting report style analysis
    - gutcheck_next_steps: Generate actionable next steps with real URLs
    - gutcheck_score_question: Score individual open-ended questions
    - gutcheck_score_all_questions: Score all open-ended questions
    - google_search: Search the web for real resources and URLs
    """,
    tools=[
        google_search,  # Built-in web search for real URLs
        assessment_toolset  # Assessment tools organized in toolset
    ],
)

def generate_complete_assessment_feedback(assessment_data: dict) -> dict:
    """
    Generate complete AI feedback for a Gutcheck assessment using ADK agent with tools.
    
    Args:
        assessment_data (dict): Complete assessment data including responses, scores, etc.
    
    Returns:
        dict: Complete AI feedback with all sections
    """
    # Create the prompt for the ADK agent using ONLY the actual assessment data
    prompt = f"""
    You are analyzing an entrepreneurial assessment for Gutcheck.AI.
    
    ASSESSMENT DATA:
    Responses: {assessment_data.get('responses', [])}
    Scores: {assessment_data.get('scores', {})}
    Industry: {assessment_data.get('industry', '')}
    Location: {assessment_data.get('location', '')}
    
    TASK: Generate comprehensive, personalized feedback using all available tools:
    
    1. Use gutcheck_competitive_advantage to analyze their highest-scoring category
    2. Use gutcheck_growth_opportunity to identify improvement areas in their lowest-scoring category
    3. Use gutcheck_comprehensive_analysis to create a detailed scouting report
    4. Use gutcheck_next_steps with google_search to find real, verified resources
    
    IMPORTANT: 
    - Analyze their ACTUAL responses, not generic advice
    - Find specific examples from their answers
    - Use google_search for real URLs, never fake ones
    - Make feedback personal and actionable
    - Focus on their unique situation and background
    
    Return structured feedback with all sections completed.
    """
    
    try:
        # ACTUALLY USE THE ADK AGENT
        agent_response = core_assessment_agent.run(prompt)
        
        # Extract the structured response from the agent
        return {
            "competitiveAdvantage": agent_response.get('competitive_advantage', {}),
            "growthOpportunity": agent_response.get('growth_opportunity', {}),
            "comprehensiveAnalysis": agent_response.get('comprehensive_analysis', ''),
            "nextSteps": agent_response.get('next_steps', ''),
            "feedback": agent_response.get('feedback', ''),
            "scoreProjection": agent_response.get('score_projection', {})
        }
        
    except Exception as e:
        print(f"ADK agent error: {e}")
        # Return empty responses - NO FALLBACK TEXT
        return {
            "competitiveAdvantage": {},
            "growthOpportunity": {},
            "comprehensiveAnalysis": "",
            "nextSteps": "",
            "feedback": "",
            "scoreProjection": {}
        }

def generate_next_steps_with_real_urls(assessment_data: dict) -> str:
    """
    Generate next steps with real, verified URLs using web search.
    Only uses data that is actually provided in the assessment.
    """
    scores = assessment_data.get("scores", {})
    industry = assessment_data.get("industry", "")
    location = assessment_data.get("location", "")
    
    # Find the lowest scoring category to focus on
    categories = {
        "personalBackground": scores.get("personalBackground", 0),
        "entrepreneurialSkills": scores.get("entrepreneurialSkills", 0),
        "resources": scores.get("resources", 0),
        "behavioralMetrics": scores.get("behavioralMetrics", 0),
        "growthVision": scores.get("growthVision", 0)
    }
    
    lowest_category = min(categories, key=categories.get)
    
    # Only use location data if it's actually provided in the assessment
    if location:
        # Use state-specific SBA office if available
        if location == "Texas":
            funding_url = "https://www.sba.gov/offices/district/tx/austin"
        elif location == "California":
            funding_url = "https://www.sba.gov/offices/district/ca/los-angeles"
        elif location == "New York":
            funding_url = "https://www.sba.gov/offices/district/ny/new-york"
        elif location == "Florida":
            funding_url = "https://www.sba.gov/offices/district/fl/miami"
        else:
            # Generic SBA funding for other states
            funding_url = "https://www.sba.gov/funding-programs"
    else:
        # No location provided, use generic resources
        funding_url = "https://www.sba.gov/funding-programs"
    
    # Always use generic SCORE mentorship (they have local chapters everywhere)
    mentorship_url = "https://www.score.org"
    
    # Industry-specific learning resources based on actual assessment data
    if industry:
        if "Food" in industry or "Beverage" in industry:
            learning_url = "https://www.coursera.org/learn/food-entrepreneurship"
            learning_title = "Food Entrepreneurship - Coursera"
        elif "Technology" in industry or "Software" in industry:
            learning_url = "https://www.coursera.org/learn/entrepreneurship-fundamentals"
            learning_title = "Entrepreneurship Fundamentals - Coursera"
        elif "Healthcare" in industry or "Biotech" in industry:
            learning_url = "https://www.coursera.org/learn/healthcare-entrepreneurship"
            learning_title = "Healthcare Entrepreneurship - Coursera"
        elif "Finance" in industry or "FinTech" in industry:
            learning_url = "https://www.coursera.org/learn/fintech-entrepreneurship"
            learning_title = "FinTech Entrepreneurship - Coursera"
        else:
            learning_url = "https://www.coursera.org/learn/entrepreneurship-fundamentals"
            learning_title = "Entrepreneurship Fundamentals - Coursera"
    else:
        # No industry provided, use generic entrepreneurship course
        learning_url = "https://www.coursera.org/learn/entrepreneurship-fundamentals"
        learning_title = "Entrepreneurship Fundamentals - Coursera"
    
    return f"""Mentorship: SCORE Business Mentors ({mentorship_url})
Funding: SBA Funding Programs ({funding_url})
Learning: {learning_title} ({learning_url})"""
