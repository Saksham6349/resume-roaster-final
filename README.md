# 🔥 Resume Roaster

> AI-powered resume analyzer with ATS scoring, JD matching, history dashboard, and resume comparison — built for students who want brutal honesty, not sugarcoating.

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=flat&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb)
![Groq](https://img.shields.io/badge/Groq-Llama%203.3%2070B-F55036?style=flat)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat)

---

## 🖥️ Live Demo

**[resume-roaster.onrender.com](https://resume-roaster.onrender.com)**

---

## Features

| Feature | Description |
|---|---|
| 🔥 ATS Analyzer | 0-100 score with 6-category breakdown + brutal AI roast |
| 🎯 JD Matching | Paste a job description — get matched/missing keywords + fit score |
| 📊 History | All past analyses saved to your account via MongoDB |
| ⚡ Compare | Upload two resumes side-by-side, AI picks a winner |
| 🔐 Google OAuth | One-click sign in, no passwords |
| 💀 Skeleton UI | Smooth loading states across all views |

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| Auth | Google OAuth 2.0 + Passport.js + JWT |
| AI Model | Llama 3.3 70B via Groq API (free) |
| Database | MongoDB Atlas |
| PDF Parsing | pdf-parse |
| Testing | Jest + Supertest |

---

## Architecture
```
┌─────────────────────────────────────────────┐
│              React Frontend (Vite)           │
│  AuthView → UploadView → ResultsView         │
│  HistoryView → CompareView                   │
└──────────────────┬──────────────────────────┘
                   │ REST API + JWT
┌──────────────────▼──────────────────────────┐
│           Node.js + Express Backend          │
│                                              │
│  /api/auth/google  → Google OAuth            │
│  /api/roast        → 3-Step AI Pipeline      │
│  /api/compare      → Resume Comparison       │
│  /api/history      → Per-user CRUD           │
└───────┬───────────────────┬──────────────────┘
        │                   │
┌───────▼───────┐   ┌───────▼──────────┐
│  MongoDB Atlas │   │    Groq API      │
│  Users         │   │  Step 1: Extract │
│  Analyses      │   │  Step 2: Score   │
└───────────────┘   │  Step 3: JD Match│
                    └──────────────────┘
```

### 3-Step AI Pipeline
1. **Extract** — Parse resume into structured data
2. **Analyze** — Deep ATS scoring using step 1 context
3. **Match** — Semantic JD matching (when JD is provided)

---

## Run Locally
```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/resume-roaster
cd resume-roaster

# 2. Install
npm install
cd client && npm install && cd ..

# 3. Configure
cp .env.example .env
# Fill in all values

# 4. Run
npm run dev
```

- Frontend → http://localhost:5173
- Backend → http://localhost:3000

---

## Environment Variables
```env
GROQ_API_KEY=           # console.groq.com — free
MONGODB_URI=            # mongodb.com/atlas — free
JWT_SECRET=             # any long random string
GOOGLE_CLIENT_ID=       # console.cloud.google.com
GOOGLE_CLIENT_SECRET=   # console.cloud.google.com
BASE_URL=https://your-app.onrender.com
PORT=3000
```

---

## Deploy (Render)

1. Push to GitHub
2. [render.com](https://render.com) → New Web Service → connect repo
3. **Build Command:** `npm install && npm run build`
4. **Start Command:** `node server.js`
5. Add all env vars
6. Add production redirect URI in Google Cloud Console:
```
https://your-app.onrender.com/api/auth/google/callback
```

---

## Testing
```bash
npm test
```

Covers: Google OAuth, JWT validation, protected routes, history CRUD, cross-user data isolation, invalid token rejection.

---

## Resume Bullet

> *Resume Roaster — Full-stack SaaS with Google OAuth, JWT, React, Node.js, MongoDB, 3-step Llama 3.3 70B pipeline, JD keyword gap analysis, skeleton UI, and integration tests. Deployed on Render.*

---


