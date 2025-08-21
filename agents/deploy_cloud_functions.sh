#!/bin/bash

# Gutcheck.AI Assessment Agent - Cloud Functions Deployment Script

set -e  # Exit on any error

echo "🚀 Deploying Gutcheck.AI Assessment Agent to Google Cloud Functions..."

# Check if we're in the right directory
if [ ! -f "cloudbuild.yaml" ]; then
    echo "❌ Error: cloudbuild.yaml not found. Please run this script from the agents directory."
    exit 1
fi

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI not found. Please install Google Cloud SDK first."
    echo "Visit: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Error: Not authenticated with gcloud. Please run: gcloud auth login"
    exit 1
fi

# Get current project
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo "❌ Error: No Google Cloud project set. Please run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "📋 Current project: $PROJECT_ID"

# Check if required APIs are enabled
echo "🔧 Checking required APIs..."
APIS=("cloudfunctions.googleapis.com" "cloudbuild.googleapis.com" "run.googleapis.com")

for api in "${APIS[@]}"; do
    if ! gcloud services list --enabled --filter="name:$api" --format="value(name)" | grep -q "$api"; then
        echo "📡 Enabling $api..."
        gcloud services enable "$api"
    else
        echo "✅ $api is already enabled"
    fi
done

# Check if .env file exists and has API key
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found. Please create it with your GOOGLE_API_KEY"
    exit 1
fi

if ! grep -q "GOOGLE_API_KEY=" .env; then
    echo "❌ Error: GOOGLE_API_KEY not found in .env file"
    exit 1
fi

echo "✅ Environment configuration looks good"

# Run deployment tests
echo "🧪 Running deployment tests..."
if ! python3 test_deployment.py; then
    echo "❌ Deployment tests failed. Please fix issues before deploying."
    exit 1
fi

echo "✅ All tests passed!"

# Deploy using Cloud Build
echo "🏗️  Starting Cloud Build deployment..."
echo "This may take 5-10 minutes..."

# Submit build to Cloud Build
gcloud builds submit --config cloudbuild.yaml .

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo ""
    echo "📋 Deployment Summary:"
    echo "  Project: $PROJECT_ID"
    echo "  Function: assessment-agent"
    echo "  Region: us-central1"
    echo "  Runtime: Python 3.11"
    echo ""
    echo "🔗 Your function URL:"
    echo "  https://us-central1-$PROJECT_ID.cloudfunctions.net/assessment-agent"
    echo ""
    echo "📝 To test the deployed function:"
    echo "  curl -X POST https://us-central1-$PROJECT_ID.cloudfunctions.net/assessment-agent \\"
    echo "    -H 'Content-Type: application/json' \\"
    echo "    -d @test_agent_with_scores.json"
    echo ""
    echo "📊 To view logs:"
    echo "  gcloud functions logs read assessment-agent --region=us-central1"
    echo ""
    echo "🔄 To update the function:"
    echo "  Run this script again"
else
    echo "❌ Deployment failed. Check the logs above for details."
    exit 1
fi
