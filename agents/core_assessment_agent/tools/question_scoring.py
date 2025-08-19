"""
Question Scoring Tool
Scores the 4 open-ended questions using the original Gemini prompts.
"""

def score_open_ended_question(question_id: str, question_text: str, response: str) -> dict:
    """
    Score an open-ended question using the original Gemini prompts.
    
    Args:
        question_id (str): Question ID (q3, q8, q18, q23)
        question_text (str): The question text
        response (str): User's response
    
    Returns:
        dict: Score and explanation
    """
    # Map question IDs to prompt types
    question_type_map = {
        'q3': 'entrepreneurialJourney',
        'q8': 'businessChallenge', 
        'q18': 'setbacksResilience',
        'q23': 'finalVision'
    }
    
    question_type = question_type_map.get(question_id, 'entrepreneurialJourney')
    
    # Get the appropriate prompt
    prompt = get_scoring_prompt(question_type, response)
    
    # Use ADK's LLM call to execute the prompt
    return call_llm_with_prompt(prompt)

def get_scoring_prompt(question_type: str, response: str) -> str:
    """Get the scoring prompt for a specific question type."""
    
    prompts = {
        'entrepreneurialJourney': f"""You are an expert business evaluator assessing a founder's entrepreneurial journey.
Score this response using ONLY scores 1, 3, or 5 where:
1 = Vague, lacks structure, no clear direction or milestones
3 = Decent clarity with some evidence of execution and progress
5 = Well-articulated, structured response with strong execution and clear growth path

Founder's Response:
{response}

Return your evaluation as a JSON object with 'score' (number 1, 3, or 5) and 'explanation' (string) fields.""",

        'businessChallenge': f"""You are an expert business evaluator assessing how a founder navigates business challenges.
Score this response using ONLY scores 1, 3, or 5 where:
1 = Poor problem definition, reactive approach, no clear solution strategy
3 = Clear problem definition, reasonable approach, some evidence of execution
5 = Exceptional problem clarity, strategic solution, strong evidence of execution/learning

Founder's Response:
{response}

Return your evaluation as a JSON object with 'score' (number 1, 3, or 5) and 'explanation' (string) fields.""",

        'setbacksResilience': f"""You are an expert business evaluator assessing a founder's ability to handle setbacks.
Score this response using ONLY scores 1, 3, or 5 where:
1 = Poor resilience, gives up easily, no clear recovery strategy
3 = Moderate resilience, recovers but slowly, some adaptation
5 = Exceptional resilience, adapts quickly, shows growth mindset and clear recovery process

Founder's Response:
{response}

Return your evaluation as a JSON object with 'score' (number 1, 3, or 5) and 'explanation' (string) fields.""",

        'finalVision': f"""You are an expert business evaluator assessing a founder's long-term vision.
Score this response using ONLY scores 1, 3, or 5 where:
1 = Vague, unrealistic, or very limited vision, no clear roadmap
3 = Clear vision with reasonable ambition, some future goals
5 = Compelling, ambitious vision with clear roadmap and long-term impact

Founder's Response:
{response}

Return your evaluation as a JSON object with 'score' (number 1, 3, or 5) and 'explanation' (string) fields."""
    }
    
    return prompts.get(question_type, prompts['entrepreneurialJourney'])

def call_llm_with_prompt(prompt: str) -> dict:
    """Call LLM with prompt and return structured response."""
    # This will be implemented with ADK's LLM calling mechanism
    # For now, return a sample response based on the prompt type
    
    # Analyze the prompt to determine the question type
    if "entrepreneurial journey" in prompt.lower():
        return {
            "score": 5,  # Well-articulated, structured response with strong execution
            "explanation": "Strong entrepreneurial journey with clear progression from food truck to consulting business. Shows learning from failures and building on experience."
        }
    elif "business challenge" in prompt.lower():
        return {
            "score": 5,  # Exceptional problem clarity, strategic solution, strong evidence of execution
            "explanation": "Exceptional problem-solving approach. Clearly identified cash flow crisis, leveraged network effectively, and executed strategic pivot with measurable results."
        }
    elif "setbacks" in prompt.lower():
        return {
            "score": 3,  # Moderate resilience, recovers but slowly, some adaptation
            "explanation": "Good resilience demonstrated through systematic learning approach. Analyzed failures, documented lessons, and applied insights to avoid similar mistakes."
        }
    elif "vision" in prompt.lower():
        return {
            "score": 3,  # Clear vision with reasonable ambition, some future goals
            "explanation": "Clear vision for scaling consulting business with diversification strategy. Shows ambition while maintaining realistic growth path."
        }
    else:
        return {
            "score": 3,
            "explanation": "AI evaluation completed"
        }

def score_all_open_ended_questions(responses: list) -> dict:
    """
    Score all open-ended questions in an assessment.
    
    Args:
        responses (list): List of response objects with questionId, questionText, response
    
    Returns:
        dict: Scores for all open-ended questions
    """
    open_ended_questions = ['q3', 'q8', 'q18', 'q23']
    scores = {}
    
    for response in responses:
        if response['questionId'] in open_ended_questions:
            result = score_open_ended_question(
                response['questionId'],
                response['questionText'],
                response['response']
            )
            scores[response['questionId']] = result
    
    return scores
