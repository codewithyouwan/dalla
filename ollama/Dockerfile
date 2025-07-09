FROM gerke74/ollama-model-loader as downloader

RUN /ollama-pull qwen3:1.7b

FROM ollama/ollama:latest

ENV OLLAMA_HOST "0.0.0.0"

COPY --from=downloader /root/.ollama /root/.ollama

EXPOSE 11434