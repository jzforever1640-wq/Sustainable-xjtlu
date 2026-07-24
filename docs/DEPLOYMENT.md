# Deployment guide

## Frontend: Vercel

Create a new Vercel project from `jzforever1640-wq/Sustainable-xjtlu` and set **Root Directory** to `sustainable-xjtlu/frontend`.

Set this environment variable in Vercel:

```text
NEXT_PUBLIC_API_BASE_URL=https://YOUR-FLASK-API.example.com
```

Vercel detects Next.js automatically. Build command: `npm run build`; output command: use the platform default. Do not use the legacy Render frontend URL for this new deployment.

## API: Render

Deploy `sustainable-xjtlu/backend` as a Python web service.

```text
Build command: pip install -r requirements.txt
Start command: gunicorn --bind 0.0.0.0:$PORT wsgi:app
```

Set the variables from `backend/.env.example` and set `CORS_ORIGINS` to the new Vercel URL. Apply migrations before accepting traffic:

```bash
flask --app wsgi:app db upgrade
```

## Local full-stack validation

```bash
cd sustainable-xjtlu
cp backend/.env.example backend/.env
docker compose up --build
```

Then open `http://localhost:3000`. The API health endpoint is `http://localhost:5000/api/health`.
