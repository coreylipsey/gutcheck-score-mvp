"""
Comprehensive test script for the ADK Assessment Agent
Tests with full 25-question assessment data
"""

import asyncio
import json
from assessment_analysis_agent.agent import root_agent

async def test_comprehensive_assessment():
    """Test the assessment agent with comprehensive assessment data"""
    
    # Load the comprehensive assessment data
    with open('test_comprehensive_assessment.json', 'r') as f:
        test_session = json.load(f)
    
    try:
        print("🚀 Testing Assessment Agent with Comprehensive Data...")
        print(f"Session ID: {test_session['session_id']}")
        print(f"Number of responses: {len(test_session['responses'])}")
        print(f"Industry: {test_session['industry']}")
        print(f"Location: {test_session['location']}")
        print()
        
        # Run the agent
        result = await root_agent.run(json.dumps(test_session))
        
        # Parse and display results
        analysis = json.loads(result)
        
        print("✅ Assessment Agent Test Successful!")
        print("=" * 50)
        print(f"Overall Score: {analysis.get('overall_score', 'N/A')}")
        print()
        
        # Display category scores
        if 'category_scores' in analysis:
            print("📊 Category Scores:")
            for category in analysis['category_scores']:
                print(f"  {category['category']}: {category['score']}/100")
        print()
        
        # Display key insights
        if 'key_insights' in analysis:
            print("💡 Key Insights:")
            for i, insight in enumerate(analysis['key_insights'], 1):
                print(f"  {i}. {insight}")
        print()
        
        # Display recommendations
        if 'recommendations' in analysis:
            print("🎯 Recommendations:")
            for i, rec in enumerate(analysis['recommendations'], 1):
                print(f"  {i}. {rec}")
        print()
        
        # Display competitive advantage and growth opportunity
        if 'competitive_advantage' in analysis:
            print("🏆 Competitive Advantage:")
            print(f"  {analysis['competitive_advantage']}")
        print()
        
        if 'growth_opportunity' in analysis:
            print("📈 Growth Opportunity:")
            print(f"  {analysis['growth_opportunity']}")
        print()
        
        return True
        
    except Exception as e:
        print(f"❌ Assessment Agent Test Failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    asyncio.run(test_comprehensive_assessment())
