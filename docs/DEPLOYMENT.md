# Deployment guide

## Frontend: Vercel

Create a Vercel project from `jzforever1640-wq/Sustainable-xjtlu` and set **Root Directory** to `frontend`.

Set this environment variable in Vercel:

```text
NEXT_PUBLIC_API_BASE_URL=https://YOUR-FLASK-API.example.com
```

Vercel detects Next.js automatically. Build command: `npm run build`; output command: use the platform default. Do not use the legacy Render frontend URL for this new deployment.

## API: Render

The repository includes `render.yaml`, which creates both the Flask service and its PostgreSQL database. In Render, choose **New → Blueprint**, connect `jzforever1640-wq/Sustainable-xjtlu`, and select the repository-root `render.yaml`.

The Blueprint deploys the root `backend` directory as a Python web service:

```text
Build command: pip install -r requirements.txt
Start command: gunicorn --bind 0.0.0.0:$PORT wsgi:app
```

It securely injects `DATABASE_URL` from the Render PostgreSQL instance and generates the Flask/JWT secrets. Its `CORS_ORIGINS` value is set to `https://sustainable-xjtlu-10.vercel.app`. On the free tier, each API start first runs the idempotent `flask --app wsgi:app db upgrade` migration, then starts Gunicorn.

## Local full-stack validation

```bash
cp backend/.env.example backend/.env
docker compose up --build
```

Then open `http://localhost:3000`. The API health endpoint is `http://localhost:5000/api/health`.
