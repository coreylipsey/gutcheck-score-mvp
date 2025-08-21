"""
Test script for the ADK Assessment Agent
Run this to verify the agent works before deployment
"""

import asyncio
import json
from assessment_analysis_agent.agent import root_agent

async def test_assessment_agent():
    """Test the assessment agent with sample data"""
    
    # Sample assessment data
    test_session = {
        "session_id": "test_session_001",
        "responses": [
            {
                "question_id": "q1",
                "question_text": "What stage is your business currently in?",
                "response": "Early operations with a few customers",
                "question_type": "multipleChoice",
                "category": "personalBackground"
            },
            {
                "question_id": "q3",
                "question_text": "Tell me about your entrepreneurial journey so far.",
                "response": "I started my business 2 years ago after identifying a gap in the market. I've built a team of 3 people and we're generating consistent monthly revenue of $15,000. We've learned a lot about customer needs and are now ready to scale.",
                "question_type": "openEnded",
                "category": "personalBackground"
            },
            {
                "question_id": "q19",
                "question_text": "Does fear of failure prevent you from taking bold steps in your business?",
                "response": "2",
                "question_type": "likert",
                "category": "behavioralMetrics"
            }
        ],
        "industry": "Technology & Software",
        "location": "California"
    }
    
    try:
        # Run the agent
        result = await root_agent.run(json.dumps(test_session))
        
        # Parse and display results
        analysis = json.loads(result)
        
        print("✅ Assessment Agent Test Successful!")
        print(f"Overall Score: {analysis.get('overall_score', 'N/A')}")
        print(f"Category Scores: {len(analysis.get('category_scores', []))} categories")
        print(f"Key Insights: {len(analysis.get('key_insights', []))} insights")
        print(f"Recommendations: {len(analysis.get('recommendations', []))} recommendations")
        
        return True
        
    except Exception as e:
        print(f"❌ Assessment Agent Test Failed: {str(e)}")
        return False

if __name__ == "__main__":
    asyncio.run(test_assessment_agent())
