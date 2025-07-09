import os
import json
import asyncio
from typing import Dict
from dotenv import load_dotenv
from threading import Thread
from src.utils import parse_llm_output
from langgraph.config import get_stream_writer
from src.prompts import reasoning_llm_system_prompt
from langchain_nvidia_ai_endpoints import ChatNVIDIA
from langchain_core.messages import HumanMessage, ToolMessage, AIMessage, SystemMessage

load_dotenv()
api_key = os.getenv("NVIDIA_KEY")

async def stream_tokens(messages: list[dict]):
    queue = asyncio.Queue()
    
    def sync_stream():
        client = ChatNVIDIA(
        model="deepseek-ai/deepseek-r1-distill-qwen-7b",
        api_key=api_key,
        temperature=0,
        max_tokens=4096,
        )

        for chunk in client.stream(messages):
            content = chunk.content or ""
            if content:
                queue.put_nowait(content)

        queue.put_nowait(None)

    
    thread = Thread(target=sync_stream)
    thread.start()
    
    while True:
        chunk = await queue.get()
        if chunk is None:
            break
        yield chunk
    
    thread.join()

async def reasoning_node(state: Dict):
    writer = get_stream_writer()
    def write(message, type="text"):
        writer({type: message})

    write("\n" + "="*60)
    write("🧠 REASONING AGENT ACTIVATED")
    write("="*60)
    write("📋 Analyzing task and creating execution plan...")
    
    all_messages = state["messages"] + [{"role": "system", "content": reasoning_llm_system_prompt}]

    def convert_message(m):
        if isinstance(m, dict):
            if "role" not in m or "content" not in m:
                raise ValueError(f"Invalid message dictionary: {m}")
            return {"role": m["role"], "content": m["content"]}
        else:
            if hasattr(m, 'content'):
                if isinstance(m, HumanMessage):
                    return {"role": "user", "content": m.content}
                elif isinstance(m, SystemMessage):
                    return {"role": "system", "content": m.content}
                elif isinstance(m, AIMessage):
                    return {"role": "assistant", "content": m.content}
                elif isinstance(m, ToolMessage):
                    return {"role": "tool", "content": m.content}
                else:
                    raise ValueError(f"Unsupported message type: {type(m)}")
            else:
                raise ValueError(f"Invalid message object: {m}")

    try:
        messages = [convert_message(m) for m in all_messages]
        
        write("🔄 Calling reasoning LLM...")
    
        full_response = ""
        async for chunk in stream_tokens(messages):
            write(chunk, "llm")
            full_response += chunk
        
        if not full_response:
            write("❌ Error: No content received from LLM")
            raise ValueError("No content received from LLM")
        
        try:
            parsed_response = parse_llm_output(full_response)
            
            state["plan"] = parsed_response.plan
            state["task_complete"] = parsed_response.taskcomplete
            state["current_step"] = ""
            state["last_feedback"] = ""
            state["executor_notes"] = []
    
            state["messages"] = state["messages"] + [
                {"role": "assistant", "content": parsed_response.content},
                {"role": "system", "content": f"Plan: {parsed_response.plan}"}
            ]

            write("✅ Reasoning complete!")
            write(f"📝 Response: {parsed_response.content}")
            write(f"📋 Generated Plan ({len(parsed_response.plan)} steps):")
            for i, step in enumerate(parsed_response.plan, 1):
                write(f"   {i}. {step}")
            write(f"🎯 Task Complete: {parsed_response.taskcomplete}")
            write("="*60)

            return state
        except json.JSONDecodeError as e:
            write(f"❌ Error: Invalid JSON output from LLM: {e}")
            write(f"📜 Problematic response: {full_response}")
            raise ValueError(f"Invalid JSON output from LLM: {e}")

    except Exception as e:
        write(f"❌ Error in reasoning_node: {e}")
        write("="*60)
        raise