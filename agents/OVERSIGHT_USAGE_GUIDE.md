# 🚨 How to Use the Human Oversight System

## 🎯 **Quick Answer: How You Get Notified**

**Current System:** No automatic email alerts yet - you need to manually check the queue.

**But I've created tools to make it easy!**

## 📊 **Option 1: Web Dashboard (Recommended)**

### **Start the Dashboard:**
```bash
cd /Users/coreylipsey/gutcheck-score-mvp/agents
python3 oversight_dashboard.py
```

### **Access the Dashboard:**
Open your browser to: **http://localhost:5001**

### **What You'll See:**
- Real-time queue status
- Pending reviews with priority levels
- Click-to-review interface
- Auto-refresh every 30 seconds

## 🔍 **Option 2: Monitor Script**

### **Start Monitoring:**
```bash
cd /Users/coreylipsey/gutcheck-score-mvp/agents
python3 monitor_oversight_queue.py
```

### **What Happens:**
- Checks queue every 60 seconds
- Shows console alerts when new items appear
- Runs in background

## 📱 **Option 3: Manual API Calls**

### **Check Queue:**
```bash
curl http://localhost:8000/safety/oversight-queue
```

### **Mark Item as Reviewed:**
```bash
curl -X POST "http://localhost:8000/safety/mark-reviewed" \
  -H "Content-Type: application/json" \
  -d '{
    "review_id": "review_20241219_143022_abc123",
    "review_decision": "approved",
    "reviewer_notes": "Safe to proceed"
  }'
```

## 🚨 **When Items Get Flagged**

The system automatically flags requests for review when it detects:

### **🔴 CRITICAL (Immediate Review)**
- Suicide-related content: "suicide", "kill myself", "end my life"
- Emergency situations: "emergency", "crisis", "urgent help"
- Illegal activities: "illegal", "criminal", "fraud", "scam"

### **🟠 HIGH (Review Required)**
- Mental health concerns: "i'm struggling mentally", "i feel hopeless"
- Business-critical advice: legal advice, financial advice, investment advice

### **🟡 MEDIUM (May Need Review)**
- Overwhelming situations: "i'm overwhelmed", "i don't know what to do"
- Professional help requests: "i need professional help"

## 📋 **Current Status**

**Queue Status:** Currently empty (0 pending reviews)
**System Status:** Active and monitoring all requests
**Server:** Running on http://localhost:8000

## 🎯 **Recommended Workflow**

### **For Daily Monitoring:**
1. **Start the dashboard:** `python3 oversight_dashboard.py`
2. **Open browser:** http://localhost:5001
3. **Check periodically** throughout the day
4. **Review flagged items** as they appear

### **For Critical Situations:**
1. **Use monitor script:** `python3 monitor_oversight_queue.py`
2. **Watch for console alerts**
3. **Respond immediately** to critical items

## 🔧 **Troubleshooting**

### **Dashboard Not Loading:**
```bash
# Check if Flask is installed
pip3 install flask

# Check if port is available
lsof -i :5001

# Try different port
# Edit oversight_dashboard.py and change port=5001 to port=5002
```

### **Server Not Responding:**
```bash
# Check if ADK server is running
curl http://localhost:8000/

# Restart server if needed
python3 server.py
```

## 📈 **Future Enhancements**

**Planned Features:**
- ✅ Email notifications
- ✅ Push notifications
- ✅ Mobile app
- ✅ Slack/Teams integration
- ✅ Automated escalation

## 🎉 **Summary**

**Right now:** Use the web dashboard at http://localhost:5001

**When flagged:** You'll see items in the dashboard with priority levels

**To review:** Click approve/reject/modify buttons in the dashboard

**The system is working** - it's just waiting for requests that need human review!
