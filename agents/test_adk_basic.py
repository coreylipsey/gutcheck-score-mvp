#!/usr/bin/env python3
"""
Basic ADK Test
Test to understand how ADK works.
"""

import asyncio

async def test_adk_basic():
    """Test basic ADK functionality."""
    try:
        from google.adk.models import Gemini
        from google.adk.agents import Agent
        
        print("Testing ADK Gemini model...")
        llm = Gemini(model="gemini-2.0-flash")
        
        # Try to use the async method
        print("Testing generate_content_async...")
        async_gen = llm.generate_content_async("Hello, how are you?")
        response = None
        async for chunk in async_gen:
            response = chunk
            break  # Just get the first chunk for now
        print(f"Response: {response}")
        
        print("Testing Agent...")
        agent = Agent(
            name="test_agent",
            model="gemini-2.0-flash",
            description="Test agent",
            instruction="You are a helpful assistant."
        )
        
        # Try to use the agent
        print("Testing agent.run_async...")
        result = await agent.run_async("Hello, how are you?")
        print(f"Agent result: {result}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_adk_basic())
