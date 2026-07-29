
import os, json
import google.generativeai as genai

def analyze_food(description:str)->dict:
    key=os.environ.get("GEMINI_API_KEY")
    if not key:
        raise RuntimeError("GEMINI_API_KEY is not set.")
    genai.configure(api_key=key)
    model=genai.GenerativeModel("gemini-2.5-flash")
    prompt=f"""Return ONLY valid JSON with keys:
food_items(array of objects with name and estimated_portion), calories, protein_g, carbs_g, fat_g, confidence(low/medium/high), assumptions.
Food: {description}"""
    resp=model.generate_content(prompt)
    txt=resp.text.strip()
    if txt.startswith("```"):
        txt="\n".join(txt.splitlines()[1:-1])
    data=json.loads(txt)
    return data
