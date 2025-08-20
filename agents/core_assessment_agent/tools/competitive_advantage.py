"""
Competitive Advantage Analysis Tool
Analyzes the highest-scoring category and identifies competitive advantages.
"""

import os
import json
import re

def analyze_competitive_advantage(assessment_data: dict) -> dict:
    """
    Analyzes the highest-scoring category and identifies competitive advantages.
    
    Args:
        assessment_data (dict): Assessment responses, scores, and metadata
    
    Returns:
        dict: Competitive advantage analysis with category, score, summary, and strengths
    """
    # Extract assessment data
    responses = assessment_data.get("responses", [])
    scores = assessment_data.get("scores", {})
    industry = assessment_data.get("industry", "")
    location = assessment_data.get("location", "")
    
    # Find highest scoring category
    categories = {
        "personalBackground": scores.get("personalBackground", 0),
        "entrepreneurialSkills": scores.get("entrepreneurialSkills", 0),
        "resources": scores.get("resources", 0),
        "behavioralMetrics": scores.get("behavioralMetrics", 0),
        "growthVision": scores.get("growthVision", 0)
    }
    
    top_category = max(categories, key=categories.get)
    top_score = categories[top_category]
    
    # Generate competitive advantage analysis using ADK LLM
    prompt = f"""You are an expert business analyst identifying competitive advantages.

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

TASK: Analyze the highest-scoring category and identify specific competitive advantages.

OUTPUT FORMAT (JSON):
{{
  "category": "{format_category_name(top_category)}",
  "score": "{top_score}/{get_category_max(top_category)}",
  "summary": "Your highest-scoring category reveals key competitive strengths.",
  "specificStrengths": [
    "Specific strength based on their actual responses",
    "Another specific strength from their answers",
    "Third specific strength from their data",
    "Fourth specific strength from their assessment"
  ]
}}

EXAMPLE SPECIFIC BULLETS (use their actual responses):
- "Strong team building (selected 'Small team' which shows collaborative approach)"
- "Excellent time management (chose 'Daily' goal tracking, demonstrating discipline)"
- "Strategic funding approach (selected 'Loans/grants' showing financial planning)"
- "Resilient mindset (chose 'Restarted' showing persistence through setbacks)"

AVOID GENERIC BULLETS LIKE:
- "Strong foundation in business fundamentals"
- "Demonstrated problem-solving abilities"
- "Commitment to continuous learning"
- "Resilient approach to challenges"

INSTRUCTIONS:
- Identify the highest-scoring category
- Look at the specific multiple choice responses they selected in that category
- Find the responses they chose that earned the highest points (4-5 points)
- Create 4 specific strengths based on their actual selected responses
- Each strength MUST reference their specific choice (e.g., "Strong team building (selected 'Small team' which shows collaborative approach)")
- Highlight why their specific choice demonstrates a competitive advantage
- Focus on the concrete actions/choices they made, not generic traits
- Use the exact wording from their selected responses
- Each bullet should clearly show which response they chose and why it's a strength

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
        # Check if we have API credentials
        api_key = os.getenv("GOOGLE_API_KEY")
        app_creds = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        
        if (api_key and api_key != 'your-gemini-api-key-here') or app_creds:
            # We have credentials, use real ADK LLM
            from google.adk.models import Gemini
            import asyncio
            
            # Initialize the ADK LLM
            llm = Gemini(model="gemini-2.0-flash")
            
            # Generate response using async method
            async def generate_response():
                async_gen = llm.generate_content_async(prompt)
                response = None
                async for chunk in async_gen:
                    response = chunk
                    break
                return response
            
            # Run the async function
            response = asyncio.run(generate_response())
            
            if response:
                # Parse the response as JSON
                # Try to extract JSON from the response
                json_match = re.search(r'\{.*\}', str(response), re.DOTALL)
                if json_match:
                    try:
                        return json.loads(json_match.group())
                    except json.JSONDecodeError:
                        pass
                
                # If JSON parsing fails, return structured response
                return {
                    "category": "Competitive Advantage",
                    "score": "High",
                    "summary": "Your highest-scoring category reveals key competitive strengths.",
                    "specificStrengths": [
                        "Strong execution capabilities demonstrated in assessment",
                        "Strategic thinking and planning abilities",
                        "Resilient approach to challenges",
                        "Effective resource utilization"
                    ]
                }
        
        # Fallback to mock response if no credentials or error
        print("   ℹ️  Using mock response (no API credentials or error)")
        return {
            "category": "Personal Background",
            "score": "17/20",
            "summary": "Your highest-scoring category reveals key competitive strengths.",
            "specificStrengths": [
                "Strong entrepreneurial experience (started two businesses in 5 years)",
                "Proven business model development (consulting business generating $50K annually)",
                "Strategic business transitions (successfully sold food truck business)",
                "Diverse industry experience (food service and consulting)"
            ]
        }
        
    except Exception as e:
        print(f"ADK LLM call error: {e}")
        # Return fallback response
        return {
            "category": "Competitive Advantage",
            "score": "High",
            "summary": "Your highest-scoring category reveals key competitive strengths.",
            "specificStrengths": [
                "Strong execution capabilities demonstrated in assessment",
                "Strategic thinking and planning abilities",
                "Resilient approach to challenges",
                "Effective resource utilization"
            ]
        }
