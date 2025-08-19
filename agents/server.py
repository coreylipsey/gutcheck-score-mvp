"""
ADK Agent Server for Gutcheck
Provides API endpoints for the ADK agent to integrate with the main application.
"""

import os
import json
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import the ADK agent
from core_assessment_agent.agent import core_assessment_agent, generate_complete_assessment_feedback

app = FastAPI(
    title="Gutcheck ADK Agent API",
    description="API for the Gutcheck ADK assessment agent",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AssessmentRequest(BaseModel):
    responses: list
    scores: Dict[str, Any]
    industry: Optional[str] = None
    location: Optional[str] = None

class AssessmentResponse(BaseModel):
    competitiveAdvantage: dict  # Object with category, score, summary, specificStrengths
    growthOpportunity: dict     # Object with category, score, summary, specificWeaknesses
    comprehensiveAnalysis: str
    nextSteps: str
    feedback: str
    scoreProjection: dict       # Object with currentScore, projectedScore, improvementPotential

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Gutcheck ADK Agent API is running", "agent": core_assessment_agent.name}

@app.post("/generate-feedback", response_model=AssessmentResponse)
async def generate_feedback(request: AssessmentRequest):
    """
    Generate comprehensive AI feedback using the ADK agent.
    
    This endpoint provides the same functionality as the Firebase Functions
    but uses the ADK agent for enhanced capabilities.
    """
    try:
        # Prepare assessment data
        assessment_data = {
            "responses": request.responses,
            "scores": request.scores,
            "industry": request.industry,
            "location": request.location
        }
        
        # Generate feedback using the ADK agent
        feedback_result = generate_complete_assessment_feedback(assessment_data)
        
        return AssessmentResponse(**feedback_result)
        
    except Exception as e:
        print(f"Error generating feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating feedback: {str(e)}")

@app.post("/score-question")
async def score_question(question_data: Dict[str, Any]):
    """
    Score an individual open-ended question using the ADK agent.
    """
    try:
        question_id = question_data.get("questionId")
        response = question_data.get("response")
        question_text = question_data.get("questionText")
        
        if not all([question_id, response, question_text]):
            raise HTTPException(status_code=400, detail="Missing required fields")
        
        # Use the ADK agent to score the question
        # This would need to be implemented in the agent tools
        # For now, return a placeholder response
        return {
            "score": 3,
            "explanation": "Question scored using ADK agent"
        }
        
    except Exception as e:
        print(f"Error scoring question: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error scoring question: {str(e)}")

@app.get("/agent-info")
async def get_agent_info():
    """Get information about the ADK agent"""
    try:
        tools_list = []
        if hasattr(core_assessment_agent, 'tools') and core_assessment_agent.tools:
            tools_list = [tool.name for tool in core_assessment_agent.tools]
        
        return {
            "name": core_assessment_agent.name,
            "description": core_assessment_agent.description,
            "model": core_assessment_agent.model,
            "tools": tools_list
        }
    except Exception as e:
        print(f"Error getting agent info: {str(e)}")
        return {
            "name": core_assessment_agent.name,
            "description": "ADK agent for Gutcheck assessments",
            "model": "gemini-2.0-flash",
            "tools": ["assessment_tools"]
        }

if __name__ == "__main__":
    import uvicorn
    
    # Get port from environment or use default
    port = int(os.getenv("PORT", 8000))
    
    print(f"Starting Gutcheck ADK Agent server on port {port}")
    print(f"Agent: {core_assessment_agent.name}")
    
    uvicorn.run(app, host="0.0.0.0", port=port)
