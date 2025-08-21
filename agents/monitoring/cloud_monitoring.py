"""
Cloud Monitoring and Logging System
Provides comprehensive monitoring for the assessment agent Cloud Function.
"""

import logging
import time
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from google.cloud import monitoring_v3
from google.cloud import logging as cloud_logging
import os

# Configure structured logging
class StructuredLogger:
    def __init__(self, name: str = "assessment_agent"):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.INFO)
        
        # Add handler if not already present
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
    
    def log_request(self, request_id: str, client_ip: str, processing_time: float, 
                   success: bool, error_message: str = None):
        """Log structured request information."""
        log_data = {
            'event_type': 'request_processed',
            'request_id': request_id,
            'client_ip': client_ip,
            'processing_time_seconds': round(processing_time, 3),
            'success': success,
            'timestamp': datetime.utcnow().isoformat(),
            'environment': os.getenv('ENVIRONMENT', 'development')
        }
        
        if error_message:
            log_data['error_message'] = error_message
        
        self.logger.info(json.dumps(log_data))
    
    def log_tool_execution(self, request_id: str, tool_name: str, 
                          execution_time: float, success: bool, error: str = None):
        """Log tool execution metrics."""
        log_data = {
            'event_type': 'tool_execution',
            'request_id': request_id,
            'tool_name': tool_name,
            'execution_time_seconds': round(execution_time, 3),
            'success': success,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        if error:
            log_data['error'] = error
        
        self.logger.info(json.dumps(log_data))
    
    def log_rate_limit(self, client_ip: str, request_count: int):
        """Log rate limiting events."""
        log_data = {
            'event_type': 'rate_limit_check',
            'client_ip': client_ip,
            'request_count': request_count,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        self.logger.warning(json.dumps(log_data))

class CloudMetrics:
    def __init__(self, project_id: str):
        self.project_id = project_id
        self.client = monitoring_v3.MetricServiceClient()
        self.project_name = f"projects/{project_id}"
    
    def create_time_series(self, metric_type: str, value: float, 
                          labels: Dict[str, str] = None):
        """Create a time series for custom metrics."""
        try:
            series = monitoring_v3.TimeSeries()
            series.metric.type = f"custom.googleapis.com/{metric_type}"
            series.resource.type = "cloud_function"
            series.resource.labels["function_name"] = "assessment-agent"
            series.resource.labels["project_id"] = self.project_id
            series.resource.labels["region"] = os.getenv('GOOGLE_CLOUD_LOCATION', 'us-central1')
            
            # Add custom labels
            if labels:
                for key, value in labels.items():
                    series.metric.labels[key] = str(value)
            
            # Set the metric value
            point = monitoring_v3.Point()
            point.value.double_value = value
            point.interval.end_time.seconds = int(time.time())
            series.points = [point]
            
            # Write the time series
            self.client.create_time_series(
                request={
                    "name": self.project_name,
                    "time_series": [series]
                }
            )
            
        except Exception as e:
            logging.error(f"Failed to create time series: {e}")
    
    def record_request_metrics(self, processing_time: float, success: bool, 
                             tool_executions: Dict[str, float] = None):
        """Record comprehensive request metrics."""
        # Record overall processing time
        self.create_time_series(
            "assessment/processing_time_seconds",
            processing_time,
            {"success": str(success).lower()}
        )
        
        # Record success/failure count
        self.create_time_series(
            "assessment/request_count",
            1,
            {"success": str(success).lower()}
        )
        
        # Record tool execution times if provided
        if tool_executions:
            for tool_name, execution_time in tool_executions.items():
                self.create_time_series(
                    "assessment/tool_execution_time_seconds",
                    execution_time,
                    {"tool_name": tool_name}
                )
    
    def record_rate_limit_metrics(self, client_ip: str, request_count: int):
        """Record rate limiting metrics."""
        self.create_time_series(
            "assessment/rate_limit_requests",
            request_count,
            {"client_ip": client_ip}
        )

class PerformanceMonitor:
    def __init__(self, project_id: str):
        self.logger = StructuredLogger()
        self.metrics = CloudMetrics(project_id)
        self.start_times = {}
    
    def start_tool_timer(self, request_id: str, tool_name: str):
        """Start timing a tool execution."""
        key = f"{request_id}_{tool_name}"
        self.start_times[key] = time.time()
    
    def end_tool_timer(self, request_id: str, tool_name: str, success: bool = True, 
                      error: str = None):
        """End timing a tool execution and log metrics."""
        key = f"{request_id}_{tool_name}"
        if key in self.start_times:
            execution_time = time.time() - self.start_times[key]
            del self.start_times[key]
            
            # Log tool execution
            self.logger.log_tool_execution(request_id, tool_name, execution_time, success, error)
            
            # Record metrics
            self.metrics.create_time_series(
                "assessment/tool_execution_time_seconds",
                execution_time,
                {"tool_name": tool_name, "success": str(success).lower()}
            )
            
            return execution_time
        return 0.0
    
    def record_request(self, request_id: str, client_ip: str, processing_time: float, 
                      success: bool, error_message: str = None, 
                      tool_executions: Dict[str, float] = None):
        """Record comprehensive request metrics."""
        # Log request
        self.logger.log_request(request_id, client_ip, processing_time, success, error_message)
        
        # Record metrics
        self.metrics.record_request_metrics(processing_time, success, tool_executions)
    
    def record_rate_limit(self, client_ip: str, request_count: int):
        """Record rate limiting events."""
        self.logger.log_rate_limit(client_ip, request_count)
        self.metrics.record_rate_limit_metrics(client_ip, request_count)

# Global monitor instance
monitor = None

def get_monitor() -> PerformanceMonitor:
    """Get or create the global monitor instance."""
    global monitor
    if monitor is None:
        project_id = os.getenv('GOOGLE_CLOUD_PROJECT', 'gutcheck-score-mvp')
        monitor = PerformanceMonitor(project_id)
    return monitor

def log_function_start(request_id: str, client_ip: str):
    """Log function start with monitoring."""
    monitor = get_monitor()
    monitor.logger.logger.info(f"Function started - Request ID: {request_id}, Client IP: {client_ip}")

def log_function_end(request_id: str, client_ip: str, processing_time: float, 
                   success: bool, error_message: str = None):
    """Log function end with monitoring."""
    monitor = get_monitor()
    monitor.record_request(request_id, client_ip, processing_time, success, error_message)

def log_tool_start(request_id: str, tool_name: str):
    """Start monitoring a tool execution."""
    monitor = get_monitor()
    monitor.start_tool_timer(request_id, tool_name)

def log_tool_end(request_id: str, tool_name: str, success: bool = True, error: str = None):
    """End monitoring a tool execution."""
    monitor = get_monitor()
    return monitor.end_tool_timer(request_id, tool_name, success, error)

def log_rate_limit_event(client_ip: str, request_count: int):
    """Log rate limiting events."""
    monitor = get_monitor()
    monitor.record_rate_limit(client_ip, request_count)
