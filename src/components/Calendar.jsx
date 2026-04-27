import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getDayWorkout } from '../data/workouts';
import WorkoutSession from './WorkoutSession';

// Index by getDay() — 0=Sun, 1=Mon, …, 6=Sat
const DAY_COLOR = ['#6b7280', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'];

// Header order: Mon–Sun
const WEEK_HEADERS  = ['M', 'T', 'O', 'T', 'F', 'L', 'S'];
const HEADER_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#6b7280'];

const MONTH_NAMES = [
  'Januar','Februar','Mars','April','Mai','Juni',
  'Juli','August','September','Oktober','November','Desember',
];

function toDateStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// European Mon-first offset: Sun → 6, Mon → 0, …
function startOffset(firstDayOfWeek) {
  return firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
}

// ─── Day cell ────────────────────────────────────────────────────────────────

function DayCell({ dateStr, day, dayOfWeek, isToday, completed, isFuture, onClick }) {
  const isSunday = dayOfWeek === 0;
  const color    = DAY_COLOR[dayOfWeek];

  return (
    <button
      onClick={isFuture ? undefined : onClick}
      disabled={isFuture}
      aria-label={dateStr}
      className="aspect-square flex flex-col items-center justify-center rounded-xl relative transition-all duration-150 active:scale-90 focus-visible:outline-none"
      style={{
        background : isSunday  ? '#111'
                   : completed ? 'rgba(74,222,128,0.09)'
                   : isToday   ? '#1c1c1e'
                                : '#141414',
        border: isToday   ? `2px solid ${color}`
              : completed ? '1px solid rgba(74,222,128,0.28)'
                          : '1px solid transparent',
        opacity: isFuture ? 0.28 : 1,
        cursor : isFuture ? 'default' : 'pointer',
      }}
    >
      <span
        className="text-sm font-semibold leading-none"
        style={{
          color: isSunday  ? '#3a3a3a'
               : isToday   ? color
               : completed ? '#4ade80'
                           : '#bbb',
        }}
      >
        {day}
      </span>

      {completed && (
        <span className="text-[10px] leading-none mt-[3px]" style={{ color: '#4ade80' }}>
          ✓
        </span>
      )}
      {isSunday && !completed && (
        <span className="text-[8px] leading-none mt-[3px]" style={{ color: '#2e2e2e' }}>
          hvile
        </span>
      )}
      {!isSunday && !completed && !isFuture && (
        <span
          className="w-[5px] h-[5px] rounded-full mt-[3px]"
          style={{ background: color, opacity: 0.6 }}
        />
      )}
    </button>
  );
}

// ─── Stats bar ───────────────────────────────────────────────────────────────

function StatsBar({ stats }) {
  const pct = stats.totalWorkoutDays
    ? Math.round((stats.completedDays / stats.totalWorkoutDays) * 100)
    : 0;

  return (
    <div
      className="rounded-2xl p-4 mb-6"
      style={{ background: '#1c1c1e', border: '1px solid #2c2c2e' }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">
            Denne måneden
          </p>
          <p className="text-2xl font-bold leading-none tabular-nums">
            <span style={{ color: '#e8ff00' }}>{stats.completedDays}</span>
            <span className="text-base font-normal text-gray-600">
              {' '}/ {stats.totalWorkoutDays} dager
            </span>
          </p>
        </div>

        <div className="flex gap-5">
          <div className="text-center">
            <p className="text-xl font-bold tabular-nums" style={{ color: '#f97316' }}>
              🔥 {stats.currentStreak}
            </p>
            <p className="text-[10px] text-gray-600 mt-0.5">Streak</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold tabular-nums" style={{ color: '#e8ff00' }}>
              ⭐ {stats.longestStreak}
            </p>
            <p className="text-[10px] text-gray-600 mt-0.5">Rekord</p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-[5px] rounded-full overflow-hidden" style={{ background: '#2a2a2a' }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: pct === 100
              ? 'linear-gradient(90deg,#4ade80,#22c55e)'
              : 'linear-gradient(90deg,#e8ff00,#a3e635)',
            transition: 'width 0.5s ease',
            boxShadow: `0 0 8px ${pct === 100 ? '#4ade8055' : '#e8ff0055'}`,
          }}
        />
      </div>
    </div>
  );
}

