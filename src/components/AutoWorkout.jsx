import { useState, useRef, useEffect, useCallback } from 'react';

// ─── Audio / haptics ──────────────────────────────────────────────────────────

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

function playDoneSound() { playBeep(440, 500, 0.5); }

function vibrate(pattern) {
  try { navigator.vibrate?.(pattern); } catch {}
}

// ─── Constants ────────────────────────────────────────────────────────────────

const INTERVAL_MAP = {
  '20/10': { work: 20, rest: 10 },
  '30/15': { work: 30, rest: 15 },
  '40/20': { work: 40, rest: 20 },
};

const ROUND_BREAK_SECS = 60;

// ─── Circular timer ───────────────────────────────────────────────────────────

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
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{
          fontFamily: 'monospace',
          fontSize: size > 230 ? '52px' : '40px',
          fontWeight: 'bold', color,
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

// ─── Phase: Rowing (warmup / cooldown) ───────────────────────────────────────

function RowingPhase({ rowingSecs, label, onDone }) {
  const [timeLeft, setTimeLeft] = useState(rowingSecs);
  const beepedRef = useRef(false);

  useEffect(() => {
    if (timeLeft <= 0) { playDoneSound(); vibrate([500]); onDone(); return; }
    if (timeLeft === 3 && !beepedRef.current) { beepedRef.current = true; playTripleBeep(); }
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, onDone]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '48px 20px', gap: '28px',
    }}>
      <p style={{ color: '#555', fontSize: '13px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase' }}>
        {label}
      </p>
      <CircleTimer timeLeft={timeLeft} totalTime={rowingSecs} color="#00d4ff" />
      <p style={{ color: '#333', fontSize: '13px' }}>Automatisk overgang</p>
    </div>
  );
}

// ─── Phase: Strength ──────────────────────────────────────────────────────────

function StrengthPhase({ exercises, intervalOpt, currentRound, totalRounds, onDone }) {
  const [exIdx, setExIdx] = useState(0);
  const [subPhase, setSubPhase] = useState('work');
  const [timeLeft, setTimeLeft] = useState(intervalOpt.work);

  const totalTime = subPhase === 'work' ? intervalOpt.work : intervalOpt.rest;
  const ringColor = subPhase === 'work' ? '#e8ff00' : '#ff3b3b';

  useEffect(() => {
    if (timeLeft > 0) {
      const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(id);
    }
    if (subPhase === 'work') {
      if (exIdx >= exercises.length - 1) { playDoneSound(); vibrate([500]); onDone(); return; }
      playBeep(880, 100); vibrate([200]);
      setSubPhase('rest'); setTimeLeft(intervalOpt.rest);
    } else {
      playBeep(880, 100); vibrate([200]);
      setExIdx(i => i + 1); setSubPhase('work'); setTimeLeft(intervalOpt.work);
    }
  }, [timeLeft, subPhase, exIdx, exercises.length, intervalOpt, onDone]);

  const exercise = exercises[exIdx];
  const nextEx = exIdx < exercises.length - 1 ? exercises[exIdx + 1] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 20px', gap: '16px' }}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          color: '#a855f7', fontSize: '13px', fontWeight: 800,
          letterSpacing: '2px', textTransform: 'uppercase',
          textShadow: '0 0 10px #a855f766',
        }}>
          RUNDE {currentRound} AV {totalRounds}
        </span>
        <span style={{ color: '#555', fontSize: '13px', fontWeight: 700 }}>
          {exIdx + 1} / {exercises.length}
        </span>
      </div>

      <div style={{ width: '100%', height: '3px', background: '#1a1a1a', borderRadius: '2px' }}>
        <div style={{
          height: '100%', borderRadius: '2px', background: '#e8ff00',
          width: `${((exIdx + (subPhase === 'rest' ? 1 : 0)) / exercises.length) * 100}%`,
          transition: 'width 0.5s ease', boxShadow: '0 0 6px #e8ff0066',
        }} />
      </div>

      <div style={{ textAlign: 'center', marginTop: '8px' }}>
        <div style={{ fontSize: '72px', lineHeight: 1 }}>{exercise.emoji}</div>
        <h2 style={{ color: '#fff', fontSize: '30px', fontWeight: 800, letterSpacing: '1px', margin: '10px 0 6px' }}>
          {exercise.name}
        </h2>
        <p style={{
          color: ringColor, fontSize: '14px', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '3px',
          textShadow: `0 0 12px ${ringColor}66`,
        }}>
          {subPhase === 'work' ? '▶ PÅ' : '◼ HVILE'}
        </p>
      </div>

      <CircleTimer timeLeft={timeLeft} totalTime={totalTime} color={ringColor} size={220} />

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

// ─── Phase: Round break ───────────────────────────────────────────────────────

