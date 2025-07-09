import json
import re
from src.models.reasoning_output import ReasoningOutput

def extract_json(text: str) -> str | None:
    """Extracts the first complete JSON object from the text based on matching braces."""
    start = text.find('{')
    if start == -1:
        return None
    
    count = 0
    for i in range(start, len(text)):
        if text[i] == '{':
            count += 1
        elif text[i] == '}':
            count -= 1
            if count == 0:
                return text[start:i + 1]
    return None

def parse_llm_output(llm_output: str) -> ReasoningOutput:
    """Parses LLM output by removing think blocks and extracting JSON."""
    no_think_blocks = re.sub(r'<think>.*?</think>', '', llm_output, flags=re.DOTALL)
    json_str = extract_json(no_think_blocks)
    if json_str is None:
        raise ValueError("No valid JSON found in LLM output")
    
    try:
        output_dict = json.loads(json_str)
        return ReasoningOutput(**output_dict)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON output from LLM: {e}")
    except Exception as e:
        raise ValueError(f"Failed to parse LLM output into ReasoningOutput: {e}")