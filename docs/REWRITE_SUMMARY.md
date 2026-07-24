# Rewrite summary

## Delivered architecture

The active implementation is `frontend/` (Next.js) plus `backend/` (Flask REST API) and PostgreSQL. The original root Vite project remains a legacy visual prototype and is not the target runtime.

## Changes made

| Change | Effect |
|---|---|
| Added `q`, `category`, `page`, and `page_size` to `GET /api/contents` | Search and pagination happen on the server, so browsers no longer need to retrieve every record before filtering. |
| Updated the content browser to request filtered API results after a short input delay | Reduces network usage and makes the UI ready for larger content libraries. |
| Added Dockerfiles and `docker-compose.yml` | Developers can start web, API, and PostgreSQL together with a repeatable configuration. |
| Added backend and frontend environment templates | Separates secrets and deployment URLs from source code. |
| Moved CORS origins to `CORS_ORIGINS` | A new Vercel frontend can be authorized without editing Flask source. |
| Added Vercel configuration and deployment guide | The Next.js frontend has a defined deployment path independent of the old Render service. |
| Added architecture and database roadmap documents | Defines how SDG classification, ingestion and semantic search can be added without replacing the core application. |
| Added a standalone preview site | Provides a deployable, interactive public-frontend build target without changing the legacy site. |
| Rebuilt the Next.js homepage from reusable `HomeExperience` sections and JSON content | Moves the Vite prototype’s visual hierarchy into the production frontend while removing duplicate header, account, feedback and content-management code from the home route. |

## Validation

- The standalone preview build completed successfully.
- Flask application modules passed Python syntax compilation.
- The Next.js production build succeeds with Webpack, including TypeScript checks and all App Router routes.

## Next implementation steps

1. Push this rewrite to `jzforever1640-wq/Sustainable-xjtlu`.
2. Create the Vercel project with `sustainable-xjtlu/frontend` as Root Directory.
3. Deploy Flask and PostgreSQL, set `NEXT_PUBLIC_API_BASE_URL`, then set the Flask `CORS_ORIGINS` to the Vercel domain.
4. Add database migrations for normalized SDG, activity, tag and content-type tables.
5. Add a worker queue for ingestion, classification and embeddings.
