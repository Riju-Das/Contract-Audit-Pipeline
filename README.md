# Contract Audit Pipeline

Contract Audit Pipeline is an event-driven legal analysis system for auditing contracts against policy rules. The project combines a Spring Boot backend, a Python AI pipeline, and Kafka-based messaging to process contracts and identify risky or non-compliant clauses.

## What This Project Does

The platform is built to:

- Ingest contract files (PDF or text)
- Normalize and parse document content
- Run legal chunking and retrieval with RAG
- Compare contract text against policy vectors in ChromaDB
- Classify risk severity and legal violations with AI
- Use Kafka as the messaging backbone between services
- Produce structured audit results for downstream workflows

## Core Features

1. Contract ingestion and processing pipeline for PDF/text agreements.
2. RAG-based legal analysis using LangChain chunking and vector retrieval.
3. ChromaDB-backed policy matching for contextual legal checks.
4. AI-driven classification of suspicious clauses and severity scoring.
5. Kafka-based event flow for asynchronous and scalable orchestration.
6. Spring Boot backend with persistence and caching layer integration.
7. JWT-enabled backend security configuration.

## Architecture Flowchart

```text
[User / Client]
       |
       v
[Spring Boot Backend]
       |
       v
[Kafka]
       |
       v
[Python Audit Worker]
       |
       v
[RAG + LangChain + ChromaDB]
       |
       v
[AI Legal Classification]
       |
       v
[Final Contract Audit Output]

Support: Spring Boot Backend -> PostgreSQL | Redis | JWT Authentication
```

## Kafka In This Project

Kafka is used in this project as the event backbone for audit orchestration:

1. It carries audit workflow events between backend orchestration and worker processing.
2. It decouples contract intake from heavy AI audit execution.
3. It supports asynchronous scaling when document volume increases.
4. It keeps request handling responsive while worker-side analysis runs.


## Architecture Notes

- Spring Boot acts as the backend integration and orchestration layer.
- FastAPI runs the AI-heavy audit and document analysis pipeline.
- LangChain + RAG logic performs chunking and retrieval workflow.
- ChromaDB stores and serves policy vectors for semantic matching.
- PostgreSQL and Redis provide persistence and fast-access support.
- JWT is part of the backend security configuration.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | Spring Boot, Java |
| AI Worker API | FastAPI, Uvicorn, Python |
| Document Parsing | PyMuPDF, pymupdf4llm |
| RAG and Chunking | LangChain text splitters |
| Embeddings | sentence-transformers (BAAI/bge-m3) |
| Vector Store | ChromaDB |
| LLM Integration | Groq SDK, Google Generative AI SDK |
| Messaging Backbone | Apache Kafka |
| Database | PostgreSQL |
| Cache Layer | Redis |
| Validation / Config | Pydantic, pydantic-settings |
| Containerized Services | Docker Compose |

## Repository Structure

- `spring-backend/`
	Spring Boot application including domain models, DTOs, repositories, configuration, and security wiring.

- `python-pipeline/`
	FastAPI-based audit pipeline including services for processing, retrieval, and AI analysis.

- `python-pipeline/app/api/`
	Audit route definitions.

- `python-pipeline/app/services/`
	Core pipeline services: upload processing, chunking, embedding, retrieval, and AI audit logic.

- `python-pipeline/app/models/`
	Schema models for violations and audit outputs.

- `python-pipeline/app/violation-policies/` and `python-pipeline/app/output_md/`
	Policy inputs and processed markdown artifacts used by the audit flow.

- `docker-compose.yaml`
	Infrastructure definitions for Kafka, ChromaDB, PostgreSQL, and Redis.

## Current Scope

- Event-driven contract audit workflow with Kafka
- RAG and LangChain-based legal retrieval
- AI classification of contract risk and policy violations
- Spring Boot and Python service foundation for end-to-end pipeline integration

