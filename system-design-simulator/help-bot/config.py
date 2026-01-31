"""
Configuration for the Help Bot RAG service.
Optimized for fast responses.
"""
import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).parent
DOCS_DIR = BASE_DIR / "docs"
VECTOR_STORE_DIR = BASE_DIR / "vector_store"

# Embedding model (all-MiniLM-L6-v2 is small and fast)
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

# Ollama settings - OPTIMIZED FOR SPEED
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("HELP_BOT_MODEL", "mistral")

# LLM generation settings - OPTIMIZED FOR SPEED
LLM_NUM_PREDICT = 256      # Shorter responses = faster
LLM_NUM_CTX = 1024         # Smaller context window
LLM_TEMPERATURE = 0.1      # Lower = more deterministic & faster
LLM_TOP_K = 10             # Limit token sampling
LLM_TOP_P = 0.5            # Nucleus sampling threshold
LLM_REPEAT_PENALTY = 1.1   # Slight penalty to avoid loops

# RAG settings - OPTIMIZED FOR SPEED
CHUNK_SIZE = 300           # Smaller chunks
CHUNK_OVERLAP = 30         # Less overlap
TOP_K_RESULTS = 2          # Fewer documents = faster

# Server settings
HOST = os.getenv("HELP_BOT_HOST", "0.0.0.0")
PORT = int(os.getenv("HELP_BOT_PORT", "8001"))