function RoundBreakPhase({ completedRound, totalRounds, onDone }) {
  const [timeLeft, setTimeLeft] = useState(ROUND_BREAK_SECS);

  useEffect(() => {
    if (timeLeft <= 0) { onDone(); return; }
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, onDone]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '40px 20px', gap: '20px',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '52px', lineHeight: 1 }}>🏅</div>
        <h2 style={{ color: '#4ade80', fontSize: '22px', fontWeight: 800, letterSpacing: '1px', margin: '12px 0 6px' }}>
          Runde {completedRound} av {totalRounds} ferdig!
        </h2>
        <p style={{ color: '#444', fontSize: '14px' }}>Hvil deg – neste runde starter snart</p>
      </div>
      <CircleTimer timeLeft={timeLeft} totalTime={ROUND_BREAK_SECS} color="#4ade80" />
      <p style={{ color: '#444', fontSize: '14px' }}>
        Runde <span style={{ color: '#a855f7', fontWeight: 700 }}>{completedRound + 1}</span>
        {' '}av {totalRounds} starter om{' '}
        <span style={{ fontFamily: 'monospace' }}>{timeLeft}</span> sek
      </p>
    </div>
  );
}

// ─── Phase: Done ──────────────────────────────────────────────────────────────

function DonePhase({ elapsedSecs, onMarkComplete, onHome }) {
  const mm = String(Math.floor(elapsedSecs / 60)).padStart(2, '0');
  const ss = String(elapsedSecs % 60).padStart(2, '0');
  const [marked, setMarked] = useState(false);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '48px 20px', gap: '28px', minHeight: '60vh',
    }}>
      <style>{`@keyframes trophyPop{0%,100%{transform:scale(1)}50%{transform:scale(1.18)}}`}</style>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '88px', lineHeight: 1, animation: 'trophyPop 1.6s ease-in-out infinite' }}>🏆</div>
        <h1 style={{
          color: '#e8ff00', fontSize: '60px', fontWeight: 900,
          letterSpacing: '4px', margin: '12px 0 0',
          fontFamily: "'Bebas Neue', sans-serif",
          textShadow: '0 0 40px #e8ff0055',
        }}>
          FERDIG!
        </h1>
        <p style={{ color: '#555', fontSize: '16px', marginTop: '10px', fontFamily: 'monospace' }}>
          Total tid: <span style={{ color: '#888' }}>{mm}:{ss}</span>
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
            fontSize: '17px', fontWeight: 700,
            cursor: marked ? 'default' : 'pointer',
            transition: 'all 0.3s',
          }}
        >
          {marked ? '✓ Dag markert som fullført' : 'Marker dag som fullført'}
        </button>
        <button
          onClick={onHome}
          style={{
            padding: '16px', borderRadius: '14px',
            border: '2px solid #222', background: 'transparent',
            color: '#555', fontSize: '16px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          ← Tilbake til hjem
        </button>
      </div>
    </div>
  );
}

// ─── AutoWorkout ──────────────────────────────────────────────────────────────

export default function AutoWorkout({ exercises, settings, markDayComplete, onDone }) {
  const { warmup = 'none', warmupTime = 8, interval = '30/15', rounds = 3 } = settings ?? {};
  const intervalOpt = INTERVAL_MAP[interval] ?? INTERVAL_MAP['30/15'];
  const rowingSecs = warmupTime * 60;
  const needsWarmup = warmup === 'before' || warmup === 'both';
  const needsCooldown = warmup === 'after' || warmup === 'both';

  const [phase, setPhase] = useState(needsWarmup ? 'rowing' : 'strength');
  const [currentRound, setCurrentRound] = useState(1);
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const startRef = useRef(Date.now());
  const todayStr = new Date().toISOString().slice(0, 10);

  const handleRowingDone = useCallback(() => setPhase('strength'), []);

  const handleCooldownDone = useCallback(() => {
    setElapsedSecs(Math.floor((Date.now() - startRef.current) / 1000));
    setPhase('done');
  }, []);

  const handleStrengthDone = useCallback(() => {
    if (currentRound < rounds) {
      setCurrentRound(r => r + 1);
      setPhase('round-break');
    } else if (needsCooldown) {
      setPhase('cooldown');
    } else {
      setElapsedSecs(Math.floor((Date.now() - startRef.current) / 1000));
      setPhase('done');
    }
  }, [currentRound, rounds, needsCooldown]);

  const handleRoundBreakDone = useCallback(() => {
    playBeep(880, 200);
    vibrate([400]);
    setPhase('strength');
  }, []);

  const handleMarkComplete = useCallback(() => {
    markDayComplete?.(todayStr);
  }, [markDayComplete, todayStr]);

  return (
    <div>
      {phase === 'rowing' && (
        <RowingPhase rowingSecs={rowingSecs} label="🚣 Oppvarming – Ro" onDone={handleRowingDone} />
      )}
      {phase === 'strength' && (
        <StrengthPhase
          key={currentRound}
          exercises={exercises}
          intervalOpt={intervalOpt}
          currentRound={currentRound}
          totalRounds={rounds}
          onDone={handleStrengthDone}
        />
      )}
      {phase === 'round-break' && (
        <RoundBreakPhase
          completedRound={currentRound - 1}
          totalRounds={rounds}
          onDone={handleRoundBreakDone}
        />
      )}
      {phase === 'cooldown' && (
        <RowingPhase rowingSecs={rowingSecs} label="🚣 Nedkjøling – Ro" onDone={handleCooldownDone} />
      )}
      {phase === 'done' && (
        <DonePhase
          elapsedSecs={elapsedSecs}
          onMarkComplete={handleMarkComplete}
          onHome={onDone}
        />
      )}
    </div>
  );
}
