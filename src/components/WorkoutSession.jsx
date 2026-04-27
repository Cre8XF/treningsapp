import { Clock, CheckCircle2 } from 'lucide-react';

function ExerciseCard({ exercise, checked, onToggle }) {
  const isTime = exercise.unit === 'sec';

  return (
    <div
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      className="relative h-[76px] cursor-pointer select-none outline-none"
      style={{ perspective: '1000px' }}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          transformStyle: 'preserve-3d',
          transform: checked ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Front face */}
        <div
          className="absolute inset-0 rounded-2xl px-4 flex items-center gap-3"
          style={{
            backfaceVisibility: 'hidden',
            background: '#1c1c1e',
            border: '1px solid #2c2c2e',
          }}
        >
          <span className="text-2xl w-8 shrink-0 text-center leading-none">
            {exercise.emoji}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white leading-tight truncate">
              {exercise.name}
            </p>
            <div className="flex items-center gap-1 mt-0.5 text-sm text-gray-500">
              {isTime && <Clock size={12} />}
              <span>
                {exercise.reps}&thinsp;{isTime ? 'sek' : 'reps'}
              </span>
            </div>
          </div>
          <div className="w-6 h-6 shrink-0 rounded-full border-2 border-gray-600" />
        </div>

        {/* Back face — green when completed */}
        <div
          className="absolute inset-0 rounded-2xl px-4 flex items-center gap-3"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(135deg, #052e16 0%, #14532d 100%)',
            border: '1px solid rgba(22,163,74,0.35)',
          }}
        >
          <span className="text-2xl w-8 shrink-0 text-center leading-none">
            {exercise.emoji}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-green-300 leading-tight truncate">
              {exercise.name}
            </p>
            <p className="text-sm text-green-600 mt-0.5">
              {exercise.reps}&thinsp;{isTime ? 'sek' : 'reps'}
            </p>
          </div>
          <CheckCircle2 size={24} color="#4ade80" className="shrink-0" />
        </div>
      </div>
    </div>
  );
}

export default function WorkoutSession({
  date,
  workout,
  progress = [],
  onToggleExercise,
  onComplete,
}) {
  if (!workout) return null;

  const { exercises = [], label, rest } = workout;

  if (rest) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-5 py-20 px-4 min-h-screen"
        style={{ background: '#0f0f0f' }}
      >
        <span className="text-7xl">😴</span>
        <h2 className="text-2xl font-bold text-white">Hviledag</h2>
        <p className="text-gray-500 text-center max-w-xs">
          Ta det med ro i dag. Kroppen din fortjener hvile!
        </p>
      </div>
    );
  }

  const total = exercises.length;
  const completedCount = progress.filter(Boolean).length;
  const allDone = total > 0 && completedCount === total;
  const pct = total > 0 ? (completedCount / total) * 100 : 0;

  const dateDisplay = new Date(`${date}T00:00:00`).toLocaleDateString('nb-NO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div
      className="flex flex-col min-h-screen px-4 pb-8 pt-6"
      style={{ background: '#0f0f0f', color: '#fff' }}
    >
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs text-gray-600 uppercase tracking-widest mb-1 capitalize">
          {dateDisplay}
        </p>
        <h2 className="text-2xl font-bold capitalize">{label}</h2>
      </div>

      {/* Progress bar */}
      <div className="mb-7">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-sm text-gray-500">
            <span
              className="tabular-nums font-bold"
              style={{ color: allDone ? '#4ade80' : '#e8ff00' }}
            >
              {completedCount}
            </span>
            <span className="text-gray-600"> av </span>
            {total} øvelser
          </span>
          <span
            className="text-sm font-bold tabular-nums"
            style={{
              color: allDone ? '#4ade80' : '#e8ff00',
              transition: 'color 0.4s ease',
            }}
          >
            {Math.round(pct)}%
          </span>
        </div>
        <div
          className="h-[6px] rounded-full overflow-hidden"
          style={{ background: '#1c1c1e' }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              background: allDone
                ? 'linear-gradient(90deg, #4ade80, #22c55e)'
                : 'linear-gradient(90deg, #e8ff00, #a3e635)',
              boxShadow: allDone ? '0 0 8px #4ade8055' : '0 0 8px #e8ff0055',
              transition: 'width 0.35s ease, background 0.4s ease, box-shadow 0.4s ease',
            }}
          />
        </div>
      </div>

      {/* Exercise cards */}
      <div className="flex flex-col gap-3 flex-1">
        {exercises.map((exercise, i) => (
          <ExerciseCard
            key={exercise.name}
            exercise={exercise}
            checked={!!progress[i]}
            onToggle={() => onToggleExercise(i)}
          />
        ))}
      </div>

      {/* Complete button */}
      <div className="mt-8">
        <button
          onClick={onComplete}
          disabled={!allDone}
          className="w-full py-4 rounded-2xl font-bold text-lg transition-all duration-400"
          style={
            allDone
              ? {
                  background: 'linear-gradient(135deg, #4ade80, #22c55e)',
                  color: '#052e16',
                  boxShadow: '0 0 28px rgba(74,222,128,0.35)',
                  cursor: 'pointer',
                }
              : {
                  background: '#1c1c1e',
                  color: '#3a3a3a',
                  border: '1px solid #2a2a2a',
                  cursor: 'not-allowed',
                }
          }
        >
          {allDone
            ? '🏆 Fullfør dag!'
            : `${total - completedCount} øvelse${total - completedCount !== 1 ? 'r' : ''} igjen`}
        </button>
      </div>
    </div>
  );
}
