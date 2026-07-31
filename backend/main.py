from datetime import date as date_type
import os
from typing import List, Optional

from dotenv import load_dotenv

load_dotenv()  # must run before claude_service reads GEMINI_API_KEY

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
import schemas
from claude_service import analyze_food
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Calorie Tracker API")

allowed_origins = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGINS", "").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    # The API has no cookie authentication, so this fallback can safely serve
    # public browser clients until explicit production origins are configured.
    allow_origins=allowed_origins or ["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/entries", response_model=schemas.FoodEntryOut)
def create_entry(payload: schemas.FoodEntryCreate, db: Session = Depends(get_db)):
    """Analyze a food description with Gemini, then persist the result."""
    try:
        nutrition = analyze_food(payload.description)
    except RuntimeError as exc:
        # Missing API key or a malformed model response -> 502, not a 500 crash.
        raise HTTPException(status_code=502, detail=str(exc))

    entry = models.FoodEntry(
        description=payload.description,
        date=payload.date or date_type.today(),
        meal_type=payload.meal_type or "snack",
        food_items=nutrition["food_items"],
        calories=nutrition["calories"],
        protein_g=nutrition["protein_g"],
        carbs_g=nutrition["carbs_g"],
        fat_g=nutrition["fat_g"],
        confidence=nutrition["confidence"],
        assumptions=nutrition.get("assumptions"),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@app.get("/api/entries", response_model=List[schemas.FoodEntryOut])
def list_entries(date: Optional[date_type] = None, db: Session = Depends(get_db)):
    query = db.query(models.FoodEntry)
    if date:
        query = query.filter(models.FoodEntry.date == date)
    return query.order_by(models.FoodEntry.created_at.asc()).all()


@app.delete("/api/entries/{entry_id}")
def delete_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(models.FoodEntry).filter(models.FoodEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    db.delete(entry)
    db.commit()
    return {"ok": True}


@app.get("/api/summary", response_model=schemas.DailySummary)
def daily_summary(date: date_type, db: Session = Depends(get_db)):
    entries = db.query(models.FoodEntry).filter(models.FoodEntry.date == date).all()
    return schemas.DailySummary(
        date=date,
        total_calories=sum(e.calories for e in entries),
        total_protein_g=sum(e.protein_g for e in entries),
        total_carbs_g=sum(e.carbs_g for e in entries),
        total_fat_g=sum(e.fat_g for e in entries),
        entry_count=len(entries),
    )
