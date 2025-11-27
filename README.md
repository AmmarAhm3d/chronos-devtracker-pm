# Chronos DevTracker

Portfolio-ready full-stack project management application showcasing TypeScript across React (Vite) frontend and Express + Prisma backend with PostgreSQL, JWT auth, and automated E2E tests (Playwright).

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS v4 + Zustand + Axios + Recharts + Zod
- **Backend**: Express + TypeScript + Prisma ORM + PostgreSQL (Docker) + Zod
- **Authentication**: JWT (Bearer tokens, bcrypt password hashing)
- **Testing**: Playwright (@playwright/test) for E2E coverage
- **Dev Environment**: GitHub Codespaces (Ubuntu 24.04 LTS)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (React SPA)                        │
│  ┌────────────┐  ┌──────────┐  ┌────────────────────────┐  │
│  │  Zustand   │  │  Axios   │  │  Pages & Components    │  │
│  │  (Auth     │◄─┤ Intercep │◄─┤  Dashboard, Project   │  │
│  │   Store)   │  │  -tor)   │  │  Detail, Auth Forms    │  │
│  └────────────┘  └──────────┘  └────────────────────────┘  │
│         │             │                                      │
│         └─────────────┘──── JWT in localStorage ────────────┘
│                       │
│                       ▼ HTTP (Bearer Token)
│              ┌─────────────────────┐
│              │   Express Server    │
│              │  ┌───────────────┐  │
│              │  │ Auth Middleware│  │
│              │  └───────┬───────┘  │
│              │          │           │
│              │  ┌───────▼────────┐ │
│              │  │ Routes (Auth,  │ │
│              │  │ Projects, Tasks│ │
│              │  └───────┬────────┘ │
│              │          │           │
│              │  ┌───────▼────────┐ │
│              │  │  Prisma Client │ │
│              │  └───────┬────────┘ │
│              └──────────┼──────────┘
│                         │
│                         ▼
│                 ┌──────────────┐
│                 │  PostgreSQL  │
│                 │   (Docker)   │
│                 └──────────────┘
└─────────────────────────────────────────────────────────────┘
```

### Data Model
- **User** → owns many **Projects** → each contains many **Tasks**
- Cascading deletes: removing a project removes its tasks
- Enums: `Status` (TODO, IN_PROGRESS, COMPLETE, ON_HOLD), `Priority` (HIGH, MEDIUM, LOW)

## Features
- User registration & login (JWT token issued on success)
- Project CRUD (title, description, status, optional repo link)
- Task CRUD nested under projects (title, priority, completion toggle)
- Dashboard with project status distribution pie chart (Recharts)
- Project detail view with inline task management
- **Edit/Delete projects** directly from project detail view
- **Optimistic UI updates** for instant task toggling and deletion with automatic rollback on failure
- **Client-side validation** with Zod schemas for all forms (auth, projects, tasks)
- **React Error Boundaries** for graceful error handling and recovery
- Polished UI with reusable components (Layout, Card, StatusBadge, ErrorBoundary)
- Seed script for demo data (one user, project, three tasks)
- E2E API & UI tests (auth flows, project/task CRUD)

## Prerequisites
- Node.js >= 18 (Codespaces provides v22)
- Docker (for PostgreSQL)

## Environment Variables (`.env`)
```env
DATABASE_URL="postgresql://chronos:devpassword@localhost:5432/chronos_dev"
JWT_SECRET="<secure-random>"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
VITE_API_URL="http://localhost:3001/api"
```

## Setup
```bash
# Clone & enter project (in Codespaces already)

# Start database
docker-compose up -d

# Install dependencies (root + workspaces)
npm install

# Run Prisma migrations
DATABASE_URL="postgresql://chronos:devpassword@localhost:5432/chronos_dev" npm run prisma:migrate

# Seed demo data
npm run prisma:seed -w server

# Start dev (backend + frontend concurrently)
npm run dev
```

Frontend: http://localhost:5173  
Backend API: http://localhost:3001/api

## API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Auth | Description | Request Body | Response |
|--------|----------|------|-------------|--------------|----------|
| POST | `/register` | No | Create new user account | `{ email, password, name? }` | `{ token, user }` |
| POST | `/login` | No | Authenticate user | `{ email, password }` | `{ token, user }` |

### Projects (`/api/projects`)
| Method | Endpoint | Auth | Description | Request Body | Response |
|--------|----------|------|-------------|--------------|----------|
| GET | `/` | Yes | List all user's projects | - | `[ { id, title, status, tasks, ... } ]` |
| POST | `/` | Yes | Create new project | `{ title, description?, status?, repoLink? }` | `{ id, title, ... }` |
| GET | `/:id` | Yes | Get project with tasks | - | `{ id, title, tasks: [...], ... }` |
| PUT | `/:id` | Yes | Update project | `{ title?, description?, status?, repoLink? }` | `{ id, title, ... }` |
| DELETE | `/:id` | Yes | Delete project (+ tasks) | - | `{ message }` |
| POST | `/:id/tasks` | Yes | Create task in project | `{ title, priority? }` | `{ id, title, ... }` |

### Tasks (`/api/tasks`)
| Method | Endpoint | Auth | Description | Request Body | Response |
|--------|----------|------|-------------|--------------|----------|
| PUT | `/:taskId` | Yes | Update task | `{ title?, priority?, completed? }` | `{ id, title, ... }` |
| DELETE | `/:taskId` | Yes | Delete task | - | `{ message }` |

**Auth**: All authenticated endpoints require `Authorization: Bearer <JWT>` header.

**Status Values**: `TODO`, `IN_PROGRESS`, `COMPLETE`, `ON_HOLD`  
**Priority Values**: `HIGH`, `MEDIUM`, `LOW`

## Testing (Playwright)
```bash
# Install browsers (Chromium, Firefox, WebKit)
npx playwright install

# Run E2E tests (starts dev server automatically via webServer config)
npm run test:e2e

# Run with UI mode for debugging
npx playwright test --ui
```

**Test Coverage**: Auth flows (register/login), project CRUD, task creation/update/delete, ownership validation.

## Screenshots

### Dashboard
![Dashboard with project status pie chart](https://github.com/user-attachments/assets/78a29692-d03a-473e-b14a-de6fa92a6856)  
*Project listing with status summary visualization (Recharts pie chart) - captured from authenticated session with seeded demo data*

### Project Detail with Edit/Delete Actions
![Project detail with task management](https://github.com/user-attachments/assets/69d65b3c-124b-47c2-8670-dcacf9873c04)  
*Inline task creation, priority assignment, completion tracking, and **Edit/Delete project buttons***

### Project Edit Mode
![Project edit form](https://github.com/user-attachments/assets/3ddae183-40f0-41e8-ba21-b28d81bfa166)  
*Edit project details including title, description, status, and repository link with **Zod validation***

### Optimistic UI Updates
![Task completion with optimistic update](https://github.com/user-attachments/assets/9f8090db-95bc-4658-88d2-7f0de34650c8)  
*Instant task completion feedback with **optimistic UI updates** - progress ring shows 33% (1 of 3 done) immediately*

## Seed Data
Creates `demo@example.com` (password: `password123`), one project, and three tasks. Modify in `server/prisma/seed.ts` if needed.

## Project Structure
```
server/          # Express API, Prisma schema & seed
client/          # React application (Vite)
tests/e2e/       # Playwright tests
docker-compose.yml  # PostgreSQL service
```

## Deployment Notes
- Replace Docker DB with managed PostgreSQL (e.g., Supabase, Railway, Neon) - update `DATABASE_URL`
- Use a cryptographically secure `JWT_SECRET` (e.g., `openssl rand -base64 32`)
- **Security Hardening** (recommended for production):
  - Add rate limiting (`express-rate-limit`) on auth endpoints to prevent brute force
  - Implement CORS whitelist for frontend origin
  - Add input sanitization (XSS protection via `xss` or `DOMPurify`)
  - Consider refresh token mechanism for JWT expiration handling
  - Add HTTPS enforcement and secure cookie flags if using cookies

## Known Limitations & Future Improvements
- **Backend**: No rate limiting, XSS sanitization, or refresh tokens (medium security risk)
- **Frontend**: ~~Missing client-side validation, error boundaries, and optimistic UI updates~~ ✅ Implemented!
- **Auth**: Token expiration handling relies on 401 responses (no proactive refresh)

### Recently Added (Stage 3 Polish)
- ✅ **Client-side validation** with Zod schemas for all forms
- ✅ **React Error Boundaries** for graceful error recovery
- ✅ **Optimistic UI updates** for instant feedback on task operations
- ✅ **Project Edit/Delete UI** in project detail view
- ✅ **TypeScript strict types** replacing `any` types throughout

### Next Enhancements (Ideas)
- User profile & password reset
- Project tagging, search, and filtering
- Task ordering (drag & drop) and subtasks
- Role-based access controls for multi-user collaboration
- Real-time updates via WebSockets
- Email notifications for task assignments

---
Crafted for portfolio impact: clean architecture, type safety, test coverage, and modern tooling.

## GitHub Publication Checklist

Before pushing to a public repository:

### Repository Setup
1. **Initialize Git** (if not already in a repo):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Chronos DevTracker full-stack app"
   ```

2. **Create GitHub Repository**:
   - Via GitHub CLI: `gh repo create chronos-devtracker --public --source=. --remote=origin`
   - Or manually via GitHub.com UI: create `chronos-devtracker` repo, then:
     ```bash
     git remote add origin https://github.com/<your-username>/chronos-devtracker.git
     git branch -M main
     git push -u origin main
     ```

### Security Hygiene
- ✅ `.env` is gitignored (verify: `cat .gitignore | grep .env`)
- ✅ No hardcoded secrets in codebase (JWT_SECRET uses env var)
- ⚠️ Replace default seed password (`password123`) before deployment
- ⚠️ Use strong `JWT_SECRET` (generate: `openssl rand -base64 32`)

### Documentation
- ✅ README with architecture diagram, API endpoints, setup instructions
- ✅ Screenshot(s) included (`screenshot-dashboard.png`)
- ✅ License file (recommended: add `LICENSE` file - MIT/Apache 2.0)
- 📝 Add GitHub topics for discoverability: `typescript`, `react`, `express`, `prisma`, `jwt`, `playwright`

### Code Quality
- ✅ All tests passing (`npm run test:e2e`)
- ✅ TypeScript strict mode enabled
- ✅ No compilation errors
- 📝 Optional: Add GitHub Actions CI workflow for automated testing

### Deployment (Optional)
- Frontend: Vercel, Netlify, or Cloudflare Pages (env: `VITE_API_URL`)
- Backend: Railway, Render, or Fly.io (env: `DATABASE_URL`, `JWT_SECRET`, `PORT`)
- Database: Supabase, Neon, or Railway PostgreSQL

#### GitHub Pages + Render Deployment
For deploying the frontend to GitHub Pages with backend on Render:

1. **Backend (Render)**:
   - Deploy the `server/` directory to Render
   - Set environment variables: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`
   - Note your Render URL (e.g., `https://chronos-devtracker-pm.onrender.com`)

2. **Frontend (GitHub Pages)**:
   - Add a repository secret `VITE_API_URL` with value: `https://your-render-app.onrender.com/api`
   - Example: `https://chronos-devtracker-pm.onrender.com/api`
   - The CI workflow uses this secret during the build step to configure the API endpoint
   - **Important**: Include `/api` at the end of the URL

### Repo Metadata (package.json)
Add to root `package.json`:
```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/<your-username>/chronos-devtracker.git"
  },
  "keywords": ["typescript", "react", "express", "prisma", "jwt", "fullstack", "portfolio"],
  "author": "Your Name <your.email@example.com>",
  "license": "MIT"
}
```