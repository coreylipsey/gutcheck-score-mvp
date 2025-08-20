"""
Human Oversight System for Gutcheck ADK Agents
Flags high-stakes queries for human review and manages escalation.
"""

import logging
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from datetime import datetime
import json

logger = logging.getLogger(__name__)

@dataclass
class OversightResult:
    """Result of human oversight evaluation"""
    requires_review: bool
    priority: str  # "low", "medium", "high", "critical"
    escalation_reason: str
    flagged_content: Dict[str, Any]
    review_id: Optional[str] = None

class HumanOversight:
    """
    Human oversight system to flag high-stakes queries for review.
    """
    
    def __init__(self):
        # Critical keywords that always require human review
        self.critical_keywords = [
            "suicide", "self-harm", "kill myself", "end my life", "want to die",
            "emergency", "crisis", "urgent help", "immediate danger",
            "illegal", "criminal", "fraud", "scam", "hack", "steal",
            "personal information", "social security", "credit card", "bank account"
        ]
        
        # High-priority patterns that suggest serious issues
        self.high_priority_patterns = [
            r"i want to.*die",
            r"i'm going to.*kill",
            r"i need.*help.*urgently",
            r"i'm in.*crisis",
            r"i'm going to.*hurt.*myself",
            r"i want to.*end.*life",
            r"i'm thinking of.*suicide"
        ]
        
        # Medium-priority patterns that suggest potential issues
        self.medium_priority_patterns = [
            r"i'm struggling.*mentally",
            r"i feel.*hopeless",
            r"i don't know.*what to do",
            r"i'm overwhelmed",
            r"i need.*professional.*help",
            r"i'm having.*thoughts.*of"
        ]
        
        # Business-related high-stakes topics
        self.business_critical_topics = [
            "financial_advice",
            "legal_advice", 
            "investment_advice",
            "tax_advice",
            "regulatory_compliance",
            "intellectual_property",
            "contract_negotiation"
        ]
        
        # Escalation messages for different priorities
        self.escalation_messages = {
            "critical": "CRITICAL: This request requires immediate human review due to safety concerns.",
            "high": "HIGH PRIORITY: This request requires human review due to potential serious issues.",
            "medium": "MEDIUM PRIORITY: This request may benefit from human review.",
            "low": "LOW PRIORITY: This request can proceed with automated processing."
        }
        
        # Review queue for flagged requests
        self.review_queue = []
    
    def evaluate_request(self, request_data: Dict[str, Any]) -> OversightResult:
        """
        Evaluate if a request requires human oversight.
        
        Args:
            request_data: The request data to evaluate
            
        Returns:
            OversightResult with evaluation findings
        """
        try:
            # Extract text content for analysis
            text_content = self._extract_text_content(request_data)
            
            # Check for critical keywords
            critical_found = self._check_critical_keywords(text_content)
            
            # Check for high-priority patterns
            high_priority_found = self._check_high_priority_patterns(text_content)
            
            # Check for medium-priority patterns
            medium_priority_found = self._check_medium_priority_patterns(text_content)
            
            # Check for business-critical topics
            business_critical_found = self._check_business_critical_topics(text_content)
            
            # Determine priority level
            priority = self._determine_priority(
                critical_found, high_priority_found, 
                medium_priority_found, business_critical_found
            )
            
            # Determine if human review is required
            requires_review = priority in ["critical", "high"]
            
            # Generate escalation reason
            escalation_reason = self._generate_escalation_reason(
                critical_found, high_priority_found, 
                medium_priority_found, business_critical_found
            )
            
            # Generate review ID if review is required
            review_id = None
            if requires_review:
                review_id = self._generate_review_id()
                self._add_to_review_queue(review_id, request_data, priority, escalation_reason)
            
            # Log oversight evaluation
            logger.info(f"Human oversight evaluation: {priority} priority, review required: {requires_review}")
            
            return OversightResult(
                requires_review=requires_review,
                priority=priority,
                escalation_reason=escalation_reason,
                flagged_content=request_data,
                review_id=review_id
            )
            
        except Exception as e:
            logger.error(f"Error in human oversight evaluation: {e}")
            # Default to requiring review on error
            return OversightResult(
                requires_review=True,
                priority="high",
                escalation_reason=f"Error in oversight evaluation: {str(e)}",
                flagged_content=request_data
            )
    
    def _extract_text_content(self, request_data: Dict[str, Any]) -> str:
        """Extract all text content from request data for analysis"""
        text_parts = []
        
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
    
    def _check_critical_keywords(self, text_content: str) -> List[str]:
        """Check for critical keywords in the content"""
        found_keywords = []
        
        for keyword in self.critical_keywords:
            if keyword.lower() in text_content.lower():
                found_keywords.append(keyword)
        
        return found_keywords
    
    def _check_high_priority_patterns(self, text_content: str) -> List[str]:
        """Check for high-priority patterns in the content"""
        import re
        found_patterns = []
        
        for pattern in self.high_priority_patterns:
            if re.search(pattern, text_content, re.IGNORECASE):
                found_patterns.append(pattern)
        
        return found_patterns
    
    def _check_medium_priority_patterns(self, text_content: str) -> List[str]:
        """Check for medium-priority patterns in the content"""
        import re
        found_patterns = []
        
        for pattern in self.medium_priority_patterns:
            if re.search(pattern, text_content, re.IGNORECASE):
                found_patterns.append(pattern)
        
        return found_patterns
    
    def _check_business_critical_topics(self, text_content: str) -> List[str]:
        """Check for business-critical topics in the content"""
        found_topics = []
        
        for topic in self.business_critical_topics:
            if topic.replace("_", " ") in text_content:
                found_topics.append(topic)
        
        return found_topics
    
    def _determine_priority(
        self,
        critical_found: List[str],
        high_priority_found: List[str], 
        medium_priority_found: List[str],
        business_critical_found: List[str]
    ) -> str:
        """Determine the priority level based on findings"""
        
        if critical_found:
            return "critical"
        elif high_priority_found:
            return "high"
        elif business_critical_found:
            return "high"
        elif medium_priority_found:
            return "medium"
        else:
            return "low"
    
    def _generate_escalation_reason(
        self,
        critical_found: List[str],
        high_priority_found: List[str],
        medium_priority_found: List[str], 
        business_critical_found: List[str]
    ) -> str:
        """Generate escalation reason based on findings"""
        
        reasons = []
        
        if critical_found:
            reasons.append(f"Critical keywords detected: {', '.join(critical_found)}")
        
        if high_priority_found:
            reasons.append(f"High-priority patterns detected: {', '.join(high_priority_found)}")
        
        if business_critical_found:
            reasons.append(f"Business-critical topics detected: {', '.join(business_critical_found)}")
        
        if medium_priority_found:
            reasons.append(f"Medium-priority patterns detected: {', '.join(medium_priority_found)}")
        
        if not reasons:
            return "No specific concerns detected"
        
        return "; ".join(reasons)
    
    def _generate_review_id(self) -> str:
        """Generate a unique review ID"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        import uuid
        unique_id = str(uuid.uuid4())[:8]
        return f"review_{timestamp}_{unique_id}"
    
    def _add_to_review_queue(self, review_id: str, request_data: Dict[str, Any], priority: str, reason: str):
        """Add request to human review queue"""
        review_item = {
            "review_id": review_id,
            "timestamp": datetime.now().isoformat(),
            "priority": priority,
            "reason": reason,
            "request_data": request_data,
            "status": "pending"
        }
        
        self.review_queue.append(review_item)
        logger.info(f"Added to review queue: {review_id} ({priority} priority)")
    
    def get_review_queue(self) -> List[Dict[str, Any]]:
        """Get the current review queue"""
        return self.review_queue.copy()
    
    def mark_reviewed(self, review_id: str, review_decision: str, reviewer_notes: str = ""):
        """Mark a review item as reviewed"""
        for item in self.review_queue:
            if item["review_id"] == review_id:
                item["status"] = "reviewed"
                item["review_decision"] = review_decision
                item["reviewer_notes"] = reviewer_notes
                item["reviewed_at"] = datetime.now().isoformat()
                logger.info(f"Marked review {review_id} as reviewed: {review_decision}")
                break
    
    def get_escalation_message(self, priority: str) -> str:
        """Get appropriate escalation message for priority level"""
        return self.escalation_messages.get(priority, "Proceed with caution.")
    
    def export_review_queue(self, filepath: str):
        """Export review queue to JSON file for external review"""
        try:
            with open(filepath, 'w') as f:
                json.dump(self.review_queue, f, indent=2, default=str)
            logger.info(f"Review queue exported to {filepath}")
        except Exception as e:
            logger.error(f"Error exporting review queue: {e}")

# Global human oversight instance
human_oversight = HumanOversight()
