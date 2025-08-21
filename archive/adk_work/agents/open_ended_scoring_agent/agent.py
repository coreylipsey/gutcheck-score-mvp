"""
Specialized Agent for Open-Ended Question Scoring
Gutcheck.AI - Scores individual open-ended questions using mission-critical prompts
FOLLOWS PROPER ADK PATTERNS FROM CRASH COURSE
USES EXACT MISSION-CRITICAL PROMPTS - NO MODIFICATIONS ALLOWED
"""

import os
from typing import Dict, Any
from google.adk import Agent
from pydantic import BaseModel, Field
import json

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

class ScoringRequest(BaseModel):
    """Request for scoring an open-ended question"""
    question_id: str = Field(description="Question identifier (e.g., q3, q8, q18, q23)")
    response: str = Field(description="User's response to the open-ended question")
    question_text: str = Field(description="The question text for context")

class ScoringResult(BaseModel):
    """Result of scoring an open-ended question"""
    score: int = Field(description="Score from 1-5", ge=1, le=5)
    explanation: str = Field(description="Explanation for the score")

class OpenEndedScoringAgent(Agent):
    """AI Agent for scoring open-ended questions using EXACT mission-critical prompts"""
    
    def __init__(self):
        instruction = """You are a specialized agent for scoring open-ended entrepreneurial assessment questions.

**IMPORTANT: You expect JSON input with question data, not conversational queries.**

**Expected Input Format:**
```json
{
  "question_id": "q3",
  "response": "I started my entrepreneurial journey 3 years ago...",
  "question_text": "Tell me about your entrepreneurial journey so far."
}
```

**Your Job:**
1. Identify the question type from the question_id
2. Use the appropriate mission-critical scoring prompt
3. Score the response on a 1-5 scale
4. Provide a clear explanation for the score

**Return Format:**
```json
{
  "score": 4,
  "explanation": "Clear explanation of why this response received this score"
}
```

**Do NOT engage in conversation. Process JSON input and return JSON output only.**"""
        
        super().__init__(
            name="open_ended_scoring_agent",
            model="gemini-2.0-flash",
            instruction=instruction
        )
    
    async def run(self, user_input: str) -> str:
        """
        Main entry point following ADK pattern
        Handles JSON scoring requests and conversational queries
        """
        try:
            # Try to parse as JSON first (production mode)
            request_data = json.loads(user_input)
            request = ScoringRequest(**request_data)
            
            # Score the question
            result = await self._score_question(request)
            
            # Return JSON response
            return json.dumps(result.dict(), indent=2)
            
        except json.JSONDecodeError:
            # Handle conversational queries (testing mode)
            return self._handle_conversational_query(user_input)
        except Exception as e:
            return json.dumps({
                "error": f"Scoring failed: {str(e)}",
                "success": False
            })
    
    def _handle_conversational_query(self, query: str) -> str:
        """Handle conversational queries for testing and debugging"""
        query_lower = query.lower()
        
        if "hello" in query_lower or "hi" in query_lower:
            return "Hello! I'm the Open-Ended Question Scoring Agent. I score individual open-ended questions from the entrepreneurial assessment. Send me JSON with question_id, response, and question_text to see me in action."
        
        elif "json" in query_lower or "format" in query_lower or "input" in query_lower:
            return """I expect JSON input with question data like this:

{
  "question_id": "q3",
  "response": "I started my entrepreneurial journey 3 years ago...",
  "question_text": "Tell me about your entrepreneurial journey so far."
}

I'll return a JSON object with score (1-5) and explanation."""
        
        elif "test" in query_lower or "sample" in query_lower:
            return "I can score open-ended questions using mission-critical prompts. To test me, send JSON with question_id, response, and question_text."
        
        else:
            return "I'm the Open-Ended Question Scoring Agent. I score individual open-ended questions from the entrepreneurial assessment. Send me JSON data to see me in action!"
    
    async def _score_question(self, request: ScoringRequest) -> ScoringResult:
        """Score an open-ended question using mission-critical prompts"""
        
        # Get question type from mapping
        question_type = QUESTION_TYPE_MAP.get(request.question_id)
        if not question_type:
            raise ValueError(f"Invalid question ID for open-ended scoring: {request.question_id}")
        
        # Get the appropriate prompt for the question type
        prompt_template = SCORING_PROMPTS.get(question_type)
        if not prompt_template:
            raise ValueError(f"Invalid question type: {question_type}")
        
        # Replace placeholder with actual response
        prompt = prompt_template.replace('{{RESPONSE}}', request.response)
        
        try:
            # Use the EXACT SAME LLM calling pattern as the assessment agent
            # This is the pattern that WORKS
            async for result in self.canonical_model.generate_content_async(prompt):
                response_text = result if isinstance(result, str) else result.text
                break  # Take the first result
            
            # Parse JSON response (same format as old system)
            try:
                scoring_data = json.loads(response_text)
                return ScoringResult(
                    score=scoring_data.get("score", 3),
                    explanation=scoring_data.get("explanation", "")
                )
            except json.JSONDecodeError:
                # If JSON parsing fails, try to extract score from text
                import re
                score_match = re.search(r'"score":\s*(\d+)', response_text)
                explanation_match = re.search(r'"explanation":\s*"([^"]*)"', response_text)
                
                score = int(score_match.group(1)) if score_match else 3
                explanation = explanation_match.group(1) if explanation_match else "Score extracted from AI response"
                
                return ScoringResult(score=score, explanation=explanation)
                
        except Exception as e:
            # Return default score on error (same as old system)
            return ScoringResult(
                score=3,
                explanation=f"Scoring failed: {str(e)}"
            )

# ADK pattern: root_agent must be defined for discovery
root_agent = OpenEndedScoringAgent()
