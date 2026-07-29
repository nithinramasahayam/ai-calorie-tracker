import { useState } from "react";
import { suggestMealType } from "../dateUtils";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

const EXAMPLES = [
  "two scrambled eggs, wheat toast with butter, black coffee",
  "large chicken burrito bowl with rice, beans, and guac",
  "handful of almonds and an apple",
];

export default function FoodEntryForm({ onSubmit, submitting, error }) {
  const [description, setDescription] = useState("");
  const [mealType, setMealType] = useState(suggestMealType());

  async function handleSubmit(e) {
    e.preventDefault();
    if (!description.trim() || submitting) return;
    const ok = await onSubmit({ description: description.trim(), mealType });
    if (ok) setDescription("");
  }

  return (
    <form className="entry-form" onSubmit={handleSubmit}>
      <label className="entry-form__label" htmlFor="description">
        What did you eat?
      </label>
      <textarea
        id="description"
        placeholder={`e.g. "${EXAMPLES[0]}"`}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        disabled={submitting}
      />

      <div className="entry-form__row">
        <div className="meal-type-picker">
          {MEAL_TYPES.map((type) => (
            <button
              type="button"
              key={type}
              className={`meal-pill ${mealType === type ? "meal-pill--active" : ""}`}
              onClick={() => setMealType(type)}
              disabled={submitting}
            >
              {type}
            </button>
          ))}
        </div>

        <button
          type="submit"
          className="primary-button"
          disabled={submitting || !description.trim()}
        >
          {submitting ? "Analyzing…" : "Log it"}
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}
    </form>
  );
}
