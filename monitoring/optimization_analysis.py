#!/usr/bin/env python3
"""
ADK Agent Optimization Analysis
Analyzes performance data and suggests optimizations.
"""

import json
import datetime
from typing import Dict, Any, List
import glob
import os

class OptimizationAnalyzer:
    def __init__(self):
        self.metrics_files = []
        self.analysis_results = {}
    
    def load_metrics_files(self, pattern: str = "adk_metrics_*.json"):
        """Load all metrics files"""
        self.metrics_files = glob.glob(pattern)
        print(f"📁 Found {len(self.metrics_files)} metrics files")
    
    def analyze_performance(self) -> Dict[str, Any]:
        """Analyze performance across all metrics files"""
        all_response_times = []
        all_errors = []
        total_requests = 0
        total_errors = 0
        
        for file_path in self.metrics_files:
            try:
                with open(file_path, 'r') as f:
                    data = json.load(f)
                
                metrics = data.get('metrics', {})
                summary = data.get('summary', {})
                
                # Collect response times
                response_times = metrics.get('response_times', [])
                all_response_times.extend(response_times)
                
                # Collect errors
                errors = metrics.get('errors', [])
                all_errors.extend(errors)
                
                # Aggregate totals
                total_requests += summary.get('total_requests', 0)
                total_errors += summary.get('total_errors', 0)
                
            except Exception as e:
                print(f"⚠️  Error loading {file_path}: {e}")
        
        # Calculate performance metrics
        avg_response_time = sum(all_response_times) / len(all_response_times) if all_response_times else 0
        min_response_time = min(all_response_times) if all_response_times else 0
        max_response_time = max(all_response_times) if all_response_times else 0
        
        success_rate = ((total_requests - total_errors) / total_requests * 100) if total_requests > 0 else 0
        
        # Analyze error patterns
        error_analysis = self.analyze_errors(all_errors)
        
        return {
            'total_requests': total_requests,
            'total_errors': total_errors,
            'success_rate': success_rate,
            'response_time_stats': {
                'average': avg_response_time,
                'minimum': min_response_time,
                'maximum': max_response_time,
                'count': len(all_response_times)
            },
            'error_analysis': error_analysis
        }
    
    def analyze_errors(self, errors: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze error patterns"""
        error_types = {}
        error_timestamps = []
        
        for error in errors:
            error_msg = error.get('error', 'Unknown error')
            error_type = self.categorize_error(error_msg)
            
            if error_type not in error_types:
                error_types[error_type] = 0
            error_types[error_type] += 1
            
            error_timestamps.append(error.get('timestamp', ''))
        
        return {
            'total_errors': len(errors),
            'error_types': error_types,
            'error_timestamps': error_timestamps
        }
    
    def categorize_error(self, error_msg: str) -> str:
        """Categorize error types"""
        error_msg_lower = error_msg.lower()
        
        if 'timeout' in error_msg_lower:
            return 'Timeout'
        elif 'connection' in error_msg_lower:
            return 'Connection Error'
        elif '500' in error_msg or 'internal server error' in error_msg_lower:
            return 'Server Error'
        elif '404' in error_msg:
            return 'Not Found'
        elif 'rate limit' in error_msg_lower:
            return 'Rate Limit'
        else:
            return 'Other'
    
    def generate_optimization_recommendations(self, performance_data: Dict[str, Any]) -> List[str]:
        """Generate optimization recommendations"""
        recommendations = []
        
        # Response time analysis
        avg_response_time = performance_data['response_time_stats']['average']
        max_response_time = performance_data['response_time_stats']['maximum']
        
        if avg_response_time > 5.0:
            recommendations.append("🚀 Consider implementing response caching for frequently requested data")
        
        if max_response_time > 15.0:
            recommendations.append("⚡ Optimize feedback generation algorithms for faster processing")
        
        # Success rate analysis
        success_rate = performance_data['success_rate']
        if success_rate < 95.0:
            recommendations.append("🛡️ Implement better error handling and retry mechanisms")
        
        # Error analysis
        error_types = performance_data['error_analysis']['error_types']
        
        if 'Timeout' in error_types and error_types['Timeout'] > 5:
            recommendations.append("⏱️ Increase timeout values or implement request queuing")
        
        if 'Connection Error' in error_types and error_types['Connection Error'] > 3:
            recommendations.append("🌐 Implement connection pooling and retry logic")
        
        if 'Rate Limit' in error_types:
            recommendations.append("📊 Implement rate limiting and request throttling")
        
        # General recommendations
        recommendations.append("📈 Set up automated monitoring and alerting")
        recommendations.append("🔧 Consider implementing circuit breaker pattern for resilience")
        recommendations.append("💾 Add response caching for improved performance")
        
        return recommendations
    
    def generate_report(self) -> str:
        """Generate comprehensive optimization report"""
        performance_data = self.analyze_performance()
        recommendations = self.generate_optimization_recommendations(performance_data)
        
        report = f"""
🔧 ADK Agent Optimization Analysis Report
{'='*60}
📅 Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
📊 Analyzed {len(self.metrics_files)} metrics files

📈 Performance Summary:
• Total Requests: {performance_data['total_requests']:,}
• Total Errors: {performance_data['total_errors']:,}
• Success Rate: {performance_data['success_rate']:.1f}%
• Average Response Time: {performance_data['response_time_stats']['average']:.2f}s
• Min Response Time: {performance_data['response_time_stats']['minimum']:.2f}s
• Max Response Time: {performance_data['response_time_stats']['maximum']:.2f}s

❌ Error Analysis:
"""
        
        for error_type, count in performance_data['error_analysis']['error_types'].items():
            report += f"• {error_type}: {count} occurrences\n"
        
        report += f"""
🚀 Optimization Recommendations:
"""
        
        for i, recommendation in enumerate(recommendations, 1):
            report += f"{i}. {recommendation}\n"
        
        report += f"""
📋 Next Steps:
1. Implement high-priority optimizations
2. Set up continuous monitoring
3. Establish performance baselines
4. Plan capacity scaling
5. Document optimization results

{'='*60}
"""
        
        return report
    
    def save_analysis(self, filename: str = None):
        """Save analysis results"""
        if filename is None:
            filename = f"optimization_analysis_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        performance_data = self.analyze_performance()
        recommendations = self.generate_optimization_recommendations(performance_data)
        
        analysis_data = {
            'performance_data': performance_data,
            'recommendations': recommendations,
            'generated_at': datetime.datetime.now().isoformat(),
            'metrics_files_analyzed': self.metrics_files
        }
        
        with open(filename, 'w') as f:
            json.dump(analysis_data, f, indent=2)
        
        print(f"📁 Analysis saved to {filename}")

def main():
    """Main analysis function"""
    analyzer = OptimizationAnalyzer()
    
    print("🔧 Starting ADK Agent Optimization Analysis")
    print("="*60)
    
    # Load metrics files
    analyzer.load_metrics_files()
    
    if not analyzer.metrics_files:
        print("⚠️  No metrics files found. Run monitoring first.")
        return
    
    # Generate and display report
    report = analyzer.generate_report()
    print(report)
    
    # Save analysis
    analyzer.save_analysis()
    
    print("✅ Optimization analysis completed!")

if __name__ == "__main__":
    main()
