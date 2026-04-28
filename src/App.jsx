import { useState } from 'react';
import { CalendarDays, Dumbbell, Timer } from 'lucide-react';
import { useWorkoutProgress } from './hooks/useWorkoutProgress';
import CalendarView from './components/Calendar';
import HomeScreen from './components/HomeScreen';
import RowingTimer from './components/RowingTimer';

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

  const calendarProps = { isDayComplete, toggleExercise, markDayComplete, getExerciseStates, getMonthStats };

  return (
    <>
      <AppHeader />

      <main className="flex-1 overflow-y-auto" style={{ background: '#0f0f0f' }}>
        {activeTab === 'calendar' && (
          <CalendarView {...calendarProps} />
        )}

        {activeTab === 'workout' && (
          <HomeScreen markDayComplete={markDayComplete} />
        )}

        {activeTab === 'timer' && <RowingTimer />}
      </main>

      <BottomNav active={activeTab} onChange={setActiveTab} />
    </>
  );
}
