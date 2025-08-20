#!/usr/bin/env python3
"""
Oversight Queue Monitor
Monitors the human oversight queue and sends notifications when items need review.
"""

import requests
import time
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class OversightMonitor:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.last_check = None
        self.known_items = set()
        
    def check_queue(self):
        """Check the oversight queue for new items"""
        try:
            response = requests.get(f"{self.base_url}/safety/oversight-queue")
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Error checking queue: {response.status_code}")
                return None
        except Exception as e:
            print(f"Error connecting to server: {e}")
            return None
    
    def get_new_items(self, queue_data):
        """Get items that are new since last check"""
        if not queue_data:
            return []
        
        current_items = set()
        new_items = []
        
        # Check pending reviews
        for item in queue_data.get('pending_reviews', []):
            review_id = item.get('review_id')
            current_items.add(review_id)
            
            if review_id not in self.known_items:
                new_items.append(item)
        
        # Update known items
        self.known_items.update(current_items)
        
        return new_items
    
    def send_email_alert(self, items):
        """Send email alert for new items (requires email configuration)"""
        # Check if email is configured
        smtp_server = os.getenv('SMTP_SERVER')
        smtp_port = os.getenv('SMTP_PORT')
        email_user = os.getenv('EMAIL_USER')
        email_password = os.getenv('EMAIL_PASSWORD')
        alert_email = os.getenv('ALERT_EMAIL')
        
        if not all([smtp_server, email_user, email_password, alert_email]):
            print("⚠️  Email not configured. Add email settings to .env file to enable email alerts.")
            return False
        
        try:
            # Create email content
            subject = f"🚨 OVERSIGHT ALERT: {len(items)} new item(s) require review"
            
            body = f"""
            <h2>Human Oversight Queue Alert</h2>
            <p><strong>Time:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            <p><strong>New Items:</strong> {len(items)}</p>
            
            <h3>Items Requiring Review:</h3>
            """
            
            for item in items:
                body += f"""
                <div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0;">
                    <p><strong>Review ID:</strong> {item.get('review_id')}</p>
                    <p><strong>Priority:</strong> {item.get('priority')}</p>
                    <p><strong>Reason:</strong> {item.get('reason')}</p>
                    <p><strong>Timestamp:</strong> {item.get('timestamp')}</p>
                    <p><strong>Request Data:</strong></p>
                    <pre>{json.dumps(item.get('request_data', {}), indent=2)}</pre>
                </div>
                """
            
            body += f"""
            <p><strong>Action Required:</strong></p>
            <ul>
                <li>Review the items above</li>
                <li>Make decisions (approve/reject/modify)</li>
                <li>Mark items as reviewed using the API</li>
            </ul>
            
            <p><strong>API Commands:</strong></p>
            <pre>
# Check queue
curl {self.base_url}/safety/oversight-queue

# Mark as reviewed
curl -X POST "{self.base_url}/safety/mark-reviewed" \\
  -H "Content-Type: application/json" \\
  -d '{{"review_id": "REVIEW_ID", "review_decision": "approved", "reviewer_notes": "Your notes"}}'
            </pre>
            """
            
            # Send email
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = email_user
            msg['To'] = alert_email
            
            html_part = MIMEText(body, 'html')
            msg.attach(html_part)
            
            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.starttls()
                server.login(email_user, email_password)
                server.send_message(msg)
            
            print(f"✅ Email alert sent to {alert_email}")
            return True
            
        except Exception as e:
            print(f"❌ Error sending email: {e}")
            return False
    
    def print_console_alert(self, items):
        """Print alert to console"""
        print("\n" + "="*60)
        print("🚨 HUMAN OVERSIGHT ALERT")
        print("="*60)
        print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"New Items: {len(items)}")
        print()
        
        for i, item in enumerate(items, 1):
            print(f"Item {i}:")
            print(f"  Review ID: {item.get('review_id')}")
            print(f"  Priority: {item.get('priority')}")
            print(f"  Reason: {item.get('reason')}")
            print(f"  Timestamp: {item.get('timestamp')}")
            print(f"  Request Data: {json.dumps(item.get('request_data', {}), indent=2)}")
            print()
        
        print("Action Required:")
        print("1. Review the items above")
        print("2. Make decisions (approve/reject/modify)")
        print("3. Mark items as reviewed using the API")
        print()
        print("API Commands:")
        print(f"curl {self.base_url}/safety/oversight-queue")
        print(f"curl -X POST \"{self.base_url}/safety/mark-reviewed\" -H \"Content-Type: application/json\" -d '{{\"review_id\": \"REVIEW_ID\", \"review_decision\": \"approved\", \"reviewer_notes\": \"Your notes\"}}'")
        print("="*60)
    
    def monitor(self, check_interval=60, enable_email=False):
        """Monitor the queue continuously"""
        print(f"🔍 Starting oversight queue monitor...")
        print(f"   Check interval: {check_interval} seconds")
        print(f"   Email alerts: {'enabled' if enable_email else 'disabled'}")
        print(f"   Server: {self.base_url}")
        print()
        
        while True:
            try:
                # Check queue
                queue_data = self.check_queue()
                if queue_data:
                    new_items = self.get_new_items(queue_data)
                    
                    if new_items:
                        # Send alerts
                        self.print_console_alert(new_items)
                        
                        if enable_email:
                            self.send_email_alert(new_items)
                    else:
                        # Print status every 10 checks
                        if not hasattr(self, 'check_count'):
                            self.check_count = 0
                        self.check_count += 1
                        
                        if self.check_count % 10 == 0:
                            total_items = queue_data.get('queue_length', 0)
                            pending = len(queue_data.get('pending_reviews', []))
                            print(f"✅ Queue status: {total_items} total, {pending} pending - {datetime.now().strftime('%H:%M:%S')}")
                
                # Wait before next check
                time.sleep(check_interval)
                
            except KeyboardInterrupt:
                print("\n🛑 Monitor stopped by user")
                break
            except Exception as e:
                print(f"❌ Monitor error: {e}")
                time.sleep(check_interval)

def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Monitor human oversight queue')
    parser.add_argument('--interval', type=int, default=60, help='Check interval in seconds (default: 60)')
    parser.add_argument('--email', action='store_true', help='Enable email alerts')
    parser.add_argument('--url', default='http://localhost:8000', help='Server URL')
    
    args = parser.parse_args()
    
    monitor = OversightMonitor(args.url)
    monitor.monitor(check_interval=args.interval, enable_email=args.email)

if __name__ == "__main__":
    main()
