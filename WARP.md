# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

DALL-A is a multi-agent AI system that combines a Next.js frontend with a FastAPI backend, utilizing LangGraph for agent orchestration. The system features a reasoning-executor architecture with tool integration for complex task execution.

## Development Commands

### Frontend (Next.js)
```bash
# Development server with Turbopack
pnpm dev
# or from project root
pnpm dev

# Build production
pnpm build

# Start production server
pnpm start

# Lint
pnpm lint
```

### Backend (Python/FastAPI)
```bash
# From backend directory
cd backend
python -m pip install -r requirements.txt
python main.py

# Development server (if using the npm script)
cd backend
npm run dev
```

### Docker Environment
```bash
# Start all services
docker-compose up

# Build and start specific service
docker-compose up --build frontend
docker-compose up --build backend
```

### Testing Individual Components
```bash
# Test single API endpoint
curl -X POST http://localhost:5175/start \
  -H "Content-Type: application/json" \
  -d '{"thread_id": "test-123", "message": "Hello"}'

# Test frontend development server
curl http://localhost:3000
```

## Architecture Overview

### Multi-Agent System
The core system implements a reasoning-executor pattern using LangGraph:

1. **Reasoning Node** (`backend/src/nodes/reasoning.py`) - Plans tasks and creates execution strategies
2. **Executor Node** (`backend/src/nodes/executor.py`) - Executes individual steps with tool calls
3. **Tool Node** (`backend/src/nodes/tool.py`) - Handles tool execution and human feedback

### Backend Architecture
- **FastAPI Server** (`backend/main.py`) - Streams LangGraph execution via Server-Sent Events
- **LangGraph State Management** - Uses Redis for persistent conversation state
- **LLM Integration** - NVIDIA API for reasoning, Ollama for execution
- **Tool System** - Structured tools with human approval workflows

### Frontend Architecture  
- **Next.js 15** with App Router and React 19
- **Real-time Communication** - Event streaming via `@microsoft/fetch-event-source`
- **Dual Interface** - Chat interface (`/chat`) and resume builder components
- **State Management** - React hooks with streaming message handling

### Key Data Flows
1. User message → Backend `/start` endpoint → LangGraph reasoning → Tool execution → Streamed response
2. Human feedback → Backend `/continue` endpoint → Executor node → Updated state
3. Conversation persistence via Redis checkpointing with thread IDs

### Service Dependencies
- **Redis** - State persistence and checkpointing
- **Ollama** - Local LLM serving (qwen3:1.7b for execution)
- **NVIDIA API** - Cloud LLM for reasoning (deepseek-r1)
- **Next.js** - Frontend with API routes for additional features

## Critical File Locations

### Backend Core
- `backend/src/graph/graph.py` - LangGraph state machine definition
- `backend/src/models/graph_state.py` - State schema and types
- `backend/src/nodes/` - Agent node implementations
- `backend/src/llms/executor_llm.py` - Tool-enabled LLM configuration

### Frontend Core  
- `frontend/src/app/chat/page.jsx` - Main agent interface
- `frontend/src/app/api/` - Next.js API routes
- `frontend/src/app/components/` - Reusable UI components

### Configuration
- `docker-compose.yml` - Multi-service orchestration
- `backend/requirements.txt` - Python dependencies
- `frontend/package.json` - Node.js dependencies and scripts

## Environment Setup

Requires environment variables:
- `NVIDIA_KEY` - For reasoning LLM API access
- `REDIS_URL` - Redis connection (defaults to `redis://redis:6379`)
- Various API keys for resume-related features

The system expects Ollama running on `host.docker.internal:11434` for executor LLM access.

## Development Workflow

1. **Local Development**: Run services independently or via Docker Compose
2. **Agent Testing**: Use `/chat` interface for multi-turn conversations
3. **State Inspection**: Monitor Redis for conversation persistence
4. **Tool Development**: Add tools to `backend/src/tools/` with approval workflows
5. **Frontend Features**: Extend API routes in `frontend/src/app/api/`
