#!/usr/bin/env python3
"""
Test script to verify deployment setup
Tests both the server and Cloud Functions entry points
"""

import asyncio
import json
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_agent_direct():
    """Test the agent directly"""
    print("🧪 Testing agent directly...")
    
    try:
        from assessment_analysis_agent.agent import AssessmentAgent
        
        # Load test data
        with open('test_agent_with_scores.json', 'r') as f:
            test_data = json.load(f)
        
        # Create agent
        agent = AssessmentAgent()
        print("✅ Agent created successfully")
        
        # Test with sample data
        result = asyncio.run(agent.run(json.dumps(test_data)))
        print("✅ Agent processed test data successfully")
        
        # Parse result
        if isinstance(result, str):
            try:
                parsed = json.loads(result)
                print("✅ Agent returned valid JSON")
                print(f"📊 Analysis sections: {list(parsed.keys())}")
            except json.JSONDecodeError:
                print("⚠️  Agent returned non-JSON response")
        else:
            print("✅ Agent returned structured data")
        
        return True
        
    except Exception as e:
        print(f"❌ Agent test failed: {e}")
        return False

def test_server_import():
    """Test server import"""
    print("\n🧪 Testing server import...")
    
    try:
        from server import app
        print("✅ Server imports successfully")
        return True
    except Exception as e:
        print(f"❌ Server import failed: {e}")
        return False

def test_main_import():
    """Test main.py import"""
    print("\n🧪 Testing main.py import...")
    
    try:
        from main import process_assessment_http
        print("✅ Cloud Functions entry point imports successfully")
        return True
    except Exception as e:
        print(f"❌ Main import failed: {e}")
        return False

def test_docker_build():
    """Test Docker build"""
    print("\n🧪 Testing Docker build...")
    
    try:
        import subprocess
        result = subprocess.run(['docker', 'build', '-t', 'test-assessment-agent', '.'], 
                              capture_output=True, text=True, timeout=60)
        
        if result.returncode == 0:
            print("✅ Docker build successful")
            return True
        else:
            print(f"❌ Docker build failed: {result.stderr}")
            return False
    except FileNotFoundError:
        print("⚠️  Docker not installed locally - skipping Docker test")
        return True  # Skip this test if Docker not available
    except Exception as e:
        print(f"❌ Docker test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Testing Assessment Agent Deployment Setup\n")
    
    tests = [
        ("Agent Direct", test_agent_direct),
        ("Server Import", test_server_import),
        ("Main Import", test_main_import),
        ("Docker Build", test_docker_build)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} test crashed: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n📋 Test Results:")
    print("=" * 50)
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:<20} {status}")
        if result:
            passed += 1
    
    print("=" * 50)
    print(f"Total: {passed}/{len(results)} tests passed")
    
    if passed == len(results):
        print("\n🎉 All tests passed! Your agent is ready for deployment.")
        print("\nNext steps:")
        print("1. Deploy to Cloud Functions: ./deploy_agent.sh")
        print("2. Test the deployed endpoint")
        print("3. Integrate with your application")
    else:
        print(f"\n⚠️  {len(results) - passed} test(s) failed. Please fix issues before deployment.")
    
    return passed == len(results)

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
