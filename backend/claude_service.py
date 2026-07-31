
import json
import os

from google import genai
from google.genai import types

def analyze_food(description:str)->dict:
    key=os.environ.get("GEMINI_API_KEY")
    if not key:
        raise RuntimeError("GEMINI_API_KEY is not set.")
    client = genai.Client(api_key=key)
    model = os.environ.get("GEMINI_MODEL", "gemini-3.6-flash")
    prompt=f"""Return ONLY valid JSON with keys:
food_items(array of objects with name and estimated_portion), calories, protein_g, carbs_g, fat_g, confidence(low/medium/high), assumptions.
Food: {description}"""
    resp = client.models.generate_content(
        model=model,
        contents=prompt,
        config=types.GenerateContentConfig(response_mime_type="application/json"),
    )
    txt = (resp.text or "").strip()
    if not txt:
        raise ValueError("Gemini returned an empty nutrition estimate.")
    if txt.startswith("```"):
        txt="\n".join(txt.splitlines()[1:-1])
    data=json.loads(txt)
    required_fields = {
        "food_items", "calories", "protein_g", "carbs_g", "fat_g", "confidence"
    }
    if not isinstance(data, dict) or not required_fields.issubset(data):
        raise ValueError("Gemini returned an incomplete nutrition estimate.")
    return data
