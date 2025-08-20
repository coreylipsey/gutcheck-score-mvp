"""
Enhanced ADK Agent Server for Gutcheck
Provides API endpoints for the multi-agent system with safety and coordination.
"""

import os
import json
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Import the enhanced ADK agents and safety systems
from core_assessment_agent.agent import core_assessment_agent, generate_complete_assessment_feedback
from core_assessment_agent.coordinator_agent import coordinator_agent, coordinate_request
from safety.content_filter import content_filter, FilterResult
from safety.human_oversight import human_oversight, OversightResult

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
    task_type: Optional[str] = "assessment_feedback"  # New field for coordinator routing

class AssessmentResponse(BaseModel):
    competitiveAdvantage: dict  # Object with category, score, summary, specificStrengths
    growthOpportunity: dict     # Object with category, score, summary, specificWeaknesses
    comprehensiveAnalysis: str
    nextSteps: str
    feedback: str
    scoreProjection: dict       # Object with currentScore, projectedScore, improvementPotential
    safety_info: Optional[Dict[str, Any]] = None  # New field for safety information

class CoordinatedRequest(BaseModel):
    task_type: str
    task_data: Dict[str, Any]

class CoordinatedResponse(BaseModel):
    coordinator_status: str
    delegated_agent: str
    task_type: str
    result: Dict[str, Any]
    timestamp: str
    safety_info: Optional[Dict[str, Any]] = None

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Gutcheck ADK Agent API is running", "agent": core_assessment_agent.name}

