# CarePets

A pet care marketplace connecting pet owners with caretakers. Owners post jobs; caretakers apply; owners confirm.

## Architecture

```
frontend (Next.js 15, port 3000)
    │
    └─▶ gateway (nginx, port 8080)
              ├─▶ auth_service    (Flask, port 5001)  /api/auth/*
              ├─▶ users_service   (Flask, port 5002)  /api/users/*
              ├─▶ pets_service    (Flask, port 5003)  /api/pets/*
              └─▶ bookings_service(Flask, port 5004)  /api/bookings/*

Data layer: Supabase (hosted Postgres + Auth)
```

## Prerequisites

- Docker Desktop (for backend)
- Node.js 20 (for frontend)
- Python 3.11 (for running backend tests locally)
- A [Supabase](https://supabase.com) project

## Supabase Setup

1. Create a new Supabase project.
2. In the **SQL Editor**, run `backend/sql/schema.sql` to create all tables.
3. Run `backend/sql/seed.sql` to populate sample data.
   - Seed creates 7 users (3 owners, 4 caretakers) with password `Password123!`
4. Copy your project credentials from **Project Settings → API**.

## Backend

### Configure

```bash
cp backend/.env.example backend/.env
```

Fill in `backend/.env`:

| Variable | Where to find it |
|---|---|
| `SUPABASE_URL` | Project Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Project Settings → API → anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → service_role key |
| `JWT_SECRET` | Project Settings → API → JWT Settings → JWT Secret |
| `SMTP_*` | Your SMTP provider credentials |

### Run

```bash
cd backend
docker compose up --build
```

This starts the nginx gateway and all four Flask services. The gateway is available at `http://localhost:8080`.

### Test

```bash
# Test a single service
pip install -r backend/services/auth/requirements.txt pytest
cd backend/services/auth
pytest tests/ -v

# Or all services
for svc in auth users pets bookings; do
  pip install -r backend/services/$svc/requirements.txt pytest
  (cd backend/services/$svc && pytest tests/ -v)
done
```

## Frontend

### Configure

Create `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### Run

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Test

```bash
cd frontend
npm test -- --watchAll=false
```

### Build

```bash
cd frontend
npm run build
```

## Project Layout

```
PetStore/
├── backend/
│   ├── docker-compose.yaml
│   ├── .env.example
│   ├── gateway/
│   │   └── nginx.conf
│   ├── shared/
│   │   ├── jwt_middleware.py   # @jwt_required / @role_required decorators
│   │   ├── email_service.py    # SMTP helpers
│   │   └── supabase_client.py
│   ├── services/
│   │   ├── auth/               # signup, login, logout, /me
│   │   ├── users/              # profile CRUD, caretaker listing
│   │   ├── pets/               # pet CRUD (owner-only)
│   │   └── bookings/           # booking CRUD, apply, confirm
│   └── sql/
│       ├── schema.sql
│       └── seed.sql
└── frontend/
    ├── app/                    # Next.js App Router pages
    ├── components/             # Shared UI components
    ├── lib/
    │   ├── api.js              # Fetch wrapper with JWT injection
    │   └── auth.js             # AuthContext + useAuth hook
    └── __tests__/              # Jest + Testing Library tests
```

## Notes

- Email notifications (applicant confirmed/rejected) are sent synchronously in the request cycle. For production, move to a background queue.
- JWT verification uses `JWT_SECRET` from your Supabase project's JWT settings. Tokens are HS256-signed.
- Caretaker role is stored in Supabase `user_metadata` during signup and embedded in issued JWTs.
