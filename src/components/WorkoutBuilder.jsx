import { useState, useMemo } from 'react';
import { ChevronRight, ChevronLeft, Check, Heart, Play, X } from 'lucide-react';
import exercises from '../data/exercises';
import { saveWorkout } from '../hooks/useSavedWorkouts';

// ─── Constants ────────────────────────────────────────────────────────────────

const WARMUP_OPTIONS = [
  { id: 'before', label: 'Ro før' },
  { id: 'after', label: 'Ro etter' },
  { id: 'both', label: 'Ro før og etter' },
  { id: 'none', label: 'Ingen ro' },
];

const WARMUP_TIMES = [5, 8, 10, 15];

const INTERVALS = [
  { id: '20/10', label: '20 sek på', sub: '10 sek av', workSec: 20, restSec: 10 },
  { id: '30/15', label: '30 sek på', sub: '15 sek av', workSec: 30, restSec: 15 },
  { id: '40/20', label: '40 sek på', sub: '20 sek av', workSec: 40, restSec: 20 },
];

const ROUND_OPTIONS = [1, 2, 3, 4, 5];

const CATEGORIES = [
  { id: 'all', label: 'Alle' },
  { id: 'bein', label: 'Bein' },
  { id: 'core', label: 'Core' },
  { id: 'overkropp', label: 'Overkropp' },
  { id: 'helkropp', label: 'Helkropp' },
  { id: 'sete', label: 'Sete' },
  { id: 'rygg', label: 'Rygg' },
];

const BETWEEN_ROUNDS_REST_SEC = 30;

const SEQUENCE_COLORS = {
  warmup: '#00d4ff',
  cooldown: '#00d4ff',
  exercise: '#e8ff00',
  rest: '#3a3a3a',
  'round-rest': '#555',
  round: '#a855f7',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(totalSec) {
  if (totalSec < 60) return `${totalSec}s`;
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return s > 0 ? `${m}m ${s}s` : `${m} min`;
}

function buildSequence(config, selectedExercises) {
  const { warmup, warmupTime, interval, rounds } = config;
  const intv = INTERVALS.find(i => i.id === interval);
  const items = [];

  if (warmup === 'before' || warmup === 'both') {
    items.push({ type: 'warmup', label: 'Oppvarming – ro', emoji: '🚣', durationSec: warmupTime * 60 });
  }

  for (let r = 0; r < rounds; r++) {
    if (rounds > 1) {
      items.push({ type: 'round', label: `Runde ${r + 1}`, emoji: null, durationSec: 0 });
    }
    selectedExercises.forEach((ex, i) => {
      items.push({ type: 'exercise', label: ex.name, emoji: ex.emoji, durationSec: intv.workSec });
      if (i < selectedExercises.length - 1) {
        items.push({ type: 'rest', label: 'Hvil', emoji: '⏸️', durationSec: intv.restSec });
      }
    });
    if (r < rounds - 1) {
      items.push({ type: 'round-rest', label: 'Hvil mellom runder', emoji: '⏸️', durationSec: BETWEEN_ROUNDS_REST_SEC });
    }
  }

  if (warmup === 'after' || warmup === 'both') {
    items.push({ type: 'cooldown', label: 'Nedkjøling – ro', emoji: '🚣', durationSec: warmupTime * 60 });
  }

  return items;
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <p style={{
      fontSize: '11px', fontWeight: 700, color: '#555',
      letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: '10px',
    }}>
      {children}
    </p>
  );
}

function DifficultyDots({ level }) {
  return (
    <span style={{ display: 'inline-flex', gap: '3px', alignItems: 'center' }}>
      {[1, 2, 3].map(d => (
        <span key={d} style={{
          width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
          background: d <= level ? '#e8ff00' : '#2a2a2a',
          boxShadow: d <= level ? '0 0 4px #e8ff0066' : 'none',
        }} />
      ))}
    </span>
  );
}

