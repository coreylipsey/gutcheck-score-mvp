"""
Content Filtering System for Gutcheck ADK Agents
Implements safety and responsible AI practices.
"""

import re
from typing import Dict, Any, List, Tuple
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

@dataclass
class FilterResult:
    """Result of content filtering operation"""
    is_safe: bool
    filtered_content: Dict[str, Any]
    flagged_issues: List[str]
    risk_level: str  # "low", "medium", "high", "critical"

class ContentFilter:
    """
    Content filtering system to ensure safe and responsible AI interactions.
    """
    
    def __init__(self):
        # Prohibited topics that should not be addressed
        self.prohibited_topics = [
            "financial_advice",
            "legal_advice", 
            "medical_advice",
            "tax_advice",
            "investment_advice",
            "health_advice"
        ]
        
        # High-risk keywords that require human review
        self.high_risk_keywords = [
            "suicide", "self-harm", "kill myself", "end my life",
            "emergency", "crisis", "urgent help", "immediate danger",
            "illegal", "criminal", "fraud", "scam", "hack",
            "personal information", "social security", "credit card"
        ]
        
        # Medium-risk patterns
        self.medium_risk_patterns = [
            r"invest.*money",
            r"legal.*advice", 
            r"medical.*condition",
            r"financial.*planning",
            r"tax.*return"
        ]
        
        # Boundary topics - should redirect to appropriate resources
        self.boundary_topics = [
            "mental_health",
            "crisis_support", 
            "legal_services",
            "financial_planning",
            "medical_consultation"
        ]
        
        # Escalation messages for different risk levels
        self.escalation_messages = {
            "critical": "This request requires immediate human review. Please contact support.",
            "high": "This topic requires professional assistance. Please consult appropriate experts.",
            "medium": "For this topic, consider consulting with qualified professionals.",
            "low": "Proceed with caution and within appropriate boundaries."
        }
    
    def filter_request(self, request_data: Dict[str, Any]) -> FilterResult:
        """
        Filter incoming request data for safety and appropriateness.
        
        Args:
            request_data: The request data to filter
            
        Returns:
            FilterResult with safety assessment and filtered content
        """
        try:
            # Extract text content from request
            text_content = self._extract_text_content(request_data)
            
            # Check for prohibited topics
            prohibited_found = self._check_prohibited_topics(text_content)
            
            # Check for high-risk keywords
            high_risk_found = self._check_high_risk_keywords(text_content)
            
            # Check for medium-risk patterns
            medium_risk_found = self._check_medium_risk_patterns(text_content)
            
            # Determine risk level
            risk_level = self._determine_risk_level(
                prohibited_found, high_risk_found, medium_risk_found
            )
            
            # Collect flagged issues
            flagged_issues = []
            if prohibited_found:
                flagged_issues.extend(prohibited_found)
            if high_risk_found:
                flagged_issues.extend(high_risk_found)
            if medium_risk_found:
                flagged_issues.extend(medium_risk_found)
            
            # Determine if request is safe to proceed
            is_safe = risk_level in ["low", "medium"]
            
            # Apply content filtering if needed
            filtered_content = self._apply_content_filtering(
                request_data, flagged_issues, risk_level
            )
            
            # Log filtering results
            logger.info(f"Content filter result: {risk_level} risk, {len(flagged_issues)} issues flagged")
            
            return FilterResult(
                is_safe=is_safe,
                filtered_content=filtered_content,
                flagged_issues=flagged_issues,
                risk_level=risk_level
            )
            
        except Exception as e:
            logger.error(f"Error in content filtering: {e}")
            # Default to safe but log the error
            return FilterResult(
                is_safe=True,
                filtered_content=request_data,
                flagged_issues=[f"Filtering error: {str(e)}"],
                risk_level="low"
            )
    
    def _extract_text_content(self, request_data: Dict[str, Any]) -> str:
        """Extract all text content from request data for analysis"""
        text_parts = []
        
        # Extract from common fields
        if isinstance(request_data, dict):
            for key, value in request_data.items():
                if isinstance(value, str):
                    text_parts.append(value.lower())
                elif isinstance(value, list):
                    for item in value:
                        if isinstance(item, str):
                            text_parts.append(item.lower())
                        elif isinstance(item, dict):
                            text_parts.extend(self._extract_text_content(item))
                elif isinstance(value, dict):
                    text_parts.extend(self._extract_text_content(value))
        
        return " ".join(text_parts)
    
    def _check_prohibited_topics(self, text_content: str) -> List[str]:
        """Check for prohibited topics in the content"""
        found_topics = []
        
        for topic in self.prohibited_topics:
            if topic.replace("_", " ") in text_content:
                found_topics.append(f"Prohibited topic detected: {topic}")
        
        return found_topics
    
    def _check_high_risk_keywords(self, text_content: str) -> List[str]:
        """Check for high-risk keywords in the content"""
        found_keywords = []
        
        for keyword in self.high_risk_keywords:
            if keyword.lower() in text_content.lower():
                found_keywords.append(f"High-risk keyword detected: {keyword}")
        
        return found_keywords
    
    def _check_medium_risk_patterns(self, text_content: str) -> List[str]:
        """Check for medium-risk patterns in the content"""
        found_patterns = []
        
        for pattern in self.medium_risk_patterns:
            if re.search(pattern, text_content, re.IGNORECASE):
                found_patterns.append(f"Medium-risk pattern detected: {pattern}")
        
        return found_patterns
    
    def _determine_risk_level(
        self, 
        prohibited_found: List[str], 
        high_risk_found: List[str], 
        medium_risk_found: List[str]
    ) -> str:
        """Determine the overall risk level based on findings"""
        
        if prohibited_found:
            return "critical"
        elif high_risk_found:
            return "high"
        elif medium_risk_found:
            return "medium"
        else:
            return "low"
    
    def _apply_content_filtering(
        self, 
        request_data: Dict[str, Any], 
        flagged_issues: List[str], 
        risk_level: str
    ) -> Dict[str, Any]:
        """Apply content filtering based on risk level"""
        
        # For critical risk, block the request entirely
        if risk_level == "critical":
            return {
                "error": "Request blocked due to prohibited content",
                "escalation_message": self.escalation_messages["critical"],
                "flagged_issues": flagged_issues
            }
        
        # For high risk, add warnings but allow with restrictions
        if risk_level == "high":
            filtered_data = request_data.copy()
            filtered_data["_safety_warnings"] = {
                "risk_level": risk_level,
                "escalation_message": self.escalation_messages["high"],
                "flagged_issues": flagged_issues
            }
            return filtered_data
        
        # For medium risk, add cautionary notes
        if risk_level == "medium":
            filtered_data = request_data.copy()
            filtered_data["_safety_warnings"] = {
                "risk_level": risk_level,
                "escalation_message": self.escalation_messages["medium"],
                "flagged_issues": flagged_issues
            }
            return filtered_data
        
        # For low risk, proceed normally
        return request_data
    
    def get_escalation_message(self, risk_level: str) -> str:
        """Get appropriate escalation message for risk level"""
        return self.escalation_messages.get(risk_level, "Proceed with caution.")

# Global content filter instance
content_filter = ContentFilter()
