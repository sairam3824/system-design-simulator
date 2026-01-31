"""
RAG Service using LangChain, FAISS, and local embeddings.
OPTIMIZED FOR FAST RESPONSES.
"""
from pathlib import Path
from typing import List, Optional

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_community.llms import Ollama
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

from config import (
    DOCS_DIR,
    VECTOR_STORE_DIR,
    EMBEDDING_MODEL,
    OLLAMA_BASE_URL,
    OLLAMA_MODEL,
    CHUNK_SIZE,
    CHUNK_OVERLAP,
    TOP_K_RESULTS,
    LLM_NUM_PREDICT,
    LLM_NUM_CTX,
    LLM_TEMPERATURE,
    LLM_TOP_K,
    LLM_TOP_P,
    LLM_REPEAT_PENALTY,
)


class HelpBotRAG:
    """RAG-based help bot - optimized for speed."""

    def __init__(self):
        self.embeddings = None
        self.vector_store = None
        self.llm = None
        self.qa_chain = None
        self._initialized = False

    def initialize(self):
        """Initialize the RAG components."""
        if self._initialized:
            return

        print("Initializing Help Bot RAG service...")

        # Initialize embeddings model
        print(f"Loading embedding model: {EMBEDDING_MODEL}")
        self.embeddings = HuggingFaceEmbeddings(
            model_name=EMBEDDING_MODEL,
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True}
        )

        # Load or create vector store
        if self._vector_store_exists():
            print("Loading existing vector store...")
            self.vector_store = FAISS.load_local(
                str(VECTOR_STORE_DIR),
                self.embeddings,
                allow_dangerous_deserialization=True
            )
        else:
            print("Creating new vector store from documents...")
            self._build_vector_store()

        # Initialize LLM with SPEED OPTIMIZATIONS
        print(f"Connecting to Ollama with model: {OLLAMA_MODEL}")
        self.llm = Ollama(
            base_url=OLLAMA_BASE_URL,
            model=OLLAMA_MODEL,
            temperature=LLM_TEMPERATURE,
            num_predict=LLM_NUM_PREDICT,
            num_ctx=LLM_NUM_CTX,
            top_k=LLM_TOP_K,
            top_p=LLM_TOP_P,
            repeat_penalty=LLM_REPEAT_PENALTY,
        )

        # Create QA chain
        self._create_qa_chain()

        self._initialized = True
        print("Help Bot RAG service initialized successfully!")

    def _vector_store_exists(self) -> bool:
        """Check if vector store already exists."""
        return (VECTOR_STORE_DIR / "index.faiss").exists()

    def _build_vector_store(self):
        """Build vector store from markdown documents."""
        VECTOR_STORE_DIR.mkdir(parents=True, exist_ok=True)

        print(f"Loading documents from {DOCS_DIR}")
        loader = DirectoryLoader(
            str(DOCS_DIR),
            glob="**/*.md",
            loader_cls=TextLoader,
            loader_kwargs={"encoding": "utf-8"}
        )
        documents = loader.load()
        print(f"Loaded {len(documents)} documents")

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP,
            separators=["\n## ", "\n### ", "\n\n", "\n", " "]
        )
        chunks = text_splitter.split_documents(documents)
        print(f"Split into {len(chunks)} chunks")

        self.vector_store = FAISS.from_documents(chunks, self.embeddings)
        self.vector_store.save_local(str(VECTOR_STORE_DIR))
        print(f"Vector store saved to {VECTOR_STORE_DIR}")

    def _create_qa_chain(self):
        """Create the QA chain with SHORT prompt for speed."""
        # VERY SHORT prompt = faster generation
        prompt_template = """Answer using context. Be brief (2-3 sentences max).

Context: {context}

Question: {question}

Answer:"""

        prompt = PromptTemplate(
            template=prompt_template,
            input_variables=["context", "question"]
        )

        retriever = self.vector_store.as_retriever(
            search_type="similarity",
            search_kwargs={"k": TOP_K_RESULTS}
        )

        self.qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type="stuff",
            retriever=retriever,
            return_source_documents=True,
            chain_type_kwargs={"prompt": prompt}
        )

    def query(self, question: str) -> dict:
        """Query the help bot."""
        if not self._initialized:
            self.initialize()

        result = self.qa_chain.invoke({"query": question})

        # Extract unique sources
        sources = []
        seen = set()
        for doc in result.get("source_documents", []):
            src = Path(doc.metadata.get("source", "")).name
            if src and src not in seen:
                seen.add(src)
                sources.append({"file": src, "content_preview": doc.page_content[:100]})

        return {
            "answer": result["result"].strip(),
            "sources": sources
        }

    def rebuild_index(self):
        """Rebuild the vector store."""
        print("Rebuilding vector store...")
        if VECTOR_STORE_DIR.exists():
            import shutil
            shutil.rmtree(VECTOR_STORE_DIR)
        self._build_vector_store()
        self._create_qa_chain()
        print("Done!")

    def get_similar_documents(self, query: str, k: int = 3) -> List[dict]:
        """Get similar documents without LLM."""
        if not self._initialized:
            self.initialize()

        docs = self.vector_store.similarity_search(query, k=k)
        return [
            {
                "content": doc.page_content,
                "source": Path(doc.metadata.get("source", "")).name,
            }
            for doc in docs
        ]


# Singleton
_rag_instance: Optional[HelpBotRAG] = None


def get_rag_service() -> HelpBotRAG:
    """Get singleton instance."""
    global _rag_instance
    if _rag_instance is None:
        _rag_instance = HelpBotRAG()
    return _rag_instance
