#!/bin/bash

# Gutcheck ADK Agent Setup Script
# This script installs Google ADK and sets up the development environment

set -e  # Exit on any error

echo "🚀 Setting up Gutcheck ADK Core Assessment Agent..."

# Check if Python 3.8+ is installed
python_version=$(python3 --version 2>&1 | sed 's/Python //' | cut -d. -f1,2)
required_version="3.8"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo "❌ Python 3.8+ is required. Current version: $python_version"
    exit 1
fi

echo "✅ Python version: $python_version"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install Google ADK
echo "🤖 Installing Google ADK..."
pip install google-adk

# Install other dependencies
echo "📚 Installing dependencies..."
pip install -r requirements.txt

# Set up environment variables
echo "🔑 Setting up environment variables..."
if [ ! -f ".env" ]; then
    cat > .env << EOF
# ADK Agent Configuration
GOOGLE_API_KEY=your-gemini-api-key-here
ADK_AGENT_URL=http://localhost:8000
USE_ADK_AGENT=true

# Development settings
PORT=8000
DEBUG=true
EOF
    echo "📝 Created .env file. Please update with your Gemini API key."
else
    echo "✅ .env file already exists."
fi

# Test ADK installation
echo "🧪 Testing ADK installation..."
python3 -c "import google.adk; print('✅ ADK imported successfully')" || {
    echo "❌ ADK installation failed"
    exit 1
}

echo ""
echo "🎉 Setup complete! Next steps:"
echo ""
echo "1. Update your .env file with your Gemini API key:"
echo "   GOOGLE_API_KEY=your-actual-api-key"
echo ""
echo "2. Start the ADK development UI:"
echo "   adk dev"
echo ""
echo "3. In another terminal, run the agent server:"
echo "   python server.py"
echo ""
echo "4. Test the agent:"
echo "   curl http://localhost:8000/health"
echo ""
echo "5. Update your frontend environment:"
echo "   export USE_ADK_AGENT=true"
echo "   export ADK_AGENT_URL=http://localhost:8000"
echo ""
echo "Happy agent building! 🤖"
