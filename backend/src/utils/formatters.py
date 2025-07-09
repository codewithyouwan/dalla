import json
from typing import List, Dict

def format_executor_notes(executor_notes: List[Dict]) -> str:
    if not executor_notes:
        return "No previous tool executions."
    
    formatted_notes = []
    for i, note in enumerate(executor_notes, 1):
        note_text = f"Execution {i}:\n"
        note_text += f"  Tool: {note.get('tool_name', 'Unknown')}\n"
        note_text += f"  Input: {json.dumps(note.get('input', {}), indent=4)}\n"
        note_text += f"  Status: {note.get('status', 'Unknown')}\n"
        
        if note.get('result'):
            result = note['result']
            if isinstance(result, dict):
                result_str = json.dumps(result, indent=4, default=str)
            else:
                result_str = str(result)
            note_text += f"  Result: {result_str}\n"
        
        if note.get('human_feedback'):
            note_text += f"  Human Feedback: {note['human_feedback']}\n"
        
        if note.get('error'):
            note_text += f"  Error: {note['error']}\n"
        
        formatted_notes.append(note_text)
    
    return "\n".join(formatted_notes)