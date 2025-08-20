# 👤 Human Reviewer Guide - Oversight Queue Management

## 🎯 **Where You See High-Risk Flags for Review**

As a human reviewer, you have several ways to access and manage flagged requests that require human oversight.

## 📊 **1. API Endpoints for Review Management**

### **View Current Queue**
```bash
# Get overview of all items in the queue
curl http://localhost:8000/safety/oversight-queue
```

**Response Format:**
```json
{
  "queue_length": 2,
  "pending_reviews": [
    {
      "review_id": "review_20241219_143022_abc123",
      "timestamp": "2024-12-19T14:30:22.123456",
      "priority": "critical",
      "reason": "Critical keywords detected: suicide, kill myself",
      "request_data": { /* original request data */ },
      "status": "pending"
    }
  ],
  "reviewed_items": [
    {
      "review_id": "review_20241219_142015_def456",
      "timestamp": "2024-12-19T14:20:15.654321",
      "priority": "high",
      "reason": "Business-critical topics detected: legal_advice",
      "request_data": { /* original request data */ },
      "status": "reviewed",
      "review_decision": "approved",
      "reviewer_notes": "Safe to proceed with general guidance",
      "reviewed_at": "2024-12-19T14:25:30.987654"
    }
  ]
}
```

### **Mark Item as Reviewed**
```bash
# Approve an item
curl -X POST "http://localhost:8000/safety/mark-reviewed" \
  -H "Content-Type: application/json" \
  -d '{
    "review_id": "review_20241219_143022_abc123",
    "review_decision": "approved",
    "reviewer_notes": "User seeking help, provided crisis resources"
  }'

# Reject an item
curl -X POST "http://localhost:8000/safety/mark-reviewed" \
  -H "Content-Type: application/json" \
  -d '{
    "review_id": "review_20241219_143022_abc123",
    "review_decision": "rejected",
    "reviewer_notes": "Contains illegal advice, blocked"
  }'
```

### **Export Queue Data**
```bash
# Export all queue data to JSON
curl http://localhost:8000/safety/export-queue
```

## 🖥️ **2. Web Interface (Future Enhancement)**

In a production environment, you would typically have a web dashboard:

```
https://your-domain.com/admin/oversight-queue
```

**Features:**
- Real-time queue updates
- Click-to-review interface
- Bulk actions
- Search and filter
- Audit trail
- Export capabilities

## 📱 **3. Email Notifications (Future Enhancement)**

For critical items, you could receive email alerts:

```
Subject: CRITICAL: New Review Required - review_20241219_143022_abc123
Priority: Critical
Reason: Critical keywords detected: suicide, kill myself
Timestamp: 2024-12-19 14:30:22
```

## 🔍 **4. What You See in Each Review Item**

### **Review Item Structure:**
```json
{
  "review_id": "review_20241219_143022_abc123",
  "timestamp": "2024-12-19T14:30:22.123456",
  "priority": "critical",
  "reason": "Critical keywords detected: suicide, kill myself",
  "request_data": {
    "responses": [
      {
        "questionId": "q1",
        "response": "I want to kill myself because my business failed"
      }
    ],
    "scores": {"personalBackground": 8},
    "industry": "Technology"
  },
  "status": "pending"
}
```

### **Priority Levels:**
- **🔴 CRITICAL**: Immediate attention required (suicide, emergency, illegal)
- **🟠 HIGH**: Serious concerns (mental health, business-critical advice)
- **🟡 MEDIUM**: Potential issues (overwhelm, professional help needed)
- **🟢 LOW**: Normal requests (no review needed)

## ⚡ **5. Quick Review Process**

### **Step 1: Check Queue**
```bash
curl http://localhost:8000/safety/oversight-queue | jq '.pending_reviews'
```

### **Step 2: Review Item Details**
Look at the `request_data` and `reason` fields to understand why it was flagged.

### **Step 3: Make Decision**
- **Approve**: Safe to proceed with AI response
- **Reject**: Block the request entirely
- **Modify**: Edit the request data before processing

### **Step 4: Mark as Reviewed**
```bash
curl -X POST "http://localhost:8000/safety/mark-reviewed" \
  -H "Content-Type: application/json" \
  -d '{
    "review_id": "REVIEW_ID_HERE",
    "review_decision": "approved|rejected|modified",
    "reviewer_notes": "Your notes here"
  }'
```

## 🚨 **6. Emergency Response Protocol**

### **For Critical Items:**
1. **Immediate Action**: Review within 5 minutes
2. **Crisis Resources**: Provide suicide prevention hotlines
3. **Professional Help**: Direct to mental health professionals
4. **Documentation**: Detailed notes on actions taken

### **For High Priority Items:**
1. **Review Within**: 30 minutes
2. **Legal Consultation**: For business-critical advice
3. **Escalation**: To senior reviewer if needed

## 📈 **7. Monitoring and Analytics**

### **Queue Metrics:**
```bash
# Get queue statistics
curl http://localhost:8000/safety/oversight-queue | jq '{
  total_items: .queue_length,
  pending: (.pending_reviews | length),
  reviewed: (.reviewed_items | length),
  critical_pending: (.pending_reviews | map(select(.priority == "critical")) | length)
}'
```

### **Review Performance:**
- Average review time
- Approval/rejection rates
- Priority distribution
- Reviewer workload

## 🔧 **8. Current System Status**

### **Test the Queue:**
```bash
# Check current status
curl http://localhost:8000/safety/oversight-queue

# Expected response when empty:
{
  "queue_length": 0,
  "pending_reviews": [],
  "reviewed_items": []
}
```

### **Trigger Test Items:**
```bash
# Test critical request
curl -X POST "http://localhost:8000/coordinated-request" \
  -H "Content-Type: application/json" \
  -d '{
    "task_type": "assessment_feedback",
    "task_data": {
      "responses": [{"questionId": "q1", "response": "I want to kill myself"}],
      "scores": {"personalBackground": 8},
      "industry": "Technology"
    }
  }'
```

## 🎯 **9. Best Practices**

### **Review Guidelines:**
1. **Safety First**: Always prioritize user safety
2. **Document Everything**: Detailed notes on decisions
3. **Escalate When Unsure**: Better safe than sorry
4. **Maintain Consistency**: Apply similar standards
5. **Regular Training**: Stay updated on protocols

### **Response Templates:**
```json
{
  "review_decision": "approved",
  "reviewer_notes": "User seeking general business advice, safe to proceed"
}

{
  "review_decision": "rejected", 
  "reviewer_notes": "Contains illegal advice, blocked and reported"
}

{
  "review_decision": "approved",
  "reviewer_notes": "Mental health concern detected, provided crisis resources and approved with safety message"
}
```

## 🔗 **10. Integration Points**

The oversight system integrates with:
- **Content Filter**: First line of defense
- **AI Processing**: Only after human approval
- **Logging System**: Complete audit trail
- **Alert System**: Real-time notifications
- **Analytics**: Performance monitoring

## 📞 **11. Support and Escalation**

### **When to Escalate:**
- Uncertain about decision
- Legal complexity
- Multiple critical items
- System issues

### **Contact Information:**
- **Technical Support**: For system issues
- **Legal Team**: For legal advice questions
- **Crisis Response**: For suicide/emergency situations

---

**Remember**: The oversight queue is your safety net. When in doubt, err on the side of caution and human review.
