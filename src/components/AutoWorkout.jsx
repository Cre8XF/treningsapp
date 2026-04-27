import { useState, useEffect, useRef, useCallback } from 'react';
import { getDayWorkout } from '../data/workouts';

// ─── Audio ────────────────────────────────────────────────────────────────────

function playBeep(freq = 880, durationMs = 100, vol = 0.3) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + durationMs / 1000);
    setTimeout(() => ctx.close(), durationMs + 200);
  } catch {}
}

function playTripleBeep() {
  playBeep(880, 100);
  setTimeout(() => playBeep(880, 100), 160);
  setTimeout(() => playBeep(880, 100), 320);
}

function playDoneSound() {
  playBeep(440, 500, 0.5);
}

function vibrate(pattern) {
  try { navigator.vibrate?.(pattern); } catch {}
}

// ─── Shared circular timer ────────────────────────────────────────────────────

function CircleTimer({ timeLeft, totalTime, color = '#00d4ff', size = 260 }) {
  const radius = (size - 24) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - (totalTime > 0 ? timeLeft / totalTime : 0));
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#1c1c1c" strokeWidth={16} />
        <circle cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={16}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 0.95s linear, stroke 0.3s ease',
            filter: `drop-shadow(0 0 10px ${color}88)`,
          }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{
          fontFamily: 'monospace',
          fontSize: size > 230 ? '52px' : '40px',
          fontWeight: 'bold',
          color,
          letterSpacing: '2px',
          textShadow: `0 0 20px ${color}55`,
          lineHeight: 1,
        }}>
          {mm}:{ss}
        </span>
      </div>
    </div>
  );
}

// ─── Setup options ────────────────────────────────────────────────────────────

const TIME_OPTS = [
  { label: '5 min',  secs: 5  * 60 },
  { label: '8 min',  secs: 8  * 60 },
  { label: '10 min', secs: 10 * 60 },
  { label: '15 min', secs: 15 * 60 },
];

const INTERVAL_OPTS = [
  { label: '20 sek på / 10 sek av', work: 20, rest: 10 },
  { label: '30 sek på / 15 sek av', work: 30, rest: 15 },
  { label: '40 sek på / 20 sek av', work: 40, rest: 20 },
];

// ─── Phase 1: Setup ───────────────────────────────────────────────────────────

