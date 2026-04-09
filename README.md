# Distributed Contract Auditor

An automated contract auditing system built with a polyglot microservices architecture. Drop a legal contract into the system — it checks every clause against a policy knowledge base, flags violations with confidence scores, generates an AI-powered plain-English summary, and presents everything on a web dashboard for a human reviewer to approve or reject.

---

## What it does

1. Upload a contract (PDF or text) through the dashboard
2. The system runs two independent pipelines in parallel:
   - **Audit pipeline** — chunks the contract, compares each chunk against violation policies using semantic search, returns flagged clauses with confidence scores
   - **Summarizer pipeline** — sends the full contract to Gemini Flash 2.0, returns a structured summary with contract type, parties, key clauses, and a risk level (LOW / MEDIUM / HIGH)
3. Results appear on the dashboard once both pipelines complete
4. Reviewers approve or reject each flagged violation

---

## Architecture

```
Upload → Spring Boot (orchestrator)
              ↓                    ↓
       Kafka: audit-jobs    Kafka: summarize-jobs
              ↓                    ↓
     FastAPI audit service   FastAPI summarizer service
     (ChromaDB + RAG)        (Gemini Flash 2.0)
              ↓                    ↓
       POST /api/jobs/{id}/results   POST /api/jobs/{id}/summary
              ↘                  ↙
            Spring Boot (job marked DONE)
                      ↓
                  Dashboard
```

Three independent services. Neither Python service knows the other exists. Both are triggered by the same contract upload event via separate Kafka topics. The job only moves to `DONE` when both callbacks have been received.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Orchestrator | Spring Boot (Java) |
| Audit Service | FastAPI (Python) + ChromaDB + sentence-transformers |
| Summarizer Service | FastAPI (Python) + Gemini Flash 2.0 API |
| Message Queue | Apache Kafka |
| Vector Database | ChromaDB |
| Database | PostgreSQL / H2 |
| Infrastructure | Docker Compose |

---

## Services

| Service | Port | Description |
|---|---|---|
| Spring Boot | 8080 | Orchestrator, REST API, dashboard |
| FastAPI Audit | 8001 | RAG pipeline, violation detection |
| FastAPI Summarizer | 8002 | Gemini summarization |
| ChromaDB | 8000 | Vector store for policies |
| Kafka | 9092 | Message broker |

---


## How the Audit Pipeline Works

The audit service uses **Retrieval-Augmented Generation (RAG)**:

1. The contract is split into 200-word chunks
2. Each chunk is converted to a vector embedding using `sentence-transformers`
3. ChromaDB finds the most similar violation policy for each chunk using cosine similarity
4. Chunks above the 0.6 similarity threshold are flagged as violations
5. Results are posted back to Spring Boot via HTTP callback

---

## How the Summarizer Works

The summarizer is **not** a RAG system. It sends the full contract text directly to Gemini Flash 2.0 with a structured prompt asking for a JSON response:

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

Gemini Flash 2.0 has a 1M token context window — the full contract is sent without truncation.

---
