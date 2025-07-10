from langchain_ollama import ChatOllama
from src.tools import fetch_with_approval, fetch_users_by_ids, edit_user_with_approval, request_executor_notes_access

executor_llm_name = "qwen3:1.7b"
tools = [
    fetch_with_approval,
    fetch_users_by_ids,
    edit_user_with_approval,
    request_executor_notes_access, 
]
tools_dict = {tool.name: tool for tool in tools}

executor_llm = ChatOllama(
    model = executor_llm_name,
    temperature=0,
    base_url="http://ollama:11434"
).bind_tools(tools, tool_choice="any")