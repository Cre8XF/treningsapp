import { useState, useEffect, useRef } from 'react';

const TIME_OPTIONS = [5, 8, 10, 15];
const DEFAULT_MINS = 10;

const SIZE = 280;
const STROKE = 14;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

export default function RowingTimer({ standalone = true }) {
  const [selectedMins, setSelectedMins] = useState(DEFAULT_MINS);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_MINS * 60);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef(null);
  const hasStarted = timeLeft < selectedMins * 60;

  const total = selectedMins * 60;
  const progress = finished ? 1 : timeLeft / total;
  const offset = CIRC * (1 - progress);
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');

  const ringColor = finished ? '#00ff88' : running ? '#e8ff00' : '#00d4ff';
  const glowColor = finished ? '#00ff8866' : running ? '#e8ff0066' : '#00d4ff44';

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            setFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const handleStart = () => {
    if (!finished) setRunning(true);
  };

  const handlePause = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
  };

  const handleReset = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setFinished(false);
    setTimeLeft(selectedMins * 60);
  };

  const handleSelectMins = (m) => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setFinished(false);
    setSelectedMins(m);
    setTimeLeft(m * 60);
  };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-8 font-mono select-none ${standalone ? 'min-h-screen' : 'py-10'}`}
      style={{ background: '#0f0f0f', color: '#fff' }}
    >
      <h1
        className="text-2xl font-bold tracking-widest uppercase"
        style={{ color: '#e8ff00', textShadow: '0 0 20px #e8ff0066' }}
      >
        🚣 Romaskin oppvarming
      </h1>

      {/* Time selector */}
      <div className="flex gap-2">
        {TIME_OPTIONS.map((m) => {
          const active = selectedMins === m;
          return (
            <button
              key={m}
              onClick={() => handleSelectMins(m)}
              className="px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 active:scale-95"
              style={{
                background: active ? '#e8ff00' : '#1a1a1a',
                color: active ? '#0f0f0f' : '#666',
                border: `1px solid ${active ? '#e8ff00' : '#2a2a2a'}`,
                boxShadow: active ? '0 0 12px #e8ff0055' : 'none',
              }}
            >
              {m} min
            </button>
          );
        })}
      </div>

      {/* SVG ring */}
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg
          width={SIZE}
          height={SIZE}
          style={{ transform: 'rotate(-90deg)' }}
          aria-hidden="true"
        >
          {/* Track */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke="#1e1e1e"
            strokeWidth={STROKE}
          />
          {/* Progress arc */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke={ringColor}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 0.95s linear, stroke 0.3s ease',
              filter: `drop-shadow(0 0 10px ${glowColor}) drop-shadow(0 0 20px ${glowColor})`,
            }}
          />
        </svg>

        {/* Center display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          {finished ? (
            <span
              className="text-5xl animate-bounce"
              style={{ filter: 'drop-shadow(0 0 12px #00ff88)' }}
            >
              ✓
            </span>
          ) : (
            <>
              <span
                className="text-5xl font-bold tabular-nums tracking-wider"
                style={{
                  color: ringColor,
                  textShadow: `0 0 24px ${ringColor}, 0 0 48px ${glowColor}`,
                  transition: 'color 0.3s ease, text-shadow 0.3s ease',
                }}
              >
                {mm}:{ss}
              </span>
              <span className="text-xs uppercase tracking-widest" style={{ color: '#444' }}>
                {running ? 'Ro!' : hasStarted ? 'Pause' : 'Klar'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Completion message */}
      {finished && (
        <div
          className="px-8 py-4 rounded-2xl text-center text-lg font-bold animate-pulse"
          style={{
            background: 'rgba(0,255,136,0.08)',
            border: '1px solid #00ff88',
            color: '#00ff88',
            boxShadow: '0 0 24px rgba(0,255,136,0.2)',
          }}
        >
          Bra jobbet! 🚣 Klar for styrke!
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        {!running && !finished && (
          <button
            onClick={handleStart}
            className="px-8 py-3 rounded-xl font-bold text-lg transition-all duration-150 active:scale-95"
            style={{
              background: '#e8ff00',
              color: '#0f0f0f',
              boxShadow: '0 0 20px #e8ff0055',
            }}
          >
            {hasStarted ? 'Fortsett' : 'Start'}
          </button>
        )}
        {running && (
          <button
            onClick={handlePause}
            className="px-8 py-3 rounded-xl font-bold text-lg transition-all duration-150 active:scale-95"
            style={{
              background: '#00d4ff',
              color: '#0f0f0f',
              boxShadow: '0 0 20px #00d4ff44',
            }}
          >
            Pause
          </button>
        )}
        <button
          onClick={handleReset}
          className="px-8 py-3 rounded-xl font-bold text-lg transition-all duration-150 active:scale-95"
          style={{
            background: '#1a1a1a',
            color: '#555',
            border: '1px solid #2a2a2a',
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
