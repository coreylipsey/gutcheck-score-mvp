#!/bin/bash

# ADK Agent Server Startup Script
# This script starts the ADK agent server for Gutcheck

echo "🚀 Starting Gutcheck ADK Agent Server..."

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed or not in PATH"
    exit 1
fi

# Check if we're in the agents directory
if [ ! -f "server.py" ]; then
    echo "❌ Please run this script from the agents directory"
    exit 1
fi

# Check if ADK agent can be imported
echo "🔍 Testing ADK agent import..."
if ! python3 -c "from core_assessment_agent.agent import core_assessment_agent; print('✅ ADK Agent ready:', core_assessment_agent.name)" 2>/dev/null; then
    echo "❌ Failed to import ADK agent. Please check dependencies."
    exit 1
fi

# Set environment variables
export PORT=${PORT:-8000}
export GEMINI_API_KEY=${GEMINI_API_KEY:-"AIzaSyAUq0hEPlGnfkj6MJC-7et_gNim-YTyTzg"}

echo "📡 Server will run on port: $PORT"
echo "🤖 Agent: gutcheck_assessment_agent"
echo "🔑 Using Gemini API key: ${GEMINI_API_KEY:0:10}..."

# Start the server
echo "🌟 Starting server..."
python3 server.py