function SetupPhase({ rowingSecs, setRowingSecs, intervalOpt, setIntervalOpt, onStart }) {
  return (
    <div style={{ padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Rowing time */}
      <div>
        <p style={{
          color: '#555', fontSize: '11px', fontWeight: '700',
          letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: '12px',
        }}>
          Ro-tid
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {TIME_OPTS.map((o) => {
            const on = rowingSecs === o.secs;
            return (
              <button key={o.secs} onClick={() => setRowingSecs(o.secs)} style={{
                padding: '14px 0', borderRadius: '10px',
                border: `2px solid ${on ? '#00d4ff' : '#1e1e1e'}`,
                background: on ? '#00d4ff15' : '#111',
                color: on ? '#00d4ff' : '#444',
                fontSize: '14px', fontWeight: '700', cursor: 'pointer',
                transition: 'all 0.15s',
              }}>
                {o.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interval */}
      <div>
        <p style={{
          color: '#555', fontSize: '11px', fontWeight: '700',
          letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: '12px',
        }}>
          Intervall-oppsett (styrke)
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {INTERVAL_OPTS.map((o, i) => {
            const on = intervalOpt === o;
            return (
              <button key={i} onClick={() => setIntervalOpt(o)} style={{
                padding: '14px 16px', borderRadius: '10px', textAlign: 'left',
                border: `2px solid ${on ? '#e8ff00' : '#1e1e1e'}`,
                background: on ? '#e8ff0010' : '#111',
                color: on ? '#e8ff00' : '#444',
                fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                transition: 'all 0.15s',
              }}>
                {o.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Start */}
      <button onClick={onStart} style={{
        padding: '20px', borderRadius: '14px', border: 'none',
        background: 'linear-gradient(135deg, #e8ff00, #c8df00)',
        color: '#000', fontSize: '26px', fontWeight: '900',
        letterSpacing: '3px', cursor: 'pointer',
        fontFamily: "'Bebas Neue', sans-serif",
        boxShadow: '0 0 40px #e8ff0033, 0 4px 20px rgba(0,0,0,0.4)',
      }}>
        START ØVKT
      </button>
    </div>
  );
}

// ─── Phase 2: Rowing ──────────────────────────────────────────────────────────

function RowingPhase({ rowingSecs, onDone }) {
  const [timeLeft, setTimeLeft] = useState(rowingSecs);
  const beepedRef = useRef(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      playDoneSound();
      vibrate([500]);
      onDone();
      return;
    }
    if (timeLeft === 3 && !beepedRef.current) {
      beepedRef.current = true;
      playTripleBeep();
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, onDone]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '48px 20px', gap: '28px',
    }}>
      <p style={{
        color: '#555', fontSize: '13px', fontWeight: '700',
        letterSpacing: '3px', textTransform: 'uppercase',
      }}>
        🚣 Romaskin
      </p>
      <CircleTimer timeLeft={timeLeft} totalTime={rowingSecs} color="#00d4ff" />
      <p style={{ color: '#333', fontSize: '13px' }}>
        Automatisk overgang til styrkeøvelser
      </p>
    </div>
  );
}

// ─── Phase 3: Strength ────────────────────────────────────────────────────────

function StrengthPhase({ exercises, intervalOpt, onDone }) {
  const [exIdx, setExIdx] = useState(0);
  const [subPhase, setSubPhase] = useState('work');
  const [timeLeft, setTimeLeft] = useState(intervalOpt.work);

  const totalTime = subPhase === 'work' ? intervalOpt.work : intervalOpt.rest;
  const ringColor = subPhase === 'work' ? '#e8ff00' : '#ff3b3b';

  useEffect(() => {
    if (timeLeft > 0) {
      const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(id);
    }
    if (subPhase === 'work') {
      if (exIdx >= exercises.length - 1) {
        playDoneSound();
        vibrate([500]);
        onDone();
        return;
      }
      playBeep(880, 100);
      vibrate([200]);
      setSubPhase('rest');
      setTimeLeft(intervalOpt.rest);
    } else {
      playBeep(880, 100);
      vibrate([200]);
      setExIdx((i) => i + 1);
      setSubPhase('work');
      setTimeLeft(intervalOpt.work);
    }
  }, [timeLeft, subPhase, exIdx, exercises.length, intervalOpt, onDone]);

  const exercise = exercises[exIdx];
  const nextEx = exIdx < exercises.length - 1 ? exercises[exIdx + 1] : null;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '24px 20px', gap: '16px',
    }}>
      {/* Header row */}
      <div style={{
        width: '100%', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{
          color: '#444', fontSize: '12px', fontWeight: '700',
          letterSpacing: '2px', textTransform: 'uppercase',
        }}>
          💪 Styrke
        </span>
        <span style={{ color: '#555', fontSize: '13px', fontWeight: '700' }}>
          Øvelse {exIdx + 1} av {exercises.length}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ width: '100%', height: '3px', background: '#1a1a1a', borderRadius: '2px' }}>
        <div style={{
          height: '100%', borderRadius: '2px',
          background: '#e8ff00',
          width: `${((exIdx + (subPhase === 'rest' ? 1 : 0)) / exercises.length) * 100}%`,
          transition: 'width 0.5s ease',
          boxShadow: '0 0 6px #e8ff0066',
        }} />
      </div>

      {/* Exercise info */}
      <div style={{ textAlign: 'center', marginTop: '8px' }}>
        <div style={{ fontSize: '72px', lineHeight: 1 }}>{exercise.emoji}</div>
        <h2 style={{
          color: '#fff', fontSize: '30px', fontWeight: '800',
          letterSpacing: '1px', margin: '10px 0 6px',
        }}>
          {exercise.name}
        </h2>
        <p style={{
          color: ringColor, fontSize: '14px', fontWeight: '700',
          textTransform: 'uppercase', letterSpacing: '3px',
          textShadow: `0 0 12px ${ringColor}66`,
        }}>
          {subPhase === 'work' ? '▶ PÅ' : '◼ HVILE'}
        </p>
      </div>

      {/* Ring */}
      <CircleTimer timeLeft={timeLeft} totalTime={totalTime} color={ringColor} size={220} />

      {/* Next exercise hint */}
      <div style={{ minHeight: '24px' }}>
        {subPhase === 'rest' && nextEx && (
          <p style={{ color: '#444', fontSize: '14px', textAlign: 'center' }}>
            Neste: <span style={{ color: '#777' }}>{nextEx.emoji} {nextEx.name}</span>
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Phase 4: Done ────────────────────────────────────────────────────────────

function DonePhase({ elapsedSecs, onMarkComplete, onRestart }) {
  const mm = String(Math.floor(elapsedSecs / 60)).padStart(2, '0');
  const ss = String(elapsedSecs % 60).padStart(2, '0');
  const [marked, setMarked] = useState(false);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '48px 20px', gap: '28px',
      minHeight: '60vh',
    }}>
      <style>{`@keyframes trophyPop{0%,100%{transform:scale(1)}50%{transform:scale(1.18)}}`}</style>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '88px', lineHeight: 1, animation: 'trophyPop 1.6s ease-in-out infinite' }}>
          🏆
        </div>
        <h1 style={{
          color: '#e8ff00', fontSize: '60px', fontWeight: '900',
          letterSpacing: '4px', margin: '12px 0 0',
          fontFamily: "'Bebas Neue', sans-serif",
          textShadow: '0 0 40px #e8ff0055',
        }}>
          FERDIG!
        </h1>
        <p style={{ color: '#555', fontSize: '16px', marginTop: '10px', fontFamily: 'monospace' }}>
          Total tid:{' '}
          <span style={{ color: '#888' }}>{mm}:{ss}</span>
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '320px' }}>
        <button
          onClick={() => { if (!marked) { setMarked(true); onMarkComplete(); } }}
          disabled={marked}
          style={{
            padding: '18px', borderRadius: '14px', border: 'none',
            background: marked ? '#0d2214' : 'linear-gradient(135deg, #4ade80, #22c55e)',
            color: marked ? '#4ade80' : '#000',
            fontSize: '17px', fontWeight: '700',
            cursor: marked ? 'default' : 'pointer',
            transition: 'all 0.3s',
          }}
        >
          {marked ? '✓ Dag markert som fullført' : 'Marker dag som fullført'}
        </button>
        <button onClick={onRestart} style={{
          padding: '16px', borderRadius: '14px',
          border: '2px solid #222', background: 'transparent',
          color: '#555', fontSize: '16px', fontWeight: '600', cursor: 'pointer',
        }}>
          Gjør igjen
        </button>
      </div>
    </div>
  );
}

