from sqlalchemy import Column, Integer, String, Float, Date, DateTime, JSON
from sqlalchemy.sql import func

from database import Base


class FoodEntry(Base):
    __tablename__ = "food_entries"

    id = Column(Integer, primary_key=True, index=True)

    # What the user typed, e.g. "two eggs, toast with butter, black coffee"
    description = Column(String, nullable=False)

    date = Column(Date, nullable=False, index=True)
    meal_type = Column(String, nullable=False, default="snack")

    # Structured nutrition estimate returned by Claude (tool-use output)
    food_items = Column(JSON, nullable=False)  # [{name, estimated_portion}, ...]
    calories = Column(Float, nullable=False)
    protein_g = Column(Float, nullable=False)
    carbs_g = Column(Float, nullable=False)
    fat_g = Column(Float, nullable=False)
    confidence = Column(String, nullable=False)  # "low" | "medium" | "high"
    assumptions = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
