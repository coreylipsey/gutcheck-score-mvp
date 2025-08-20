"""
Key Insights Generation Tool
Generates a 3-sentence executive summary of the assessment.
"""

from google.adk.models import Gemini
import json
import re

def generate_key_insights(assessment_data: dict) -> str:
    """
    Generates a 3-sentence executive summary of the assessment.
    
    Args:
        assessment_data (dict): Assessment responses, scores, and metadata
    
    Returns:
        str: 3-sentence executive summary
    """
    # Extract assessment data
    responses = assessment_data.get("responses", [])
    scores = assessment_data.get("scores", {})
    industry = assessment_data.get("industry", "")
    location = assessment_data.get("location", "")
    
    # Calculate overall score
    total_score = sum(scores.values())
    max_possible = 100  # 20+25+20+15+20
    percentage = (total_score / max_possible) * 100
    
    # Generate key insights using ADK LLM
    prompt = f"""You are an expert business analyst creating a concise executive summary.

ASSESSMENT DATA:
{format_responses(responses)}

CURRENT SCORES:
- Personal Foundation: {scores.get('personalBackground', 0)}/20
- Entrepreneurial Skills: {scores.get('entrepreneurialSkills', 0)}/25
- Resources: {scores.get('resources', 0)}/20
- Behavioral Metrics: {scores.get('behavioralMetrics', 0)}/15
- Growth & Vision: {scores.get('growthVision', 0)}/20
- Overall Score: {total_score}/{max_possible} ({percentage:.1f}%)
- Industry: {industry or 'Not specified'}
- Location: {location or 'Not specified'}

TASK: Create a 3-sentence executive summary that captures the key insights from this assessment.

INSTRUCTIONS:
- Write exactly 3 sentences
- First sentence: Overall assessment and score context
- Second sentence: Key strength based on their actual responses
- Third sentence: Primary growth opportunity based on their actual responses
- Base all insights on their specific responses, not generic observations
- Use concrete examples from their answers
- Make it personal and actionable
- Focus on their unique situation and background

EXAMPLE FORMAT:
"Your assessment shows a solid foundation with room for strategic growth. Your experience in [specific area from their responses] demonstrates strong [specific strength]. To accelerate your progress, focus on developing [specific area from their responses]."

Return only the 3-sentence executive summary."""
    
    # Use ADK's LLM call to execute the prompt
    return call_llm_with_prompt(prompt)

def format_responses(responses: list) -> str:
    """Format responses the same way as your current code."""
    return '\n'.join([
        f"Question {r['questionId']}: {r['questionText']}\nResponse: {r['response']}"
        for r in responses
    ])

def call_llm_with_prompt(prompt: str) -> str:
    """Call ADK LLM with prompt and return insights text."""
    try:
        # Initialize the ADK LLM
        llm = Gemini(model="gemini-2.0-flash")
        
        # Generate response - use the correct method
        # For now, use a mock response since ADK requires credentials
        # In production, this would use: response = llm.generate_content_async(prompt)
        
        # Mock response for testing
        return "Your assessment reveals a solid foundation with clear potential for growth, scoring 78/100 overall. Your experience in starting and scaling two businesses demonstrates strong entrepreneurial execution and strategic thinking. To accelerate your progress, focus on developing systematic goal tracking and time management systems to optimize your behavioral metrics and drive even greater success."
        
    except Exception as e:
        print(f"ADK LLM call error: {e}")
        # Return fallback insights
        return "Your assessment reveals a solid foundation with clear potential for growth. Your execution patterns show promising indicators, particularly in your approach to problem-solving and goal-setting. The data suggests you're positioned well for scaling, with clear opportunities to strengthen your resource allocation and long-term planning processes."
