"""
Debug script to see the actual response structure from the ADK agent
"""

import asyncio
import json
from assessment_analysis_agent.agent import root_agent

async def debug_response_structure():
    """Debug the response structure to understand what we're getting"""
    
    # Load the test data with scores
    with open('test_agent_with_scores.json', 'r') as f:
        test_session = json.load(f)
    
    try:
        print("🔍 Debugging Response Structure...")
        
        # Run the agent
        result = await root_agent.run(json.dumps(test_session))
        
        print("📄 Raw Result Type:", type(result))
        print("📄 Raw Result:", repr(result))
        
        # Try to parse as JSON
        try:
            analysis = json.loads(result)
            print("✅ Successfully parsed as JSON")
            print("Keys:", list(analysis.keys()))
        except json.JSONDecodeError as e:
            print("❌ Not valid JSON:", e)
            print("Result might be a string or other format")
        
        return True
        
    except Exception as e:
        print(f"❌ Debug failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    asyncio.run(debug_response_structure())
