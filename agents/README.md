# Gutcheck ADK Core Assessment Agent

This directory contains the Google ADK implementation of the Core Assessment Agent for Gutcheck's entrepreneurial assessment system.

## Architecture

The ADK agent follows the **Agentic RAG** pattern with:

- **Core Assessment Agent**: Main orchestrator agent
- **Specialized Tools**: Individual analysis functions
- **Web Search Integration**: Real URL validation for next steps
- **Clean Architecture Integration**: Seamless integration with existing codebase

## Directory Structure

```
agents/
├── core_assessment_agent/
│   ├── __init__.py
│   ├── agent.py              # Main Core Assessment Agent
│   └── tools/
│       ├── __init__.py
│       ├── competitive_advantage.py
│       ├── growth_opportunity.py
│       ├── comprehensive_analysis.py
│       └── next_steps.py
├── server.py                 # FastAPI server for deployment
├── requirements.txt          # Python dependencies
└── README.md                # This file
```

## Installation

1. **Install ADK**:
   ```bash
   pip install google-adk
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment**:
   ```bash
   export GOOGLE_API_KEY="your-gemini-api-key"
   export ADK_AGENT_URL="http://localhost:8000"
   ```

## Development

### Running the Agent Locally

1. **Start the ADK dev UI**:
   ```bash
   adk dev
   ```

2. **Run the FastAPI server**:
   ```bash
   python server.py
   ```

3. **Test the agent**:
   ```bash
   curl -X POST http://localhost:8000/generate-feedback \
     -H "Content-Type: application/json" \
     -d @test_data.json
   ```

### Testing with ADK Dev UI

The ADK dev UI provides a browser-based interface for testing and debugging agents:

1. Open `http://localhost:8000` in your browser
2. Select the `gutcheck_assessment_agent`
3. Test with sample assessment data
4. Monitor the agent's workflow and tool usage

## Integration with Clean Architecture

The ADK agent integrates seamlessly with the existing Clean Architecture:

1. **Domain Layer**: Uses existing DTOs and interfaces
2. **Application Layer**: Implements `IAIScoringService`
3. **Infrastructure Layer**: `ADKAssessmentService` handles integration
4. **Presentation Layer**: No changes required

## Key Features

### 1. Real URL Validation
The `next_steps` tool uses ADK's `google_search` to find real, verified resources:

```python
# Uses ADK's built-in web search
search_results = await google_search("SCORE business mentors", num_results=5)

# Validates URLs before returning
for result in search_results:
    if await validate_url(result["url"]):
        return result
```

### 2. Preserved Prompt Logic
All existing prompts are preserved and converted to Python:

```python
# Your existing comprehensive analysis prompt
prompt = f"""You are a seasoned entrepreneurial scout...
ASSESSMENT DATA:
{format_responses(responses)}
...
"""
```

### 3. Graceful Fallback
If ADK fails, the system falls back to existing Firebase functions:

```typescript
try {
  // Try ADK agent first
  const adkResponse = await fetch(`${this.adkAgentUrl}/generate-feedback`, ...);
  return adkData;
} catch (error) {
  // Fallback to existing service
  return this.fallbackToExistingService(...);
}
```

## Deployment

### Local Development
```bash
python server.py
```

### Production Deployment
1. **Deploy to Cloud Run**:
   ```bash
   gcloud run deploy gutcheck-adk-agent \
     --source . \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

2. **Update environment variable**:
   ```bash
   export ADK_AGENT_URL="https://gutcheck-adk-agent-xxx-uc.a.run.app"
   ```

## Monitoring and Debugging

### ADK Dev UI
- Real-time agent workflow visualization
- Tool execution monitoring
- Response analysis

### Logging
```python
# Agent logs all tool executions
console.log('ADK agent executed:', {
  tool: 'analyze_competitive_advantage',
  input: assessment_data,
  output: result
});
```

## Benefits Over Current System

1. **Reliability**: Agentic RAG ensures all sections are generated
2. **Real URLs**: Web search integration prevents fake URLs
3. **Better Debugging**: ADK dev UI shows exactly what's happening
4. **Scalability**: Easy to add new analysis tools
5. **Maintainability**: Code-first approach with version control

## Next Steps

1. **Install ADK** and set up the development environment
2. **Test locally** using the ADK dev UI
3. **Deploy to staging** and test with real assessment data
4. **Gradually migrate** from Firebase functions to ADK
5. **Monitor performance** and reliability improvements
