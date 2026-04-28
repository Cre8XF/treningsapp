import { useState, useMemo } from 'react';
import { Plus, Play, ChevronRight } from 'lucide-react';
import exercises from '../data/exercises';
import templateWorkouts from '../data/templateWorkouts';
import useSavedWorkouts from '../hooks/useSavedWorkouts';
import WorkoutBuilder from './WorkoutBuilder';
import AutoWorkout from './AutoWorkout';

// ─── Animated screen wrapper ──────────────────────────────────────────────────

function AnimatedScreen({ children, animation = 'screenFadeIn' }) {
  return (
    <div style={{ animation: `${animation} 0.22s cubic-bezier(0.4, 0, 0.2, 1) both` }}>
      {children}
    </div>
  );
}

// ─── Day suggestions (matching workouts.js) ───────────────────────────────────

const DAY_SUGGESTIONS = {
  0: null,
  1: {
    label: 'Mandag',
    exerciseIds: ['squat', 'plank', 'push_up', 'step_up', 'mountain_climber', 'glute_bridge', 'bicycle_crunch'],
    config: { warmup: 'before', warmupTime: 8, interval: '30/15', rounds: 3 },
  },
  2: {
    label: 'Tirsdag',
    exerciseIds: ['squat', 'plank', 'push_up', 'lunge', 'leg_raise', 'donkey_kick', 'russian_twist'],
    config: { warmup: 'before', warmupTime: 8, interval: '30/15', rounds: 3 },
  },
  3: {
    label: 'Onsdag',
    exerciseIds: ['squat', 'plank', 'push_up', 'jumping_jack', 'bulgarian_split_squat', 'glute_bridge', 'heel_touch'],
    config: { warmup: 'before', warmupTime: 8, interval: '30/15', rounds: 3 },
  },
  4: {
    label: 'Torsdag',
    exerciseIds: ['squat', 'plank', 'push_up', 'step_up', 'burpee', 'single_leg_glute_bridge', 'flutter_kick'],
    config: { warmup: 'before', warmupTime: 8, interval: '30/15', rounds: 3 },
  },
  5: {
    label: 'Fredag',
    exerciseIds: ['squat', 'plank', 'push_up', 'side_lunge', 'high_knee', 'hip_raise', 'v_up'],
    config: { warmup: 'before', warmupTime: 8, interval: '30/15', rounds: 3 },
  },
  6: {
    label: 'Lørdag',
    exerciseIds: ['squat', 'plank', 'push_up', 'side_lunge', 'jump_squat', 'bridge_march', 'leg_raise'],
    config: { warmup: 'before', warmupTime: 8, interval: '30/15', rounds: 3 },
  },
};

const TEMPLATE_ACCENTS = ['#e8ff00', '#ff6b35', '#a855f7', '#00d4ff'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'God morgen';
  if (h >= 12 && h < 18) return 'God ettermiddag';
  return 'God kveld';
}

function estimateMinutes(settings, exerciseCount) {
  const iMap = { '20/10': { w: 20, r: 10 }, '30/15': { w: 30, r: 15 }, '40/20': { w: 40, r: 20 } };
  const intv = iMap[settings?.interval] ?? { w: 20, r: 10 };
  const { warmup = 'none', warmupTime = 5, rounds = 1 } = settings ?? {};
  const perRound = exerciseCount * intv.w + Math.max(0, exerciseCount - 1) * intv.r;
  const workSecs = rounds * perRound + Math.max(0, rounds - 1) * 30;
  const rowingSecs =
    warmup === 'both' ? warmupTime * 120 :
    warmup === 'before' || warmup === 'after' ? warmupTime * 60 : 0;
  return Math.ceil((workSecs + rowingSecs) / 60);
}

function getActiveSession() {
  try {
    const session = JSON.parse(sessionStorage.getItem('active_workout') || 'null');
    const today = new Date().toISOString().slice(0, 10);
    return session?.date === today ? session : null;
  } catch {
    return null;
  }
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <p style={{
      fontSize: '11px', fontWeight: 700, color: '#555',
      letterSpacing: '2.5px', textTransform: 'uppercase',
      marginBottom: '12px', paddingLeft: '16px',
    }}>
      {children}
    </p>
  );
}

// ─── Today / continue card (full width) ──────────────────────────────────────

