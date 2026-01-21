import os
import re
import json
from typing import List, Dict, Optional
# Assuming you have an OpenAI-compatible API for your local model (e.g., via ollama or vLLM).
# If using ollama, install it and run 'ollama serve', then use ollama library.
# Here, I'll use openai library with base_url for local inference.
from openai import OpenAI

# Placeholder for your tools. Implement these based on your description.
def list_project_files(filter_keyword: Optional[str] = None) -> List[str]:
    # Implement: Return list of .c and .h files in project dir.
    # For demo, assume a project dir.
    project_dir = "/path/to/your/c/project"  # Replace with actual path
    files = [os.path.join(project_dir, f) for f in os.listdir(project_dir) if f.endswith(('.c', '.h'))]
    if filter_keyword:
        files = [f for f in files if filter_keyword in f]
    return files

def read_file_content(file_path: str, function_name: Optional[str] = None) -> str:
    # Implement: Read file content, optionally extract function body.
    with open(file_path, 'r') as f:
        content = f.read()
    if function_name and file_path.endswith('.c'):
        # Simple regex to extract function body (improve with AST if needed).
        pattern = rf"(?:[\w\s\*]+)\s+{re.escape(function_name)}\s*\([^)]*\)\s*\{{(.*?)\}}\s*(?=\w|$)"
        match = re.search(pattern, content, re.DOTALL | re.MULTILINE)
        return match.group(1).strip() if match else ""
    return content

def find_definition(symbol: str) -> Dict[str, Optional[any]]:
    # Implement: Search all files for definition, return {'file_path': str, 'line': int}
    # For demo, dummy return.
    return {'file_path': '/path/to/file.c', 'line': 42}

def lookup_function_reference(function_name: str) -> Dict[str, any]:
    # Implement: Load from .pkl, return prototype dict.
    # For demo.
    if function_name == 'mpf_mfs_open':
        return {'prototype': 'int mpf_mfs_open(char* path, int mode, int file_num)'}
    return {}

# System prompt for the LLM.
SYSTEM_PROMPT = """
You are an AI code crawler analyzing a C codebase. Your goal: Start from the main() function in the main file (assume it's main.c). Recursively trace all function calls reachable from main(). For each call to mpf_mfs_open(), determine the value of the 3rd argument (file number).

Rules:
- ALWAYS start from main(). Do not analyze unrelated functions.
- Traverse recursively: For each function call in the current function, find its definition and repeat.
- Only consider code paths reachable from main (ignore dead code).
- To resolve arguments: If the 3rd arg is a literal, note it. If a variable/macro, trace its definition/value using tools.
- No hallucinations: Base EVERY claim on tool outputs. If unsure, use tools to verify.
- Output format: JSON list of {"file": str, "line": int, "third_arg_value": str} for each mpf_mfs_open call. If none, empty list.

Tools:
- list_project_files(filter_keyword): List files.
- read_file_content(file_path, function_name): Read file or function body.
- find_definition(symbol): Get {'file_path': str, 'line': int}.
- lookup_function_reference(function_name): Get prototype.

Step-by-step:
1. Find main.c using list_project_files('main').
2. Read main() using read_file_content(main_path, 'main').
3. Parse calls in body.
4. For each call, find definition, read its body, recurse.
5. In each body, look for mpf_mfs_open calls, extract 3rd arg.

In each response, output JSON: {"reasoning": str, "action": {"tool": str, "args": dict}, "state_update": dict} or {"final_results": list} if done.
"""

class CodeCrawlerAgent:
    def __init__(self, model_endpoint: str = "http://localhost:8000/v1", model_name: str = "gpt-oss:20b"):
        self.client = OpenAI(base_url=model_endpoint, api_key="dummy")  # Adjust for your local setup.
        self.model = model_name
        self.state = {
            "call_graph": {},  # func_name: {"file": str, "line": int, "calls": list, "parent": str}
            "visited": set(),
            "results": [],  # list of dicts for mpf_mfs_open calls
            "current_func": "main",
            "depth": 0,
            "max_depth": 10
        }

    def run(self) -> List[Dict[str, any]]:
        while True:
            if self.state["depth"] > self.state["max_depth"] or not self.state.get("current_func"):
                break
            response = self._query_llm()
            if "final_results" in response:
                self.state["results"] = response["final_results"]
                break
            self._process_action(response)
        return self.state["results"]

    def _query_llm(self) -> Dict[str, any]:
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": json.dumps(self.state)}
        ]
        completion = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            response_format={"type": "json_object"}
        )
        return json.loads(completion.choices[0].message.content)

    def _process_action(self, response: Dict[str, any]):
        if "action" in response:
            tool = response["action"]["tool"]
            args = response["action"]["args"]
            if tool == "list_project_files":
                result = list_project_files(**args)
            elif tool == "read_file_content":
                result = read_file_content(**args)
            elif tool == "find_definition":
                result = find_definition(**args)
            elif tool == "lookup_function_reference":
                result = lookup_function_reference(**args)
            else:
                result = "Unknown tool"
            # Update state with result and any state_update from LLM.
            self.state["last_tool_result"] = result
            self.state.update(response.get("state_update", {}))
        if "reasoning" in response:
            print(response["reasoning"])  # For debugging.

# Usage
agent = CodeCrawlerAgent(model_endpoint="your_local_endpoint", model_name="gpt-oss:20b")
results = agent.run()
print("Final results:", results)