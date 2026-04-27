import { useState } from 'react';
import { CalendarDays, Dumbbell, Timer } from 'lucide-react';
import { useWorkoutProgress } from './hooks/useWorkoutProgress';
import { getDayWorkout } from './data/workouts';
import CalendarView from './components/Calendar';
import WorkoutSession from './components/WorkoutSession';
import RowingTimer from './components/RowingTimer';

function toDateStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const TABS = [
  { id: 'calendar', label: 'Kalender', Icon: CalendarDays },
  { id: 'workout',  label: 'Trening',  Icon: Dumbbell },
  { id: 'timer',    label: 'Timer',    Icon: Timer },
];

// ─── Header ──────────────────────────────────────────────────────────────────

function AppHeader() {
  const today = new Date();
  const dateLabel = today.toLocaleDateString('nb-NO', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <header
      className="shrink-0 flex items-center justify-between px-5"
      style={{
        height: '56px',
        background: '#0a0a0a',
        borderBottom: '1px solid #1a1a1a',
      }}
    >
      <h1
        className="text-3xl tracking-wider leading-none"
        style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#e8ff00' }}
      >
        TRENINGSAPP
      </h1>
      <p className="text-[11px] capitalize" style={{ color: '#444' }}>
        {dateLabel}
      </p>
    </header>
  );
}

// ─── Bottom navigation ────────────────────────────────────────────────────────

function BottomNav({ active, onChange }) {
  return (
    <nav
      className="shrink-0 flex"
      style={{
        height: '60px',
        background: '#0a0a0a',
        borderTop: '1px solid #1a1a1a',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {TABS.map(({ id, label, Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="flex-1 flex flex-col items-center justify-center gap-[3px] transition-all duration-150 active:scale-90"
            style={{ color: isActive ? '#e8ff00' : '#3a3a3a' }}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon
              size={22}
              strokeWidth={isActive ? 2 : 1.5}
              style={{
                filter: isActive ? 'drop-shadow(0 0 6px #e8ff0088)' : 'none',
                transition: 'filter 0.2s ease',
              }}
            />
            <span
              className="text-[10px] font-medium tracking-wide"
              style={{ color: isActive ? '#e8ff00' : '#3a3a3a' }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

// ─── Trening tab ─────────────────────────────────────────────────────────────

function WorkoutTab({ todayStr, todayWorkout, todayProgress, toggleExercise, markDayComplete }) {
  const [timerOpen, setTimerOpen] = useState(false);

  return (
    <div>
      {/* Collapsible rowing timer */}
      <div style={{ borderBottom: '1px solid #1a1a1a' }}>
        <button
          onClick={() => setTimerOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 transition-colors active:bg-white/5"
          style={{ background: '#111' }}
        >
          <div className="flex items-center gap-2">
            <span>🚣</span>
            <span className="text-sm font-semibold" style={{ color: '#666' }}>
              Oppvarming – romaskin
            </span>
          </div>
          <span className="text-[11px]" style={{ color: '#444' }}>
            {timerOpen ? '▲ skjul' : '▼ åpne timer'}
          </span>
        </button>

        <div
          style={{
            maxHeight: timerOpen ? '600px' : '0px',
            overflow: 'hidden',
            transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <RowingTimer standalone={false} />
        </div>
      </div>

      {/* Today's workout session */}
      <WorkoutSession
        date={todayStr}
        workout={todayWorkout}
        progress={todayProgress}
        onToggleExercise={(i) => toggleExercise(todayStr, i)}
        onComplete={() => markDayComplete(todayStr)}
      />
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState('workout');

  const {
    toggleExercise,
    markDayComplete,
    isDayComplete,
    getExerciseStates,
    getMonthStats,
  } = useWorkoutProgress();

  const today        = new Date();
  const todayStr     = toDateStr(today);
  const todayWorkout = getDayWorkout(today);
  const todayProgress = getExerciseStates(todayStr);

  const progressProps = { isDayComplete, toggleExercise, markDayComplete, getExerciseStates, getMonthStats };

  return (
    <>
      <AppHeader />

      <main className="flex-1 overflow-y-auto" style={{ background: '#0f0f0f' }}>
        {activeTab === 'calendar' && (
          <CalendarView {...progressProps} />
        )}

        {activeTab === 'workout' && (
          <WorkoutTab
            todayStr={todayStr}
            todayWorkout={todayWorkout}
            todayProgress={todayProgress}
            toggleExercise={toggleExercise}
            markDayComplete={markDayComplete}
          />
        )}

        {activeTab === 'timer' && <RowingTimer />}
      </main>

      <BottomNav active={activeTab} onChange={setActiveTab} />
    </>
  );
}
