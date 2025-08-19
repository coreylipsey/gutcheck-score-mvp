"""
ADK Agent Server
FastAPI server to deploy the Core Assessment Agent
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
import os
import json

from core_assessment_agent.agent import generate_complete_assessment_feedback
from core_assessment_agent.tools.question_scoring import score_open_ended_question

# Initialize FastAPI app
app = FastAPI(
    title="Gutcheck ADK Assessment Agent",
    description="AI agent for generating comprehensive entrepreneurial assessment feedback",
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

# Pydantic models for request/response
class AssessmentData(BaseModel):
    responses: List[Dict]
    scores: Dict[str, int]
    industry: Optional[str] = None
    location: Optional[str] = None

class QuestionScoringData(BaseModel):
    questionId: str
    questionText: str
    response: str

class ScoringResponse(BaseModel):
    score: int
    explanation: str

class FeedbackResponse(BaseModel):
    feedback: str
    competitiveAdvantage: Dict
    growthOpportunity: Dict
    scoreProjection: Dict
    comprehensiveAnalysis: str
    nextSteps: str

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Gutcheck ADK Assessment Agent is running"}

@app.post("/generate-feedback", response_model=FeedbackResponse)
async def generate_feedback(assessment_data: AssessmentData):
    """
    Generate comprehensive AI feedback for an assessment
    
    Args:
        assessment_data: Assessment responses, scores, and metadata
    
    Returns:
        Complete AI feedback with all sections
    """
    try:
        # Convert Pydantic model to dict
        data_dict = assessment_data.dict()
        
        # Generate feedback using ADK agent
        feedback_result = generate_complete_assessment_feedback(data_dict)
        
        # Transform to match expected response format
        return FeedbackResponse(
            feedback=feedback_result.get("feedback", "AI feedback generation completed."),
            competitiveAdvantage=feedback_result.get("competitiveAdvantage", {
                "category": "Unknown",
                "score": "0/0",
                "summary": "Your competitive advantages will be identified based on your assessment scores.",
                "specificStrengths": [
                    "Business experience (previous attempts show learning mindset)",
                    "Network connections (leveraged support systems effectively)",
                    "Learning commitment (regular professional development activities)",
                    "Adaptability (successfully navigated business challenges)"
                ]
            }),
            growthOpportunity=feedback_result.get("growthOpportunity", {
                "category": "Unknown",
                "score": "0/0",
                "summary": "Your growth opportunities will be determined from your assessment results.",
                "specificWeaknesses": [
                    "Goal tracking frequency (currently 'occasionally' vs weekly)",
                    "Time allocation (varies without consistent structure)",
                    "Planning processes (informal vs documented approach)",
                    "Strategic execution (reactive vs proactive planning)"
                ]
            }),
            scoreProjection=feedback_result.get("scoreProjection", {
                "currentScore": sum(assessment_data.scores.values()),
                "projectedScore": 0,
                "improvementPotential": 0
            }),
            comprehensiveAnalysis=feedback_result.get("comprehensiveAnalysis", 
                "Comprehensive analysis is being generated. Please check back in a moment."),
            nextSteps=feedback_result.get("nextSteps", 
                "Consider seeking mentorship, exploring funding options, and building your entrepreneurial fundamentals.")
        )
        
    except Exception as e:
        print(f"Error generating feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating feedback: {str(e)}")

@app.post("/score-question", response_model=ScoringResponse)
async def score_question(question_data: QuestionScoringData):
    """
    Score an individual open-ended question
    
    Args:
        question_data: Question ID, text, and user response
    
    Returns:
        Score and explanation
    """
    try:
        result = score_open_ended_question(
            question_data.questionId,
            question_data.questionText,
            question_data.response
        )
        
        return ScoringResponse(
            score=result.get("score", 3),
            explanation=result.get("explanation", "AI evaluation completed")
        )
        
    except Exception as e:
        print(f"Error scoring question: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error scoring question: {str(e)}")

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "agent": "gutcheck_assessment_agent",
        "version": "1.0.0",
        "tools": [
            "analyze_competitive_advantage",
            "analyze_growth_opportunity", 
            "generate_comprehensive_analysis",
            "generate_next_steps",
            "score_open_ended_question",
            "score_all_open_ended_questions"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    
    # Get port from environment or default to 8000
    port = int(os.getenv("PORT", 8000))
    
    # Run the server
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=port,
        reload=True  # Enable auto-reload for development
    )
