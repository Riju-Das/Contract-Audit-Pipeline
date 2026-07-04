# Contract Audit Pipeline

A full-stack contract auditing system that checks employment agreements against Indian law policy rules. Upload a PDF, get structured violations with legal reasoning, plain-language summaries, and a risk score.

---

## Repo Layout

- frontend/ — React + Vite UI
- spring-backend/ — Spring Boot API, auth, persistence, Kafka orchestration
- python-pipeline/ — FastAPI worker, RAG pipeline, LangGraph audit
- docker-compose.yaml — Kafka, Postgres, Redis, ChromaDB for local dev

---z

## Architecture

```
[Client UI]
   |
   | HTTP upload + polling
   v
[Spring Boot API]  -> Kafka: contract.audit.request
   |
   v
[Python Worker]    -> Kafka: contract.audit.result
   |
   v
[Spring Boot API]  -> Postgres
```

### Python Worker Flow

```
PDF -> pymupdf4llm -> Markdown
                       |
              LangChain chunking
                       |
           BAAI/bge-m3 embedding
                       |
         ChromaDB similarity search
                       |
              suspicious chunks
                       |
              LangGraph pipeline
                       |
   classify -> optional deep requery -> plain language -> risk score
```

---

## Tech Stack

- Frontend: React, Vite, Tailwind
- Backend: Spring Boot (Java 21), Spring Security, JPA
- Worker: FastAPI, LangChain, LangGraph, Groq Llama 3.3 70B
- Storage: Postgres, Redis, ChromaDB
- Messaging: Kafka

---

## Local Setup

### Prereqs

- Docker + Docker Compose
- Java 21
- Node 18+
- Python 3.12

### 1) Start Infra

```bash
docker compose up -d
```

### 2) Environment Variables

frontend/.env

```bash
VITE_API_BASE=http://localhost:8080
```

python-pipeline/.env

```bash
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
CHROMA_HOST=localhost
CHROMA_PORT=8000
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
```

Optional Spring Boot override:

- JWT_SECRET_KEY (defaults to a dev value in application.yaml)

### 3) Seed the Policy Vector Store

Add policy markdown files under python-pipeline/app/output_md, then run:

```bash
cd python-pipeline
python -m app.scripts.ingest_policies
```

### 4) Run Services

Spring Boot API:

```bash
cd spring-backend
./mvnw spring-boot:run
```

Python worker:

```bash
cd python-pipeline
python -m venv .venv
source .venv/bin/activate
pip install -e .
python -m app.main
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

---

## API Quick Reference

Auth:

- POST /api/v1/auth/signup
- POST /api/v1/auth/login
- POST /api/v1/auth/refresh
- POST /api/v1/auth/logout

Contracts:

- POST /api/v1/contracts/upload
- GET /api/v1/contracts
- GET /api/v1/contracts/{id}
- DELETE /api/v1/contracts/{id}

Worker (direct test):

- POST /api/v1/audit