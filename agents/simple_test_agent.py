"""
Simple test to see if the ADK agent works at all
"""

import asyncio
import json
from assessment_analysis_agent.agent import root_agent

async def simple_test():
    """Simple test of the agent"""
    
    try:
        print("🧪 Simple Agent Test...")
        
        # Test with a simple conversational query
        result = await root_agent.run("Hello, can you tell me about your capabilities?")
        
        print("📄 Result:", result)
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    asyncio.run(simple_test())
