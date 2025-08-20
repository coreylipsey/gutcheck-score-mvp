"""
Assessment Toolset for Gutcheck ADK Agent
Organizes all assessment-related tools using ADK's BaseToolset pattern.
"""

from typing import List, Optional
from google.adk.tools import base_toolset
from google.adk.tools import BaseTool, FunctionTool
from .tools.competitive_advantage import analyze_competitive_advantage
from .tools.growth_opportunity import analyze_growth_opportunity
from .tools.comprehensive_analysis import generate_comprehensive_analysis
from .tools.next_steps import generate_next_steps
from .tools.key_insights import generate_key_insights
from .tools.question_scoring import score_open_ended_question, score_all_open_ended_questions

class AssessmentToolset(base_toolset.BaseToolset):
    """
    Toolset for Gutcheck assessment tools.
    
    Provides all tools needed for comprehensive entrepreneurial assessment analysis.
    """
    
    def __init__(self, name_prefix: str = "assessment_"):
        """
        Initialize the assessment toolset.
        
        Args:
            name_prefix (str): Prefix for tool names to avoid conflicts
        """
        self.name_prefix = name_prefix
        self._tools = None
        
    async def get_tools(
        self, readonly_context: Optional[object] = None
    ) -> List[BaseTool]:
        """
        Get the list of assessment tools.
        
        Args:
            readonly_context: ADK context (unused in this implementation)
            
        Returns:
            List of assessment tools
        """
        if self._tools is None:
            # Create FunctionTool instances with custom names
            self._tools = [
                FunctionTool(
                    func=analyze_competitive_advantage,
                    name=f"{self.name_prefix}competitive_advantage"
                ),
                FunctionTool(
                    func=analyze_growth_opportunity,
                    name=f"{self.name_prefix}growth_opportunity"
                ),
                FunctionTool(
                    func=generate_comprehensive_analysis,
                    name=f"{self.name_prefix}comprehensive_analysis"
                ),
                FunctionTool(
                    func=generate_next_steps,
                    name=f"{self.name_prefix}next_steps"
                ),
                FunctionTool(
                    func=generate_key_insights,
                    name=f"{self.name_prefix}key_insights"
                ),
                FunctionTool(
                    func=score_open_ended_question,
                    name=f"{self.name_prefix}score_question"
                ),
                FunctionTool(
                    func=score_all_open_ended_questions,
                    name=f"{self.name_prefix}score_all_questions"
                )
            ]
        
        return self._tools
    
    async def close(self) -> None:
        """
        Clean up resources when the toolset is no longer needed.
        """
        # No specific cleanup needed for these tools
        pass
