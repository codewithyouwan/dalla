from typing import List, Dict
from langchain_core.tools import tool
from langgraph.config import get_stream_writer
from langgraph.types import interrupt
from src.database.supabase import supabase
from src.embeddings.sentence_transformer import model

@tool
async def fetch_with_approval(filter_cols: List[str], filter_val: str, limit: int, select_cols: List[str]) -> Dict:
    """Fetches entries with automatic human approval flow"""
    
    writer = get_stream_writer()
    def write(message, type="text"):
        writer({type: message})

    embedding = model.encode([filter_val])[0].tolist()
    query_params = {
        "query_embedding": embedding,
        "match_columns": filter_cols,
        "match_limit": limit
    }
    print(f"Query parameters: {query_params}") 
    result = supabase.rpc("match_embeddings", query_params).execute()
    print(f"Result data: {result}") 
    result_data = result.data if hasattr(result, 'data') else []
    
    if not result_data:
        return {"fetch_result": [], "human_feedback": "No results found", "status": "empty"}
    
    user_ids = [row.get("user_id") for row in result_data if row.get("user_id")]
    if not user_ids:
        return {"fetch_result": [], "human_feedback": "No valid user IDs", "status": "empty"}
    
    print(f"User IDs: {user_ids}")  
    selected_cols = list(set(select_cols + ["id", "full_name_english", "full_name_katakana"]))
    response = supabase.table("data").select(", ".join(selected_cols)).in_("id", user_ids).execute()
    
    write(f"""{response.data if response.data else []}
          
          Is this fetch result OK? (yes/no)""", "interrupt"
          )
    human_response = interrupt({"query": "Is this fetch result OK? (yes/no)"})

    return {
        "tool_result": response.data if response.data else [],
        "human_feedback": human_response["data"],
        "status": "approved" if human_response["data"].lower() == "yes" else "rejected"
    }

@tool
async def fetch_users_by_ids(user_ids: List[int]) -> Dict:
    """Fetches all fields for users with the specified user IDs with human approval"""

    writer = get_stream_writer()
    def write(message, type="text"):
        writer({type: message})
    
    if not user_ids:
        return {
            "fetch_result": [],
            "human_feedback": None,
            "status": "empty",
            "error": None
        }
    
    response = supabase.table("data").select("*").in_("id", user_ids).execute()
    users = response.data if response.data else []
    if not users:
        return {
            "tool_result": [],
            "human_feedback": None,
            "status": "empty",
            "error": None
        }
    
    write(f"""{users if users else []}
          
          Is this fetch result OK? (yes/no)""", "interrupt"
          )
    human_response = interrupt({
        "query": f"Fetched {users} users. Is this correct? (yes/no)"
    })
    
    status = "approved" if human_response["data"].lower() == "yes" else "rejected"
    return {
        "tool_result": users,
        "human_feedback": human_response["data"],
        "status": status,
        "error": None
    }