from src.models import State
from langgraph.config import get_stream_writer
from langgraph.graph import StateGraph, START, END
from src.nodes import reasoning_node, executor_node, tool_node

def reasoning_condition(state: State):

    writer = get_stream_writer()
    def write(message, type="text"):
        writer({type: message})

    write("\n🔀 ROUTING DECISION FROM REASONING NODE")
    if state.get("task_complete", False):
        write("➡️  Task complete - routing to END", "end")
        return END
    write("➡️  Task not complete - routing to EXECUTOR")
    return "executor_node"

def executor_condition(state: State):

    writer = get_stream_writer()
    def write(message, type="text"):
        writer({type: message})

    write("\n🔀 ROUTING DECISION FROM EXECUTOR NODE")
    
    if state.get("last_feedback") == "abort":
        write("➡️  Abort feedback received - routing to END", "end")
        return END
    
    if state.get("task_complete", False):
        write("➡️  Task complete - routing to END", "end")
        return END
    
    if state["messages"]:
        last_message = state["messages"][-1]
        has_tool_calls = False
        if isinstance(last_message, dict):
            has_tool_calls = bool(last_message.get('tool_calls'))
        else:
            has_tool_calls = bool(getattr(last_message, 'tool_calls', None))
        
        if has_tool_calls:
            write("➡️  Tool calls detected - routing to TOOLS")
            return "tools"
    
    if state.get("current_step") or state.get("plan"):
        write("➡️  More steps to execute - routing back to EXECUTOR")
        return "executor_node"
    
    write("➡️  No more steps - routing to REASONING")
    return "reasoning_node"

def build_graph(checkpointer):
    print("🔗 Building state graph...")
    graph_builder = StateGraph(State)
    graph_builder.add_node("reasoning_node", reasoning_node)
    graph_builder.add_node("executor_node", executor_node)
    graph_builder.add_node("tools", tool_node)
    graph_builder.add_edge(START, "reasoning_node")

    graph_builder.add_conditional_edges("reasoning_node", reasoning_condition)
    graph_builder.add_conditional_edges("executor_node", executor_condition)
    graph_builder.add_edge("tools", "executor_node")
    
    graph = graph_builder.compile(checkpointer=checkpointer)
    return graph