"""
Test script for the simplified assessment agent that focuses on insights and analysis
"""

import asyncio
import json
from assessment_analysis_agent.agent import root_agent

async def test_simplified_agent():
    """Test the simplified agent with pre-calculated scores"""
    
    # Load the test data with scores
    with open('test_agent_with_scores.json', 'r') as f:
        test_session = json.load(f)
    
    try:
        print("🚀 Testing Simplified Assessment Agent...")
        print(f"Session ID: {test_session['session_id']}")
        print(f"Overall Score: {test_session['overall_score']}")
        print(f"Number of responses: {len(test_session['responses'])}")
        print(f"Industry: {test_session['industry']}")
        print(f"Location: {test_session['location']}")
        print()
        
        # Run the agent
        result = await root_agent.run(json.dumps(test_session))
        
        print("📄 Agent Response:")
        print("=" * 50)
        print(result)
        print("=" * 50)
        
        # Try to parse the response
        try:
            analysis = json.loads(result)
            print("\n✅ Successfully parsed JSON response")
            print(f"Keys in response: {list(analysis.keys())}")
            
            if 'key_insights' in analysis:
                print(f"\n🔍 Key Insights ({len(analysis['key_insights'])}):")
                for i, insight in enumerate(analysis['key_insights'], 1):
                    print(f"  {i}. {insight}")
            
            if 'recommendations' in analysis:
                print(f"\n💡 Recommendations ({len(analysis['recommendations'])}):")
                for i, rec in enumerate(analysis['recommendations'], 1):
                    print(f"  {i}. {rec}")
            
            if 'competitive_advantage' in analysis:
                print(f"\n🏆 Competitive Advantage:")
                print(f"  {analysis['competitive_advantage']}")
            
            if 'growth_opportunity' in analysis:
                print(f"\n📈 Growth Opportunity:")
                print(f"  {analysis['growth_opportunity']}")
            
            if 'comprehensive_analysis' in analysis:
                print(f"\n📋 Comprehensive Analysis:")
                print(f"  {analysis['comprehensive_analysis']}")
            
            if 'category_insights' in analysis:
                print(f"\n📊 Category Insights:")
                for cat_insight in analysis['category_insights']:
                    print(f"  {cat_insight['category']} ({cat_insight['score']:.1f}/100):")
                    for insight in cat_insight['insights']:
                        print(f"    • {insight}")
            
            return True
            
        except json.JSONDecodeError as e:
            print(f"❌ Failed to parse JSON response: {e}")
            print("Response might not be valid JSON")
            return False
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    asyncio.run(test_simplified_agent())
