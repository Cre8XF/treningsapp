import { useState, useCallback } from 'react';

const STORAGE_KEY = 'workout_progress';

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function shiftDays(dateStr, delta) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + delta);
  return toDateStr(d);
}

function isSunday(dateStr) {
  return new Date(`${dateStr}T00:00:00`).getDay() === 0;
}

function daysInMonth(year, month) {
  // month is 1-based; day 0 of next month = last day of this month
  return new Date(year, month, 0).getDate();
}

export function useWorkoutProgress() {
  const [progress, setProgress] = useState(loadProgress);

  const update = useCallback((updater) => {
    setProgress((prev) => {
      const next = updater(prev);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleExercise = useCallback((dateStr, index) => {
    update((prev) => {
      const day = prev[dateStr] ?? { completed: false, exercises: [] };
      const exercises = [...(day.exercises ?? [])];
      exercises[index] = !exercises[index];
      return { ...prev, [dateStr]: { ...day, exercises } };
    });
  }, [update]);

  const markDayComplete = useCallback((dateStr) => {
    update((prev) => {
      const day = prev[dateStr] ?? { completed: false, exercises: [] };
      return { ...prev, [dateStr]: { ...day, completed: true } };
    });
  }, [update]);

  const isDayComplete = useCallback(
    (dateStr) => progress[dateStr]?.completed ?? false,
    [progress],
  );

  const getExerciseStates = useCallback(
    (dateStr) => progress[dateStr]?.exercises ?? [],
    [progress],
  );

  const getMonthStats = useCallback(
    (year, month) => {
      // --- totalWorkoutDays & completedDays (month-scoped) ---
      const count = daysInMonth(year, month);
      let totalWorkoutDays = 0;
      let completedDays = 0;

      for (let d = 1; d <= count; d++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        if (!isSunday(dateStr)) {
          totalWorkoutDays++;
          if (progress[dateStr]?.completed) completedDays++;
        }
      }

      // --- currentStreak (global, backwards from today, Sundays skipped) ---
      const todayStr = toDateStr(new Date());
      let currentStreak = 0;
      let cursor = todayStr;

      while (true) {
        if (isSunday(cursor)) {
          cursor = shiftDays(cursor, -1);
          continue;
        }
        if (progress[cursor]?.completed) {
          currentStreak++;
          cursor = shiftDays(cursor, -1);
        } else {
          break;
        }
      }

      // --- longestStreak (global, across all recorded data) ---
      const recordedDates = Object.keys(progress);
      let longestStreak = currentStreak;

      if (recordedDates.length > 0) {
        const earliest = recordedDates.reduce((a, b) => (a < b ? a : b));
        let running = 0;
        let day = earliest;

        while (day <= todayStr) {
          if (isSunday(day)) {
            day = shiftDays(day, 1);
            continue;
          }
          if (progress[day]?.completed) {
            running++;
            if (running > longestStreak) longestStreak = running;
          } else {
            running = 0;
          }
          day = shiftDays(day, 1);
        }
      }

      return { totalWorkoutDays, completedDays, currentStreak, longestStreak };
    },
    [progress],
  );

  return {
    toggleExercise,
    markDayComplete,
    isDayComplete,
    getExerciseStates,
    getMonthStats,
  };
}
