#!/usr/bin/env python3
"""
Test script to verify application integration with deployed agent
Simulates the ADKAssessmentService.ts integration
"""

import asyncio
import json
import httpx
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

async def test_application_integration():
    """Test the integration similar to ADKAssessmentService.ts"""
    print("🧪 Testing Application Integration (ADKAssessmentService.ts simulation)")
    
    # This simulates the data that would come from the application
    mock_assessment_data = {
        "session_id": "app_integration_test_001",
        "user_id": "test_user_001",
        "industry": "Manufacturing & Consumer Goods",
        "location": "Texas",
        "overall_score": 78.0,
        "category_scores": {
            "personalBackground": 82.0,
            "entrepreneurialSkills": 75.0,
            "resources": 70.0,
            "behavioralMetrics": 68.0,
            "growthVision": 80.0
        },
        "question_scores": {},
        "responses": [
            {
                "question_id": "q1",
                "question_text": "What stage is your business currently in?",
                "response": "Early operations with a few customers",
                "question_type": "multipleChoice",
                "category": "personalBackground"
            },
            {
                "question_id": "q7",
                "question_text": "What drives you to succeed in business?",
                "response": "Creating value for customers and making a positive impact",
                "question_type": "openEnded",
                "category": "entrepreneurialSkills"
            }
        ]
    }
    
    try:
        # Simulate the ADKAssessmentService.ts call
        agent_url = "https://us-central1-gutcheck-score-mvp.cloudfunctions.net/assessment-agent"
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            print(f"🌐 Calling deployed agent: {agent_url}")
            
            response = await client.post(
                agent_url,
                json=mock_assessment_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                result = response.json()
                
                if result.get("success"):
                    data = result.get("data", {})
                    print("✅ Application integration successful!")
                    
                    # Verify the response structure matches what the app expects
                    expected_fields = [
                        'key_insights', 'recommendations', 'competitive_advantage', 
                        'growth_opportunity', 'comprehensive_analysis', 'category_insights'
                    ]
                    
                    print("\n📊 Response Analysis:")
                    for field in expected_fields:
                        if field in data:
                            content = data[field]
                            if isinstance(content, list):
                                print(f"  ✅ {field}: {len(content)} items")
                            elif isinstance(content, str):
                                print(f"  ✅ {field}: {len(content)} characters")
                            elif isinstance(content, dict):
                                print(f"  ✅ {field}: {len(content)} entries")
                        else:
                            print(f"  ❌ Missing field: {field}")
                    
                    # Show the actual data structure
                    print(f"\n🔍 Actual data keys: {list(data.keys())}")
                    
                    # Show sample content
                    print("\n📝 Sample Content:")
                    if data.get('key_insights'):
                        print(f"  Key Insights: {data['key_insights'][0][:100]}...")
                    if data.get('recommendations'):
                        print(f"  Recommendations: {data['recommendations'][0][:100]}...")
                    
                    return True
                else:
                    print(f"❌ Agent processing failed: {result.get('error')}")
                    return False
            else:
                print(f"❌ HTTP request failed: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
    except Exception as e:
        print(f"❌ Application integration test failed: {e}")
        return False

def show_integration_code():
    """Show the TypeScript integration code"""
    print("\n🔗 TypeScript Integration Code (ADKAssessmentService.ts)")
    print("=" * 60)
    
    integration_code = '''
// Updated ADKAssessmentService.ts
export class ADKAssessmentService implements IAIScoringService {
  private readonly agentUrl: string;
  private readonly useADK: boolean;

  constructor() {
    // Use environment variable or default to deployed Cloud Functions agent
    this.agentUrl = process.env.ASSESSMENT_AGENT_URL || 
                   'https://us-central1-gutcheck-score-mvp.cloudfunctions.net/assessment-agent';
    
    this.useADK = process.env.USE_ADK !== 'false';
  }

  async generateFeedback(
    responses: Record<string, unknown>[],
    scores: Record<AssessmentCategory, number>,
    industry?: string,
    location?: string
  ): Promise<AIFeedback> {
    try {
      // Calculate overall score from category scores
      const overallScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;
      
      // Call the deployed assessment agent
      const apiResponse = await fetch(this.agentUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: `feedback_${Date.now()}`,
          user_id: `user_${Date.now()}`,
          industry: industry || 'General',
          location: location || 'Unknown',
          overall_score: overallScore,
          category_scores: scores,
          question_scores: {},
          responses: responses
        })
      });

      if (!apiResponse.ok) {
        throw new Error(`Assessment agent API error: ${apiResponse.statusText}`);
      }

      const result = await apiResponse.json();
      
      if (!result.success) {
        throw new Error(`Assessment agent processing failed: ${result.error}`);
      }
      
      const data = result.data;
      
      // Transform to AIFeedback format
      return {
        feedback: data.key_insights?.join('\\n\\n') || '',
        competitiveAdvantage: {
          category: this.getHighestScoringCategory(scores),
          score: overallScore.toString(),
          summary: data.competitive_advantage || '',
          specificStrengths: data.key_insights || []
        },
        growthOpportunity: {
          category: this.getLowestScoringCategory(scores),
          score: overallScore.toString(),
          summary: data.growth_opportunity || '',
          specificWeaknesses: data.recommendations || []
        },
        scoreProjection: {
          currentScore: overallScore,
          projectedScore: overallScore,
          improvementPotential: 0
        },
        comprehensiveAnalysis: data.comprehensive_analysis || '',
        nextSteps: data.recommendations?.join('\\n\\n') || ''
      };
    } catch (error) {
      console.error('Assessment agent error:', error);
      // Fallback to legacy system
      return this.generateLegacyFeedback(responses, scores, industry, location);
    }
  }
}
'''
    
    print(integration_code)
    print("=" * 60)

async def main():
    """Run the application integration test"""
    print("🚀 Testing Application Integration with Deployed Agent\n")
    
    # Test the integration
    success = await test_application_integration()
    
    # Show integration code
    show_integration_code()
    
    # Summary
    print("\n📋 Integration Test Results:")
    print("=" * 30)
    print(f"Application Integration: {'✅ PASS' if success else '❌ FAIL'}")
    
    if success:
        print("\n🎉 Application integration successful!")
        print("\nNext steps:")
        print("1. ✅ Agent deployed to Cloud Functions")
        print("2. ✅ ADKAssessmentService.ts updated")
        print("3. 🔄 Test with real application data")
        print("4. 🚀 Deploy application updates")
    else:
        print("\n❌ Integration test failed. Please check the logs above.")
    
    return success

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
