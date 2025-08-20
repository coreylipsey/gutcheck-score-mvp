#!/usr/bin/env python3
"""
Google API Credentials Test
Tests if the Google API credentials are properly configured for ADK.
"""

import os
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_environment_variables():
    """Test if environment variables are set."""
    print("🔍 Testing Environment Variables...")
    
    api_key = os.getenv("GOOGLE_API_KEY")
    app_creds = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    project = os.getenv("GOOGLE_CLOUD_PROJECT")
    location = os.getenv("GOOGLE_CLOUD_LOCATION")
    
    print(f"   GOOGLE_API_KEY: {'✅ Set' if api_key and api_key != 'your-gemini-api-key-here' else '❌ Not set or placeholder'}")
    print(f"   GOOGLE_APPLICATION_CREDENTIALS: {'✅ Set' if app_creds else '❌ Not set'}")
    print(f"   GOOGLE_CLOUD_PROJECT: {'✅ Set' if project else '❌ Not set'}")
    print(f"   GOOGLE_CLOUD_LOCATION: {'✅ Set' if location else '❌ Not set'}")
    
    return bool(api_key and api_key != 'your-gemini-api-key-here') or bool(app_creds)

async def test_adk_connection():
    """Test if ADK can connect to Google APIs."""
    print("\n🔍 Testing ADK Connection...")
    
    try:
        from google.adk.models import Gemini
        
        # Try to initialize the model
        llm = Gemini(model="gemini-2.0-flash")
        print("   ✅ Gemini model initialized successfully")
        
        # Try a simple test call
        print("   🔄 Testing API call...")
        async_gen = llm.generate_content_async("Hello, this is a test.")
        
        # Get the first response
        response = None
        async for chunk in async_gen:
            response = chunk
            break
        
        if response:
            print("   ✅ API call successful!")
            print(f"   📝 Response preview: {str(response)[:100]}...")
            return True
        else:
            print("   ❌ No response received")
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_tools_with_real_llm():
    """Test if tools work with real LLM calls."""
    print("\n🔍 Testing Tools with Real LLM...")
    
    try:
        from core_assessment_agent.tools.key_insights import generate_key_insights
        
        # Test data
        test_data = {
            "responses": [
                {"questionId": "q1", "questionText": "Test question", "response": "Test response"}
            ],
            "scores": {"personalBackground": 8},
            "industry": "Technology",
            "location": "San Francisco"
        }
        
        # Try to generate insights
        result = generate_key_insights(test_data)
        
        if result and len(result) > 50:
            print("   ✅ Key insights tool working with real LLM")
            print(f"   📝 Generated: {result[:100]}...")
            return True
        else:
            print("   ❌ Key insights tool not working properly")
            return False
            
    except Exception as e:
        print(f"   ❌ Error testing tools: {e}")
        return False

def main():
    """Run all credential tests."""
    print("🚀 Google API Credentials Test")
    print("=" * 50)
    
    # Test 1: Environment variables
    env_ok = test_environment_variables()
    
    if not env_ok:
        print("\n❌ Environment variables not properly configured.")
        print("Please follow the setup guide in GOOGLE_API_SETUP.md")
        return False
    
    # Test 2: ADK connection
    try:
        connection_ok = asyncio.run(test_adk_connection())
    except Exception as e:
        print(f"   ❌ Error testing connection: {e}")
        connection_ok = False
    
    # Test 3: Tools with real LLM
    tools_ok = test_tools_with_real_llm()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"   Environment Variables: {'✅ PASS' if env_ok else '❌ FAIL'}")
    print(f"   ADK Connection: {'✅ PASS' if connection_ok else '❌ FAIL'}")
    print(f"   Tools with Real LLM: {'✅ PASS' if tools_ok else '❌ FAIL'}")
    
    if env_ok and connection_ok and tools_ok:
        print("\n🎉 All tests passed! Google API credentials are working correctly.")
        print("The ADK system is ready for production use.")
        return True
    else:
        print("\n⚠️  Some tests failed. Please check your configuration.")
        print("Refer to GOOGLE_API_SETUP.md for troubleshooting.")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
