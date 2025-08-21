#!/usr/bin/env python3
"""
Integration test for Assessment Agent
Simulates how the application would call the deployed agent
"""

import asyncio
import json
import httpx
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

async def test_local_agent():
    """Test the agent running locally"""
    print("🧪 Testing local agent integration...")
    
    try:
        from assessment_analysis_agent.agent import AssessmentAgent
        
        # Load test data
        with open('test_agent_with_scores.json', 'r') as f:
            test_data = json.load(f)
        
        # Create agent
        agent = AssessmentAgent()
        
        # Process assessment (simulating application call)
        result = await agent.run(json.dumps(test_data))
        
        # Parse result
        if isinstance(result, str):
            analysis = json.loads(result)
        else:
            analysis = result
        
        # Verify expected sections
        expected_sections = [
            'key_insights', 'recommendations', 'competitive_advantage', 
            'growth_opportunity', 'comprehensive_analysis', 'category_insights'
        ]
        
        for section in expected_sections:
            if section in analysis:
                print(f"✅ {section}: {len(analysis[section])} items")
            else:
                print(f"❌ Missing section: {section}")
        
        return True
        
    except Exception as e:
        print(f"❌ Local agent test failed: {e}")
        return False

async def test_http_endpoint(base_url="http://localhost:8000"):
    """Test the agent via HTTP endpoint"""
    print(f"\n🌐 Testing HTTP endpoint: {base_url}")
    
    try:
        # Load test data
        with open('test_agent_with_scores.json', 'r') as f:
            test_data = json.load(f)
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            # Test health endpoint
            response = await client.get(f"{base_url}/")
            if response.status_code == 200:
                print("✅ Health check passed")
            else:
                print(f"❌ Health check failed: {response.status_code}")
                return False
            
            # Test assessment processing
            response = await client.post(
                f"{base_url}/process_assessment",
                json=test_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("success"):
                    analysis = result.get("data", {})
                    print("✅ Assessment processing successful")
                    
                    # Verify sections
                    expected_sections = [
                        'key_insights', 'recommendations', 'competitive_advantage', 
                        'growth_opportunity', 'comprehensive_analysis', 'category_insights'
                    ]
                    
                    for section in expected_sections:
                        if section in analysis:
                            print(f"  ✅ {section}: {len(analysis[section])} items")
                        else:
                            print(f"  ❌ Missing section: {section}")
                    
                    return True
                else:
                    print(f"❌ Processing failed: {result.get('error')}")
                    return False
            else:
                print(f"❌ HTTP request failed: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
    except Exception as e:
        print(f"❌ HTTP test failed: {e}")
        return False

def simulate_application_integration():
    """Simulate how the application would integrate with the agent"""
    print("\n🔗 Simulating Application Integration")
    print("=" * 50)
    
    # This is similar to what ADKAssessmentService.ts would do
    integration_code = '''
// TypeScript integration example (ADKAssessmentService.ts)
export class ADKAssessmentService implements IAIScoringService {
    private agentUrl: string;
    
    constructor() {
        this.agentUrl = process.env.ASSESSMENT_AGENT_URL || 
                       'https://us-central1-YOUR_PROJECT.cloudfunctions.net/assessment-agent';
    }
    
    async generateAIFeedback(assessmentSession: AssessmentSession): Promise<AssessmentAnalysis> {
        try {
            const response = await fetch(this.agentUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    session_id: assessmentSession.sessionId,
                    user_id: assessmentSession.userId,
                    industry: assessmentSession.industry,
                    location: assessmentSession.location,
                    overall_score: assessmentSession.overallScore,
                    category_scores: assessmentSession.categoryScores,
                    question_scores: assessmentSession.questionScores,
                    responses: assessmentSession.responses
                })
            });
            
            if (!response.ok) {
                throw new Error(`Agent request failed: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(`Agent processing failed: ${result.error}`);
            }
            
            return result.data;
            
        } catch (error) {
            console.error('Error calling assessment agent:', error);
            throw error;
        }
    }
}
'''
    
    print(integration_code)
    print("=" * 50)

async def main():
    """Run all integration tests"""
    print("🚀 Assessment Agent Integration Testing\n")
    
    # Test local agent
    local_success = await test_local_agent()
    
    # Test HTTP endpoint (if server is running)
    http_success = False
    try:
        http_success = await test_http_endpoint()
    except:
        print("⚠️  HTTP endpoint test skipped (server not running)")
        print("   To test HTTP: python server.py")
    
    # Show integration example
    simulate_application_integration()
    
    # Summary
    print("\n📋 Integration Test Results:")
    print("=" * 30)
    print(f"Local Agent:     {'✅ PASS' if local_success else '❌ FAIL'}")
    print(f"HTTP Endpoint:   {'✅ PASS' if http_success else '⚠️  SKIP'}")
    
    if local_success:
        print("\n🎉 Integration tests passed!")
        print("\nNext steps:")
        print("1. Deploy to Cloud Functions: ./deploy_cloud_functions.sh")
        print("2. Update your application's ASSESSMENT_AGENT_URL environment variable")
        print("3. Test with real assessment data")
    else:
        print("\n❌ Integration tests failed. Please fix issues before deployment.")
    
    return local_success

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
