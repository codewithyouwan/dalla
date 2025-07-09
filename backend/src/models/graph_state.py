from langgraph.graph.message import add_messages
from typing import Annotated, List, Dict, Optional, TypedDict

class State(TypedDict):
    messages: Annotated[list, add_messages] 
    plan: List[str]
    current_step: Optional[str]
    executor_notes: List[Dict]
    task_complete: bool
    last_feedback: Optional[str]