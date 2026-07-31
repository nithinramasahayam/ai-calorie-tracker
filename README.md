# AI Calorie Tracker

Log meals in plain English ("two eggs, toast, black coffee") and get an
instant nutrition estimate, powered by Gemini. Full-stack app: React
frontend, FastAPI backend, SQLite storage.

## How it works

1. You type a free-text food description into the form.
2. The frontend `POST`s it to the FastAPI backend.
3. The backend calls the Gemini API for a structured nutrition estimate
   exactly the nutrition fields we need (calories, protein, carbs, fat,
   per-item portions, a confidence level, and any assumptions made). Forcing
   `tool_choice` to that tool means Claude's reply is always structured
   data — no fragile JSON-parsing of freeform text.
4. The estimate is saved to SQLite alongside the date and meal type.
5. The frontend re-fetches the day's entries and totals and updates the UI.

```
Browser (React) ──HTTP──▶ FastAPI ──API call──▶ Claude (tool use)
                              │
                              ▼
                          SQLite (calorie_tracker.db)
```

## Project structure

```
backend/
  main.py            FastAPI app + routes
  models.py           SQLAlchemy ORM model (FoodEntry)
  schemas.py          Pydantic request/response schemas
  claude_service.py   Gemini API call
  database.py         SQLite engine/session
  requirements.txt
  .env.example

frontend/
  src/
    App.jsx                    Top-level state + data flow
    api.js                     fetch() wrappers for the backend
    dateUtils.js                Date formatting helpers
    components/
      DateNav.jsx               Day switcher
      FoodEntryForm.jsx         Description input + meal-type picker
      DailySummary.jsx          Calorie progress bar + macro totals
      FoodLog.jsx                Logged entries, grouped by meal
```

## Setup

### 1. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# then edit .env and set GEMINI_API_KEY=...

uvicorn main:app --reload --port 8000
```

The API is now at `http://localhost:8000` (interactive docs at
`http://localhost:8000/docs`). A `calorie_tracker.db` SQLite file is
created automatically on first run.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

### Deploying the backend to Render

This repository includes `render.yaml`. Create a Render Blueprint from the
repository, then set `GEMINI_API_KEY` in the service environment. Set
`FRONTEND_ORIGINS` to the comma-separated URLs of your frontend deployments
(for example, `https://my-app.vercel.app,http://localhost:5173`).
Optionally set `GEMINI_MODEL=gemini-3.6-flash` (the default).

For a deployed frontend, set `VITE_API_BASE_URL` to the Render service URL
followed by `/api`, then rebuild and redeploy the frontend. The API health
check at `/api/health` must return `{"status":"ok"}` before the frontend can
connect.

## API reference

| Method | Path                    | Description                              |
|--------|-------------------------|-------------------------------------------|
| POST   | `/api/entries`          | Analyze a description with Gemini, save it |
| GET    | `/api/entries?date=`    | List entries for a date                    |
| DELETE | `/api/entries/{id}`     | Remove an entry                            |
| GET    | `/api/summary?date=`    | Daily totals (calories, protein, carbs, fat) |
| GET    | `/api/health`           | Health check                               |

`POST /api/entries` body:

```json
{
  "description": "grilled chicken breast with a cup of rice",
  "date": "2026-07-29",
  "meal_type": "lunch"
}
```

## Notes & things you might extend

- **Model choice**: `claude_service.py` uses `claude-sonnet-5`. For very
  high entry volume, swap to `claude-haiku-4-5-20251001` for lower cost.
- **Daily calorie goal** is stored in the browser's `localStorage`, not the
  database — simplest place for a single-user setup. Move it to a
  `settings` table if you add multi-user auth.
- **No auth / single user** by design, to keep the example focused. Add a
  `users` table + a `user_id` foreign key on `FoodEntry` to support more
  than one person.
- Nutrition values are AI-generated estimates from a text description, not
  lab-verified measurements — good for spotting trends, not a substitute
  for a nutritionist or a food scale.
