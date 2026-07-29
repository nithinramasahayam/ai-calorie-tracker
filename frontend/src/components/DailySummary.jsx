import { useState } from "react";

const MACRO_CONFIG = [
  { key: "total_protein_g", label: "Protein", unit: "g", className: "macro--protein" },
  { key: "total_carbs_g", label: "Carbs", unit: "g", className: "macro--carbs" },
  { key: "total_fat_g", label: "Fat", unit: "g", className: "macro--fat" },
];

export default function DailySummary({ summary, goal, onGoalChange }) {
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalDraft, setGoalDraft] = useState(goal);

  const calories = summary?.total_calories ?? 0;
  const pct = goal ? Math.min(100, Math.round((calories / goal) * 100)) : 0;

  function saveGoal() {
    const parsed = Number(goalDraft);
    if (parsed > 0) onGoalChange(parsed);
    setEditingGoal(false);
  }

  return (
    <section className="summary-card">
      <div className="summary-card__header">
        <h2>Totals</h2>
        {summary && (
          <span className="summary-card__count">
            {summary.entry_count} {summary.entry_count === 1 ? "entry" : "entries"}
          </span>
        )}
      </div>

      <div className="calorie-progress">
        <div className="calorie-progress__numbers">
          <span className="calorie-progress__current">{Math.round(calories)}</span>
          <span className="calorie-progress__goal">
            {" "}
            /{" "}
            {editingGoal ? (
              <input
                autoFocus
                type="number"
                value={goalDraft}
                onChange={(e) => setGoalDraft(e.target.value)}
                onBlur={saveGoal}
                onKeyDown={(e) => e.key === "Enter" && saveGoal()}
                className="goal-input"
              />
            ) : (
              <button className="link-button" onClick={() => setEditingGoal(true)}>
                {goal} kcal goal
              </button>
            )}
          </span>
        </div>
        <div className="progress-track">
          <div
            className={`progress-fill ${pct >= 100 ? "progress-fill--over" : ""}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="macro-grid">
        {MACRO_CONFIG.map(({ key, label, unit, className }) => (
          <div className={`macro-block ${className}`} key={key}>
            <span className="macro-block__value">
              {Math.round(summary?.[key] ?? 0)}
              {unit}
            </span>
            <span className="macro-block__label">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
