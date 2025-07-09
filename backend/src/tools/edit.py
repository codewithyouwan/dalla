from typing import Dict
from langchain_core.tools import tool
from langgraph.types import interrupt
from langgraph.config import get_stream_writer
from src.database.supabase import supabase
from src.embeddings.sentence_transformer import model

@tool
async def edit_user_with_approval(user_id: int, column_name: str, new_value: str) -> Dict:
    """Updates user with automatic approval flow and syncs embeddings"""

    writer = get_stream_writer()
    def write(message, type="text"):
        writer({type: message})
    
    current_user = supabase.table("data").select("*").eq("id", user_id).execute()
    current_value = current_user.data[0].get(column_name, "N/A") if current_user.data else "N/A"

    interrupt_message = {
        "query": f"""Update user {user_id}'s {column_name} 
        from 
        
        '{current_value}' 
        to 
        '{new_value}'. 
        
        Approve? (yes/no)"""
    }

    write(interrupt_message["query"], "interrupt")
    human_response = interrupt(interrupt_message)
    
    if human_response["data"].lower() == "yes":
        supabase.table("data").update({column_name: new_value}).eq("id", user_id).execute()
        
        existing = supabase.table("embeddings").select("id").eq("user_id", user_id).eq("column_name", column_name).execute()
        if existing.data:
            supabase.table("embeddings").delete().eq("user_id", user_id).eq("column_name", column_name).execute()
            new_embedding = model.encode([new_value])[0].tolist()
            supabase.table("embeddings").insert({"user_id": user_id, "column_name": column_name, "vector": new_embedding}).execute()
        
        return {
            "tool_result": "Success",
            "human_feedback": human_response["data"],
            "status": "approved",
            "error": None
        }
    else:
        return {
            "tool_result": "Cancelled",
            "human_feedback": human_response["data"],
            "status": "rejected",
            "error": None
        }
