import json
from src.llms import tools_dict
from langgraph.config import get_stream_writer
from src.utils.formatters import format_executor_notes

async def tool_node(state: dict):

    writer = get_stream_writer()
    def write(message, type="text"):
        writer({type: message})
    
    write("\n" + "="*60)
    write("🔧 TOOL EXECUTION NODE")
    write("="*60)

    last_message = state["messages"][-1]

    tool_calls = getattr(last_message, 'tool_calls', None) or last_message.get('tool_calls', [])

    if not tool_calls:
        write("⚠️  No tool calls found in last message")
        write("="*60)
        return state

    write(f"🎯 Executing {len(tool_calls)} tool call(s)...")

    executor_notes = state.get("executor_notes", [])
    messages = state.get("messages", []).copy()

    results = []

    for i, call in enumerate(tool_calls, 1):
        tool_name = call.get("name") if isinstance(call, dict) else getattr(call, 'name', None)
        tool_args = call.get("args") if isinstance(call, dict) else getattr(call, 'args', {})

        write(f"\n🔧 Tool {i}/{len(tool_calls)}: {tool_name}")
        write(f"📥 Input: {json.dumps(tool_args, indent=2)}")

        tool = tools_dict.get(tool_name)
        if not tool:
            write(f"❌ Error: Tool {tool_name} not found")
            note = {
                "tool_name": tool_name,
                "input": tool_args,
                "result": None,
                "status": "error",
                "human_feedback": None,
                "error": f"Tool {tool_name} not found"
            }
            executor_notes.append(note)

            messages.append({
                "role": "tool",
                "content": f"Error: Tool {tool_name} not found",
                "tool_call_id": call.get("id") if isinstance(call, dict) else getattr(call, 'id', str(len(messages)))
            })
            results.append(None)
            continue

        write("⚙️  Executing tool...")
        result = await tool.ainvoke(tool_args)

        if tool_name == "request_executor_notes_access":
            if result.get("status", "") == "approved":
                write("✅ Access granted - Adding executor notes to state messages")

                notes_summary = format_executor_notes(executor_notes)
                messages.append({
                    "role": "system",
                    "content": f"EXECUTOR NOTES SHARED:\n{notes_summary}"
                })
            else:
                write("❌ Access denied - Reasoning node will proceed without execution history")
                messages.append({
                    "role": "system", 
                    "content": "EXECUTOR NOTES ACCESS DENIED: Reasoning node must create new plan without execution history"
                })

        note = {
            "tool_name": tool_name,
            "input": tool_args,
            "result": result,
            "status": result.get("status", "success"),
            "human_feedback": result.get("human_feedback"),
            "error": result.get("error")
        }

        executor_notes.append(note)

        tool_content = result.get("content") or result.get("tool_result") or str(result)
        messages.append({
            "role": "tool",
            "content": {
                    "input": tool_args,
                    "status": result.get("status", "success"),
                    "human_feedback": result.get("human_feedback"),
                    "error": result.get("error")
                },
            "tool_call_id": call.get("id") if isinstance(call, dict) else getattr(call, 'id', str(len(messages))),
            "tool_name": tool_name,
        })

        write(f"📤 Result: {result.get('status', 'success')}")
        if result.get('human_feedback'):
            write(f"💬 Human Feedback: {result.get('human_feedback')}")
        if result.get('error'):
            write(f"❌ Error: {result.get('error')}")

        results.append(result)

    updated_state = state.copy()
    updated_state["executor_notes"] = executor_notes
    updated_state["messages"] = messages

    if results and any(r is not None for r in results):
        last_successful_result = next((r for r in reversed(results) if r is not None), None)
        if last_successful_result:
            updated_state["last_feedback"] = last_successful_result.get("human_feedback")

    write(f"\n✅ All tools executed successfully!")
    write("="*60)

    return updated_state