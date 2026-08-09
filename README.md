# FINDIT
##  Smart Campus Lost & Found

FINDIT is a campus lost-and-found platform for reporting belongings, discovering possible matches, submitting verified claims, chatting securely, and confirming successful returns.

## Features

- Lost and found item reports with photos
- Search, filtering, categories, campus locations, and item details
- Rule-based smart matching for opposite-type reports
- JWT authentication with MongoDB-backed user accounts
- Password hashing with bcrypt
- Item-specific and direct authenticated chats
- Private conversations with unread indicators and polling updates
- Claim submission, approval/rejection, and recovery confirmation
- Thank-you messages after an item is returned
- Admin dashboard for reports, claims, users, and statistics
- Responsive white and lavender/violet SaaS interface

## Project structure

```text
FINDIT/
├── backend/       FastAPI API and MongoDB integration
├── frontend/      React + Vite web application
└── README.md
```

## Requirements

- Python 3.11+
- Node.js 18+
- MongoDB Atlas (or a compatible MongoDB deployment)

## Backend setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate       # macOS/Linux
# fish: source .venv/bin/activate.fish
python -m pip install -r requirements.txt
cp .env.example .env
```

Edit `backend/.env` and set:

```env
MONGODB_URI=your-mongodb-connection-string
DATABASE_NAME=findit
JWT_SECRET=your-long-random-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
FRONTEND_URL=http://127.0.0.1:5000
```

Start the API:

```bash
python -m uvicorn app.main:app --reload
```

The API runs at `http://127.0.0.1:8000`.

Health check:

```text
http://127.0.0.1:8000/api/health
```

The expected response is:

```json
{"status":"ok","database":"connected"}
```

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at:

```text
http://127.0.0.1:5000
```

Vite proxies `/api` and `/uploads` to the backend on port `8000`.

For a production build:

```bash
npm run build
npm run preview
```

## Authentication

Registration creates a `student` account. Passwords are hashed before storage. Successful logins create JWT sessions and a login audit record without storing passwords or tokens.

The frontend validates the stored token through `/api/auth/me` when it reloads. Protected routes redirect unauthenticated users to login.

## Admin access

Register a normal account, then promote it directly in MongoDB Atlas:

```javascript
use findit

db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

Log out and log in again, then open `/admin`.

Admins can review claims, manage reports, mark items returned, view users, and inspect platform statistics.

## MongoDB collections

The backend creates and uses:

- `users` — accounts and roles
- `login_events` — successful login timestamps
- `items` — lost and found reports
- `claims` — ownership claims and recovery messages
- `chats` — private participant conversations
- `messages` — chat messages and read state

Never commit `backend/.env` or expose MongoDB credentials and JWT secrets.

## Chat flow

Authenticated users can open `/chats`, start a direct conversation with another FINDIT user, or start a chat from an item page. Chat requests are authenticated and every API call verifies that the user is a participant.

Chat currently uses REST APIs with five-second polling. Messages persist in MongoDB and remain available after refresh. WebSockets are not required for the current implementation.

## Smart matching

The matching endpoint is:

```text
GET /api/items/{item_id}/matches
```

Matching considers category, location, brand, colour, text similarity, and date proximity. The implementation is in `backend/app/services/matching_service.py`.

## Core API routes

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me

GET  /api/items
POST /api/items
GET  /api/items/{item_id}
GET  /api/items/{item_id}/matches

GET  /api/claims/my
GET  /api/claims/received
POST /api/claims

GET  /api/chats
POST /api/chats
GET  /api/chats/{chat_id}/messages
POST /api/chats/{chat_id}/messages
PUT  /api/chats/{chat_id}/read
```

## Verification

Frontend production build:

```bash
cd frontend
npm run build
```

Backend syntax check:

```bash
cd backend
python -m compileall -q app
```

Before deployment, verify MongoDB connectivity, configure Atlas Network Access, use a strong production `JWT_SECRET`, set the production `FRONTEND_URL`, and move uploaded files to persistent or cloud storage.
