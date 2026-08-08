# 🔎 FINDIT

### 🎓 Campus Lost & Found Platform

**FINDIT** is a modern campus lost-and-found platform designed to make reporting, discovering, matching, claiming, and recovering lost belongings simple and secure.

Users can report lost or found items with photos, discover possible matches using smart rule-based matching, submit verified ownership claims, communicate securely through private chats, and confirm successful item recovery.

---

## ✨ Features

### 📦 Lost & Found

* 📝 Report lost and found items
* 📸 Upload item photos
* 🔍 Search and filter reported items
* 🏷️ Categorize items
* 📍 Specify campus locations
* 📄 View detailed item information

### 🧠 Smart Matching

* 🤖 Rule-based item matching
* 🔄 Matches lost reports with found reports and vice versa
* 📊 Matching based on:

  * Category
  * Location
  * Brand
  * Colour
  * Text similarity
  * Date proximity

### 🔐 Authentication & Security

* 🔑 JWT-based authentication
* 👤 Student and administrator roles
* 🔒 Password hashing using bcrypt
* 🛡️ Protected API routes
* 📝 Login audit records
* 🚫 Passwords and authentication tokens are never stored in plain text

### 💬 Secure Chat

* 💬 Item-specific conversations
* 👥 Direct user-to-user conversations
* 🔐 Authenticated private chats
* 🔔 Unread message indicators
* 🔄 Automatic polling for new messages
* 💾 Persistent messages stored in MongoDB

### ✅ Claims & Recovery

* 📩 Submit ownership claims
* 🔎 Review received claims
* 👍 Approve or reject claims
* 🔄 Confirm successful item recovery
* 💌 Send thank-you messages after returning an item

### 👨‍💼 Admin Dashboard

* 📊 Platform statistics
* 📦 Manage lost and found reports
* 📩 Review claims
* 👥 Manage users
* ✅ Mark items as returned
* 🔎 Monitor platform activity

### 🎨 Modern UI

* 🤍 Clean white SaaS interface
* 💜 Lavender / violet visual theme
* 📱 Responsive design
* ✨ Modern cards, forms, dashboards, and navigation

---

## 🏗️ Project Architecture

```text
FINDIT/
├── backend/              🐍 FastAPI API & MongoDB integration
├── frontend/             ⚛️ React + Vite application
└── README.md             📖 Project documentation
```

### 🛠️ Tech Stack

| Layer                | Technology         |
| -------------------- | ------------------ |
| 🎨 Frontend          | React + Vite       |
| ⚡ Backend            | FastAPI            |
| 🐍 Language          | Python             |
| 🗄️ Database         | MongoDB Atlas      |
| 🔐 Authentication    | JWT                |
| 🔒 Password Security | bcrypt             |
| 💬 Chat              | REST API + Polling |
| 📦 Storage           | MongoDB + Uploads  |
| 🌐 API Server        | Uvicorn            |

---

# 🚀 Getting Started

## 📋 Requirements

Make sure you have the following installed:

* 🐍 Python **3.11+**
* 🟢 Node.js **18+**
* 🍃 MongoDB Atlas or a compatible MongoDB deployment
* 📦 npm

---

# ⚙️ Backend Setup

### 1️⃣ Navigate to the backend

```bash
cd backend
```

### 2️⃣ Create a virtual environment

```bash
python -m venv .venv
```

Activate it:

**macOS / Linux**

```bash
source .venv/bin/activate
```

**Fish shell**

```fish
source .venv/bin/activate.fish
```

### 3️⃣ Install dependencies

```bash
python -m pip install -r requirements.txt
```

### 4️⃣ Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `backend/.env`:

```env
MONGODB_URI=your-mongodb-connection-string
DATABASE_NAME=findit
JWT_SECRET=your-long-random-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
FRONTEND_URL=http://127.0.0.1:5000
```

> ⚠️ **Never commit `.env` files or expose your MongoDB credentials and JWT secret.**

---

## ▶️ Start the Backend

```bash
python -m uvicorn app.main:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

### ❤️ Health Check

```text
http://127.0.0.1:8000/api/health
```

Expected response:

```json
{
  "status": "ok",
  "database": "connected"
}
```

---

# 💻 Frontend Setup

Open another terminal:

```bash
cd frontend
```

### 📦 Install dependencies

```bash
npm install
```

### ▶️ Start development server

```bash
npm run dev
```

The frontend will run at:

```text
http://127.0.0.1:5000
```

Vite automatically proxies:

```text
/api
/uploads
```

to the backend running on port `8000`.

---

## 📦 Production Build

Build the frontend:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

---

# 🔐 Authentication

FINDIT uses **JWT-based authentication** to protect user accounts and platform functionality.

### Registration

New users are registered with the default:

```text
role = student
```

Passwords are securely hashed using **bcrypt** before being stored in MongoDB.

### Login

After a successful login:

1. 🔑 Credentials are validated
2. 🔐 A JWT access token is generated
3. 📝 A login audit event is recorded
4. 🚫 Passwords and tokens are never stored as plain database records

When the frontend reloads, it validates the stored session through:

```text
GET /api/auth/me
```

Unauthenticated users are redirected to the login page when accessing protected routes.

---

# 👨‍💼 Admin Access

By default, newly registered accounts are created as `student`.

To promote an account to administrator, update the user directly in MongoDB Atlas.

```javascript
use findit