// ─── Slide-up sheet ──────────────────────────────────────────────────────────

function Sheet({ open, onClose, children }) {
  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.72)' }}
        onClick={onClose}
      />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-y-auto"
        style={{
          background: '#0f0f0f',
          maxHeight: '88vh',
          animation: 'slideUp 0.32s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Handle row */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-4 pt-3 pb-1"
          style={{ background: '#0f0f0f' }}
        >
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full"
            style={{ background: '#2e2e2e' }}
          />
          <div className="w-8" />
          <div />
          <button
            onClick={onClose}
            className="p-2 rounded-full active:scale-90 transition-transform"
            style={{ background: '#1c1c1e' }}
            aria-label="Lukk"
          >
            <X size={16} color="#666" />
          </button>
        </div>
        {children}
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0.4; }
          to   { transform: translateY(0);    opacity: 1;   }
        }
      `}</style>
    </>
  );
}

// ─── Calendar ────────────────────────────────────────────────────────────────

export default function Calendar({
  isDayComplete,
  toggleExercise,
  markDayComplete,
  getExerciseStates,
  getMonthStats,
}) {
  const today    = new Date();
  const todayStr = toDateStr(today);

  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1); // 1-based
  const [selected,  setSelected]  = useState(null);

  const stats = getMonthStats(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 1) { setViewYear(y => y - 1); setViewMonth(12); }
    else                 { setViewMonth(m => m - 1); }
  };
  const nextMonth = () => {
    if (viewMonth === 12) { setViewYear(y => y + 1); setViewMonth(1); }
    else                  { setViewMonth(m => m + 1); }
  };

  // Build grid cells
  const firstDay    = new Date(viewYear, viewMonth - 1, 1);
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const offset      = startOffset(firstDay.getDay());

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${viewYear}-${String(viewMonth).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    cells.push({ dateStr, day: d, dayOfWeek: new Date(`${dateStr}T00:00:00`).getDay() });
  }

  const selectedWorkout  = selected ? getDayWorkout(new Date(`${selected}T00:00:00`)) : null;
  const selectedProgress = selected ? getExerciseStates(selected) : [];

  return (
    <div
      className="min-h-screen px-4 py-6"
      style={{ background: '#0f0f0f', color: '#fff', fontFamily: 'system-ui,sans-serif' }}
    >
      <StatsBar stats={stats} />

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 rounded-xl active:scale-90 transition-transform"
          style={{ background: '#1c1c1e' }}
          aria-label="Forrige måned"
        >
          <ChevronLeft size={20} color="#666" />
        </button>

        <button
          onClick={() => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth() + 1); }}
          className="text-base font-bold tracking-wide capitalize"
          style={{ color: '#fff' }}
        >
          {MONTH_NAMES[viewMonth - 1]} {viewYear}
        </button>

        <button
          onClick={nextMonth}
          className="p-2 rounded-xl active:scale-90 transition-transform"
          style={{ background: '#1c1c1e' }}
          aria-label="Neste måned"
        >
          <ChevronRight size={20} color="#666" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEK_HEADERS.map((h, i) => (
          <p key={i} className="text-center text-[11px] font-bold py-1" style={{ color: HEADER_COLORS[i] }}>
            {h}
          </p>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) =>
          cell ? (
            <DayCell
              key={cell.dateStr}
              {...cell}
              isToday={cell.dateStr === todayStr}
              completed={isDayComplete(cell.dateStr)}
              isFuture={cell.dateStr > todayStr}
              onClick={() => setSelected(cell.dateStr)}
            />
          ) : (
            <div key={`e-${i}`} />
          ),
        )}
      </div>

      {/* Slide-up WorkoutSession sheet */}
      <Sheet open={!!selected} onClose={() => setSelected(null)}>
        <WorkoutSession
          date={selected ?? ''}
          workout={selectedWorkout}
          progress={selectedProgress}
          onToggleExercise={(index) => toggleExercise(selected, index)}
          onComplete={() => {
            markDayComplete(selected);
            setSelected(null);
          }}
        />
      </Sheet>
    </div>
  );
}
