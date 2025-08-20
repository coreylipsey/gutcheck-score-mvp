#!/bin/bash

# Enhanced ADK Agent System Deployment Script
# Deploys the multi-agent architecture with safety and coordination features

set -e  # Exit on any error

echo "🚀 Deploying Enhanced Gutcheck ADK Agent System"
echo "================================================"

# Configuration
PROJECT_ID="gutcheck-score-mvp"
SERVICE_NAME="gutcheck-adk-agent-enhanced"
REGION="us-central1"
MEMORY="2Gi"
CPU="2"
MAX_INSTANCES="10"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "server.py" ]; then
    print_error "Please run this script from the agents directory"
    exit 1
fi

# Check if gcloud is installed and authenticated
print_status "Checking gcloud configuration..."
if ! command -v gcloud &> /dev/null; then
    print_error "gcloud CLI is not installed. Please install it first."
    exit 1
fi

# Check if authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    print_error "Not authenticated with gcloud. Please run 'gcloud auth login' first."
    exit 1
fi

# Check if project is set
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
if [ "$CURRENT_PROJECT" != "$PROJECT_ID" ]; then
    print_warning "Setting project to $PROJECT_ID"
    gcloud config set project $PROJECT_ID
fi

# Check if required APIs are enabled
print_status "Checking required APIs..."
APIS=("run.googleapis.com" "cloudbuild.googleapis.com" "aiplatform.googleapis.com")

for api in "${APIS[@]}"; do
    if ! gcloud services list --enabled --filter="name:$api" --format="value(name)" | grep -q "$api"; then
        print_status "Enabling API: $api"
        gcloud services enable $api
    else
        print_success "API $api is already enabled"
    fi
done

# Install dependencies
print_status "Installing Python dependencies..."
if [ ! -d "venv" ]; then
    print_status "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Test the enhanced system locally
print_status "Testing enhanced system locally..."
if python3 test_enhanced_system.py; then
    print_success "Local tests passed"
else
    print_error "Local tests failed. Please fix issues before deploying."
    exit 1
fi

# Build and deploy to Cloud Run
print_status "Building and deploying to Cloud Run..."

# Set environment variables
ENV_VARS="GEMINI_API_KEY=AIzaSyAUq0hEPlGnfkj6MJC-7et_gNim-YTyTzg,USE_ENHANCED_SYSTEM=true"

# Deploy the enhanced service
gcloud run deploy $SERVICE_NAME \
    --source . \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --port 8000 \
    --memory $MEMORY \
    --cpu $CPU \
    --max-instances $MAX_INSTANCES \
    --set-env-vars $ENV_VARS \
    --timeout 300 \
    --concurrency 80

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")

print_success "Enhanced ADK Agent deployed successfully!"
echo ""
echo "📊 Deployment Summary:"
echo "   Service Name: $SERVICE_NAME"
echo "   URL: $SERVICE_URL"
echo "   Region: $REGION"
echo "   Memory: $MEMORY"
echo "   CPU: $CPU"
echo "   Max Instances: $MAX_INSTANCES"
echo ""

# Test the deployed service
print_status "Testing deployed service..."
curl -s "$SERVICE_URL/" > /dev/null
if [ $? -eq 0 ]; then
    print_success "Deployed service is responding"
else
    print_error "Deployed service is not responding"
    exit 1
fi

# Update the main application configuration
print_status "Updating main application configuration..."
echo ""
echo "🔧 Next Steps:"
echo "1. Update your Next.js environment variables:"
echo "   NEXT_PUBLIC_ADK_SERVER_URL=$SERVICE_URL"
echo "   USE_ADK=true"
echo ""
echo "2. Deploy the main application with the new configuration"
echo ""
echo "3. Monitor the enhanced system:"
echo "   - Check logs: gcloud logs tail --service=$SERVICE_NAME"
echo "   - Monitor safety queue: curl $SERVICE_URL/safety/oversight-queue"
echo "   - Test coordination: curl $SERVICE_URL/coordinated-request"
echo ""

print_success "Enhanced ADK Agent System deployment complete!"
print_success "The system now includes:"
echo "   ✅ Coordinator Agent for routing"
echo "   ✅ Content filtering and safety"
echo "   ✅ Human oversight system"
echo "   ✅ Multi-agent architecture"
echo "   ✅ A/B testing capability"
echo "   ✅ Legacy compatibility"
