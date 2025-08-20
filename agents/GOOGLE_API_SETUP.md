# Google API Credentials Setup Guide

## 🔑 **Setting Up Google API Credentials for ADK**

This guide will help you configure Google API credentials to enable real ADK LLM calls in the Gutcheck.AI assessment system.

## **Option 1: Google AI API Key (Recommended for Development)**

### Step 1: Get a Google AI API Key
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click on "Get API key" in the top right
4. Create a new API key or use an existing one
5. Copy the API key

### Step 2: Configure the API Key
Edit the `.env` file in the `agents` directory:

```bash
# Replace 'your-gemini-api-key-here' with your actual API key
GOOGLE_API_KEY=your-actual-api-key-here
```

### Step 3: Test the Configuration
```bash
# Set the environment variable
export GOOGLE_API_KEY="your-actual-api-key-here"

# Test the ADK system
python3 test_complete_adk_system.py
```

## **Option 2: Google Cloud Service Account (Recommended for Production)**

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Gemini API
   - Vertex AI API
   - Google AI API

### Step 2: Create a Service Account
1. In Google Cloud Console, go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Give it a name (e.g., "gutcheck-adk-agent")
4. Grant the following roles:
   - Vertex AI User
   - AI Platform Developer
   - Service Account User

### Step 3: Download the Service Account Key
1. Click on the created service account
2. Go to "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose JSON format
5. Download the JSON file
6. Place it in a secure location (e.g., `agents/credentials/service-account.json`)

### Step 4: Configure Environment Variables
Edit the `.env` file:

```bash
# Google Cloud Service Account
GOOGLE_APPLICATION_CREDENTIALS=./credentials/service-account.json
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1

# Comment out the API key if using service account
# GOOGLE_API_KEY=your-gemini-api-key-here
```

## **Option 3: Environment Variables (System-wide)**

You can also set the credentials as system environment variables:

### For Google AI API Key:
```bash
export GOOGLE_API_KEY="your-actual-api-key-here"
```

### For Google Cloud Service Account:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
export GOOGLE_CLOUD_PROJECT="your-project-id"
export GOOGLE_CLOUD_LOCATION="us-central1"
```

## **Testing the Configuration**

### Step 1: Restart the Server
```bash
# Kill existing server
lsof -ti:8000 | xargs kill -9

# Start server with new credentials
python3 server.py
```

### Step 2: Run the Test Suite
```bash
python3 test_complete_adk_system.py
```

### Step 3: Test Individual Components
```bash
# Test health check
curl http://localhost:8000/

# Test coordinated request
curl -X POST "http://localhost:8000/coordinated-request" \
  -H "Content-Type: application/json" \
  -d '{"task_type": "assessment_feedback", "task_data": {"responses": [{"questionId": "q1", "response": "test"}], "scores": {"personalBackground": 8}, "industry": "Technology"}}'
```

## **Troubleshooting**

### Common Issues:

1. **"Missing key inputs argument"**
   - Ensure your API key is valid and properly set
   - Check that the environment variable is loaded

2. **"Permission denied"**
   - For service accounts, ensure the JSON file has correct permissions
   - Verify the service account has the required roles

3. **"API not enabled"**
   - Enable the Gemini API in Google Cloud Console
   - Enable the Vertex AI API if using service accounts

4. **"Quota exceeded"**
   - Check your API usage in Google Cloud Console
   - Consider upgrading your quota limits

### Debug Commands:
```bash
# Check environment variables
echo "GOOGLE_API_KEY: ${GOOGLE_API_KEY:-'Not set'}"
echo "GOOGLE_APPLICATION_CREDENTIALS: ${GOOGLE_APPLICATION_CREDENTIALS:-'Not set'}"

# Test basic ADK functionality
python3 test_adk_basic.py
```

## **Security Best Practices**

1. **Never commit credentials to version control**
   - Add `.env` and `credentials/` to `.gitignore`
   - Use environment variables in production

2. **Use service accounts for production**
   - More secure than API keys
   - Better for server deployments

3. **Rotate credentials regularly**
   - Update API keys periodically
   - Monitor usage and costs

4. **Limit permissions**
   - Only grant necessary roles to service accounts
   - Use least privilege principle

## **Production Deployment**

For production deployment, use environment variables or secure secret management:

```bash
# Production environment variables
export GOOGLE_APPLICATION_CREDENTIALS="/secure/path/to/service-account.json"
export GOOGLE_CLOUD_PROJECT="gutcheck-production"
export GOOGLE_CLOUD_LOCATION="us-central1"
```

## **Next Steps**

Once credentials are configured:

1. ✅ **Test the system**: Run `python3 test_complete_adk_system.py`
2. ✅ **Verify real LLM calls**: Check that tools return real responses instead of mock data
3. ✅ **Monitor performance**: Watch response times and API usage
4. ✅ **Deploy to production**: Use service account credentials for production deployment

## **Support**

If you encounter issues:
1. Check the troubleshooting section above
2. Verify your Google Cloud project settings
3. Ensure all required APIs are enabled
4. Check your API quota and billing status
