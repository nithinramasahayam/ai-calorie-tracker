const MEAL_ORDER = ["breakfast", "lunch", "dinner", "snack"];

function groupByMeal(entries) {
  const groups = {};
  for (const entry of entries) {
    const key = MEAL_ORDER.includes(entry.meal_type) ? entry.meal_type : "snack";
    if (!groups[key]) groups[key] = [];
    groups[key].push(entry);
  }
  return groups;
}

export default function FoodLog({ entries, onDelete, deletingId }) {
  if (entries.length === 0) {
    return (
      <div className="empty-state">
        <p>Nothing logged for this day yet.</p>
        <p className="empty-state__hint">
          Describe a meal above in plain language — Claude will estimate the macros.
        </p>
      </div>
    );
  }

  const grouped = groupByMeal(entries);

  return (
    <div className="food-log">
      {MEAL_ORDER.filter((meal) => grouped[meal]?.length).map((meal) => (
        <div className="food-log__group" key={meal}>
          <h3 className="food-log__meal-heading">{meal}</h3>
          {grouped[meal].map((entry) => (
            <article className="entry-card" key={entry.id}>
              <div className="entry-card__main">
                <p className="entry-card__description">{entry.description}</p>
                <p className="entry-card__items">
                  {entry.food_items.map((item, i) => (
                    <span key={i} className="food-item-chip">
                      {item.name} · {item.estimated_portion}
                    </span>
                  ))}
                </p>
                {entry.assumptions && (
                  <p className="entry-card__assumptions">{entry.assumptions}</p>
                )}
              </div>

              <div className="entry-card__macros">
                <span className="entry-card__calories">
                  {Math.round(entry.calories)} kcal
                </span>
                <span className="entry-card__macro-line">
                  P {Math.round(entry.protein_g)}g · C {Math.round(entry.carbs_g)}g · F{" "}
                  {Math.round(entry.fat_g)}g
                </span>
                <span className={`confidence-tag confidence-tag--${entry.confidence}`}>
                  {entry.confidence} confidence
                </span>
                <button
                  className="icon-button icon-button--danger"
                  onClick={() => onDelete(entry.id)}
                  disabled={deletingId === entry.id}
                  aria-label="Delete entry"
                >
                  {deletingId === entry.id ? "…" : "✕"}
                </button>
              </div>
            </article>
          ))}
        </div>
      ))}
    </div>
  );
}
