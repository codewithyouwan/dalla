import os
import re

class MakefileContext:
    def __init__(self):
        # 1. Start with System Environment Variables
        # This solves the "ab = $(some_var)/.." requirement
        self.vars = dict(os.environ)
        self.include_dirs = []
        self.sources = []

    def resolve_string(self, raw_str):
        """
        Recursively resolves $(VAR) or ${VAR} in a string.
        """
        if not raw_str:
            return ""
            
        # Regex to find $(VAR) or ${VAR}
        var_pattern = re.compile(r'\$[({]([a-zA-Z0-9_]+)[)}]')
        
        resolved = raw_str
        # Keep resolving until no more variables are found (handles nested vars)
        while True:
            match = var_pattern.search(resolved)
            if not match:
                break
            
            var_name = match.group(1)
            # Get value from our state, default to empty string if not found
            var_value = self.vars.get(var_name, "")
            
            # Replace the *first* occurrence
            # (We reconstruct the string to avoid infinite loops if value contains key)
            start, end = match.span()
            resolved = resolved[:start] + var_value + resolved[end:]
            
        return resolved

    def parse_file(self, filepath):
        """
        Parses a Makefile line by line, handling includes recursively.
        """
        if not os.path.exists(filepath):
            print(f"Warning: Makefile not found: {filepath}")
            return

        print(f"Parsing: {filepath}")
        
        with open(filepath, 'r', errors='ignore') as f:
            lines = f.readlines()

        for line in lines:
            line = line.strip()
            # Skip comments
            if line.startswith('#') or not line:
                continue

            # --- CASE 1: Variable Definition (e.g., ab = $(some_var)/..) ---
            # Matches "KEY = VALUE" or "KEY := VALUE" or "KEY += VALUE"
            assign_match = re.match(r'^([a-zA-Z0-9_]+)\s*(\??:?|\+?)=\s*(.*)', line)
            if assign_match:
                key = assign_match.group(1)
                operator = assign_match.group(2)
                raw_value = assign_match.group(3)
                
                # Resolve the value immediately using current knowledge
                resolved_value = self.resolve_string(raw_value)
                
                if operator == '+=':
                    # Append to existing
                    existing = self.vars.get(key, "")
                    self.vars[key] = f"{existing} {resolved_value}".strip()
                else:
                    # Overwrite (=, :=)
                    self.vars[key] = resolved_value
                continue

            # --- CASE 2: Include Directive (e.g., include $(ab)/common.mk) ---
            include_match = re.match(r'^include\s+(.+)', line)
            if include_match:
                raw_path = include_match.group(1)
                # Resolve the path (this handles the $(ab) part)
                resolved_path = self.resolve_string(raw_path)
                
                # Handle relative paths (relative to current file's directory?)
                # Usually Makefiles resolve relative to CWD, but let's check strict path first
                if not os.path.isabs(resolved_path):
                    # Try resolving relative to the file being parsed
                    current_dir = os.path.dirname(filepath)
                    potential_path = os.path.join(current_dir, resolved_path)
                    if os.path.exists(potential_path):
                        resolved_path = potential_path
                
                # RECURSIVE CALL
                self.parse_file(resolved_path)
                continue

    def extract_build_info(self):
        """
        Post-parsing: extract INCLUDE and SRCS specifically.
        """
        # 1. Extract Include Paths (looking for INCLUDE variable)
        raw_includes = self.vars.get("INCLUDE", "")
        # Split by whitespace
        tokens = raw_includes.split()
        for token in tokens:
            if token.startswith("-I"):
                path = token[2:] # Remove -I
                self.include_dirs.append(os.path.normpath(path))
        
        # 2. Extract Source Files (looking for SRCS variable)
        # Some Makefiles use SRCS, others SOURCES, others OBJS
        # We'll look for SRCS as requested
        raw_srcs = self.vars.get("SRCS", "")
        self.sources = raw_srcs.split()

        return {
            "includes": list(set(self.include_dirs)), # Unique
            "sources": self.sources,
            "home": self.vars.get("HOME", "Not Found")
        }

# --- USAGE SCRIPT ---
if __name__ == "__main__":
    # Mocking a system env var for testing (in real usage, this exists in OS)
    os.environ["MY_SYSTEM_LIB"] = "/usr/local/lib"

    # Assume we are pointing to the user's project Makefile
    # /home/seigyo/c_repo/c_repo/src/rbt001/Makefile
    project_makefile = "Makefile" 
    
    # Create Context
    ctx = MakefileContext()
    
    # Run Parser
    # This will:
    # 1. Load os.environ
    # 2. Parse Makefile
    # 3. Hit 'ab = $(MY_SYSTEM_LIB)/..' -> Resolve it
    # 4. Hit 'include $(ab)/defs.mk' -> Recurse and load defs
    ctx.parse_file(project_makefile)
    
    # Get Result
    info = ctx.extract_build_info()
    
    print("--- PARSED INFO ---")
    print(f"HOME: {info['home']}")
    print(f"Includes: {info['includes']}")
    print(f"Sources: {info['sources']}")