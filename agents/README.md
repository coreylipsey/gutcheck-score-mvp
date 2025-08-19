# Gutcheck ADK Agent Integration

This directory contains the Google ADK (Agent Development Kit) integration for the Gutcheck assessment system. The ADK agent provides enhanced AI capabilities for generating comprehensive entrepreneurial assessment feedback.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Google ADK package (`google-adk>=1.11.0`)
- Gemini API key

### Installation
```bash
# Install dependencies
pip3 install -r requirements.txt

# Set up environment (copy env.example to .env and configure)
cp env.example .env
```

### Starting the ADK Server
```bash
# Option 1: Use the startup script
./start_adk_server.sh

# Option 2: Start manually
python3 server.py
```

The server will start on `http://localhost:8000` by default.

## 🏗️ Architecture

### Core Components

1. **ADK Agent** (`core_assessment_agent/agent.py`)
   - Main agent configuration using Google ADK
   - Uses Gemini 2.0 Flash model
   - Integrates with assessment tools

2. **Assessment Tools** (`core_assessment_agent/tools/`)
   - `competitive_advantage.py` - Analyzes strengths
   - `growth_opportunity.py` - Identifies improvement areas
   - `comprehensive_analysis.py` - Sports scouting report style analysis
   - `next_steps.py` - Actionable recommendations with real URLs
   - `question_scoring.py` - Scores open-ended questions

3. **Toolset** (`core_assessment_agent/toolset.py`)
   - Organizes all assessment tools using ADK patterns
   - Provides clean interface for tool management

4. **API Server** (`server.py`)
   - FastAPI server exposing ADK agent functionality
   - RESTful endpoints for integration with main application
   - CORS enabled for cross-origin requests

## 🔌 API Endpoints

### Health Check
```http
GET /
```
Returns server status and agent information.

### Agent Information
```http
GET /agent-info
```
Returns detailed information about the ADK agent configuration.

### Generate Feedback
```http
POST /generate-feedback
Content-Type: application/json

{
  "responses": [...],
  "scores": {...},
  "industry": "Technology",
  "location": "San Francisco"
}
```
Generates comprehensive AI feedback including:
- Competitive advantages
- Growth opportunities  
- Comprehensive analysis
- Actionable next steps

### Score Question
```http
POST /score-question
Content-Type: application/json

{
  "questionId": "q3",
  "response": "User response text...",
  "questionText": "Question text..."
}
```
Scores individual open-ended questions.

## 🔧 Integration with Main Application

### Environment Configuration
Add to your Next.js environment:
```env
NEXT_PUBLIC_ADK_SERVER_URL=http://localhost:8000
```

### Service Integration
The main application uses `ADKAssessmentService` which:
- Connects to the ADK server
- Provides fallback mechanisms
- Handles error cases gracefully
- Maintains compatibility with existing interfaces

### Dependency Injection
The DI container is configured to use the ADK service:
```typescript
container.register('IAIScoringService', () => 
  new ADKAssessmentService()
);
```

## 🧪 Testing

### Run Integration Tests
```bash
python3 test_adk_integration.py
```

Tests include:
- Health check
- Agent info retrieval
- Feedback generation
- Question scoring

### Manual Testing
```bash
# Test health endpoint
curl http://localhost:8000/

# Test agent info
curl http://localhost:8000/agent-info

# Test feedback generation
curl -X POST http://localhost:8000/generate-feedback \
  -H "Content-Type: application/json" \
  -d @test_data.json
```

## 🔄 Deployment

### Local Development
1. Start the ADK server: `python3 server.py`
2. Configure main app to use `http://localhost:8000`
3. Run integration tests to verify functionality

### Production Deployment
1. Deploy ADK server to cloud platform (GCP, AWS, etc.)
2. Update `NEXT_PUBLIC_ADK_SERVER_URL` to production URL
3. Ensure proper CORS configuration
4. Set up monitoring and logging

## 🛠️ Development

### Adding New Tools
1. Create new tool file in `core_assessment_agent/tools/`
2. Add function to `AssessmentToolset`
3. Update agent instructions
4. Add tests

### Modifying Prompts
Edit the prompt templates in individual tool files to customize AI behavior.

### Debugging
- Check server logs for errors
- Use the test script to verify functionality
- Monitor API responses for expected format

## 📊 Performance

### Current Capabilities
- ✅ Health check and monitoring
- ✅ Comprehensive feedback generation
- ✅ Question scoring
- ✅ Error handling and fallbacks
- ✅ Integration with main application

### Optimization Opportunities
- Caching frequently used responses
- Batch processing for multiple assessments
- Async processing for long-running operations
- Rate limiting and request queuing

## 🔒 Security

### API Security
- CORS configuration for allowed origins
- Input validation and sanitization
- Error message sanitization
- Rate limiting (recommended for production)

### Environment Variables
- Store sensitive keys in environment variables
- Use `.env` file for local development
- Never commit API keys to version control

## 📝 Troubleshooting

### Common Issues

1. **Import Errors**
   ```bash
   pip3 install -r requirements.txt
   ```

2. **Port Already in Use**
   ```bash
   lsof -ti:8000 | xargs kill -9
   ```

3. **ADK Agent Not Loading**
   ```bash
   python3 -c "from core_assessment_agent.agent import core_assessment_agent; print('Agent loaded')"
   ```

4. **API Connection Issues**
   - Check if server is running: `curl http://localhost:8000/`
   - Verify CORS configuration
   - Check network connectivity

### Logs and Debugging
- Server logs appear in terminal when running `python3 server.py`
- Use `test_adk_integration.py` for comprehensive testing
- Check browser network tab for API call details

## 🤝 Contributing

1. Follow existing code patterns
2. Add tests for new functionality
3. Update documentation
4. Test integration thoroughly

## 📄 License

This ADK integration is part of the Gutcheck.AI assessment system.
