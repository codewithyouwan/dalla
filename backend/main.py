import os
import json
from dotenv import load_dotenv
from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from langchain_core.messages import HumanMessage
from langgraph.types import Command
from langgraph.checkpoint.redis import AsyncRedisSaver
from src.graph import build_graph

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()
DB_URI = os.getenv("REDIS_URL", "redis://redis:6379")

async def init_checkpointer():
    async with AsyncRedisSaver.from_conn_string(DB_URI) as checkpointer:
        await checkpointer.asetup()
        return checkpointer

@app.on_event("startup")
async def startup_event():
    global graph
    checkpointer = await init_checkpointer()
    graph = build_graph(checkpointer)

async def stream_graph(input, config):
    """Async generator to stream graph chunks"""
    async for chunk in graph.astream(
        input,
        config,
        stream_mode="custom",
    ):
        yield f"data: {json.dumps(chunk)}\n\n"

@app.post("/start")
async def start_graph(
    thread_id: str = Body(..., embed=True),
    message: str = Body(..., embed=True)
):
    config = {"configurable": {"thread_id": thread_id}}
    input_data = {"messages": [HumanMessage(content=message)]}
    
    return StreamingResponse(
        stream_graph(input_data, config),
        media_type="text/event-stream"
    )

@app.post("/continue")
async def continue_graph(
    thread_id: str = Body(..., embed=True),
    command_data: str = Body(..., embed=True)
):
    config = {"configurable": {"thread_id": thread_id}}
    input_data = Command(resume={"data": command_data})
    
    return StreamingResponse(
        stream_graph(input_data, config),
        media_type="text/event-stream"
    )