db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

Then:

1. 🚪 Log out
2. 🔑 Log in again
3. 🌐 Open `/admin`

### Admin capabilities

* 📊 View platform statistics
* 📦 Manage reports
* 📩 Review claims
* 👥 Manage users
* ✅ Mark items as returned
* 🔎 Monitor platform activity

---

# 🗄️ MongoDB Collections

FINDIT uses the following MongoDB collections:

| Collection        | Purpose                                |
| ----------------- | -------------------------------------- |
| 👤 `users`        | User accounts and roles                |
| 🔐 `login_events` | Successful login timestamps            |
| 📦 `items`        | Lost and found item reports            |
| 📩 `claims`       | Ownership claims and recovery messages |
| 💬 `chats`        | Private conversations                  |
| 📨 `messages`     | Chat messages and read states          |

---

# 💬 Chat System

FINDIT provides authenticated private messaging between users.

Users can:

* 💬 Start a direct conversation
* 📦 Start a conversation from an item page
* 📨 Send and receive messages
* 🔔 View unread message indicators
* 🔄 Receive new messages through polling
* 💾 Keep conversations after refreshing the page

### 🔐 Chat Security

Every chat API request verifies that the authenticated user is a participant in the conversation.

Messages are stored persistently in MongoDB.

The current implementation uses **REST APIs with five-second polling** rather than WebSockets.

> 💡 WebSockets are not required for the current implementation and can be introduced later if real-time communication becomes necessary.

---

# 🧠 Smart Matching

FINDIT includes a rule-based matching system to help users identify potentially related lost and found reports.

### Matching Endpoint

```http
GET /api/items/{item_id}/matches
```

The matching engine considers:

```text
📂 Category
📍 Location
🏷️ Brand
🎨 Colour
📝 Text similarity
📅 Date proximity
```

The matching implementation is located at:

```text
backend/app/services/matching_service.py
```

This allows users to quickly discover reports that may correspond to their missing or found belongings.

---

# 🌐 Core API Routes

## 🔐 Authentication

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

## 📦 Items

```http
GET  /api/items
POST /api/items
GET  /api/items/{item_id}
GET  /api/items/{item_id}/matches
```

## 📩 Claims

```http
GET  /api/claims/my
GET  /api/claims/received
POST /api/claims
```

## 💬 Chats

```http
GET  /api/chats
POST /api/chats
GET  /api/chats/{chat_id}/messages
POST /api/chats/{chat_id}/messages
PUT  /api/chats/{chat_id}/read
```

---

# 🧪 Verification & Testing

Before committing or deploying changes, verify the frontend build:

```bash
cd frontend
npm run build
```

Check backend Python syntax:

```bash
cd backend
python -m compileall -q app
```

---

# 🚀 Deployment Checklist

Before deploying FINDIT to production:

* [ ] 🍃 Verify MongoDB Atlas connectivity
* [ ] 🌐 Configure MongoDB Atlas Network Access
* [ ] 🔐 Generate a strong production `JWT_SECRET`
* [ ] ⚙️ Configure production environment variables
* [ ] 🌍 Set the production `FRONTEND_URL`
* [ ] 📦 Configure persistent/cloud storage for uploaded files
* [ ] 🔒 Ensure `.env` is excluded from Git
* [ ] 🧪 Run frontend production build
* [ ] 🐍 Run backend syntax checks
* [ ] 🔍 Test authentication and protected routes
* [ ] 💬 Test chat and claim workflows

---

# 🔒 Security Notes

> ⚠️ **Never commit sensitive credentials to GitHub.**

Make sure the following remain private:

```text
backend/.env
MongoDB connection strings
JWT secrets
Production credentials
```

Use environment variables for all sensitive configuration.

---

# 🗺️ Future Improvements

Some possible improvements for future versions:

* ⚡ WebSocket-based real-time chat
* 🔔 Push notifications
* 🤖 AI-powered semantic item matching
* 📧 Email notifications
* 📱 Progressive Web App support
* ☁️ Cloud image storage
* 📊 Advanced admin analytics
* 🏫 Multi-campus support
* 🔎 Advanced search and filtering
* 🛡️ Improved claim verification

---

# 🎯 Vision

**FINDIT** aims to create a faster, safer, and smarter way for students to recover lost belongings within their campus community.

> **Lost something? Find it.
> Found something? Return it.
> Together, we FINDIT. 🔎💜**

---

## 👨‍💻 Project

**FINDIT — Campus Lost & Found Platform**

Built with ❤️ using **React, Vite, FastAPI, Python, and MongoDB**.
