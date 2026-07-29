const BASE_URL = "https://ai-calorie-backend-h20o.onrender.com/api";

async function handle(res) {
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body.detail) detail = body.detail;
    } catch {
      // response wasn't JSON, keep the generic message
    }
    throw new Error(detail);
  }
  if (res.status === 204) return null;
  return res.json();
}

export function createEntry({ description, date, meal_type }) {
  return fetch(`${BASE_URL}/entries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description, date, meal_type }),
  }).then(handle);
}

export function fetchEntries(date) {
  return fetch(`${BASE_URL}/entries?date=${date}`).then(handle);
}

export function fetchSummary(date) {
  return fetch(`${BASE_URL}/summary?date=${date}`).then(handle);
}

export function deleteEntry(id) {
  return fetch(`${BASE_URL}/entries/${id}`, { method: "DELETE" }).then(handle);
}
