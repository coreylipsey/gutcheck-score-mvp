#!/usr/bin/env python3
"""
Test script for the Open-Ended Question Scoring Agent V2
Tests the agent's ability to score individual open-ended questions
"""

import asyncio
import json
import sys
import os

# Add the agents directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from open_ended_scoring_agent.agent import root_agent

async def test_open_ended_scoring():
    """Test the open-ended scoring agent with sample data"""

    print("🧪 Testing Open-Ended Question Scoring Agent")
    print("=" * 50)

    # Test data for each open-ended question type
    test_cases = [
        {
            "question_id": "q3",
            "question_text": "Tell me about your entrepreneurial journey so far.",
            "response": "I started my entrepreneurial journey 3 years ago when I identified a gap in the market for sustainable packaging solutions. I began by conducting extensive market research, interviewing potential customers, and developing a prototype. Within 6 months, I had my first paying customer and have since grown to serve 15 clients across three states. I've learned to pivot quickly based on customer feedback and have developed strong relationships with suppliers and distributors."
        },
        {
            "question_id": "q8",
            "question_text": "Describe a time when you faced a major business challenge and how you addressed it.",
            "response": "When our main supplier suddenly increased prices by 40%, I immediately reached out to alternative suppliers and negotiated better terms with existing partners. I also analyzed our cost structure and identified areas where we could optimize without sacrificing quality. Within two weeks, I had secured new supplier agreements that actually reduced our costs by 15% while maintaining product quality."
        },
        {
            "question_id": "q18",
            "question_text": "How do you typically handle setbacks?",
            "response": "I view setbacks as learning opportunities. When we lost our biggest client due to budget cuts, I immediately analyzed what we could have done differently and used that insight to improve our value proposition. I reached out to other potential clients with a refined pitch and within a month had replaced the lost revenue with two new clients."
        },
        {
            "question_id": "q23",
            "question_text": "What is your ultimate vision for your business?",
            "response": "I envision building a company that revolutionizes how small businesses approach sustainability. Within 5 years, I want to be the leading provider of eco-friendly packaging solutions in the Midwest, serving 500+ businesses. Long-term, I see expanding nationally and potentially internationally, while maintaining our commitment to environmental responsibility and customer service excellence."
        }
    ]

    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📝 Test Case {i}: {test_case['question_id']}")
        print(f"Question: {test_case['question_text']}")
        print(f"Response: {test_case['response'][:100]}...")

        try:
            # Convert test case to JSON string
            input_json = json.dumps(test_case)

            # Call the agent
            result = await root_agent.run(input_json)

            # Parse the result
            try:
                scoring_result = json.loads(result)
                print(f"✅ Score: {scoring_result.get('score', 'N/A')}/5")
                print(f"📋 Explanation: {scoring_result.get('explanation', 'N/A')}")
            except json.JSONDecodeError:
                print(f"❌ Failed to parse result: {result}")

        except Exception as e:
            print(f"❌ Error: {str(e)}")

    print("\n" + "=" * 50)
    print("🎯 Testing Complete!")

if __name__ == "__main__":
    asyncio.run(test_open_ended_scoring())
