"""
Configuration settings for the Explain Like I'm 10 API
"""
import os
from langchain_ollama import OllamaLLM

# Audio settings
AUDIO_DIR = "audio"

# LLM settings
LLM_MODEL = "llama3.1:8b"
LLM_TEMPERATURE = 0

# Initialize LLM
llm = OllamaLLM(
    model=LLM_MODEL,
    temperature=LLM_TEMPERATURE
)

# CORS settings
CORS_ORIGINS = ["*"]
CORS_CREDENTIALS = True
CORS_METHODS = ["*"]
CORS_HEADERS = ["*"]
CORS_EXPOSE_HEADERS = ["*"]
