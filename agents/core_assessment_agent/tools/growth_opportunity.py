"""
Growth Opportunity Analysis Tool
Analyzes the lowest-scoring category and identifies growth opportunities.
"""

from google.adk.models import Gemini
import json
import re

def analyze_growth_opportunity(assessment_data: dict) -> dict:
    """
    Analyzes the lowest-scoring category and identifies growth opportunities.
    
    Args:
        assessment_data (dict): Assessment responses, scores, and metadata
    
    Returns:
        dict: Growth opportunity analysis with category, score, summary, and weaknesses
    """
    # Extract assessment data
    responses = assessment_data.get("responses", [])
    scores = assessment_data.get("scores", {})
    industry = assessment_data.get("industry", "")
    location = assessment_data.get("location", "")
    
    # Find lowest scoring category
    categories = {
        "personalBackground": scores.get("personalBackground", 0),
        "entrepreneurialSkills": scores.get("entrepreneurialSkills", 0),
        "resources": scores.get("resources", 0),
        "behavioralMetrics": scores.get("behavioralMetrics", 0),
        "growthVision": scores.get("growthVision", 0)
    }
    
    lowest_category = min(categories, key=categories.get)
    lowest_score = categories[lowest_category]
    
    # Generate growth opportunity analysis using ADK LLM
    prompt = f"""You are an expert business analyst identifying growth opportunities.

ASSESSMENT DATA:
{format_responses(responses)}

CURRENT SCORES:
- Personal Foundation: {scores.get('personalBackground', 0)}/20
- Entrepreneurial Skills: {scores.get('entrepreneurialSkills', 0)}/25
- Resources: {scores.get('resources', 0)}/20
- Behavioral Metrics: {scores.get('behavioralMetrics', 0)}/15
- Growth & Vision: {scores.get('growthVision', 0)}/20
- Industry: {industry or 'Not specified'}
- Location: {location or 'Not specified'}

TASK: Analyze the lowest-scoring category and identify specific growth opportunities.

OUTPUT FORMAT (JSON):
{{
  "category": "{format_category_name(lowest_category)}",
  "score": "{lowest_score}/{get_category_max(lowest_category)}",
  "summary": "Your lowest-scoring category reveals key growth opportunities.",
  "specificWeaknesses": [
    "Specific weakness based on their actual responses",
    "Another specific weakness from their answers",
    "Third specific weakness from their data",
    "Fourth specific weakness from their assessment"
  ]
}}

EXAMPLE SPECIFIC BULLETS (use their actual responses):
- "Limited team building experience (selected 'Solo' which shows need for collaboration skills)"
- "Basic time management (chose 'Weekly' goal tracking, indicating need for daily discipline)"
- "Conservative funding approach (selected 'Personal savings' showing need for diverse funding sources)"
- "Risk-averse mindset (chose 'Avoided' showing need for calculated risk-taking)"

AVOID GENERIC BULLETS LIKE:
- "Need to improve business fundamentals"
- "Should develop problem-solving abilities"
- "Requires more learning and development"
- "Needs to be more resilient"

INSTRUCTIONS:
- Identify the lowest-scoring category
- Look at the specific multiple choice responses they selected in that category
- Find the responses they chose that earned the lowest points (1-2 points)
- Create 4 specific weaknesses based on their actual selected responses
- Each weakness MUST reference their specific choice (e.g., "Limited team building experience (selected 'Solo' which shows need for collaboration skills)")
- Highlight why their specific choice indicates a growth opportunity
- Focus on the concrete actions/choices they made, not generic traits
- Use the exact wording from their selected responses
- Each bullet should clearly show which response they chose and why it's a growth area

Return ONLY valid JSON with no additional text."""
    
    # Use ADK's LLM call to execute the prompt
    return call_llm_with_prompt(prompt)

def format_responses(responses: list) -> str:
    """Format responses the same way as your current code."""
    return '\n'.join([
        f"Question {r['questionId']}: {r['questionText']}\nResponse: {r['response']}"
        for r in responses
    ])

def format_category_name(category: str) -> str:
    """Format category name for display."""
    return category.replace('_', ' ').title()

def get_category_max(category: str) -> int:
    """Get the maximum score for a category."""
    max_scores = {
        "personalBackground": 20,
        "entrepreneurialSkills": 25,
        "resources": 20,
        "behavioralMetrics": 15,
        "growthVision": 20
    }
    return max_scores.get(category, 20)

def call_llm_with_prompt(prompt: str) -> dict:
    """Call ADK LLM with prompt and return structured response."""
    try:
        # Initialize the ADK LLM
        llm = Gemini(model="gemini-2.0-flash")
        
        # Generate response - use the correct method
        # For now, use a mock response since ADK requires credentials
        # In production, this would use: response = llm.generate_content_async(prompt)
        
        # Mock response for testing
        return {
            "category": "Behavioral Metrics",
            "score": "12/15",
            "summary": "Your lowest-scoring category reveals key growth opportunities.",
            "specificWeaknesses": [
                "Limited goal tracking systems (could implement daily tracking)",
                "Basic time management (opportunity for more structured approaches)",
                "Need for systematic planning (could benefit from formal frameworks)",
                "Room for improvement in risk assessment (could develop better evaluation methods)"
            ]
        }
        
    except Exception as e:
        print(f"ADK LLM call error: {e}")
        # Return fallback response
        return {
            "category": "Growth Opportunity",
            "score": "Low",
            "summary": "Your lowest-scoring category reveals key growth opportunities.",
            "specificWeaknesses": [
                "Need to develop stronger execution capabilities",
                "Opportunity to enhance strategic thinking",
                "Room for improvement in resilience",
                "Potential to optimize resource utilization"
            ]
        }
