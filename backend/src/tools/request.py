from langgraph.config import get_stream_writer
from langchain_core.tools import tool
from langgraph.types import interrupt
from src.database.supabase import supabase
from src.embeddings.sentence_transformer import model
from typing import List, Dict, Annotated, Optional, TypedDict

@tool
async def request_executor_notes_access() -> Dict:
    """Requests human permission to share executor notes with reasoning node for better planning"""
    
    writer = get_stream_writer()
    def write(message, type="text"):
        writer({type: message})

    human_response = interrupt({
        "query": "The reasoning agent wants to see the execution history to make better plans. Share executor notes with reasoning node? (yes/no)"
    })

    write("The reasoning agent wants to see the execution history to make better plans. Share executor notes with reasoning node? (yes/no)")
    
    return {
        "tool_result": "Access granted" if human_response["data"].lower() == "yes" else "Access denied",
        "human_feedback": human_response["data"],
        "status": "approved" if human_response["data"].lower() == "yes" else "rejected",
    }