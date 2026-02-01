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






import os
import re
import json
import ollama  # Assuming ollama Python client is installed: pip install ollama
from typing import Dict, List, Any

# Configuration
OLLAMA_MODEL = 'gpt-oss:20b'  # Your local model
PROJECT_DIR = '/path/to/your/c/project'  # TODO: Set this to your actual project directory
MAX_DEPTH = 10
MAX_STEPS = 100
TARGET_FUNC = 'mpf_mfs_open'  # TODO: Customize
TARGET_ARG_POS = 3  # 1-based index for the required_argument

# Helper to shorten text
def shorten(text: str, max_len: int = 1000) -> str:
    return text[:max_len] + '...' if len(text) > max_len else text

# Tool implementations
def tool_list_project_files(filter_keyword: str = '') -> List[str]:
    """List .c and .h files in PROJECT_DIR matching filter_keyword."""
    files = []
    for root, _, filenames in os.walk(PROJECT_DIR):
        for fname in filenames:
            if fname.endswith(('.c', '.h')) and filter_keyword in fname:
                files.append(os.path.relpath(os.path.join(root, fname), PROJECT_DIR))
    return files

def tool_find_definition(symbol_name: str) -> Dict[str, Any]:
    """Search for symbol definition across files. Returns {'file': str, 'is_c': bool, 'function_name': str or None, 'line': int or None}"""
    # Simple grep-based search; assumes definition like 'type symbol(...) {' or '#define symbol'
    for root, _, filenames in os.walk(PROJECT_DIR):
        for fname in filenames:
            if not fname.endswith(('.c', '.h')): continue
            full_path = os.path.join(root, fname)
            with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
                for i, line in enumerate(lines, 1):
                    if re.search(r'\b' + re.escape(symbol_name) + r'\s*\(', line):  # Rough function def/decl
                        is_c = fname.endswith('.c')
                        return {
                            'file': os.path.relpath(full_path, PROJECT_DIR),
                            'is_c': is_c,
                            'function_name': symbol_name if is_c else None,
                            'line': i if not is_c else None
                        }
    return {'error': f'Symbol {symbol_name} not found'}

def tool_read_file_content(file_name: str, function_name: str = None, line_number: int = None) -> str:
    """Read content: for .c, extract function body; for .h, 20 lines around line_number."""
    full_path = os.path.join(PROJECT_DIR, file_name)
    if not os.path.exists(full_path):
        return f'Error: File {file_name} not found'
    
    with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()
    
    if file_name.endswith('.c'):
        if not function_name:
            return 'Error: function_name required for .c files'
        # Extract function body roughly
        in_func = False
        body = []
        brace_count = 0
        for line in lines:
            if not in_func and re.search(r'\b' + re.escape(function_name) + r'\s*\(', line):
                in_func = True
                body.append(line)
            if in_func:
                body.append(line)
                brace_count += line.count('{') - line.count('}')
                if brace_count == 0 and '{' in ''.join(body):
                    break
        return ''.join(body) if body else 'Error: Function not found'
    
    elif file_name.endswith('.h'):
        if not line_number:
            return 'Error: line_number required for .h files'
        start = max(0, line_number - 11)  # 10 lines before + line + 10 after = ~20
        end = min(len(lines), line_number + 10)
        return ''.join(lines[start:end])
    
    return 'Error: Unsupported file type'

# Helper to extract callees from code text (rough regex)
def extract_callees(code: str) -> List[str]:
    """Find potential function calls."""
    calls = re.findall(r'\b(\w+)\s*\(', code)
    return list(set(c for c in calls if c not in ['if', 'while', 'for', 'switch', 'return']))  # Filter keywords

# Helper to find target calls and extract arg (rough)
def find_target_hits(code: str, target_func: str, arg_pos: int) -> List[Dict]:
    """Scan for calls to target_func and extract arg at pos."""
    hits = []
    lines = code.splitlines()
    for i, line in enumerate(lines, 1):
        if re.search(r'\b' + re.escape(target_func) + r'\s*\(', line):
            # Extract args roughly: split by , outside quotes/parens
            arg_str = re.search(r'\(\s*(.*?)\s*\)', line)
            if arg_str:
                args = re.split(r'\s*,\s*', arg_str.group(1))
                if len(args) >= arg_pos:
                    hits.append({'line': i, 'arg_expr': args[arg_pos - 1]})
    return hits

# Parse LLM response (assuming structured tags)
def parse_response(response: str) -> Dict:
    """Parse <reasoning>, <action>, etc."""
    parsed = {'has_tool_call': False}
    try:
        reasoning = re.search(r'<reasoning>(.*?)</reasoning>', response, re.DOTALL).group(1).strip()
        action = re.search(r'<action>(.*?)</action>', response, re.DOTALL).group(1).strip()
        if action == 'tool':
            parsed['has_tool_call'] = True
            tool_name = re.search(r'<tool_name>(.*?)</tool_name>', response, re.DOTALL).group(1).strip()
            args_json = re.search(r'<tool_args_json>(.*?)</tool_args_json>', response, re.DOTALL).group(1).strip()
            parsed['tool'] = (tool_name, json.loads(args_json))
        parsed['callees'] = json.loads(re.search(r'<discovered_callees>(.*?)</discovered_callees>', response, re.DOTALL).group(1).strip())
        parsed['target_hits'] = json.loads(re.search(r'<target_hits>(.*?)</target_hits>', response, re.DOTALL).group(1).strip())
        parsed['state_update'] = re.search(r'<state_update>(.*?)</state_update>', response, re.DOTALL).group(1).strip()
    except AttributeError:
        parsed['error'] = 'Invalid response format'
    return parsed

