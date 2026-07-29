from datetime import date as date_type, datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class FoodItem(BaseModel):
    name: str
    estimated_portion: str


class FoodEntryCreate(BaseModel):
    description: str = Field(..., min_length=1, max_length=1000)
    date: Optional[date_type] = None
    meal_type: Optional[str] = "snack"


class FoodEntryOut(BaseModel):
    id: int
    description: str
    date: date_type
    meal_type: str
    food_items: List[FoodItem]
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    confidence: str
    assumptions: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class DailySummary(BaseModel):
    date: date_type
    total_calories: float
    total_protein_g: float
    total_carbs_g: float
    total_fat_g: float
    entry_count: int
