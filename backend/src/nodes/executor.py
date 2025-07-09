from src.models import State
from src.llms import executor_llm
from src.prompts import executor_llm_system_prompt
from src.utils.formatters import format_executor_notes
from langgraph.config import get_stream_writer

async def executor_node(state: State):

    writer = get_stream_writer()
    def write(message, type="text"):
        writer({type: message})
    
    write("\n" + "="*60)
    write("⚡ EXECUTOR AGENT ACTIVATED")
    write("="*60)
    
    new_state = state.copy()
    executor_notes = new_state.get("executor_notes", [])
    

    if new_state.get("last_feedback"):
        write(f"💬 Processing feedback: {new_state['last_feedback']}")
        if new_state["last_feedback"] == "abort":
            write("🛑 Task aborted by user feedback")
            write("="*60)
            return new_state
        elif executor_notes and (executor_notes[-1].get("status") == "approved" or executor_notes[-1].get("human_feedback") == "skip"):
            write("✅ Previous step approved/skipped, moving to next step")
            new_state["current_step"] = None
            new_state["last_feedback"] = None
    
    if not new_state.get("current_step") and new_state.get("plan"):
        plan = new_state["plan"].copy() if new_state["plan"] else []
        if plan:
            new_state["current_step"] = plan.pop(0)
            new_state["plan"] = plan
            write(f"📋 Next step selected: {new_state['current_step']}")
            write(f"📊 Remaining steps: {len(new_state['plan'])}")
        else:
            write("📋 No more steps in plan")
    

    if new_state.get("current_step"):
        write(f"🎯 Executing: {new_state['current_step']}")
        
        context = {
            "executor_notes": format_executor_notes(executor_notes),
            "human_feedback": new_state.get("last_feedback", ""),
            "current_task": new_state["current_step"]
        }
        
        context_messages = [
            {"role": "system", "content": executor_llm_system_prompt},
            {"role": "user", "content": """
Execute the current task. Use the provided tools to complete this specific step.
Human Feedback: {human_feedback}
Past executions: {executor_notes}
Current Task: {current_task}
Please make the appropriate tool call to complete this task.
            """.format(**context)
            }
        ]
        
        write("🔄 Calling executor LLM...")
        message = await executor_llm.ainvoke(context_messages)        
        new_state["messages"] = [message]
        
        write("✅ Executor response generated")
        write("="*60)
        return new_state
    

    write("🎉 No current step found - marking task as complete")
    new_state["task_complete"] = True
    write("="*60)
    return new_state