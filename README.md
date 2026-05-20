# Contract Audit Pipeline

An event-driven legal analysis system that audits employment contracts against Indian law policy rules. Upload a contract PDF, get back a structured list of violations with severity ratings, legal reasoning, plain English summaries, and an overall risk score.

---

## What It Does

1. User uploads a contract PDF through the Spring Boot API
2. Spring saves the file and publishes an audit request to Kafka
3. The Python worker consumes the message, converts the PDF to markdown, and chunks it
4. Each chunk is embedded and searched against a ChromaDB vector store of Indian law policy documents
5. Chunks that match policy rules above a similarity threshold are flagged as suspicious
6. A LangGraph pipeline classifies each suspicious clause, reruns uncertain ones with targeted retrieval, rewrites legal reasoning into plain English, and calculates a contract-level risk score
7. Results are published back to Kafka
8. Spring consumes the result and persists violations and risk score to Postgres
9. The frontend can poll for the completed audit by contract ID

---

## Architecture

```
[Client]
   |
   | HTTP upload
   v
[Spring Boot API]          — handles auth, file storage, contract records
   |
   | Kafka: contract.audit.request
   v
[Python FastAPI Worker]    — PDF processing, RAG pipeline, LangGraph audit
   |
   | Kafka: contract.audit.result
   v
[Spring Boot API]          — persists violations + risk score to Postgres
   |
   v
[Client polls GET /contracts/{id}]
```

### Python Worker Internal Flow

```
PDF → pymupdf4llm → Markdown
                       |
              LangChain chunking
                       |
           BAAI/bge-m3 embedding
                       |
         ChromaDB similarity search
          (n_results=2 per chunk)
                       |
           suspicious chunks list
                       |
              LangGraph Pipeline
                       |
         ┌─────────────────────────┐
         │      classify_node       │  ← Groq LLM classifies all chunks
         └─────────────┬───────────┘
                       │
              confidence_router
               /              \
     needs_requery          no_requery
          |                      |
  deep_research_node             |
  (targeted ChromaDB             |
   re-search + reclassify)       |
          |                      |
          └──────────┬───────────┘
                     │
          plain_language_node    ← rewrites legal reasoning into plain English
                     │
           risk_score_node       ← calculates 5-category risk score
                     │
                    END
```

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Backend API | Spring Boot + Java 21 | Handles auth, file management, persistence. Java's strong typing and Spring's ecosystem make it well suited for the orchestration layer where correctness matters more than flexibility. |
| AI Worker | FastAPI + Python | Python is the natural home for ML libraries. FastAPI gives async support which matters when waiting on LLM API calls. |
| PDF Parsing | PyMuPDF + pymupdf4llm | pymupdf4llm converts PDFs to clean markdown that LLMs can reason about much better than raw text extraction. |
| Chunking | LangChain text splitters | MarkdownHeaderTextSplitter respects document structure. RecursiveCharacterTextSplitter handles overflow with overlap. |
| Embeddings | BAAI/bge-m3 via sentence-transformers | Multilingual model that handles Indian legal English well. Better at domain-specific legal text than general-purpose embedding models. |
| Vector Store | ChromaDB | Lightweight, runs locally, supports cosine similarity out of the box. No infrastructure overhead compared to Pinecone or Weaviate for a project at this scale. |
| LLM | Groq + llama-3.3-70b-versatile | Groq's inference is significantly faster than OpenAI for the same model class. Fast inference matters when you're making multiple LLM calls per audit. |
| AI Pipeline | LangGraph | Manages multi-step AI workflows with typed state, conditional routing, and clean node separation. Replaces manual if/else orchestration with a declarative graph. |
| Messaging | Apache Kafka | Decouples the Spring API from the Python worker. The upload endpoint returns immediately and the heavy AI processing happens asynchronously. Supports scaling the Python worker independently. |
| Database | PostgreSQL | Stores users, contracts, violations, and risk scores. Relational model fits the structured audit output well. |
| Cache / Sessions | Redis | Stores refresh tokens with TTL. Fast key-value lookups are exactly what token validation needs. |
| Auth | JWT + Spring Security | Stateless authentication. Access tokens are short-lived, refresh tokens are stored in Redis and rotated on use. |
| Structured Output | Pydantic + LangChain with_structured_output | Forces the LLM to return typed data matching a schema at the API level rather than parsing raw text with regex. Eliminates a whole class of production bugs. |

---

## Key Design Decisions

**Why Kafka instead of direct HTTP from Spring to Python**
The Python worker loads a 400MB embedding model on startup and each audit takes 10-30 seconds. Synchronous HTTP would block the Spring API and timeout. Kafka lets Spring return a contract ID immediately while processing happens in the background.

**Why LangGraph instead of plain functions**
Low-confidence verdicts need a second retrieval pass with better queries. High-confidence verdicts skip that pass. LangGraph makes this conditional routing explicit and declarative rather than buried in nested if/else. It also makes adding new nodes (plain language rewriting, risk scoring) clean — each node has one job and touches only its own state fields.

**Why ChromaDB instead of a managed vector database**
The policy corpus is small (a few hundred chunks) and doesn't need distributed infrastructure. ChromaDB runs as a Docker container alongside the other services with zero operational overhead. The same retriever code works whether the collection has 100 or 100,000 chunks.

**Why BAAI/bge-m3 instead of OpenAI embeddings**
BGE-M3 runs locally, so there's no per-embedding API cost and no latency on embedding calls. For a corpus that's re-ingested infrequently, local embeddings are strictly better than paying per token for a hosted model.