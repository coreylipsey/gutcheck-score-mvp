#!/usr/bin/env python3
"""
ADK Agent Monitoring Script
Monitors the production ADK agent for performance, health, and reliability.
"""

import requests
import json
import time
import datetime
import logging
from typing import Dict, Any, List
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('adk_monitoring.log'),
        logging.StreamHandler()
    ]
)

class ADKMonitor:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.metrics = {
            'health_checks': [],
            'response_times': [],
            'errors': [],
            'success_rate': 0,
            'total_requests': 0
        }
    
    def health_check(self) -> Dict[str, Any]:
        """Perform health check on ADK agent"""
        start_time = time.time()
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            response_time = time.time() - start_time
            
            result = {
                'timestamp': datetime.datetime.now().isoformat(),
                'status': response.status_code,
                'response_time': response_time,
                'success': response.status_code == 200,
                'data': response.json() if response.status_code == 200 else None
            }
            
            self.metrics['health_checks'].append(result)
            self.metrics['total_requests'] += 1
            
            if result['success']:
                logging.info(f"✅ Health check passed: {response_time:.2f}s")
            else:
                logging.error(f"❌ Health check failed: {response.status_code}")
                self.metrics['errors'].append(result)
            
            return result
            
        except Exception as e:
            response_time = time.time() - start_time
            error_result = {
                'timestamp': datetime.datetime.now().isoformat(),
                'status': 'ERROR',
                'response_time': response_time,
                'success': False,
                'error': str(e)
            }
            
            self.metrics['health_checks'].append(error_result)
            self.metrics['errors'].append(error_result)
            self.metrics['total_requests'] += 1
            
            logging.error(f"❌ Health check error: {e}")
            return error_result
    
    def test_feedback_generation(self) -> Dict[str, Any]:
        """Test feedback generation endpoint"""
        start_time = time.time()
        
        test_data = {
            "responses": [
                {
                    "questionId": "q3",
                    "questionText": "Tell us about your entrepreneurial journey so far.",
                    "response": "I've started two small businesses in the past 3 years. The first was a local food delivery service that I ran for 6 months before selling it. The second is a consulting business that I'm currently growing.",
                    "category": "entrepreneurialSkills"
                }
            ],
            "scores": {
                "personalBackground": 15,
                "entrepreneurialSkills": 20,
                "resources": 12,
                "behavioralMetrics": 10,
                "growthVision": 16
            },
            "industry": "Technology",
            "location": "San Francisco"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/generate-feedback",
                headers={"Content-Type": "application/json"},
                json=test_data,
                timeout=30
            )
            
            response_time = time.time() - start_time
            
            result = {
                'timestamp': datetime.datetime.now().isoformat(),
                'status': response.status_code,
                'response_time': response_time,
                'success': response.status_code == 200,
                'data_length': len(response.text) if response.status_code == 200 else 0
            }
            
            self.metrics['response_times'].append(response_time)
            self.metrics['total_requests'] += 1
            
            if result['success']:
                logging.info(f"✅ Feedback generation test passed: {response_time:.2f}s")
            else:
                logging.error(f"❌ Feedback generation test failed: {response.status_code}")
                self.metrics['errors'].append(result)
            
            return result
            
        except Exception as e:
            response_time = time.time() - start_time
            error_result = {
                'timestamp': datetime.datetime.now().isoformat(),
                'status': 'ERROR',
                'response_time': response_time,
                'success': False,
                'error': str(e)
            }
            
            self.metrics['errors'].append(error_result)
            self.metrics['total_requests'] += 1
            
            logging.error(f"❌ Feedback generation test error: {e}")
            return error_result
    
    def calculate_metrics(self) -> Dict[str, Any]:
        """Calculate performance metrics"""
        total_requests = self.metrics['total_requests']
        total_errors = len(self.metrics['errors'])
        success_rate = ((total_requests - total_errors) / total_requests * 100) if total_requests > 0 else 0
        
        avg_response_time = 0
        if self.metrics['response_times']:
            avg_response_time = sum(self.metrics['response_times']) / len(self.metrics['response_times'])
        
        return {
            'total_requests': total_requests,
            'total_errors': total_errors,
            'success_rate': success_rate,
            'avg_response_time': avg_response_time,
            'last_check': datetime.datetime.now().isoformat()
        }
    
    def generate_report(self) -> str:
        """Generate monitoring report"""
        metrics = self.calculate_metrics()
        
        report = f"""
📊 ADK Agent Monitoring Report
{'='*50}
📅 Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
🌐 Server: {self.base_url}

📈 Performance Metrics:
• Total Requests: {metrics['total_requests']}
• Total Errors: {metrics['total_errors']}
• Success Rate: {metrics['success_rate']:.1f}%
• Avg Response Time: {metrics['avg_response_time']:.2f}s

🔍 Recent Health Checks:
"""
        
        # Add recent health checks
        recent_checks = self.metrics['health_checks'][-5:]  # Last 5 checks
        for check in recent_checks:
            status = "✅" if check['success'] else "❌"
            report += f"• {status} {check['timestamp']}: {check['response_time']:.2f}s\n"
        
        if self.metrics['errors']:
            report += f"\n❌ Recent Errors:\n"
            recent_errors = self.metrics['errors'][-3:]  # Last 3 errors
            for error in recent_errors:
                report += f"• {error['timestamp']}: {error.get('error', 'Unknown error')}\n"
        
        return report
    
    def save_metrics(self, filename: str = None):
        """Save metrics to file"""
        if filename is None:
            filename = f"adk_metrics_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        with open(filename, 'w') as f:
            json.dump({
                'metrics': self.metrics,
                'summary': self.calculate_metrics(),
                'generated_at': datetime.datetime.now().isoformat()
            }, f, indent=2)
        
        logging.info(f"📁 Metrics saved to {filename}")

def main():
    """Main monitoring function"""
    # Production ADK server URL
    base_url = "https://gutcheck-adk-agent-286731768309.us-central1.run.app"
    
    monitor = ADKMonitor(base_url)
    
    print("🚀 Starting ADK Agent Monitoring")
    print(f"🌐 Monitoring: {base_url}")
    print("="*60)
    
    # Run monitoring for 10 minutes
    duration = 600  # 10 minutes
    interval = 60   # Check every minute
    
    start_time = time.time()
    check_count = 0
    
    try:
        while time.time() - start_time < duration:
            check_count += 1
            print(f"\n🔍 Check #{check_count} - {datetime.datetime.now().strftime('%H:%M:%S')}")
            
            # Perform health check
            health_result = monitor.health_check()
            
            # Test feedback generation
            feedback_result = monitor.test_feedback_generation()
            
            # Calculate and display metrics
            metrics = monitor.calculate_metrics()
            print(f"📊 Success Rate: {metrics['success_rate']:.1f}% | Avg Response: {metrics['avg_response_time']:.2f}s")
            
            # Wait for next check
            if time.time() - start_time < duration:
                print(f"⏳ Waiting {interval} seconds until next check...")
                time.sleep(interval)
    
    except KeyboardInterrupt:
        print("\n⏹️  Monitoring stopped by user")
    
    # Generate final report
    print("\n" + "="*60)
    print(monitor.generate_report())
    
    # Save metrics
    monitor.save_metrics()
    
    print("\n✅ Monitoring completed!")

if __name__ == "__main__":
    main()
