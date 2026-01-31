"""
FastAPI server for the Help Bot RAG service.
With rate limiting and optimized for fast responses.
"""
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from config import HOST, PORT
from rag_service import get_rag_service


# Rate limiter - uses IP address as key
limiter = Limiter(key_func=get_remote_address)


# Request/Response models
class QueryRequest(BaseModel):
    question: str


class QueryResponse(BaseModel):
    answer: str
    sources: list


class HealthResponse(BaseModel):
    status: str
    model: str
    ready: bool


# Initialize at startup for faster first query
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize RAG service on startup."""
    print("Starting Help Bot service...")
    rag = get_rag_service()
    # Initialize synchronously at startup
    rag.initialize()
    print("Help Bot ready!")
    yield
    print("Shutting down Help Bot service...")


# Create FastAPI app
app = FastAPI(
    title="Help Bot RAG Service",
    description="Fast RAG-based help bot with rate limiting",
    version="1.0.0",
    lifespan=lifespan
)

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Check service health."""
    rag = get_rag_service()
    return HealthResponse(
        status="healthy" if rag._initialized else "initializing",
        model="mistral",
        ready=rag._initialized
    )


@app.post("/query", response_model=QueryResponse)
@limiter.limit("10/minute")  # 10 requests per minute per IP
async def query_help_bot(request: Request, body: QueryRequest):
    """
    Query the help bot.

    Rate limit: 10 requests per minute per IP address.
    """
    rag = get_rag_service()

    if not rag._initialized:
        raise HTTPException(status_code=503, detail="Service initializing, please wait...")

    try:
        # Run in thread pool to not block event loop
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, rag.query, body.question)
        return QueryResponse(answer=result["answer"], sources=result["sources"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/search")
@limiter.limit("20/minute")  # 20 requests per minute per IP
async def search_documents(request: Request, query: str, k: int = 3):
    """
    Fast search without LLM generation.

    Rate limit: 20 requests per minute per IP address.
    """
    rag = get_rag_service()

    if not rag._initialized:
        raise HTTPException(status_code=503, detail="Service initializing...")

    try:
        loop = asyncio.get_event_loop()
        results = await loop.run_in_executor(None, rag.get_similar_documents, query, k)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/rebuild-index")
@limiter.limit("1/hour")  # 1 request per hour per IP
async def rebuild_index(request: Request):
    """
    Rebuild vector store.

    Rate limit: 1 request per hour per IP address.
    """
    rag = get_rag_service()
    try:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, rag.rebuild_index)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/rate-limit-status")
async def rate_limit_status(request: Request):
    """Check current rate limit status."""
    return {
        "endpoints": {
            "/query": "10 requests/minute",
            "/search": "20 requests/minute",
            "/rebuild-index": "1 request/hour"
        },
        "client_ip": get_remote_address(request)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=HOST, port=PORT)