# Main state
state: Dict[str, Any] = {
    'target_func': TARGET_FUNC,
    'target_arg_pos': TARGET_ARG_POS,
    'file_index': {},  # symbol -> tool_find_definition result
    'function_bodies': {},  # func -> cached body
    'call_graph': {},  # func -> [callees]
    'target_occurrences': [],  # [{'path': list, 'file': str, 'line': int, 'arg_expr': str}]
    'work_stack': [],  # [{'func': str, 'path': list[str], 'depth': int}]
    'known_functions': set(),
    'summary': 'Starting trace from main. No target hits yet.',
    'recent_tool_output': None
}

# Bootstrap: Assume we know files, find main
files = tool_list_project_files()
main_def = tool_find_definition('main')
if 'error' in main_def:
    raise ValueError('Main not found')
state['file_index']['main'] = main_def
state['work_stack'].append({'func': 'main', 'path': [], 'depth': 0})

# Agent loop
steps = 0
while state['work_stack'] and steps < MAX_STEPS:
    current = state['work_stack'].pop()  # DFS
    func = current['func']
    path = current['path']
    depth = current['depth']

    if func in state['known_functions'] or depth > MAX_DEPTH:
        continue

    # Build prompt
    prompt = f"""You are tracing calls from 'main' toward '{state["target_func"]}' in a C project.
Current function to analyze: {func}
Call path so far: {' -> '.join(path + [func])}
Progress summary: {state["summary"]}
Recent tool output: {shorten(str(state["recent_tool_output"]) if state["recent_tool_output"] else "None")}

Goal: Find calls from this function, especially to '{state["target_func"]}'. If found, extract exact argument expression at position {state["target_arg_pos"]} (1-based, raw as in code).

You have only 3 tools:
- list_project_files(filter_keyword?: str) -> list[str]
- find_definition(symbol_name: str) -> dict with file, etc.
- read_file_content(file_name: str, function_name?: str, line_number?: int) -> str

Rules:
- ALWAYS use find_definition before read_file_content.
- For read_file_content: Use function_name for .c, line_number for .h.
- Never guess files/locations.
- From function body, list discovered callees (function names called).
- For target calls, list hits with line and arg_expr.

Output ONLY in tags:
<reasoning>Short plan</reasoning>
<action>tool | none</action>
<tool_name>if tool</tool_name>
<tool_args_json>{{"symbol_name": "foo"}} example</tool_args_json>
<discovered_callees>["foo", "bar"]</discovered_callees>
<target_hits>[{{"line": 42, "arg_expr": "value"}}]</target_hits>
<state_update>One sentence update</state_update>
"""

    # Call LLM
    response = ollama.generate(model=OLLAMA_MODEL, prompt=prompt)['response']  # Adjust if ollama API differs

    # Parse
    parsed = parse_response(response)
    if 'error' in parsed:
        print(f'Parse error: {parsed["error"]}')
        continue

    if parsed['has_tool_call']:
        tool_name, args = parsed['tool']
        if tool_name == 'list_project_files':
            result = tool_list_project_files(args.get('filter_keyword', ''))
        elif tool_name == 'find_definition':
            result = tool_find_definition(args['symbol_name'])
            state['file_index'][args['symbol_name']] = result
        elif tool_name == 'read_file_content':
            result = tool_read_file_content(
                args['file_name'],
                args.get('function_name'),
                args.get('line_number')
            )
            # Cache body if .c
            if args.get('function_name'):
                state['function_bodies'][func] = result
                # Wrapper-assisted extraction
                callees = extract_callees(result)
                state['call_graph'].setdefault(func, []).extend(callees)
                hits = find_target_hits(result, state['target_func'], state['target_arg_pos'])
                for hit in hits:
                    state['target_occurrences'].append({
                        'path': path + [func],
                        'file': args['file_name'],
                        'line': hit['line'],
                        'arg_expr': hit['arg_expr']
                    })
        else:
            result = 'Unknown tool'
        state['recent_tool_output'] = result
    else:
        # No tool: Use LLM's discovered
        for callee in parsed['callees']:
            if callee not in state['known_functions']:
                state['work_stack'].append({
                    'func': callee,
                    'path': path + [func],
                    'depth': depth + 1
                })

    state['summary'] += '\n' + parsed['state_update']
    state['known_functions'].add(func)
    steps += 1

# Final report
print('Tracing complete.')
print('Target occurrences:')
for occ in state['target_occurrences']:
    print(f"Path: {' -> '.join(occ['path'])} -> {state['target_func']}")
    print(f"File: {occ['file']}, Line: {occ['line']}, Arg: {occ['arg_expr']}")
    print('---')