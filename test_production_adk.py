#!/usr/bin/env python3
"""
Test script for Production ADK Agent Integration
Tests the deployed ADK agent server endpoints and functionality.
"""

import requests
import json
import time

# Production ADK server URL
BASE_URL = "https://gutcheck-adk-agent-286731768309.us-central1.run.app"

def test_health_check():
    """Test the health check endpoint"""
    print("🔍 Testing production health check...")
    try:
        response = requests.get(f"{BASE_URL}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Production health check passed: {data}")
            return True
        else:
            print(f"❌ Production health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Production health check error: {e}")
        return False

def test_agent_info():
    """Test the agent info endpoint"""
    print("🔍 Testing production agent info...")
    try:
        response = requests.get(f"{BASE_URL}/agent-info", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Production agent info: {data}")
            return True
        else:
            print(f"❌ Production agent info failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Production agent info error: {e}")
        return False

def test_feedback_generation():
    """Test the feedback generation endpoint"""
    print("🔍 Testing production feedback generation...")
    
    # Sample assessment data
    test_data = {
        "responses": [
            {
                "questionId": "q3",
                "questionText": "Tell us about your entrepreneurial journey so far.",
                "response": "I've started two small businesses in the past 3 years. The first was a local food delivery service that I ran for 6 months before selling it. The second is a consulting business that I'm currently growing.",
                "category": "entrepreneurialSkills"
            },
            {
                "questionId": "q8", 
                "questionText": "Describe a significant business challenge you've faced.",
                "response": "When I started my consulting business, I struggled with pricing my services. I initially undercharged and worked too many hours for too little pay. I learned to value my time and expertise properly.",
                "category": "behavioralMetrics"
            }
        ],
        "scores": {
            "personalBackground": 15,
            "entrepreneurialSkills": 20,
            "resources": 12,
            "behavioralMetrics": 10,
            "growthVision": 16
        },
        "industry": "Technology",
        "location": "San Francisco"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/generate-feedback",
            headers={"Content-Type": "application/json"},
            json=test_data,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Production feedback generation successful!")
            print(f"📊 Competitive Advantage: {len(data.get('competitiveAdvantage', ''))} chars")
            print(f"📈 Growth Opportunity: {len(data.get('growthOpportunity', ''))} chars")
            print(f"📋 Comprehensive Analysis: {len(data.get('comprehensiveAnalysis', ''))} chars")
            print(f"🎯 Next Steps: {len(data.get('nextSteps', ''))} chars")
            return True
        else:
            print(f"❌ Production feedback generation failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Production feedback generation error: {e}")
        return False

def test_question_scoring():
    """Test the question scoring endpoint"""
    print("🔍 Testing production question scoring...")
    
    test_data = {
        "questionId": "q3",
        "response": "I've been running my own e-commerce business for 2 years, generating $50K in revenue annually.",
        "questionText": "Tell us about your entrepreneurial journey so far."
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/score-question",
            headers={"Content-Type": "application/json"},
            json=test_data,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Production question scoring successful: Score {data.get('score')}, Explanation: {data.get('explanation', '')[:100]}...")
            return True
        else:
            print(f"❌ Production question scoring failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Production question scoring error: {e}")
        return False

def main():
    """Run all production tests"""
    print("🚀 Starting Production ADK Agent Integration Tests")
    print("=" * 60)
    print(f"🌐 Testing against: {BASE_URL}")
    print("=" * 60)
    
    tests = [
        test_health_check,
        test_agent_info,
        test_feedback_generation,
        test_question_scoring
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
        time.sleep(2)  # Brief pause between tests
    
    print("=" * 60)
    print(f"📊 Production Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All production tests passed! ADK agent is ready for production use.")
        print("✅ Ready to update main application to use production ADK server.")
    else:
        print("⚠️  Some production tests failed. Please check the deployment.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
