import { addDays, formatDisplayDate, todayISO } from "../dateUtils";

export default function DateNav({ date, onChange }) {
  const isToday = date === todayISO();

  return (
    <div className="date-nav">
      <button
        className="icon-button"
        onClick={() => onChange(addDays(date, -1))}
        aria-label="Previous day"
      >
        ‹
      </button>

      <div className="date-nav__label">
        <span className="date-nav__day">{formatDisplayDate(date)}</span>
        <span className="date-nav__date">{date}</span>
      </div>

      <button
        className="icon-button"
        onClick={() => onChange(addDays(date, 1))}
        aria-label="Next day"
      >
        ›
      </button>

      {!isToday && (
        <button className="link-button" onClick={() => onChange(todayISO())}>
          Jump to today
        </button>
      )}
    </div>
  );
}
