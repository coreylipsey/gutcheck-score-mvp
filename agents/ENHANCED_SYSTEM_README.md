# Enhanced Gutcheck ADK Agent System

This document describes the enhanced ADK agent system that implements the strategic multi-agent architecture with safety and coordination features.

## 🚀 Overview

The enhanced system transforms the single ADK agent into a sophisticated multi-agent architecture with:

- **Coordinator Agent**: Router/Dispatcher for all requests
- **Content Filtering**: Safety layer for responsible AI
- **Human Oversight**: Flagging high-stakes queries for review
- **A/B Testing**: Gradual migration capability
- **Legacy Compatibility**: Backward compatibility with existing systems

## 🏗️ Architecture

### Multi-Agent System

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js App   │───▶│  Coordinator     │───▶│  Specialist     │
│                 │    │  Agent           │    │  Agents         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │  Safety Layer    │
                       │  • Content Filter│
                       │  • Human Oversight│
                       └──────────────────┘
```

### Agent Roles

1. **Coordinator Agent** (`coordinator_agent.py`)
   - Routes requests to appropriate specialist agents
   - Validates input and handles errors
   - Maintains audit trail

2. **Core Assessment Agent** (`agent.py`)
   - Generates comprehensive assessment feedback
   - Uses specialized tools for analysis
   - Provides competitive advantages and growth opportunities

3. **Safety Systems**
   - **Content Filter**: Blocks prohibited content and flags risks
   - **Human Oversight**: Queues high-stakes queries for review

## 🔧 Installation & Setup

### Prerequisites
- Python 3.8+
- Google Cloud CLI
- Gemini API key

### Quick Start

```bash
# Navigate to agents directory
cd agents

# Install dependencies
pip install -r requirements.txt

# Start the enhanced server
python3 server.py
```

### Environment Variables

```bash
# Required
GEMINI_API_KEY=your-gemini-api-key

# Optional
USE_ENHANCED_SYSTEM=true
PORT=8000
```

## 🔌 API Endpoints

### Enhanced Endpoints

#### 1. Coordinated Request (Primary)
```http
POST /coordinated-request
Content-Type: application/json

{
  "task_type": "assessment_feedback",
  "task_data": {
    "responses": [...],
    "scores": {...},
    "industry": "Technology",
    "location": "San Francisco"
  }
}
```

**Response:**
```json
{
  "coordinator_status": "success",
  "delegated_agent": "scoring_agent",
  "task_type": "assessment_feedback",
  "result": {
    "competitiveAdvantage": {...},
    "growthOpportunity": {...},
    "comprehensiveAnalysis": "...",
    "nextSteps": "..."
  },
  "safety_info": {
    "content_filter": {
      "risk_level": "low",
      "flagged_issues": []
    },
    "human_oversight": {
      "priority": "low",
      "requires_review": false,
      "escalation_reason": "No specific concerns detected"
    }
  }
}
```

#### 2. Safety Monitoring
```http
GET /safety/oversight-queue
GET /safety/export-queue
POST /safety/mark-reviewed
```

#### 3. Agent Information
```http
GET /agent-info
```

### Legacy Endpoints (Backward Compatible)

#### Generate Feedback
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

## 🛡️ Safety Features

### Content Filtering

The system automatically filters requests for:

- **Prohibited Topics**: Financial advice, legal advice, medical advice
- **High-Risk Keywords**: Suicide, self-harm, crisis, emergency
- **Medium-Risk Patterns**: Investment advice, legal consultation

**Risk Levels:**
- `low`: Safe to proceed
- `medium`: Proceed with caution
- `high`: Add warnings, may require review
- `critical`: Block request entirely

### Human Oversight

Automatically flags requests for human review when:

- Critical keywords detected
- High-priority patterns found
- Business-critical topics identified

**Priority Levels:**
- `low`: No review needed
- `medium`: Optional review
- `high`: Review recommended
- `critical`: Immediate review required

## 🔄 A/B Testing

The system supports gradual migration with environment flags:

```typescript
// In your Next.js app
const useADK = process.env.USE_ADK !== 'false'; // Defaults to true

