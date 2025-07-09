import os
from sentence_transformers import SentenceTransformer

current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_dir, "model")

model = SentenceTransformer(model_path, device='cpu', local_files_only=True)