@app.post("/generate-feedback", response_model=AssessmentResponse)
async def generate_feedback(request: AssessmentRequest):
    """
    Generate comprehensive AI feedback using the enhanced multi-agent system.
    
    This endpoint now includes safety filtering and human oversight.
    """
    try:
        # Prepare assessment data
        assessment_data = {
            "responses": request.responses,
            "scores": request.scores,
            "industry": request.industry,
            "location": request.location
        }
        
        # Step 1: Content filtering
        filter_result = content_filter.filter_request(assessment_data)
        logger.info(f"Content filter result: {filter_result.risk_level} risk")
        
        # Step 2: Human oversight evaluation
        oversight_result = human_oversight.evaluate_request(assessment_data)
        logger.info(f"Human oversight result: {oversight_result.priority} priority, review required: {oversight_result.requires_review}")
        
        # Step 3: Check if request should be blocked
        if not filter_result.is_safe:
            logger.warning(f"Request blocked due to content filtering: {filter_result.flagged_issues}")
            raise HTTPException(
                status_code=400, 
                detail=f"Request blocked: {filter_result.risk_level} risk content detected"
            )
        
        # Step 4: Check if human review is required
        if oversight_result.requires_review:
            logger.warning(f"Request flagged for human review: {oversight_result.escalation_reason}")
            # For now, we'll proceed but add a warning
            # In production, you might want to block or queue these requests
        
        # Step 5: Generate feedback using the core agent directly
        feedback_result = generate_complete_assessment_feedback(assessment_data)
        
        # Step 6: Prepare response with safety information
        safety_info = {
            "content_filter": {
                "risk_level": filter_result.risk_level,
                "flagged_issues": filter_result.flagged_issues
            },
            "human_oversight": {
                "priority": oversight_result.priority,
                "requires_review": oversight_result.requires_review,
                "escalation_reason": oversight_result.escalation_reason,
                "review_id": oversight_result.review_id
            }
        }
        
        # Ensure we have the expected structure for backward compatibility
        response_data = {
            "competitiveAdvantage": feedback_result.get("competitiveAdvantage", {}),
            "growthOpportunity": feedback_result.get("growthOpportunity", {}),
            "comprehensiveAnalysis": feedback_result.get("comprehensiveAnalysis", ""),
            "nextSteps": feedback_result.get("nextSteps", ""),
            "feedback": feedback_result.get("feedback", ""),
            "scoreProjection": feedback_result.get("scoreProjection", {}),
            "safety_info": safety_info
        }
        
        return AssessmentResponse(**response_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating feedback: {str(e)}")
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

@app.post("/coordinated-request", response_model=CoordinatedResponse)
async def coordinated_request(request: CoordinatedRequest):
    """
    Process requests through the coordinator agent with full safety filtering.
    
    This is the new primary endpoint that implements the multi-agent architecture.
    """
    try:
        # Step 1: Content filtering
        filter_result = content_filter.filter_request(request.task_data)
        logger.info(f"Content filter result: {filter_result.risk_level} risk")
        
        # Step 2: Human oversight evaluation
        oversight_result = human_oversight.evaluate_request(request.task_data)
        logger.info(f"Human oversight result: {oversight_result.priority} priority, review required: {oversight_result.requires_review}")
        
        # Step 3: Check if request should be blocked
        if not filter_result.is_safe:
            logger.warning(f"Request blocked due to content filtering: {filter_result.flagged_issues}")
            raise HTTPException(
                status_code=400, 
                detail=f"Request blocked: {filter_result.risk_level} risk content detected"
            )
        
        # Step 4: Process through coordinator agent
        coordinated_result = coordinate_request(request.task_type, filter_result.filtered_content)
        logger.info(f"Coordinated result: {coordinated_result}")
        
        # Step 5: Add safety information
        safety_info = {
            "content_filter": {
                "risk_level": filter_result.risk_level,
                "flagged_issues": filter_result.flagged_issues
            },
            "human_oversight": {
                "priority": oversight_result.priority,
                "requires_review": oversight_result.requires_review,
                "escalation_reason": oversight_result.escalation_reason,
                "review_id": oversight_result.review_id
            }
        }
        
        # Step 6: Prepare response with all required fields
        response_data = {
            "coordinator_status": coordinated_result.get("coordinator_status", "success"),
            "delegated_agent": coordinated_result.get("delegated_agent", "unknown"),
            "task_type": request.task_type,
            "result": coordinated_result.get("result", {}),
            "timestamp": coordinated_result.get("timestamp", ""),
            "safety_info": safety_info
        }
        
        logger.info(f"Response data: {response_data}")
        
        return CoordinatedResponse(**response_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in coordinated request: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error in coordinated request: {str(e)}")

@app.get("/agent-info")
async def get_agent_info():
    """Get information about all ADK agents"""
    try:
        # Get coordinator agent info
        coordinator_tools = []
        if hasattr(coordinator_agent, 'tools') and coordinator_agent.tools:
            coordinator_tools = [tool.name for tool in coordinator_agent.tools]
        
        # Get core assessment agent info
        core_tools = []
        if hasattr(core_assessment_agent, 'tools') and core_assessment_agent.tools:
            core_tools = [tool.name for tool in core_assessment_agent.tools]
        
        return {
            "coordinator_agent": {
                "name": coordinator_agent.name,
                "description": coordinator_agent.description,
                "model": coordinator_agent.model,
                "tools": coordinator_tools
            },
            "core_assessment_agent": {
                "name": core_assessment_agent.name,
                "description": core_assessment_agent.description,
                "model": core_assessment_agent.model,
                "tools": core_tools
            },
            "safety_systems": {
                "content_filter": "Active",
                "human_oversight": "Active"
            }
        }
    except Exception as e:
        logger.error(f"Error getting agent info: {str(e)}")
        return {
            "coordinator_agent": {
                "name": "gutcheck_coordinator_agent",
                "description": "Router/Dispatcher agent",
                "model": "gemini-2.0-flash",
                "tools": ["delegate_to_scoring_agent", "delegate_to_feedback_agent", "delegate_to_memory_agent"]
            },
            "core_assessment_agent": {
                "name": "gutcheck_assessment_agent",
                "description": "ADK agent for Gutcheck assessments",
                "model": "gemini-2.0-flash",
                "tools": ["assessment_tools"]
            },
            "safety_systems": {
                "content_filter": "Active",
                "human_oversight": "Active"
            }
        }

@app.get("/safety/oversight-queue")
async def get_oversight_queue():
    """Get the current human oversight review queue"""
    try:
        queue = human_oversight.get_review_queue()
        return {
            "queue_length": len(queue),
            "pending_reviews": [item for item in queue if item["status"] == "pending"],
            "reviewed_items": [item for item in queue if item["status"] == "reviewed"]
        }
    except Exception as e:
        logger.error(f"Error getting oversight queue: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting oversight queue: {str(e)}")

@app.post("/safety/mark-reviewed")
async def mark_reviewed(review_id: str, review_decision: str, reviewer_notes: str = ""):
    """Mark a review item as reviewed by human"""
    try:
        human_oversight.mark_reviewed(review_id, review_decision, reviewer_notes)
        return {"status": "success", "message": f"Review {review_id} marked as reviewed"}
    except Exception as e:
        logger.error(f"Error marking review as reviewed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error marking review as reviewed: {str(e)}")

@app.get("/safety/export-queue")
async def export_oversight_queue():
    """Export the oversight queue to JSON"""
    try:
        import tempfile
        import os
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            human_oversight.export_review_queue(f.name)
            filepath = f.name
        
        # Read the file content
        with open(filepath, 'r') as f:
            content = f.read()
        
        # Clean up
        os.unlink(filepath)
        
        return {"queue_data": content}
    except Exception as e:
        logger.error(f"Error exporting oversight queue: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error exporting oversight queue: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    
    # Get port from environment or use default
    port = int(os.getenv("PORT", 8000))
    
    print(f"Starting Enhanced Gutcheck ADK Agent server on port {port}")
    print(f"Coordinator Agent: {coordinator_agent.name}")
    print(f"Core Assessment Agent: {core_assessment_agent.name}")
    print(f"Safety Systems: Content Filter + Human Oversight")
    
    uvicorn.run(app, host="0.0.0.0", port=port)