if (useADK) {
  // Use enhanced coordinated request
  return await fetch('/coordinated-request', {...});
} else {
  // Use legacy system
  return await fetch('/generate-feedback', {...});
}
```

## 🧪 Testing

### Run Enhanced System Tests

```bash
# Test all features
python3 test_enhanced_system.py

# Test specific components
python3 -c "from safety.content_filter import content_filter; print('Content filter working')"
python3 -c "from safety.human_oversight import human_oversight; print('Human oversight working')"
```

### Test Scenarios

1. **Normal Request**: Should process normally with low risk
2. **High Risk Request**: Should flag for review but proceed
3. **Critical Request**: Should be blocked entirely
4. **Legacy Compatibility**: Should work with old endpoints

## 🚀 Deployment

### Local Development

```bash
# Start enhanced server
python3 server.py

# Test locally
python3 test_enhanced_system.py
```

### Production Deployment

```bash
# Deploy to Google Cloud Run
./deploy_enhanced_system.sh

# Or manually
gcloud run deploy gutcheck-adk-agent-enhanced \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8000 \
  --memory 2Gi \
  --cpu 2
```

### Environment Configuration

Update your Next.js environment:

```env
NEXT_PUBLIC_ADK_SERVER_URL=https://your-enhanced-service-url
USE_ADK=true
```

## 📊 Monitoring

### Health Checks

```bash
# Check service health
curl https://your-service-url/

# Get agent information
curl https://your-service-url/agent-info

# Check safety queue
curl https://your-service-url/safety/oversight-queue
```

### Logs

```bash
# View Cloud Run logs
gcloud logs tail --service=gutcheck-adk-agent-enhanced

# Filter for safety events
gcloud logs tail --service=gutcheck-adk-agent-enhanced --filter="textPayload:content_filter"
```

## 🔧 Configuration

### Content Filter Settings

Edit `safety/content_filter.py` to customize:

- Prohibited topics
- Risk keywords
- Escalation messages

### Human Oversight Settings

Edit `safety/human_oversight.py` to customize:

- Critical keywords
- Priority patterns
- Review thresholds

### Coordinator Agent

Edit `core_assessment_agent/coordinator_agent.py` to:

- Add new task types
- Modify delegation logic
- Update agent instructions

## 🚨 Troubleshooting

### Common Issues

1. **Import Errors**
   ```bash
   pip install -r requirements.txt
   ```

2. **Safety System Not Working**
   ```bash
   # Check if safety modules are imported
   python3 -c "from safety import content_filter, human_oversight; print('Safety systems loaded')"
   ```

3. **Coordinator Agent Issues**
   ```bash
   # Test coordinator directly
   python3 -c "from core_assessment_agent.coordinator_agent import coordinate_request; print('Coordinator working')"
   ```

4. **Legacy Compatibility Issues**
   - Ensure both `/generate-feedback` and `/coordinated-request` endpoints work
   - Check that response formats match expected structure

### Debug Mode

Enable debug logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 🔮 Future Enhancements

### Planned Features

1. **Memory Agent**: Long-term user context with Vertex AI Memory Bank
2. **Feedback Agent**: Business mentorship persona
3. **Advanced Monitoring**: Real-time performance metrics
4. **Automated Testing**: CI/CD integration with evaluation datasets

### Integration Points

- Vertex AI Memory Bank for long-term context
- Cloud Logging for comprehensive monitoring
- Cloud Build for automated deployment
- Human review dashboard for oversight management

## 📝 Contributing

1. Follow existing code patterns
2. Add tests for new functionality
3. Update documentation
4. Test safety systems thoroughly
5. Ensure backward compatibility

## 📄 License

This enhanced ADK agent system is part of the Gutcheck.AI assessment platform.
