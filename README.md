# OnboardX — Employee Onboarding Workflow (MERN)

Production-oriented onboarding app: **registration → documents → HR verification → manager assignment → IT setup → completion**, with JWT auth, role-based access, workflow automation, optional Cloudinary uploads, and Nodemailer notifications.

## Folder structure

```
OnboardX/
├── server/                 # Express API (MVC)
│   ├── config/             # DB, email, Cloudinary
│   ├── controllers/
│   ├── middleware/         # JWT auth, upload
│   ├── models/             # Mongoose schemas
│   ├── routes/
│   ├── services/           # Workflow engine, email, uploads
│   ├── scripts/seed.js     # HR + Admin users
│   ├── uploads/            # Local files (gitignored)
│   ├── loadEnv.js          # dotenv: loads server/.env (not cwd)
│   ├── app.js
│   └── server.js
├── client/                 # React (Vite) + Tailwind
│   └── src/
│       ├── context/        # Auth (Context API)
│       ├── pages/
│       ├── components/
│       └── services/api.js # Axios instance
├── .env.example
└── README.md
```

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

## Setup

### 1. Environment

Copy the sample env file and edit values:

```bash
copy .env.example .env
```

Set `MONGODB_URI` and `JWT_SECRET` at minimum.

### 2. Backend

```bash
cd server
npm install
```

Ensure **`server/.env`** exists (copy from `server/.env.example`). The entry file `server/loadEnv.js` loads variables with an explicit path to `server/.env` (with an optional fallback to the repo root `.env`), so starting the API from the repo root or from `server/` both work.

**Recommended:** keep `.env` in `OnboardX/server/.env` and run:

```bash
cd server
npm run seed
npm run dev
```

API: `http://localhost:5000` — health check: `GET /api/health`

### 3. Frontend

```bash
cd client
npm install
npm run dev
```

UI: `http://localhost:5173` — Vite proxies `/api` and `/uploads` to the backend in development.

### 4. Accounts

- **Employees:** register via **Sign up** (role is always `employee`).
- **HR / Admin:** run `npm run seed` in `server/` (creates `admin@example.com` and `hr@example.com`; password from `SEED_PASSWORD` in `.env` or default `ChangeMe123!`).

## Workflow steps (automation)

| Step              | Meaning |
|-------------------|---------|
| `SUBMITTED`       | Profile registered |
| `HR_REVIEW`       | At least one document uploaded |
| `MANAGER_ASSIGNED`| All documents **approved** by HR |
| `IT_SETUP`        | Manager assigned by admin |
| `COMPLETED`       | HR/Admin marks IT setup complete |

The service `services/workflowService.js` advances steps when conditions are met and sends emails when SMTP is configured.

## API overview

| Area        | Examples |
|------------|----------|
| Auth       | `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me` |
| Employees  | `GET /api/employees/me`, `PATCH /api/employees/me`, `GET /api/employees` (HR/Admin), `PATCH /api/employees/:id/manager` (Admin) |
| Documents  | `POST /api/documents/upload`, `GET /api/documents/me`, `PATCH /api/documents/:id/review` (HR/Admin) |
| Workflow   | `GET /api/workflow/me`, `POST /api/workflow/:employeeId/complete-it` (HR/Admin) |

## Production notes

- Use strong `JWT_SECRET`, HTTPS, and restrict CORS (`CLIENT_URL`).
- Configure SMTP for real emails; without it, Nodemailer uses a JSON transport (logs only).
- Set `CLOUDINARY_*` to store files in Cloudinary; otherwise files remain under `server/uploads` and are served at `/uploads/...`.

## How modules work (short)

- **`loadEnv.js`** — First import in `server.js`; calls `dotenv.config({ path: server/.env })` so env vars load regardless of the shell’s current working directory.
- **`config/`** — Connects MongoDB, configures optional Cloudinary and Nodemailer.
- **`middleware/auth.js`** — Validates JWT, attaches `req.user`, `authorize()` checks roles.
- **`models/`** — `User`, `EmployeeProfile`, `Document`, `Workflow` with step enum and history array.
- **`services/workflowService.js`** — Central rules: after uploads, HR approvals, or manager assignment, updates `Workflow` and triggers emails.
- **`services/uploadService.js`** — After Multer saves a file locally, optionally uploads to Cloudinary and returns a public URL.
- **`controllers/`** — Thin HTTP layer calling services and models.
- **`client/src/context/AuthContext.jsx`** — Stores JWT in `localStorage`, loads `/api/auth/me`, exposes `login` / `signup` / `logout`.
- **`client/src/services/api.js`** — Axios with `Authorization` header for protected routes.
