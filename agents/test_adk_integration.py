#!/usr/bin/env python3
"""
Test script for ADK Agent Integration
Tests the ADK agent server endpoints and functionality.
"""

import requests
import json
import time

# Test configuration
BASE_URL = "http://localhost:8000"

def test_health_check():
    """Test the health check endpoint"""
    print("🔍 Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_agent_info():
    """Test the agent info endpoint"""
    print("🔍 Testing agent info...")
    try:
        response = requests.get(f"{BASE_URL}/agent-info")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Agent info: {data}")
            return True
        else:
            print(f"❌ Agent info failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Agent info error: {e}")
        return False

def test_feedback_generation():
    """Test the feedback generation endpoint"""
    print("🔍 Testing feedback generation...")
    
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
            json=test_data
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Feedback generation successful!")
            print(f"📊 Competitive Advantage: {len(data.get('competitiveAdvantage', ''))} chars")
            print(f"📈 Growth Opportunity: {len(data.get('growthOpportunity', ''))} chars")
            print(f"📋 Comprehensive Analysis: {len(data.get('comprehensiveAnalysis', ''))} chars")
            print(f"🎯 Next Steps: {len(data.get('nextSteps', ''))} chars")
            return True
        else:
            print(f"❌ Feedback generation failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Feedback generation error: {e}")
        return False

def test_question_scoring():
    """Test the question scoring endpoint"""
    print("🔍 Testing question scoring...")
    
    test_data = {
        "questionId": "q3",
        "response": "I've been running my own e-commerce business for 2 years, generating $50K in revenue annually.",
        "questionText": "Tell us about your entrepreneurial journey so far."
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/score-question",
            headers={"Content-Type": "application/json"},
            json=test_data
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Question scoring successful: Score {data.get('score')}, Explanation: {data.get('explanation', '')[:100]}...")
            return True
        else:
            print(f"❌ Question scoring failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Question scoring error: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting ADK Agent Integration Tests")
    print("=" * 50)
    
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
        time.sleep(1)  # Brief pause between tests
    
    print("=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! ADK agent integration is working correctly.")
    else:
        print("⚠️  Some tests failed. Please check the ADK agent configuration.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
