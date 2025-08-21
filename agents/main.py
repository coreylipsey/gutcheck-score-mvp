#!/usr/bin/env python3
"""
Cloud Functions entry point for Assessment Analysis Agent
This file is the entry point specified in cloudbuild.yaml
"""

import os
import json
import logging
from typing import Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import functions_framework

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
    allow_origins=["*"],
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

# Cloud Functions entry point
@functions_framework.http
def process_assessment_http(request):
    """
    HTTP Cloud Function entry point
    This is the function called by Cloud Functions
    """
    # Handle CORS preflight requests
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }
        return ('', 204, headers)
    
    # Set CORS headers for all responses
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    }
    
    try:
        # Parse the request
        if request.method == 'GET':
            return (json.dumps({
                "status": "healthy",
                "service": "Assessment Analysis Agent",
                "version": "1.0.0"
            }), 200, headers)
        
        elif request.method == 'POST':
            # Get JSON data from request
            request_json = request.get_json(silent=True)
            if not request_json:
                return (json.dumps({
                    "success": False,
                    "error": "No JSON data provided"
                }), 400, headers)
            
            # Validate required fields
            required_fields = ['session_id', 'user_id', 'industry', 'location', 
                             'overall_score', 'category_scores', 'question_scores', 'responses']
            for field in required_fields:
                if field not in request_json:
                    return (json.dumps({
                        "success": False,
                        "error": f"Missing required field: {field}"
                    }), 400, headers)
            
            # Process with agent
            if not agent:
                return (json.dumps({
                    "success": False,
                    "error": "Agent not initialized"
                }), 500, headers)
            
            logger.info(f"Processing assessment for session: {request_json['session_id']}")
            
            # Convert to the format expected by the agent
            assessment_data = {
                "session_id": request_json['session_id'],
                "user_id": request_json['user_id'],
                "industry": request_json['industry'],
                "location": request_json['location'],
                "overall_score": request_json['overall_score'],
                "category_scores": request_json['category_scores'],
                "question_scores": request_json['question_scores'],
                "responses": request_json['responses']
            }
            
            # Process with the agent (we need to run this synchronously for Cloud Functions)
            import asyncio
            result = asyncio.run(agent.run(json.dumps(assessment_data)))
            
            # Parse the JSON response
            if isinstance(result, str):
                try:
                    parsed_result = json.loads(result)
                except json.JSONDecodeError:
                    parsed_result = {"analysis": result}
            else:
                parsed_result = result
            
            logger.info(f"Successfully processed assessment for session: {request_json['session_id']}")
            
            return (json.dumps({
                "success": True,
                "data": parsed_result
            }), 200, headers)
        
        else:
            return (json.dumps({
                "success": False,
                "error": f"Method {request.method} not allowed"
            }), 405, headers)
    
    except Exception as e:
        logger.error(f"Error processing request: {e}")
        return (json.dumps({
            "success": False,
            "error": str(e)
        }), 500, headers)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
