import { useCallback, useEffect, useState } from "react";
import DateNav from "./components/DateNav";
import DailySummary from "./components/DailySummary";
import FoodEntryForm from "./components/FoodEntryForm";
import FoodLog from "./components/FoodLog";
import { createEntry, deleteEntry, fetchEntries, fetchSummary } from "./api";
import { todayISO } from "./dateUtils";
import "./App.css";

const GOAL_STORAGE_KEY = "calorieTracker.dailyGoal";
const DEFAULT_GOAL = 2000;

export default function App() {
  const [date, setDate] = useState(todayISO());
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [goal, setGoal] = useState(() => {
    const stored = Number(localStorage.getItem(GOAL_STORAGE_KEY));
    return stored > 0 ? stored : DEFAULT_GOAL;
  });

  const loadData = useCallback(async (isoDate) => {
    setLoading(true);
    setLoadError(null);
    try {
      const [entriesRes, summaryRes] = await Promise.all([
        fetchEntries(isoDate),
        fetchSummary(isoDate),
      ]);
      setEntries(entriesRes);
      setSummary(summaryRes);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(date);
  }, [date, loadData]);

  function handleGoalChange(newGoal) {
    setGoal(newGoal);
    localStorage.setItem(GOAL_STORAGE_KEY, String(newGoal));
  }

  async function handleAddEntry({ description, mealType }) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createEntry({ description, date, meal_type: mealType });
      await loadData(date);
      return true;
    } catch (err) {
      setSubmitError(err.message);
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteEntry(id) {
    setDeletingId(id);
    try {
      await deleteEntry(id);
      await loadData(date);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>AI Calorie Tracker</h1>
        <p className="app-header__subtitle">
          Describe what you ate in plain English — Claude estimates the rest.
        </p>
      </header>

      <main className="app-main">
        <DateNav date={date} onChange={setDate} />

        <FoodEntryForm
          onSubmit={handleAddEntry}
          submitting={submitting}
          error={submitError}
        />

        {loadError && (
          <p className="form-error">
            Couldn't reach the backend: {loadError}. Check that the API service is running.
          </p>
        )}

        <DailySummary summary={summary} goal={goal} onGoalChange={handleGoalChange} />

        {loading ? (
          <p className="loading-text">Loading…</p>
        ) : (
          <FoodLog entries={entries} onDelete={handleDeleteEntry} deletingId={deletingId} />
        )}
      </main>

      <footer className="app-footer">
        Nutrition values are AI-generated estimates, not verified lab measurements —
        useful for tracking trends, not medical decisions.
      </footer>
    </div>
  );
}
