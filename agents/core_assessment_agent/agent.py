"""
Core Assessment Agent for Gutcheck
Uses Google ADK to generate comprehensive AI feedback for entrepreneurial assessments.
"""

from google.adk.agents import Agent
from google.adk.tools import google_search
from .tools.competitive_advantage import analyze_competitive_advantage
from .tools.growth_opportunity import analyze_growth_opportunity
from .tools.comprehensive_analysis import generate_comprehensive_analysis
from .tools.next_steps import generate_next_steps
from .tools.question_scoring import score_open_ended_question, score_all_open_ended_questions

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
    When generating next steps, use web search to find real, verified resources with working URLs.
    Never generate fake or hypothetical URLs.
    """,
    tools=[
        google_search,  # Built-in web search for real URLs
        analyze_competitive_advantage,
        analyze_growth_opportunity, 
        generate_comprehensive_analysis,
        generate_next_steps,
        score_open_ended_question,
        score_all_open_ended_questions
    ],
)

def generate_complete_assessment_feedback(assessment_data: dict) -> dict:
    """
    Generate complete AI feedback for a Gutcheck assessment.
    
    Args:
        assessment_data (dict): Complete assessment data including responses, scores, etc.
    
    Returns:
        dict: Complete AI feedback with all sections
    """
    return {
        "competitiveAdvantage": analyze_competitive_advantage(assessment_data),
        "growthOpportunity": analyze_growth_opportunity(assessment_data),
        "comprehensiveAnalysis": generate_comprehensive_analysis(assessment_data),
        "nextSteps": generate_next_steps(assessment_data),
        "feedback": "AI feedback generation completed successfully."
    }
