#!/usr/bin/env python3
"""
FastAPI server for the Assessment Analysis Agent
Production entry point for Cloud Functions deployment
"""

import os
import json
import logging
from typing import Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Import the agent
from assessment_analysis_agent.agent import AssessmentAgent

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Assessment Analysis Agent API",
    description="AI-powered assessment analysis and insights generation",
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

# Initialize the agent
try:
    agent = AssessmentAgent()
    logger.info("Assessment agent initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize agent: {e}")
    agent = None

class AssessmentRequest(BaseModel):
    """Request model for assessment analysis"""
    session_id: str
    user_id: str
    industry: str
    location: str
    overall_score: float
    category_scores: Dict[str, float]
    question_scores: Dict[str, float]
    responses: list

class AssessmentResponse(BaseModel):
    """Response model for assessment analysis"""
    success: bool
    data: Dict[str, Any] = None
    error: str = None

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Assessment Analysis Agent",
        "version": "1.0.0"
    }

@app.post("/process_assessment", response_model=AssessmentResponse)
async def process_assessment(request: AssessmentRequest):
    """
    Process an assessment and generate AI-powered insights
    
    This is the main entry point for Cloud Functions deployment
    """
    if not agent:
        raise HTTPException(status_code=500, detail="Agent not initialized")
    
    try:
        logger.info(f"Processing assessment for session: {request.session_id}")
        
        # Convert request to the format expected by the agent
        assessment_data = {
            "session_id": request.session_id,
            "user_id": request.user_id,
            "industry": request.industry,
            "location": request.location,
            "overall_score": request.overall_score,
            "category_scores": request.category_scores,
            "question_scores": request.question_scores,
            "responses": request.responses
        }
        
        # Process with the agent
        result = await agent.run(json.dumps(assessment_data))
        
        # Parse the JSON response
        if isinstance(result, str):
            try:
                parsed_result = json.loads(result)
            except json.JSONDecodeError:
                # If it's not JSON, wrap it in a data field
                parsed_result = {"analysis": result}
        else:
            parsed_result = result
        
        logger.info(f"Successfully processed assessment for session: {request.session_id}")
        
        return AssessmentResponse(
            success=True,
            data=parsed_result
        )
        
    except Exception as e:
        logger.error(f"Error processing assessment: {e}")
        return AssessmentResponse(
            success=False,
            error=str(e)
        )

@app.post("/analyze")
async def analyze_assessment(request: AssessmentRequest):
    """
    Alternative endpoint for assessment analysis
    """
    return await process_assessment(request)

if __name__ == "__main__":
    import uvicorn
    
    # Get port from environment or default to 8000
    port = int(os.getenv("PORT", 8000))
    
    # Run the server
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=port,
        log_level="info"
    )
