# Distributed Contract Auditor

An automated contract auditing system built with a polyglot foundation. Drop a legal contract into the system and it checks clauses against a policy knowledge base, flags risky/legal violations with confidence scores, and returns a structured AI-assisted review output.

---

## What it does

1. Upload a contract (PDF or text) through the Spring Boot backend.
2. Spring Boot publishes parallel job events for audit and summarization.
3. The audit pipeline processes the contract with RAG (chunking + Chroma retrieval + AI legal classification) and sends back violations with confidence and severity.
4. The summarizer pipeline generates a plain-language contract summary with risk context.
5. Spring Boot aggregates callbacks from both pipelines and exposes the final combined review result.

---

## Architecture

```
Upload → Spring Boot (orchestrator)
              ↓                    ↓
       Kafka: audit-jobs    Kafka: summarize-jobs
              ↓                    ↓
     FastAPI audit service   FastAPI summarizer service
   (ChromaDB + RAG + Groq)   (LLM summary pipeline)
              ↓                    ↓
POST /api/jobs/{id}/results   POST /api/jobs/{id}/summary
              ↘                  ↙
            Spring Boot (job marked DONE)
                      ↓
                Final API response
```

The overall system architecture is Spring Boot centered, with Python workers executing AI-heavy tasks independently and returning async callbacks to the orchestrator.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Orchestrator | Spring Boot (Java) |
| Audit Service | FastAPI (Python) + ChromaDB + sentence-transformers + Groq |
| Summarizer Service | FastAPI (Python) + LLM summarization |
| Message Queue | Apache Kafka |
| Vector Database | ChromaDB |
| Embedding Model | BAAI/bge-m3 |
| Infrastructure | Docker Compose |

---

## Services

| Service | Port | Description |
|---|---|---|
| Spring Boot | 8080 | Orchestrator, callback aggregation, API layer |
| FastAPI Audit | 8001 | RAG-based violation detection |
| FastAPI Summarizer | 8002 | AI contract summarization worker |
| ChromaDB | 8000 | Vector store for policies |
| Kafka | 9092 | Message broker |

---


## How the Audit Pipeline Works

The audit service uses **Retrieval-Augmented Generation (RAG)**:

1. The uploaded contract is normalized to text (PDFs are converted to markdown first).
2. The contract is split into legal chunks with markdown-aware and recursive splitting.
3. Each chunk is converted to vector embeddings using `sentence-transformers` (`BAAI/bge-m3`).
4. ChromaDB retrieves the closest policy match for each chunk using cosine-space similarity.
5. Chunks above the current similarity threshold (0.4) are marked as suspicious.
6. Suspicious items are batch-reviewed by Groq Llama 3.3 70B and only actionable severities are returned.

---

## How the Summarizer Works

The summarizer runs as a separate worker pipeline and processes the full contract text to produce a structured plain-English output.

Typical summary output includes:

```json
{
       "contract_type": "Service Agreement",
       "duration": "2 years",
       "parties": ["Acme Corp", "Vendor Ltd"],
       "key_clauses": ["Unlimited liability waiver", "Auto-renewal without notice"],
       "risk_level": "HIGH",
       "plain_summary": "..."
}
```

Spring Boot merges this summary callback with audit callback data before final response delivery.

---
