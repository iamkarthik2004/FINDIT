# FINDIT backend

FastAPI and MongoDB Atlas backend for the FINDIT campus lost-and-found frontend.

## Setup

From `backend/`, create and activate a virtual environment, then install dependencies:

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
cp .env.example .env
```

In MongoDB Atlas, create a cluster and database user, allow your development IP address, then copy its connection URI into `MONGODB_URI` in `.env`. Set a long random `JWT_SECRET`; leave `DATABASE_NAME=findit` and set `FRONTEND_URL=http://localhost:5173` for Vite.

Run the API:

```bash
uvicorn app.main:app --reload
```

If Atlas is configured with a `mongodb+srv://` URI and startup reports an SRV/DNS error, verify that your network allows DNS and that the current IP is allowed in Atlas Network Access. The API intentionally stops at startup when MongoDB cannot be reached, so the frontend will show proxy connection errors until the database connection succeeds.

Interactive documentation is at `http://localhost:8000/docs`; ReDoc is at `/redoc`.

## Deploy to Render

The repository includes a `render.yaml` Blueprint that creates a FastAPI web service
and the Vite frontend as a static site. Push the repository to GitHub, then in Render
select **New > Blueprint** and choose the repository. Render will prompt for
`MONGODB_URI`; use your MongoDB Atlas connection string. `JWT_SECRET` is generated
automatically. Ensure Atlas Network Access permits connections from Render (or allows
all IPs for a demo deployment). After deployment, open the `findit-web` URL.

Render web-service disks are required if uploaded photos must survive redeploys or
service restarts. The current local-file upload implementation is suitable for demos;
use object storage (such as Cloudinary or S3) for durable production uploads.

## Frontend connection

The Vite dev server proxies `/api` and `/uploads` to `http://localhost:8000`. Start the API above, then run `npm run dev` from `frontend/`. The frontend stores the JWT locally and sends it as a Bearer token; on reload it validates that token with `/api/auth/me` before restoring a session. Each successful password login updates the user's `lastLoginAt` field and writes a timestamped record to MongoDB's `login_events` collection. Passwords and tokens are never stored in that audit collection. Item photos are uploaded to the backend `uploads/` directory in development; the upload route is intentionally isolated so it can later be swapped for cloud object storage.

## Creating an admin

Public registration always creates a `student`. Promote a trusted account directly in Atlas:

```javascript
db.users.updateOne({ email: "admin@college.edu" }, { $set: { role: "admin" } })
```

Log in again after promoting the account to receive a token with the new role checked on each request.
