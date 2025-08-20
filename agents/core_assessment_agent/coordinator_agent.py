"""
Coordinator Agent for Gutcheck
Acts as a Router/Dispatcher for all assessment requests.
This implements the Coordinator/Dispatcher multi-agent pattern.
"""

from google.adk.agents import Agent
from google.adk.tools import FunctionTool
from typing import Dict, Any, Optional
import json
import datetime

def delegate_to_scoring_agent(task_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Delegate assessment scoring tasks to the scoring agent.
    
    Args:
        task_data: Dictionary containing assessment data and task type
        
    Returns:
        Dictionary with scoring results
    """
    try:
        # Check if this is a question scoring task
        if task_data.get('task_type') == 'question_scoring':
            # Use enhanced question scoring (preserves original logic)
            from .tools.enhanced_question_scoring import enhanced_score_question
            
            question_id = task_data.get('questionId')
            question_text = task_data.get('questionText', '')
            response = task_data.get('response', '')
            
            result = enhanced_score_question(question_id, question_text, response)
            
            return {
                "status": "success",
                "agent": "enhanced_scoring_agent",
                "result": result
            }
        
        # For comprehensive assessment feedback, use the core agent
        from .agent import generate_complete_assessment_feedback
        
        # Extract assessment data
        assessment_data = {
            "responses": task_data.get("responses", []),
            "scores": task_data.get("scores", {}),
            "industry": task_data.get("industry", ""),
            "location": task_data.get("location", "")
        }
        
        # Generate comprehensive feedback using the core agent
        result = generate_complete_assessment_feedback(assessment_data)
        
        return {
            "status": "success",
            "agent": "core_assessment_agent",
            "result": result
        }
        
    except Exception as e:
        return {
            "status": "error",
            "agent": "scoring_agent", 
            "error": str(e)
        }

def delegate_to_feedback_agent(task_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Delegate business mentorship tasks to the feedback agent.
    
    Args:
        task_data: Dictionary containing user context and mentorship request
        
    Returns:
        Dictionary with mentorship feedback
    """
    try:
        # This will be implemented when we create the feedback agent
        # For now, return a placeholder
        return {
            "status": "success",
            "agent": "feedback_agent",
            "result": {
                "mentorship_feedback": "Business mentorship feedback will be implemented in the next phase.",
                "personalized_insights": "Based on your assessment results, here are some key insights...",
                "recommendations": "Consider focusing on these areas for improvement..."
            }
        }
        
    except Exception as e:
        return {
            "status": "error",
            "agent": "feedback_agent",
            "error": str(e)
        }

def delegate_to_memory_agent(task_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Delegate memory operations to the memory agent.
    
    Args:
        task_data: Dictionary containing memory operation and user context
        
    Returns:
        Dictionary with memory results
    """
    try:
        # This will be implemented when we create the memory agent
        # For now, return a placeholder
        return {
            "status": "success", 
            "agent": "memory_agent",
            "result": {
                "retrieved_memories": [],
                "stored_memories": [],
                "context": "Memory management will be implemented with Vertex AI Memory Bank."
            }
        }
        
    except Exception as e:
        return {
            "status": "error",
            "agent": "memory_agent",
            "error": str(e)
        }

# Create the coordinator agent tools
delegate_to_scoring_tool = FunctionTool(delegate_to_scoring_agent)
delegate_to_feedback_tool = FunctionTool(delegate_to_feedback_agent)
delegate_to_memory_tool = FunctionTool(delegate_to_memory_agent)

# Main Coordinator Agent
coordinator_agent = Agent(
    name="gutcheck_coordinator_agent",
    model="gemini-2.0-flash",
    description="Router/Dispatcher agent that delegates tasks to specialized agents",
    instruction="""
    You are the Coordinator Agent for Gutcheck.AI - the central router and dispatcher for all assessment requests.
    
    Your role is to:
    1. Receive incoming requests with a task_type
    2. Validate the request data and task type
    3. Delegate to the appropriate specialist agent
    4. Return structured responses with proper error handling
    
    Available task types and delegations:
    - "assessment_feedback" → delegate_to_scoring_agent (for comprehensive assessment analysis)
    - "business_mentorship" → delegate_to_feedback_agent (for personalized business advice)
    - "memory_retrieval" → delegate_to_memory_agent (for user context and learning)
    - "question_scoring" → delegate_to_scoring_agent (for individual question analysis)
    
    IMPORTANT RULES:
    - Always validate that task_type is provided and valid
    - Ensure all required data is present before delegation
    - Handle errors gracefully and return structured error responses
    - Never attempt to process tasks directly - always delegate to specialist agents
    - Maintain audit trail of all delegations for monitoring purposes
    
    Return responses in this format:
    {
        "coordinator_status": "success|error",
        "delegated_agent": "agent_name",
        "task_type": "requested_task_type", 
        "result": {delegated_agent_response},
        "timestamp": "ISO_timestamp"
    }
    """,
    tools=[
        delegate_to_scoring_tool,
        delegate_to_feedback_tool, 
        delegate_to_memory_tool
    ]
)

def coordinate_request(task_type: str, task_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main coordination function that routes requests to appropriate agents.
    
    Args:
        task_type: Type of task to perform
        task_data: Data needed for the task
        
    Returns:
        Dictionary with coordinated response
    """
    try:
        # For now, use a direct approach since ADK requires credentials
        # In production, this would use: result = coordinator_agent.run(prompt)
        
        # Route to appropriate agent based on task type
        if task_type == "assessment_feedback":
            # Use the core assessment agent
            from .agent import generate_complete_assessment_feedback
            result = generate_complete_assessment_feedback(task_data)
            delegated_agent = "core_assessment_agent"
        elif task_type == "question_scoring":
            # Use the enhanced scoring agent
            from .tools.enhanced_question_scoring import enhanced_score_question
            question_id = task_data.get("questionId", "")
            question_text = task_data.get("questionText", "")
            response = task_data.get("response", "")
            result = enhanced_score_question(question_id, question_text, response)
            delegated_agent = "enhanced_scoring_agent"
        else:
            # Default fallback
            result = {"message": f"Task type {task_type} not implemented yet"}
            delegated_agent = "unknown"
        
        return {
            "coordinator_status": "success",
            "delegated_agent": delegated_agent,
            "task_type": task_type,
            "result": result,
            "timestamp": datetime.datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "coordinator_status": "error",
            "delegated_agent": "none",
            "task_type": task_type,
            "result": {"error": str(e)},
            "timestamp": datetime.datetime.now().isoformat()
        }

def parse_coordinator_response(agent_response: str, task_type: str) -> Dict[str, Any]:
    """
    Parse the coordinator agent response text into structured format.
    
    Args:
        agent_response (str): Raw agent response text
        task_type (str): The original task type
        
    Returns:
        dict: Structured coordinator response
    """
    try:
        # Try to extract structured information from the response
        # This is a simplified parser - in production, this would be more sophisticated
        
        # Look for delegation information
        delegated_agent = "unknown"
        if "delegate_to_scoring_agent" in agent_response.lower():
            delegated_agent = "scoring_agent"
        elif "delegate_to_feedback_agent" in agent_response.lower():
            delegated_agent = "feedback_agent"
        elif "delegate_to_memory_agent" in agent_response.lower():
            delegated_agent = "memory_agent"
        
        # For assessment feedback tasks, generate the actual feedback
        result = {}
        if task_type == "assessment_feedback":
            # Extract assessment data from the response or use a default
            # For now, use a mock result
            result = {
                "feedback": "Your assessment reveals a solid foundation with clear potential for growth.",
                "competitiveAdvantage": {
                    "category": "Personal Background",
                    "score": "17/20",
                    "summary": "Your highest-scoring category reveals key competitive strengths.",
                    "specificStrengths": [
                        "Strong entrepreneurial experience",
                        "Proven business model development",
                        "Strategic business transitions",
                        "Diverse industry experience"
                    ]
                },
                "growthOpportunity": {
                    "category": "Behavioral Metrics",
                    "score": "12/15",
                    "summary": "Your lowest-scoring category reveals key growth opportunities.",
                    "specificWeaknesses": [
                        "Limited goal tracking systems",
                        "Basic time management",
                        "Need for systematic planning",
                        "Room for improvement in risk assessment"
                    ]
                },
                "comprehensiveAnalysis": "EXECUTIVE SUMMARY: This entrepreneur demonstrates solid foundational skills with clear potential for growth.",
                "nextSteps": "1. Connect with SCORE Business Mentors (https://www.score.org)",
                "scoreProjection": {}
            }
        else:
            # For other task types, use the response content
            result = {"content": agent_response}
        
        return {
            "coordinator_status": "success",
            "delegated_agent": delegated_agent,
            "task_type": task_type,
            "result": result,
            "timestamp": datetime.datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "coordinator_status": "error",
            "delegated_agent": "unknown",
            "task_type": task_type,
            "error": f"Error parsing coordinator response: {str(e)}",
            "timestamp": datetime.datetime.now().isoformat()
        }
