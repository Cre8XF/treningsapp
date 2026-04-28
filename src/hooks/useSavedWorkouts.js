import { useState, useCallback } from 'react';

const STORAGE_KEY = 'saved_workouts';

function loadFromStorage() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function persistToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function generateId() {
  return 'workout_' + Math.random().toString(36).slice(2, 9);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// ─── Stateless helpers (usable outside React) ─────────────────────────────────

export function saveWorkout(name, settings, exercises) {
  const all = loadFromStorage();
  const id = generateId();
  all[id] = {
    id,
    name: name.trim() || 'Uten navn',
    createdAt: todayISO(),
    settings,
    exercises,
  };
  persistToStorage(all);
  return id;
}

export function getSavedWorkouts() {
  const all = loadFromStorage();
  return Object.values(all).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function deleteWorkout(id) {
  const all = loadFromStorage();
  delete all[id];
  persistToStorage(all);
}

export function getWorkout(id) {
  return loadFromStorage()[id] ?? null;
}

// ─── React hook ───────────────────────────────────────────────────────────────

export default function useSavedWorkouts() {
  const [workouts, setWorkouts] = useState(() => getSavedWorkouts());

  const refresh = useCallback(() => {
    setWorkouts(getSavedWorkouts());
  }, []);

  const save = useCallback((name, settings, exercises) => {
    const id = saveWorkout(name, settings, exercises);
    refresh();
    return id;
  }, [refresh]);

  const remove = useCallback((id) => {
    deleteWorkout(id);
    refresh();
  }, [refresh]);

  const get = useCallback((id) => getWorkout(id), []);

  return { workouts, save, remove, get, refresh };
}
