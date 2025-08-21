"""
Debug script to see the raw response from the assessment agent
"""

import asyncio
import json
from assessment_analysis_agent.agent import root_agent

async def debug_agent_response():
    """Debug the agent response to see what's happening"""
    
    # Load the comprehensive assessment data
    with open('test_comprehensive_assessment.json', 'r') as f:
        test_session = json.load(f)
    
    try:
        print("🔍 Debugging Assessment Agent Response...")
        print(f"Session ID: {test_session['session_id']}")
        print(f"Number of responses: {len(test_session['responses'])}")
        print()
        
        # Run the agent
        result = await root_agent.run(json.dumps(test_session))
        
        print("📄 Raw Agent Response:")
        print("=" * 50)
        print(result)
        print("=" * 50)
        
        # Try to parse the response
        try:
            analysis = json.loads(result)
            print("\n✅ Successfully parsed JSON response")
            print(f"Keys in response: {list(analysis.keys())}")
            
            if 'overall_score' in analysis:
                print(f"Overall Score: {analysis['overall_score']}")
            else:
                print("❌ No overall_score in response")
                
            if 'category_scores' in analysis:
                print(f"Category Scores: {len(analysis['category_scores'])} categories")
                for cat in analysis['category_scores']:
                    print(f"  {cat.get('category', 'Unknown')}: {cat.get('score', 'N/A')}")
            else:
                print("❌ No category_scores in response")
                
        except json.JSONDecodeError as e:
            print(f"❌ Failed to parse JSON response: {e}")
            print("Response might not be valid JSON")
        
        return True
        
    except Exception as e:
        print(f"❌ Debug failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    asyncio.run(debug_agent_response())
