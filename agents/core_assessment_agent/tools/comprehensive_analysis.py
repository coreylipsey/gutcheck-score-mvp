"""
Comprehensive Analysis Tool
Generates comprehensive entrepreneurial analysis using existing prompt logic.
"""

def generate_comprehensive_analysis(assessment_data: dict) -> str:
    """
    Generate comprehensive analysis using your existing prompt logic.
    
    Args:
        assessment_data (dict): Assessment data including responses, scores, etc.
    
    Returns:
        str: Comprehensive analysis text
    """
    # Extract data from assessment_data
    responses = assessment_data.get("responses", [])
    scores = assessment_data.get("scores", {})
    industry = assessment_data.get("industry", "")
    location = assessment_data.get("location", "")
    
    # Calculate scores (same logic as your current code)
    overall_score = sum(scores.values())
    star_rating, star_label = calculate_star_rating(overall_score)
    
    # Your original sports scouting report prompt - converted to Python
    prompt = f"""You are a seasoned entrepreneurial scout, analyzing the signals from a founder's Gutcheck Assessment the way an NFL scout would evaluate a player's combine results and tape. Your role is not to prescribe or judge, but to surface signals, tendencies, and overlooked strengths/risks that help explain where this entrepreneur sits on their trajectory.

ASSESSMENT DATA:
{format_responses(responses)}

CURRENT SCORES:
- Overall Score: {overall_score}/100
- Personal Foundation: {scores.get('personalBackground', 0)}/20
- Entrepreneurial Skills: {scores.get('entrepreneurialSkills', 0)}/25
- Resources: {scores.get('resources', 0)}/20
- Behavioral Metrics: {scores.get('behavioralMetrics', 0)}/15
- Growth & Vision: {scores.get('growthVision', 0)}/20
- Star Rating: {star_rating}/5 ({star_label})
- Industry: {industry or 'Not specified'}
- Location: {location or 'Not specified'}

TASK: Produce a 2-3 paragraph scouting-style report that includes:
1. **Signal Readout** – interpret the score and explain what it means in context, like a scout explaining combine numbers
2. **Strength Signals** – highlight competitive advantages or unique tendencies (e.g., resilience under pressure, strong networks, disciplined routines)
3. **Development Areas** – note where signals suggest gaps or undervalued traits (e.g., limited capital access, inconsistent tracking, hesitation in risk-taking)
4. **Trajectory Indicators** – suggest next moves or opportunities that could elevate their "market value" as an entrepreneur (like a coach pointing out how to turn raw talent into production)

OUTPUT FORMAT: Plain text, 2-3 paragraphs

TONE GUIDANCE:
- Warm, constructive, growth-oriented — like a scout who genuinely wants the player to succeed
- Honest but encouraging, balancing candor with motivation
- Specific, concrete observations rather than generic praise/criticism
- Use metaphors where helpful (e.g., "You've built a strong baseline, but your goal-tracking is like a quarterback with good instincts who hasn't yet mastered the playbook")
- Never prescriptive — frame insights as signals and indicators, not verdicts
- Make it feel personalized and authentic"""
    
    # Use ADK's LLM call to execute the prompt
    return call_llm_with_prompt(prompt)

def format_responses(responses: list) -> str:
    """Format responses the same way as your current code."""
    return '\n'.join([
        f"Question {r['questionId']}: {r['questionText']}\nResponse: {r['response']}"
        for r in responses
    ])

def calculate_star_rating(overall_score: int) -> tuple:
    """Same star rating logic as your current code."""
    if overall_score >= 90:
        return 5, "Transformative Trajectory"
    elif overall_score >= 80:
        return 4, "Established Signals"
    elif overall_score >= 65:
        return 3, "Emerging Traction"
    elif overall_score >= 50:
        return 2, "Forming Potential"
    else:
        return 1, "Early Spark"

def call_llm_with_prompt(prompt: str) -> str:
    """Call LLM with prompt and return text response."""
    # This should use the actual ADK LLM, not hardcoded data
    raise NotImplementedError("This function should use ADK's LLM, not hardcoded data")
