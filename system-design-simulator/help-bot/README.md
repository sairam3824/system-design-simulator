# Help Bot RAG Service

A RAG (Retrieval Augmented Generation) based help bot for the System Design Simulator.

## Architecture

- **Embeddings**: all-MiniLM-L6-v2 (via sentence-transformers)
- **Vector Store**: FAISS (local file-based)
- **LLM**: Mistral (via Ollama)
- **Framework**: LangChain
- **API**: FastAPI

## Prerequisites

1. **Python 3.9+** installed
2. **Ollama** running with Mistral model:
   ```bash
   ollama pull mistral
   ollama serve
   ```

## Installation

1. Create a virtual environment:
   ```bash
   cd help-bot
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Service

```bash
python main.py
```

The service will start on `http://localhost:8001`.

## API Endpoints

### Health Check
```
GET /health
```
Returns service status and initialization state.

### Query (Non-streaming)
```
POST /query
Content-Type: application/json

{
  "question": "How do I start an interview?"
}
```

### Query (Streaming)
```
POST /query/stream
Content-Type: application/json

{
  "question": "How do I start an interview?"
}
```

### Search Documents
```
POST /search
Content-Type: application/json

{
  "query": "interview scoring",
  "k": 4
}
```

### Rebuild Index
```
POST /rebuild-index
```
Call after updating documentation files.

## Documentation Files

Add markdown files to the `docs/` directory. The service will automatically index them.

Current documentation:
- `getting-started.md` - Basic usage guide
- `interviews.md` - Interview structure and scoring
- `topics.md` - Available interview topics
- `analytics.md` - Performance tracking
- `coding.md` - Coding challenges
- `resume.md` - Resume features
- `profile.md` - Profile management
- `troubleshooting.md` - Common issues
- `faq.md` - Frequently asked questions

## Configuration

Environment variables (optional):
- `OLLAMA_BASE_URL` - Ollama server URL (default: http://localhost:11434)
- `HELP_BOT_MODEL` - LLM model to use (default: mistral)
- `HELP_BOT_HOST` - Server host (default: 0.0.0.0)
- `HELP_BOT_PORT` - Server port (default: 8001)

## Adding New Documentation

1. Add a new `.md` file to the `docs/` directory
2. Call the rebuild endpoint: `POST /rebuild-index`
3. The new content will be indexed and available for queries

## Troubleshooting

### Service not starting
- Ensure Ollama is running: `ollama serve`
- Check if Mistral is installed: `ollama list`

### Slow first query
- The first query initializes the embedding model and vector store
- Subsequent queries will be faster

### Out of memory
- The embedding model requires ~500MB RAM
- Reduce `TOP_K_RESULTS` in config.py if needed