function StepIndicator({ step, onBack }) {
  const labels = ['Oppsett', 'Øvelser', 'Forhåndsvisning'];
  return (
    <div style={{
      padding: '14px 16px 12px', flexShrink: 0,
      display: 'flex', alignItems: 'center', gap: '8px',
      borderBottom: '1px solid #1a1a1a',
    }}>
      {onBack && (
        <button
          onClick={onBack}
          className="active:scale-90 transition-all duration-150 shrink-0"
          style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: '#1c1c1e', border: '1px solid #2a2a2a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#555',
          }}
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      )}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
      {labels.map((label, i) => {
        const s = i + 1;
        const done = step > s;
        const active = step === s;
        return (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: s < 3 ? 1 : undefined }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                background: done ? '#4ade80' : active ? '#e8ff00' : '#1c1c1e',
                border: done || active ? 'none' : '1px solid #2c2c2e',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {done
                  ? <Check size={11} color="#000" strokeWidth={3} />
                  : <span style={{ fontSize: '10px', fontWeight: 800, color: active ? '#000' : '#444' }}>{s}</span>
                }
              </div>
              <span style={{
                fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px',
                color: active ? '#e8ff00' : done ? '#4ade80' : '#3a3a3a',
              }}>
                {label}
              </span>
            </div>
            {s < 3 && (
              <div style={{
                flex: 1, height: '1px', minWidth: '12px',
                background: step > s ? '#4ade8040' : '#1e1e1e',
              }} />
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
}

// ─── Step 1: Setup ─────────────────────────────────────────────────────────────

function OptionBtn({ label, active, onClick, color = '#e8ff00' }) {
  return (
    <button
      onClick={onClick}
      className="transition-all duration-150 active:scale-95"
      style={{
        padding: '13px 8px',
        borderRadius: '12px',
        border: active ? `2px solid ${color}` : '1px solid #242424',
        background: active ? `${color}18` : '#1c1c1e',
        color: active ? color : '#555',
        fontWeight: 700, fontSize: '13px',
        cursor: 'pointer', width: '100%',
      }}
    >
      {label}
    </button>
  );
}

function Step1Setup({ config, onChange, onNext }) {
  const { warmup, warmupTime, interval, rounds } = config;
  const hasWarmup = warmup !== 'none';

  return (
    <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Warmup type */}
      <div>
        <SectionLabel>Oppvarming</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {WARMUP_OPTIONS.map(opt => (
            <OptionBtn key={opt.id} label={opt.label} active={warmup === opt.id}
              onClick={() => onChange('warmup', opt.id)} />
          ))}
        </div>
      </div>

      {/* Warmup duration */}
      {hasWarmup && (
        <div>
          <SectionLabel>Ro-tid</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {WARMUP_TIMES.map(t => (
              <OptionBtn key={t} label={`${t} min`} active={warmupTime === t}
                onClick={() => onChange('warmupTime', t)} />
            ))}
          </div>
        </div>
      )}

      {/* Interval */}
      <div>
        <SectionLabel>Intervall</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {INTERVALS.map(opt => {
            const active = interval === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onChange('interval', opt.id)}
                className="transition-all duration-150 active:scale-[0.98]"
                style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: active ? '2px solid #00d4ff' : '1px solid #242424',
                  background: active ? '#00d4ff18' : '#1c1c1e',
                  cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '14px', color: active ? '#00d4ff' : '#888' }}>
                  {opt.label}
                </span>
                <span style={{ fontSize: '12px', color: active ? '#00d4ff88' : '#3a3a3a' }}>
                  / {opt.sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rounds */}
      <div>
        <SectionLabel>Runder</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
          {ROUND_OPTIONS.map(r => (
            <OptionBtn key={r} label={String(r)} active={rounds === r}
              onClick={() => onChange('rounds', r)} color="#a855f7" />
          ))}
        </div>
      </div>

      <button
        onClick={onNext}
        className="active:scale-95 transition-all duration-150"
        style={{
          marginTop: '4px', padding: '18px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #e8ff00, #c8df00)',
          color: '#000', fontWeight: 900, fontSize: '16px', letterSpacing: '1px',
          boxShadow: '0 0 30px #e8ff0033',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}
      >
        Neste <ChevronRight size={20} strokeWidth={3} />
      </button>
    </div>
  );
}

// ─── Step 2: Exercise selection ───────────────────────────────────────────────

function Step2Exercises({ selectedIds, onToggle, onBack, onNext }) {
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(
    () => filter === 'all' ? exercises : exercises.filter(e => e.category === filter),
    [filter],
  );

  const count = selectedIds.length;
  const canProceed = count >= 3;
  const atMax = count >= 10;

  return (
    <div>
      {/* Sticky filter header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: '#0f0f0f', borderBottom: '1px solid #1a1a1a',
        padding: '12px 16px 10px',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '10px',
        }}>
          <span style={{
            fontSize: '13px', fontWeight: 700, letterSpacing: '1px',
            color: count >= 3 ? '#4ade80' : '#555',
            transition: 'color 0.2s',
          }}>
            {count} øvelser valgt
          </span>
          <span style={{ fontSize: '11px', color: '#3a3a3a', fontWeight: 600 }}>
            Min 3 · Maks 10
          </span>
        </div>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          {CATEGORIES.map(cat => {
            const active = filter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className="shrink-0 transition-all duration-150 active:scale-90"
                style={{
                  padding: '6px 14px', borderRadius: '20px',
                  border: active ? '1.5px solid #e8ff00' : '1.5px solid #242424',
                  background: active ? '#e8ff0020' : 'transparent',
                  color: active ? '#e8ff00' : '#555',
                  fontWeight: 600, fontSize: '12px',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Exercise list */}
      <div style={{ padding: '8px 16px 4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.map(ex => {
          const isSelected = selectedIds.includes(ex.id);
          const isDisabled = atMax && !isSelected;
          return (
            <button
              key={ex.id}
              onClick={() => !isDisabled && onToggle(ex.id)}
              className="transition-all duration-150 active:scale-[0.98] text-left"
              style={{
                padding: '12px 14px', borderRadius: '14px',
                border: isSelected ? '2px solid #4ade80' : '1px solid #242424',
                background: isSelected ? '#4ade8012' : '#1c1c1e',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled ? 0.4 : 1,
                display: 'flex', alignItems: 'center', gap: '12px',
                width: '100%',
              }}
            >
              <span style={{ fontSize: '22px', flexShrink: 0, width: '28px', textAlign: 'center' }}>
                {ex.emoji}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px',
                }}>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: isSelected ? '#fff' : '#ccc' }}>
                    {ex.name}
                  </span>
                  <DifficultyDots level={ex.difficulty} />
                </div>
                <p style={{ fontSize: '11px', color: '#4a4a4a', lineHeight: 1.35, margin: 0 }}>
                  {ex.description}
                </p>
              </div>
              <div style={{
                width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                background: isSelected ? '#4ade80' : '#1e1e1e',
                border: isSelected ? 'none' : '1px solid #2a2a2a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s',
              }}>
                {isSelected && <Check size={12} color="#000" strokeWidth={3} />}
              </div>
            </button>
          );
        })}
        <div style={{ height: '80px' }} />
      </div>

      {/* Sticky footer buttons */}
      <div style={{
        position: 'sticky', bottom: 0, zIndex: 10,
        background: '#0f0f0f', borderTop: '1px solid #1a1a1a',
        padding: '12px 16px',
        display: 'flex', gap: '10px',
      }}>
        <button
          onClick={onBack}
          className="active:scale-95 transition-all duration-150"
          style={{
            padding: '16px 18px', borderRadius: '12px',
            border: '1.5px solid #2a2a2a', background: 'transparent',
            color: '#555', fontWeight: 700, fontSize: '14px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          <ChevronLeft size={18} /> Tilbake
        </button>
        <button
          onClick={canProceed ? onNext : undefined}
          className="transition-all duration-150"
          style={{
            flex: 1, padding: '16px', borderRadius: '12px',
            background: canProceed ? 'linear-gradient(135deg, #e8ff00, #c8df00)' : '#1c1c1e',
            color: canProceed ? '#000' : '#3a3a3a',
            border: canProceed ? 'none' : '1px solid #242424',
            fontWeight: 900, fontSize: '14px',
            cursor: canProceed ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            boxShadow: canProceed ? '0 0 20px #e8ff0033' : 'none',
            ...(canProceed && { scale: undefined }),
          }}
        >
          Se forhåndsvisning <ChevronRight size={18} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Preview ──────────────────────────────────────────────────────────

function Step3Preview({ config, selectedIds, onBack, onStart }) {
  const [showFavInput, setShowFavInput] = useState(false);
  const [favName, setFavName] = useState('');

  const selectedExercises = useMemo(
    () => selectedIds.map(id => exercises.find(e => e.id === id)).filter(Boolean),
    [selectedIds],
  );

  const sequence = useMemo(
    () => buildSequence(config, selectedExercises),
    [config, selectedExercises],
  );

  const totalSec = useMemo(
    () => sequence.reduce((acc, item) => acc + item.durationSec, 0),
    [sequence],
  );

  const intv = INTERVALS.find(i => i.id === config.interval);

  function handleSaveFavorite() {
    if (!favName.trim()) return;
    saveWorkout(favName.trim(), config, selectedIds);
    setShowFavInput(false);
    setFavName('');
  }

  return (
    <div>
      {/* Sticky summary banner */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: '#0f0f0f', borderBottom: '1px solid #1a1a1a',
        padding: '14px 16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <p style={{
            fontSize: '10px', fontWeight: 700, color: '#555',
            letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px',
          }}>
            Estimert tid
          </p>
          <p style={{
            fontFamily: 'monospace', fontSize: '26px', fontWeight: 900,
            color: '#e8ff00', letterSpacing: '1px', lineHeight: 1,
            textShadow: '0 0 20px #e8ff0044',
          }}>
            {formatDuration(totalSec)}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: '#555', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>
              Øvelser
            </p>
            <p style={{ fontSize: '20px', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
              {selectedIds.length}
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: '#555', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>
              Runder
            </p>
            <p style={{ fontSize: '20px', fontWeight: 800, color: '#a855f7', lineHeight: 1 }}>
              {config.rounds}
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: '#555', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>
              Intervall
            </p>
            <p style={{ fontSize: '14px', fontWeight: 800, color: '#00d4ff', lineHeight: 1 }}>
              {intv.workSec}/{intv.restSec}s
            </p>
          </div>
        </div>
      </div>

      {/* Warning banner */}
      {config.warning && (
        <div style={{
          margin: '12px 16px 0',
          padding: '12px 14px',
          borderRadius: '12px',
          border: '1.5px solid #f97316',
          background: '#f9731612',
          color: '#f97316',
          fontSize: '13px',
          fontWeight: 600,
          lineHeight: 1.4,
        }}>
          {config.warning}
        </div>
      )}

      {/* Sequence list */}
      <div style={{ padding: '12px 16px 4px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {sequence.map((item, i) => {
          const color = SEQUENCE_COLORS[item.type] || '#ccc';
          const isRoundLabel = item.type === 'round';
          const isDim = item.type === 'rest' || item.type === 'round-rest';

          if (isRoundLabel) {
            return (
              <div key={i} style={{ padding: '8px 4px 2px' }}>
                <p style={{
                  fontSize: '10px', fontWeight: 700, color: '#a855f7',
                  letterSpacing: '3px', textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <span style={{ flex: 1, height: '1px', background: '#a855f730', display: 'block' }} />
                  {item.label}
                  <span style={{ flex: 1, height: '1px', background: '#a855f730', display: 'block' }} />
                </p>
              </div>
            );
          }

          return (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '11px 14px', borderRadius: '12px',
                background: '#1c1c1e',
                border: `1px solid ${isDim ? '#1e1e1e' : '#262626'}`,
                opacity: isDim ? 0.55 : 1,
              }}
            >
              <span style={{ fontSize: '18px', flexShrink: 0, width: '24px', textAlign: 'center' }}>
                {item.emoji}
              </span>
              <span style={{
                flex: 1, fontWeight: 600, fontSize: '14px',
                color: isDim ? '#444' : '#bbb',
              }}>
                {item.label}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 700, color, flexShrink: 0 }}>
                {formatDuration(item.durationSec)}
              </span>
            </div>
          );
        })}
        <div style={{ height: '100px' }} />
      </div>

      {/* Sticky footer */}
      <div style={{
        position: 'sticky', bottom: 0, zIndex: 10,
        background: '#0f0f0f', borderTop: '1px solid #1a1a1a',
        padding: '12px 16px',
        display: 'flex', flexDirection: 'column', gap: '8px',
      }}>
        {/* Favorite name input */}
        {showFavInput && (
          <div style={{
            padding: '10px 12px', borderRadius: '12px',
            border: '1px solid #2c2c2e', background: '#141414',
            display: 'flex', gap: '8px', alignItems: 'center',
          }}>
            <input
              autoFocus
              value={favName}
              onChange={e => setFavName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveFavorite()}
              placeholder="Navn på favorittøkt…"
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: '#fff', fontSize: '14px', fontWeight: 600,
              }}
            />
            <button
              onClick={handleSaveFavorite}
              className="active:scale-95 transition-all duration-150"
              style={{
                padding: '6px 14px', borderRadius: '8px',
                background: favName.trim() ? '#e8ff00' : '#2a2a2a',
                color: favName.trim() ? '#000' : '#555',
                fontWeight: 700, fontSize: '12px', cursor: 'pointer', flexShrink: 0,
              }}
            >
              Lagre
            </button>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onBack}
            className="active:scale-95 transition-all duration-150"
            style={{
              padding: '16px 18px', borderRadius: '12px',
              border: '1.5px solid #2a2a2a', background: 'transparent',
              color: '#555', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center',
            }}
          >
            <ChevronLeft size={18} />
          </button>

          <button
            onClick={() => setShowFavInput(v => !v)}
            className="active:scale-95 transition-all duration-150"
            style={{
              padding: '16px 14px', borderRadius: '12px',
              border: showFavInput ? '1.5px solid #e8ff0066' : '1.5px solid #2a2a2a',
              background: showFavInput ? '#e8ff0010' : 'transparent',
              color: showFavInput ? '#e8ff00' : '#555',
              fontWeight: 700, fontSize: '13px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
            }}
          >
            <Heart size={16} strokeWidth={showFavInput ? 2.5 : 2} /> Favoritt
          </button>

          <button
            onClick={() => onStart?.({ config, exercises: selectedExercises, sequence, totalSec })}
            className="active:scale-95 transition-all duration-150"
            style={{
              flex: 1, padding: '16px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #4ade80, #22c55e)',
              color: '#000', fontWeight: 900, fontSize: '15px', letterSpacing: '0.5px',
              boxShadow: '0 0 30px #4ade8033',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            <Play size={17} fill="#000" strokeWidth={0} /> START NÅ
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── WorkoutBuilder ───────────────────────────────────────────────────────────

export default function WorkoutBuilder({
  initialConfig,
  initialExerciseIds,
  initialStep = 1,
  onStart,
  onBack,
}) {
  const [step, setStep] = useState(initialStep);
  const [config, setConfig] = useState(initialConfig ?? {
    warmup: 'before',
    warmupTime: 5,
    interval: '20/10',
    rounds: 3,
  });
  const [selectedIds, setSelectedIds] = useState(initialExerciseIds ?? []);

  function updateConfig(key, value) {
    setConfig(prev => ({ ...prev, [key]: value }));
  }

  function toggleExercise(id) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  }

  return (
    <div style={{ background: '#0f0f0f', minHeight: '100%' }}>
      <StepIndicator step={step} onBack={onBack} />
      {step === 1 && (
        <Step1Setup config={config} onChange={updateConfig} onNext={() => setStep(2)} />
      )}
      {step === 2 && (
        <Step2Exercises
          selectedIds={selectedIds}
          onToggle={toggleExercise}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}
      {step === 3 && (
        <Step3Preview
          config={config}
          selectedIds={selectedIds}
          onBack={() => setStep(2)}
          onStart={onStart}
        />
      )}
    </div>
  );
}
