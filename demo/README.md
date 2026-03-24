# quick-chat-react — Demo App

Standalone demo app for the [quick-chat-react](https://www.npmjs.com/package/quick-chat-react) library. Uses the library via a local `file:..` link so every change in `/src/lib` is reflected here immediately.

## Setup

### 1. Install dependencies

```bash
# From the repo root — installs both the library and the demo
npm install
cd demo && npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in your Supabase project credentials in `demo/.env`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run migrations

In the [Supabase SQL Editor](https://supabase.com/dashboard), run the migration files from `/supabase/migrations/` **in filename order**.

### 4. Start the demo

```bash
npm run dev
```

Opens at [http://localhost:8080](http://localhost:8080).

---

## Seed demo users (optional)

To pre-populate the demo with test users and conversations:

```bash
# From the demo/ directory
cp .env.seed.example .env.seed
# Fill in .env.seed with your service role key, then:
npm run seed
```

This creates a set of demo accounts you can sign in with to test the chat without registering manually.

---

## Rate limits

The library enforces rate limits at the database level (PostgreSQL triggers):

| Action | Limit |
|---|---|
| Send message | 30 per 60 seconds per user |
| Add reaction | 60 per 60 seconds per user |

To adjust, edit the constants in `/supabase/migrations/20260324000000_rate_limiting.sql` and re-run that migration.

---

## How the demo links to the library

`package.json` references the library as `"quick-chat-react": "file:.."` — it resolves to the `/dist` folder produced by `npm run build:lib` in the repo root.

If you change library source code and don't see updates in the demo, rebuild:

```bash
# From the repo root
npm run build:lib
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server on port 8080 |
| `npm run build` | Production build |
| `npm run seed` | Seed demo users (requires `.env.seed`) |
| `npm run lint` | Run ESLint |
