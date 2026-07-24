# Sustainable XJTLU

A full-stack sustainability knowledge platform built with **Next.js**, **Flask** and **PostgreSQL**.

## What changed in this rewrite

- Consolidates the product direction around the Next.js frontend instead of maintaining two active frontends.
- Preserves the React prototype as a visual reference while the new implementation lives in `frontend/`.
- Moves content search and pagination to the Flask API, preventing the browser from downloading and filtering the whole collection.
- Adds Docker-based local development, environment templates, Vercel configuration and deployment documentation.
- Moves CORS configuration into environment variables, so a new Vercel deployment can be allowed without source-code changes.
- Establishes a documented path for SDG classification, ingestion and semantic search using PostgreSQL + pgvector.

## Repository layout

```text
sustainable-xjtlu/
├── frontend/       Next.js App Router frontend; deploy to Vercel
├── backend/        Flask REST API; deploy separately
├── docs/           architecture and deployment guidance
└── docker-compose.yml
```

## Run locally

The simplest full-stack route is Docker Compose:

```bash
cp backend/.env.example backend/.env
docker compose up --build
```

Open `http://localhost:3000`.

## Deploy the frontend

Follow [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). The Vercel project must use `frontend` as its Root Directory. Set `NEXT_PUBLIC_API_BASE_URL` to the deployed Flask API before deployment.

## Team workflow

- Branch from `main` for every change.
- Open a pull request and run frontend build checks before merging.
- Keep public content API changes backwards-compatible or version them under `/api/v1`.
- Do not publish AI-ingested content without human review.