// ─── Phase 1.5: Preparation ──────────────────────────────────────────────────

function PrepPhase({ exercises, rowingSecs, intervalOpt, onBack, onStart }) {
  const rowingMins = Math.round(rowingSecs / 60);

  return (
    <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Title */}
      <div>
        <p style={{
          color: '#444', fontSize: '11px', fontWeight: '700',
          letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: '6px',
        }}>
          Forberedelse
        </p>
        <h2 style={{
          color: '#fff', fontSize: '22px', fontWeight: '900',
          letterSpacing: '2px', fontFamily: "'Bebas Neue', sans-serif",
        }}>
          DAGENS ØVELSER
        </h2>
      </div>

      {/* Exercise list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
        {/* Rowing warmup */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '12px 14px', borderRadius: '12px',
          background: '#00d4ff0c', border: '1px solid #00d4ff22',
        }}>
          <span style={{ fontSize: '20px', lineHeight: 1, flexShrink: 0 }}>🚣</span>
          <p style={{ flex: 1, color: '#aaa', fontSize: '15px', fontWeight: '600', margin: 0 }}>
            Oppvarming – romaskin
          </p>
          <span style={{
            color: '#00d4ff', fontSize: '13px', fontWeight: '700',
            flexShrink: 0, fontFamily: 'monospace',
          }}>
            {rowingMins} min
          </span>
        </div>

        {/* Strength exercises */}
        {exercises.map((ex, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px 14px', borderRadius: '12px',
            background: '#111', border: '1px solid #1e1e1e',
          }}>
            <span style={{
              color: '#333', fontSize: '12px', fontWeight: '700',
              width: '18px', textAlign: 'right', flexShrink: 0,
              fontFamily: 'monospace',
            }}>
              {i + 1}
            </span>
            <span style={{ fontSize: '22px', lineHeight: 1, flexShrink: 0 }}>{ex.emoji}</span>
            <p style={{ flex: 1, color: '#ccc', fontSize: '15px', fontWeight: '600', margin: 0 }}>
              {ex.name}
            </p>
            <span style={{
              color: '#e8ff00', fontSize: '13px', fontWeight: '700',
              flexShrink: 0, fontFamily: 'monospace',
            }}>
              {intervalOpt.work} sek
            </span>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={onBack} style={{
          flex: 1, padding: '16px', borderRadius: '12px',
          border: '2px solid #222', background: 'transparent',
          color: '#555', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
        }}>
          ← Endre oppsett
        </button>
        <button onClick={onStart} style={{
          flex: 2, padding: '16px', borderRadius: '12px', border: 'none',
          background: 'linear-gradient(135deg, #e8ff00, #c8df00)',
          color: '#000', fontSize: '16px', fontWeight: '900',
          letterSpacing: '1px', cursor: 'pointer',
          boxShadow: '0 0 30px #e8ff0033',
        }}>
          START NÅ →
        </button>
      </div>
    </div>
  );
}

