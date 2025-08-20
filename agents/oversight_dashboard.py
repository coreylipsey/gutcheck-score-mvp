#!/usr/bin/env python3
"""
Oversight Queue Dashboard
Simple web dashboard for monitoring and managing the human oversight queue.
"""

from flask import Flask, render_template_string, request, jsonify, redirect, url_for
import requests
import json
from datetime import datetime
import threading
import time

app = Flask(__name__)

# Configuration
SERVER_URL = "http://localhost:8000"
REFRESH_INTERVAL = 30  # seconds

# HTML Template
HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>Human Oversight Queue Dashboard</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: #2c3e50; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .status-bar { background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .queue-section { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .item { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .critical { border-left: 5px solid #e74c3c; background-color: #fdf2f2; }
        .high { border-left: 5px solid #f39c12; background-color: #fef9e7; }
        .medium { border-left: 5px solid #f1c40f; background-color: #fefce8; }
        .low { border-left: 5px solid #27ae60; background-color: #f0f8f0; }
        .priority-badge { padding: 4px 8px; border-radius: 4px; color: white; font-size: 12px; font-weight: bold; }
        .priority-critical { background-color: #e74c3c; }
        .priority-high { background-color: #f39c12; }
        .priority-medium { background-color: #f1c40f; }
        .priority-low { background-color: #27ae60; }
        .action-buttons { margin-top: 10px; }
        .btn { padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
        .btn-approve { background-color: #27ae60; color: white; }
        .btn-reject { background-color: #e74c3c; color: white; }
        .btn-modify { background-color: #3498db; color: white; }
        .refresh-btn { background-color: #9b59b6; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
        .timestamp { color: #666; font-size: 12px; }
        .reason { background-color: #f8f9fa; padding: 10px; border-radius: 4px; margin: 10px 0; }
        .request-data { background-color: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px; white-space: pre-wrap; }
        .empty-state { text-align: center; padding: 40px; color: #666; }
        .loading { text-align: center; padding: 20px; }
        .error { background-color: #fdf2f2; color: #e74c3c; padding: 15px; border-radius: 4px; margin: 10px 0; }
    </style>
    <script>
        function refreshData() {
            location.reload();
        }
        
        function markReviewed(reviewId, decision) {
            const notes = prompt('Enter review notes:');
            if (notes === null) return;
            
            fetch('/mark-reviewed', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    review_id: reviewId,
                    review_decision: decision,
                    reviewer_notes: notes
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Item marked as reviewed successfully!');
                    location.reload();
                } else {
                    alert('Error: ' + data.error);
                }
            })
            .catch(error => {
                alert('Error: ' + error);
            });
        }
        
        // Auto-refresh every 30 seconds
        setInterval(refreshData, 30000);
    </script>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚨 Human Oversight Queue Dashboard</h1>
            <p>Monitor and manage flagged requests that require human review</p>
        </div>
        
        <div class="status-bar">
            <button class="refresh-btn" onclick="refreshData()">🔄 Refresh Now</button>
            <span style="margin-left: 20px;">Last updated: {{ last_updated }}</span>
            <span style="margin-left: 20px;">Auto-refresh: Every 30 seconds</span>
        </div>
        
        {% if error %}
        <div class="error">
            <strong>Error:</strong> {{ error }}
        </div>
        {% endif %}
        
        <div class="queue-section">
            <h2>📊 Queue Status</h2>
            <p><strong>Total Items:</strong> {{ queue_data.queue_length }}</p>
            <p><strong>Pending Reviews:</strong> {{ queue_data.pending_reviews|length }}</p>
            <p><strong>Reviewed Items:</strong> {{ queue_data.reviewed_items|length }}</p>
        </div>
        
        <div class="queue-section">
            <h2>⏳ Pending Reviews</h2>
            {% if queue_data.pending_reviews %}
                {% for item in queue_data.pending_reviews %}
                <div class="item {{ item.priority }}">
                    <div style="display: flex; justify-content: between; align-items: center;">
                        <h3>Review ID: {{ item.review_id }}</h3>
                        <span class="priority-badge priority-{{ item.priority }}">{{ item.priority.upper() }}</span>
                    </div>
                    <p class="timestamp">Timestamp: {{ item.timestamp }}</p>
                    <div class="reason">
                        <strong>Reason:</strong> {{ item.reason }}
                    </div>
                    <div class="request-data">{{ item.request_data | tojson(indent=2) }}</div>
                    <div class="action-buttons">
                        <button class="btn btn-approve" onclick="markReviewed('{{ item.review_id }}', 'approved')">✅ Approve</button>
                        <button class="btn btn-reject" onclick="markReviewed('{{ item.review_id }}', 'rejected')">❌ Reject</button>
                        <button class="btn btn-modify" onclick="markReviewed('{{ item.review_id }}', 'modified')">✏️ Modify</button>
                    </div>
                </div>
                {% endfor %}
            {% else %}
                <div class="empty-state">
                    <h3>🎉 No pending reviews!</h3>
                    <p>All requests are being processed automatically.</p>
                </div>
            {% endif %}
        </div>
        
        <div class="queue-section">
            <h2>✅ Recently Reviewed</h2>
            {% if queue_data.reviewed_items %}
                {% for item in queue_data.reviewed_items[-5:] %}
                <div class="item">
                    <h3>Review ID: {{ item.review_id }}</h3>
                    <p class="timestamp">Reviewed: {{ item.reviewed_at }}</p>
                    <p><strong>Decision:</strong> {{ item.review_decision }}</p>
                    <p><strong>Notes:</strong> {{ item.reviewer_notes }}</p>
                </div>
                {% endfor %}
            {% else %}
                <div class="empty-state">
                    <p>No reviewed items yet.</p>
                </div>
            {% endif %}
        </div>
    </div>
</body>
</html>
"""

def get_queue_data():
    """Get queue data from the server"""
    try:
        response = requests.get(f"{SERVER_URL}/safety/oversight-queue", timeout=5)
        if response.status_code == 200:
            return response.json()
        else:
            return {"error": f"Server returned {response.status_code}"}
    except requests.exceptions.RequestException as e:
        return {"error": f"Connection error: {str(e)}"}

@app.route('/')
def dashboard():
    """Main dashboard page"""
    queue_data = get_queue_data()
    last_updated = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    return render_template_string(HTML_TEMPLATE, 
                                queue_data=queue_data, 
                                last_updated=last_updated)

@app.route('/mark-reviewed', methods=['POST'])
def mark_reviewed():
    """Mark an item as reviewed"""
    try:
        data = request.json
        review_id = data.get('review_id')
        review_decision = data.get('review_decision')
        reviewer_notes = data.get('reviewer_notes', '')
        
        response = requests.post(f"{SERVER_URL}/safety/mark-reviewed", 
                               json={
                                   'review_id': review_id,
                                   'review_decision': review_decision,
                                   'reviewer_notes': reviewer_notes
                               })
        
        if response.status_code == 200:
            return jsonify({"success": True})
        else:
            return jsonify({"success": False, "error": f"Server error: {response.status_code}"})
            
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/api/queue')
def api_queue():
    """API endpoint to get queue data"""
    return jsonify(get_queue_data())

if __name__ == '__main__':
    print("🚨 Starting Human Oversight Dashboard...")
    print(f"   URL: http://localhost:5001")
    print(f"   Server: {SERVER_URL}")
    print(f"   Auto-refresh: Every {REFRESH_INTERVAL} seconds")
    print()
    print("Open your browser to http://localhost:5001 to view the dashboard")
    print("Press Ctrl+C to stop")
    
    app.run(host='0.0.0.0', port=5001, debug=False)
