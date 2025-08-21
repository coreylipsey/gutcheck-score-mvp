#!/bin/bash

# Deploy Open-Ended Scoring Agent to Google Cloud Functions
# Gutcheck.AI - Agent Deployment Script

set -e

echo "🚀 Deploying Open-Ended Scoring Agent to Google Cloud Functions"
echo "================================================================"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI is not installed. Please install it first."
    exit 1
fi

# Check if authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Error: Not authenticated with gcloud. Please run 'gcloud auth login' first."
    exit 1
fi

# Get project ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo "❌ Error: No project ID configured. Please run 'gcloud config set project YOUR_PROJECT_ID' first."
    exit 1
fi

echo "📋 Project ID: $PROJECT_ID"

# Check if required APIs are enabled
echo "🔍 Checking required APIs..."
APIS=("cloudfunctions.googleapis.com" "cloudbuild.googleapis.com" "run.googleapis.com")

for api in "${APIS[@]}"; do
    if ! gcloud services list --enabled --filter="name:$api" --format="value(name)" | grep -q "$api"; then
        echo "⚠️  Enabling API: $api"
        gcloud services enable "$api"
    else
        echo "✅ API enabled: $api"
    fi
done

# Test the agent locally first
echo "🧪 Testing agent locally..."
cd "$(dirname "$0")"
python test_open_ended_agent.py

if [ $? -ne 0 ]; then
    echo "❌ Local test failed. Please fix the agent before deploying."
    exit 1
fi

echo "✅ Local test passed"

# Deploy to Cloud Functions
echo "🚀 Deploying to Cloud Functions..."
gcloud builds submit --config=open_ended_scoring_agent_cloudbuild.yaml .

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo ""
    echo "📋 Deployment Summary:"
    echo "  • Function: open-ended-scoring-agent"
    echo "  • URL: https://us-central1-$PROJECT_ID.cloudfunctions.net/open-ended-scoring-agent"
    echo "  • Health Check: https://us-central1-$PROJECT_ID.cloudfunctions.net/open-ended-scoring-agent-health"
    echo ""
    echo "🔧 Next Steps:"
    echo "  1. Add to your .env.local:"
    echo "     OPEN_ENDED_SCORING_AGENT_URL=https://us-central1-$PROJECT_ID.cloudfunctions.net/open-ended-scoring-agent"
    echo ""
    echo "  2. Test the deployment:"
    echo "     curl -X POST https://us-central1-$PROJECT_ID.cloudfunctions.net/open-ended-scoring-agent \\"
    echo "       -H 'Content-Type: application/json' \\"
    echo "       -d '{\"question_id\":\"q3\",\"response\":\"I started my journey...\",\"question_text\":\"Tell me about your journey\"}'"
    echo ""
    echo "  3. Check health:"
    echo "     curl https://us-central1-$PROJECT_ID.cloudfunctions.net/open-ended-scoring-agent-health"
else
    echo "❌ Deployment failed"
    exit 1
fi