// ─── AutoWorkout ──────────────────────────────────────────────────────────────

export default function AutoWorkout({ markDayComplete }) {
  const [phase, setPhase] = useState('setup');
  const [rowingSecs, setRowingSecs] = useState(10 * 60);
  const [intervalOpt, setIntervalOpt] = useState(INTERVAL_OPTS[1]);
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const startRef = useRef(null);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const workout = getDayWorkout(today);

  const handleStart = useCallback(() => setPhase('prep'), []);

  const handlePrepBack = useCallback(() => setPhase('setup'), []);

  const handlePrepStart = useCallback(() => {
    startRef.current = Date.now();
    setPhase('rowing');
  }, []);

  const handleRowingDone = useCallback(() => setPhase('strength'), []);

  const handleStrengthDone = useCallback(() => {
    setElapsedSecs(Math.floor((Date.now() - startRef.current) / 1000));
    setPhase('done');
  }, []);

  const handleMarkComplete = useCallback(() => {
    markDayComplete(todayStr);
  }, [markDayComplete, todayStr]);

  const handleRestart = useCallback(() => setPhase('setup'), []);

  if (workout.rest) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '80px 20px', gap: '16px',
      }}>
        <span style={{ fontSize: '80px' }}>😴</span>
        <p style={{ color: '#555', fontSize: '20px', fontWeight: '600' }}>
          Hviledag – nyt søndagen!
        </p>
      </div>
    );
  }

  return (
    <div>
      {phase === 'setup' && (
        <SetupPhase
          rowingSecs={rowingSecs}
          setRowingSecs={setRowingSecs}
          intervalOpt={intervalOpt}
          setIntervalOpt={setIntervalOpt}
          onStart={handleStart}
        />
      )}
      {phase === 'prep' && (
        <PrepPhase
          exercises={workout.exercises}
          rowingSecs={rowingSecs}
          intervalOpt={intervalOpt}
          onBack={handlePrepBack}
          onStart={handlePrepStart}
        />
      )}
      {phase === 'rowing' && (
        <RowingPhase rowingSecs={rowingSecs} onDone={handleRowingDone} />
      )}
      {phase === 'strength' && (
        <StrengthPhase
          exercises={workout.exercises}
          intervalOpt={intervalOpt}
          onDone={handleStrengthDone}
        />
      )}
      {phase === 'done' && (
        <DonePhase
          elapsedSecs={elapsedSecs}
          onMarkComplete={handleMarkComplete}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
