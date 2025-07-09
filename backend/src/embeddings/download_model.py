import os
from huggingface_hub import hf_hub_download

current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_dir, "model")

repo_id = "tomaarsen/static-similarity-mrl-multilingual-v1"
files_to_download = [
    "config_sentence_transformers.json",
    "modules.json",
    "README.md",
    "0_StaticEmbedding/model.safetensors",
    "0_StaticEmbedding/tokenizer.json",
]


for file_path in files_to_download:
    hf_hub_download(
        repo_id=repo_id,
        filename=file_path,
        local_dir=model_path
    )