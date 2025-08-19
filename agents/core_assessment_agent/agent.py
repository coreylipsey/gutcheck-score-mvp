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
    Generate complete AI feedback for a Gutcheck assessment.
    
    Args:
        assessment_data (dict): Complete assessment data including responses, scores, etc.
    
    Returns:
        dict: Complete AI feedback with all sections
    """
    # Add questionText to each response if not present
    question_text_map = {
        'q1': 'What is your current employment status?',
        'q2': 'How many years of work experience do you have?',
        'q3': 'Tell us about your entrepreneurial journey so far. What businesses have you started or been involved with?',
        'q4': 'How would you rate your understanding of business fundamentals?',
        'q5': 'What is your highest level of education?',
        'q6': 'How often do you track your business or personal goals?',
        'q7': 'How do you typically approach problem-solving in business situations?',
        'q8': 'Describe a significant business challenge you\'ve faced and how you handled it.',
        'q9': 'How do you stay updated with industry trends and business knowledge?',
        'q10': 'How would you rate your networking and relationship-building skills?',
        'q11': 'What is your current financial situation regarding business funding?',
        'q12': 'How would you describe your access to mentors or business advisors?',
        'q13': 'What is your current team size or support network?',
        'q14': 'How do you typically make important business decisions?',
        'q15': 'How do you handle stress and pressure in business situations?',
        'q16': 'How would you rate your time management and organizational skills?',
        'q17': 'How do you typically respond to failure or setbacks?',
        'q18': 'Tell us about a time when you faced a major setback. How did you respond and what did you learn?',
        'q19': 'How do you approach learning and skill development?',
        'q20': 'What is your typical approach to risk-taking in business?',
        'q21': 'How do you envision your business growing over the next 3-5 years?',
        'q22': 'What is your primary motivation for starting or growing a business?',
        'q23': 'What is your long-term vision for your entrepreneurial journey?',
        'q24': 'How do you measure success in your business endeavors?',
        'q25': 'What is your approach to innovation and staying competitive?'
    }
    
    # Add questionText to each response
    for response in assessment_data.get('responses', []):
        if 'questionId' in response and 'questionText' not in response:
            response['questionText'] = question_text_map.get(response['questionId'], 'Assessment question')
    
    # Get feedback from tools
    competitive_advantage_result = analyze_competitive_advantage(assessment_data)
    growth_opportunity_result = analyze_growth_opportunity(assessment_data)
    comprehensive_analysis_result = generate_comprehensive_analysis(assessment_data)
    next_steps_result = generate_next_steps(assessment_data)
    
    # Ensure competitive advantage is in the correct format
    if isinstance(competitive_advantage_result, dict):
        competitive_advantage = competitive_advantage_result
    else:
        # Fallback if tool returns string
        competitive_advantage = {
            "category": "Entrepreneurial Skills",
            "score": "Strong",
            "summary": str(competitive_advantage_result),
            "specificStrengths": ["Analysis completed successfully"]
        }
    
    # Ensure growth opportunity is in the correct format
    if isinstance(growth_opportunity_result, dict):
        growth_opportunity = growth_opportunity_result
    else:
        # Fallback if tool returns string
        growth_opportunity = {
            "category": "Resources",
            "score": "Opportunity",
            "summary": str(growth_opportunity_result),
            "specificWeaknesses": ["Analysis completed successfully"]
        }
    
    # Calculate score projection
    current_score = sum(assessment_data.get('scores', {}).values())
    projected_score = min(100, current_score + 15)  # Conservative 15-point improvement
    
    score_projection = {
        "currentScore": current_score,
        "projectedScore": projected_score,
        "improvementPotential": projected_score - current_score
    }
    
    return {
        "competitiveAdvantage": competitive_advantage,
        "growthOpportunity": growth_opportunity,
        "comprehensiveAnalysis": str(comprehensive_analysis_result),
        "nextSteps": str(next_steps_result),
        "feedback": "AI feedback generation completed successfully.",
        "scoreProjection": score_projection
    }
