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

# Import the agents
from assessment_analysis_agent.agent import AssessmentAgent
from open_ended_scoring_agent.agent import root_agent as open_ended_agent

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

@functions_framework.http
def process_open_ended_scoring_http(request):
    """
    Cloud Functions HTTP entry point for open-ended question scoring
    """
    # Handle CORS preflight requests
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }
        return ('', 204, headers)

    # Only allow POST requests
    if request.method != 'POST':
        return (json.dumps({
            'success': False,
            'error': 'Only POST requests are allowed'
        }), 405, {'Content-Type': 'application/json'})

    try:
        # Parse the request
        request_json = request.get_json()
        if not request_json:
            return (json.dumps({
                'success': False,
                'error': 'No JSON data provided'
            }), 400, {'Content-Type': 'application/json'})

        # Validate required fields
        required_fields = ['question_id', 'response', 'question_text']
        for field in required_fields:
            if field not in request_json:
                return (json.dumps({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400, {'Content-Type': 'application/json'})

        # Convert to JSON string for the agent
        input_data = {
            'question_id': request_json['question_id'],
            'response': request_json['response'],
            'question_text': request_json['question_text']
        }
        input_json = json.dumps(input_data)

        # Call the agent synchronously
        import asyncio
        result = asyncio.run(open_ended_agent.run(input_json))

        # Parse the result
        try:
            scoring_data = json.loads(result)
            return (json.dumps({
                'success': True,
                'score': scoring_data.get('score'),
                'explanation': scoring_data.get('explanation')
            }), 200, {'Content-Type': 'application/json'})
        except json.JSONDecodeError:
            logger.error(f'Failed to parse agent response: {result}')
            return (json.dumps({
                'success': False,
                'error': 'Failed to parse agent response'
            }), 500, {'Content-Type': 'application/json'})

    except Exception as e:
        logger.error(f'Error processing open-ended scoring request: {str(e)}')
        return (json.dumps({
            'success': False,
            'error': f'Processing failed: {str(e)}'
        }), 500, {'Content-Type': 'application/json'})

@functions_framework.http
def health_check_http(request):
    """
    Health check endpoint for the open-ended scoring agent
    """
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    }

    if request.method == 'OPTIONS':
        return ('', 204, headers)

    if request.method != 'GET':
        return (json.dumps({
            'success': False,
            'error': 'Only GET requests are allowed'
        }), 405, {'Content-Type': 'application/json'})

    try:
        # Test the agent with a simple query
        import asyncio
        result = asyncio.run(open_ended_agent.run("hello"))
        return (json.dumps({
            'success': True,
            'service': 'Open-Ended Question Scoring Agent',
            'status': 'healthy',
            'version': '1.0.0',
            'agent_response': result
        }), 200, {'Content-Type': 'application/json'})
    except Exception as e:
        return (json.dumps({
            'success': False,
            'status': 'unhealthy',
            'error': str(e)
        }), 500, {'Content-Type': 'application/json'})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