function TodayCard({ onOpen }) {
  const dayOfWeek = new Date().getDay();
  const activeSession = getActiveSession();
  const suggestion = DAY_SUGGESTIONS[dayOfWeek];

  if (activeSession) {
    return (
      <div style={{ padding: '0 16px' }}>
        <button
          onClick={() => onOpen(activeSession.config, activeSession.exerciseIds, 3)}
          className="active:scale-[0.98] transition-all duration-150"
          style={{
            width: '100%', padding: '18px 20px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #052e16, #14532d)',
            border: '1px solid rgba(22,163,74,0.35)',
            cursor: 'pointer', textAlign: 'left',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}
        >
          <div>
            <p style={{ fontSize: '10px', fontWeight: 700, color: '#4ade8099', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px' }}>
              Pågår
            </p>
            <p style={{ fontSize: '19px', fontWeight: 800, color: '#4ade80' }}>Fortsett dagens økt</p>
          </div>
          <ChevronRight size={24} color="#4ade80" />
        </button>
      </div>
    );
  }

  if (!suggestion) {
    return (
      <div style={{ padding: '0 16px' }}>
        <div style={{
          padding: '24px', borderRadius: '16px',
          background: '#1c1c1e', border: '1px solid #242424',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '36px', marginBottom: '8px' }}>🛌</p>
          <p style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>Hviledag</p>
          <p style={{ fontSize: '13px', color: '#444' }}>Kroppen trenger hvile for å vokse!</p>
        </div>
      </div>
    );
  }

  const exObjects = suggestion.exerciseIds
    .map(id => exercises.find(e => e.id === id))
    .filter(Boolean);
  const minutes = estimateMinutes(suggestion.config, suggestion.exerciseIds.length);
  const preview = exObjects.slice(0, 4);

  return (
    <div style={{ padding: '0 16px' }}>
      <button
        onClick={() => onOpen(suggestion.config, suggestion.exerciseIds, 3)}
        className="active:scale-[0.98] transition-all duration-150"
        style={{
          width: '100%', padding: '18px 20px', borderRadius: '16px',
          background: '#1c1c1e', border: '1px solid #2a2a2a',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div>
            <span style={{
              fontSize: '10px', fontWeight: 700, color: '#e8ff00',
              letterSpacing: '2px', textTransform: 'uppercase',
              background: '#e8ff0015', padding: '3px 8px', borderRadius: '6px',
              display: 'inline-block',
            }}>
              {suggestion.label}
            </span>
            <p style={{ fontSize: '19px', fontWeight: 800, color: '#fff', marginTop: '8px', lineHeight: 1.1 }}>
              Dagens økt
            </p>
          </div>
          <p style={{ fontSize: '13px', color: '#555', fontWeight: 600, flexShrink: 0, marginLeft: '12px' }}>
            ~{minutes} min
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
          {preview.map(ex => (
            <span key={ex.id} style={{
              fontSize: '12px', fontWeight: 600, color: '#999',
              background: '#262626', padding: '4px 10px', borderRadius: '20px',
            }}>
              {ex.emoji} {ex.name}
            </span>
          ))}
          {exObjects.length > 4 && (
            <span style={{
              fontSize: '12px', color: '#555',
              background: '#222', padding: '4px 10px', borderRadius: '20px',
            }}>
              +{exObjects.length - 4} til
            </span>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#444', fontWeight: 600 }}>
            {exObjects.length} øvelser · {suggestion.config.rounds} runder
          </span>
          <span style={{
            fontSize: '13px', fontWeight: 700, color: '#e8ff00',
            display: 'flex', alignItems: 'center', gap: '3px',
          }}>
            Start <ChevronRight size={15} strokeWidth={2.5} />
          </span>
        </div>
      </button>
    </div>
  );
}

// ─── Workout card (horizontal scroll) ────────────────────────────────────────

function WorkoutCard({ name, emoji, description, exerciseCount, minutes, accent = '#e8ff00', onPress }) {
  return (
    <button
      onClick={onPress}
      className="shrink-0 active:scale-95 transition-all duration-150 text-left"
      style={{
        width: '162px', padding: '14px 14px 12px', borderRadius: '16px',
        background: '#1c1c1e', border: '1px solid #242424',
        cursor: 'pointer', display: 'flex', flexDirection: 'column',
        minHeight: '178px',
      }}
    >
      <span style={{ fontSize: '26px', marginBottom: '8px', display: 'block' }}>{emoji}</span>
      <p style={{ fontSize: '14px', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: '4px' }}>
        {name}
      </p>
      {description && (
        <p style={{ fontSize: '11px', color: '#4a4a4a', lineHeight: 1.35, marginBottom: '8px', flexGrow: 1 }}>
          {description}
        </p>
      )}
      <div style={{ marginTop: 'auto' }}>
        <p style={{ fontSize: '11px', color: '#3a3a3a', marginBottom: '8px', fontWeight: 600 }}>
          {exerciseCount} øvelser · ~{minutes} min
        </p>
        <div style={{
          padding: '7px 10px', borderRadius: '8px',
          background: `${accent}18`, border: `1px solid ${accent}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
        }}>
          <Play size={11} fill={accent} strokeWidth={0} />
          <span style={{ fontSize: '12px', fontWeight: 700, color: accent }}>Start</span>
        </div>
      </div>
    </button>
  );
}

function NewWorkoutCard({ onPress }) {
  return (
    <button
      onClick={onPress}
      className="shrink-0 active:scale-95 transition-all duration-150"
      style={{
        width: '130px', minHeight: '178px', borderRadius: '16px',
        border: '2px dashed #252525', background: 'transparent',
        cursor: 'pointer', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '10px',
        padding: '14px',
      }}
    >
      <div style={{
        width: '42px', height: '42px', borderRadius: '50%',
        background: '#1a1a1a', border: '1px solid #2a2a2a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Plus size={20} color="#3a3a3a" />
      </div>
      <span style={{ fontSize: '13px', fontWeight: 700, color: '#3a3a3a', textAlign: 'center', lineHeight: 1.2 }}>
        Ny økt
      </span>
    </button>
  );
}

// ─── Home view ────────────────────────────────────────────────────────────────

function HomeView({ onOpen, onNew }) {
  const { workouts: savedWorkouts } = useSavedWorkouts();

  const dateLabel = useMemo(() =>
    new Date().toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' }),
    [],
  );

  return (
    <div style={{ paddingTop: '24px', paddingBottom: '32px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Greeting */}
      <div style={{ padding: '0 16px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: '5px' }}>
          {getGreeting()}, <span style={{ color: '#e8ff00' }}>Roger!</span> 💪
        </h2>
        <p style={{ fontSize: '13px', color: '#555', fontWeight: 600, textTransform: 'capitalize' }}>
          {dateLabel}
        </p>
      </div>

      {/* Dagens forslag */}
      <div>
        <SectionLabel>Dagens forslag</SectionLabel>
        <TodayCard onOpen={onOpen} />
      </div>

      {/* Mine Økter */}
      <div>
        <SectionLabel>Mine Økter</SectionLabel>
        <div style={{
          display: 'flex', gap: '10px',
          overflowX: 'auto', padding: '2px 16px 4px',
          scrollbarWidth: 'none',
        }}>
          {savedWorkouts.length === 0 && (
            <p style={{
              fontSize: '13px', color: '#333', fontWeight: 600,
              alignSelf: 'center', paddingRight: '8px', whiteSpace: 'nowrap',
            }}>
              Ingen lagrede enda –
            </p>
          )}
          {savedWorkouts.map(w => {
            const firstEx = exercises.find(e => e.id === w.exercises?.[0]);
            return (
              <WorkoutCard
                key={w.id}
                name={w.name}
                emoji={firstEx?.emoji ?? '⭐'}
                exerciseCount={w.exercises?.length ?? 0}
                minutes={estimateMinutes(w.settings, w.exercises?.length ?? 0)}
                accent="#e8ff00"
                onPress={() => onOpen(w.settings, w.exercises, 3)}
              />
            );
          })}
          <NewWorkoutCard onPress={onNew} />
        </div>
      </div>

      {/* Mal-Økter */}
      <div>
        <SectionLabel>Mal-Økter</SectionLabel>
        <div style={{
          display: 'flex', gap: '10px',
          overflowX: 'auto', padding: '2px 16px 4px',
          scrollbarWidth: 'none',
        }}>
          {templateWorkouts.map((t, i) => (
            <WorkoutCard
              key={t.id}
              name={t.name}
              emoji={t.emoji}
              description={t.description}
              exerciseCount={t.exercises.length}
              minutes={estimateMinutes(t.settings, t.exercises.length)}
              accent={TEMPLATE_ACCENTS[i] ?? '#e8ff00'}
              onPress={() => onOpen(t.settings, t.exercises, 3)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── HomeScreen ───────────────────────────────────────────────────────────────

export default function HomeScreen({ markDayComplete }) {
  const [screen, setScreen] = useState('home');
  const [preset, setPreset] = useState(null);
  const [sessionData, setSessionData] = useState(null);

  function handleOpen(config, exerciseIds, startAtStep = 3) {
    setPreset({ config, exerciseIds, startAtStep });
    setScreen('builder');
  }

  function handleNew() {
    setPreset(null);
    setScreen('builder');
  }

  function handleStart({ config, exercises: exObjects }) {
    setSessionData({ settings: config, exercises: exObjects });
    setScreen('session');
  }

  function handleSessionDone() {
    setSessionData(null);
    setScreen('home');
  }

  if (screen === 'session') {
    return (
      <AnimatedScreen animation="screenSlideRight">
        <AutoWorkout
          exercises={sessionData.exercises}
          settings={sessionData.settings}
          markDayComplete={markDayComplete}
          onDone={handleSessionDone}
        />
      </AnimatedScreen>
    );
  }

  if (screen === 'builder') {
    return (
      <AnimatedScreen animation="screenSlideRight">
        <WorkoutBuilder
          initialConfig={preset?.config}
          initialExerciseIds={preset?.exerciseIds}
          initialStep={preset?.startAtStep ?? 1}
          onBack={() => setScreen('home')}
          onStart={handleStart}
        />
      </AnimatedScreen>
    );
  }

  return (
    <AnimatedScreen animation="screenFadeIn">
      <HomeView onOpen={handleOpen} onNew={handleNew} />
    </AnimatedScreen>
  );
}
