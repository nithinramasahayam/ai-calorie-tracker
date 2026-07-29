// Local-time YYYY-MM-DD, avoiding the UTC-shift bugs that
// `new Date().toISOString()` introduces near midnight.
export function toISODate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayISO() {
  return toISODate(new Date());
}

export function addDays(isoDate, delta) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + delta);
  return toISODate(date);
}

export function formatDisplayDate(isoDate) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const todayStr = todayISO();
  const yesterdayStr = addDays(todayStr, -1);
  const tomorrowStr = addDays(todayStr, 1);

  if (isoDate === todayStr) return "Today";
  if (isoDate === yesterdayStr) return "Yesterday";
  if (isoDate === tomorrowStr) return "Tomorrow";

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// Suggests a meal type based on the current local time, used as the
// default selection in the entry form.
export function suggestMealType() {
  const hour = new Date().getHours();
  if (hour < 11) return "breakfast";
  if (hour < 16) return "lunch";
  if (hour < 21) return "dinner";
  return "snack";
}
