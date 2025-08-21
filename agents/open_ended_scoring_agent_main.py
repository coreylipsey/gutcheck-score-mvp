#!/usr/bin/env python3
"""
Cloud Functions entry point for Open-Ended Question Scoring Agent V2
Gutcheck.AI - Deployed to Google Cloud Functions
"""

import functions_framework
import asyncio
import json
import logging
from typing import Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import the agent
from open_ended_scoring_agent.agent import root_agent

@functions_framework.http
def process_open_ended_scoring_http(request):
    """
    Cloud Functions HTTP entry point for open-ended question scoring
    """
    # Handle CORS preflight requests
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }
        return ('', 204, headers)

    # Only allow POST requests
    if request.method != 'POST':
        return json.dumps({
            'success': False,
            'error': 'Only POST requests are allowed'
        }), 405, {'Content-Type': 'application/json'}

    try:
        # Parse the request
        request_json = request.get_json()
        if not request_json:
            return json.dumps({
                'success': False,
                'error': 'No JSON data provided'
            }), 400, {'Content-Type': 'application/json'}

        # Validate required fields
        required_fields = ['question_id', 'response', 'question_text']
        for field in required_fields:
            if field not in request_json:
                return json.dumps({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400, {'Content-Type': 'application/json'}

        # Convert to JSON string for the agent
        input_data = {
            'question_id': request_json['question_id'],
            'response': request_json['response'],
            'question_text': request_json['question_text']
        }
        input_json = json.dumps(input_data)

        # Call the agent synchronously
        result = asyncio.run(root_agent.run(input_json))

        # Parse the result
        try:
            scoring_data = json.loads(result)
            return json.dumps({
                'success': True,
                'score': scoring_data.get('score'),
                'explanation': scoring_data.get('explanation')
            }), 200, {'Content-Type': 'application/json'}
        except json.JSONDecodeError:
            logger.error(f'Failed to parse agent response: {result}')
            return json.dumps({
                'success': False,
                'error': 'Failed to parse agent response'
            }), 500, {'Content-Type': 'application/json'}

    except Exception as e:
        logger.error(f'Error processing open-ended scoring request: {str(e)}')
        return json.dumps({
            'success': False,
            'error': f'Processing failed: {str(e)}'
        }), 500, {'Content-Type': 'application/json'}

@functions_framework.http
def health_check_http(request):
    """
    Health check endpoint for the open-ended scoring agent
    """
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    }

    if request.method == 'OPTIONS':
        return ('', 204, headers)

    if request.method != 'GET':
        return json.dumps({
            'success': False,
            'error': 'Only GET requests are allowed'
        }), 405, {'Content-Type': 'application/json'}

    try:
        # Test the agent with a simple query
        result = asyncio.run(root_agent.run("hello"))
        return json.dumps({
            'success': True,
            'service': 'Open-Ended Question Scoring Agent',
            'status': 'healthy',
            'version': '1.0.0',
            'agent_response': result
        }), 200, {'Content-Type': 'application/json'}
    except Exception as e:
        return json.dumps({
            'success': False,
            'status': 'unhealthy',
            'error': str(e)
        }), 500, {'Content-Type': 'application/json'}
