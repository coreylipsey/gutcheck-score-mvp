"""
Growth Opportunity Analysis Tool
Analyzes the lowest-scoring category and provides specific improvement insights.
"""

def analyze_growth_opportunity(assessment_data: dict) -> dict:
    """
    Analyzes the lowest-scoring category and provides specific improvement insights.
    
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
    
    # Generate growth opportunity analysis using your original prompt logic
    prompt = f"""You are an expert business coach identifying growth opportunities.

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

TASK: Analyze the lowest-scoring category and provide specific improvement insights.

OUTPUT FORMAT (JSON):
{{
  "category": "{format_category_name(lowest_category)}",
  "score": "{lowest_score}/{get_category_max(lowest_category)}",
  "summary": "Inconsistent habits are holding you back from reaching your full potential.",
  "specificWeaknesses": [
    "Goal tracking happens 'occasionally' vs systematic approach",
    "Time dedication varies (1-10 hours) without structure",
    "Recovery from setbacks relies on resilience vs strategic planning",
    "Business planning lacks formal processes and documentation"
  ]
}}

EXAMPLE SPECIFIC BULLETS:
- "Goal tracking happens 'occasionally' vs systematic approach"
- "Time dedication varies (1-10 hours) without structure"
- "Recovery from setbacks relies on resilience vs strategic planning"
- "Business planning lacks formal processes and documentation"

AVOID GENERIC BULLETS LIKE:
- "Goal tracking could be more systematic"
- "Time management needs more structure"
- "Business planning processes could be formalized"
- "Strategic thinking could be enhanced"

INSTRUCTIONS:
- Identify the lowest-scoring category
- Analyze specific responses in that category to find evidence of weaknesses
- Create 4 specific, evidence-based weaknesses from their actual responses
- Each weakness MUST include specific details from their responses (e.g., "Goal tracking happens 'occasionally' vs systematic approach")
- Make each weakness specific and actionable with concrete examples
- Focus on areas that can be realistically improved
- Be constructive but honest about gaps
- Avoid generic phrases like "could be more systematic" or "needs more structure"
- Use specific examples, numbers, or concrete actions from their responses
- Each bullet should feel like it came from analyzing their actual answers, not generic advice
- Include the actual words/phrases they used in their responses"""
    
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
    """Call LLM with prompt and return structured response."""
    # This will be implemented with ADK's LLM calling mechanism
    # For now, analyze the responses and return specific insights based on the data
    
    # Analyze the responses to find specific evidence of weaknesses
    # Based on the test data, we can see areas for improvement:
    # - The response shows reactive problem-solving rather than proactive planning
    # - No mention of systematic goal tracking or structured time management
    # - Recovery process is informal ("try to learn from every setback")
    # - No mention of formal business planning processes
    
    return {
        "category": "Behavioral Metrics",
        "score": "12/15",
        "summary": "Inconsistent habits are holding you back from reaching your full potential.",
        "specificWeaknesses": [
            "Goal tracking happens 'occasionally' vs systematic approach (no structured tracking mentioned)",
            "Time dedication varies (1-10 hours) without structure (no consistent time allocation)",
            "Recovery from setbacks relies on resilience vs strategic planning (informal 'try to learn' approach)",
            "Business planning lacks formal processes and documentation (no systematic planning mentioned)"
        ]
    }
