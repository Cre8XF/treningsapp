const workouts = {
  monday: {
    label: 'Mandag',
    exercises: [
      { name: 'Squats',            reps: 15, unit: 'reps', emoji: '🏋️' },
      { name: 'Plank',             reps: 30, unit: 'sec',  emoji: '🧘' },
      { name: 'Push Ups',          reps: 20, unit: 'reps', emoji: '💪' },
      { name: 'Step Ups',          reps: 25, unit: 'reps', emoji: '🪜' },
      { name: 'Mountain Climbers', reps: 30, unit: 'reps', emoji: '🧗' },
      { name: 'Glute Bridges',     reps: 20, unit: 'reps', emoji: '🍑' },
      { name: 'Bicycle Crunches',  reps: 30, unit: 'reps', emoji: '🚴' },
    ],
  },
  tuesday: {
    label: 'Tirsdag',
    exercises: [
      { name: 'Squats',         reps: 20, unit: 'reps', emoji: '🏋️' },
      { name: 'Plank',          reps: 60, unit: 'sec',  emoji: '🧘' },
      { name: 'Push Ups',       reps: 15, unit: 'reps', emoji: '💪' },
      { name: 'Lunges',         reps: 25, unit: 'reps', emoji: '🦵' },
      { name: 'Leg Raises',     reps: 30, unit: 'reps', emoji: '🦿' },
      { name: 'Donkey Kicks',   reps: 20, unit: 'reps', emoji: '🐴' },
      { name: 'Russian Twists', reps: 25, unit: 'reps', emoji: '🌀' },
    ],
  },
  wednesday: {
    label: 'Onsdag',
    exercises: [
      { name: 'Squats',                 reps: 20, unit: 'reps', emoji: '🏋️' },
      { name: 'Plank',                  reps: 45, unit: 'sec',  emoji: '🧘' },
      { name: 'Push Ups',               reps: 20, unit: 'reps', emoji: '💪' },
      { name: 'Jumping Jacks',          reps: 30, unit: 'reps', emoji: '⭐' },
      { name: 'Bulgarian Split Squats', reps: 30, unit: 'reps', emoji: '🇧🇬' },
      { name: 'Glute Bridges',          reps: 20, unit: 'reps', emoji: '🍑' },
      { name: 'Heel Touches',           reps: 30, unit: 'reps', emoji: '👟' },
    ],
  },
  thursday: {
    label: 'Torsdag',
    exercises: [
      { name: 'Squats',                    reps: 25, unit: 'reps', emoji: '🏋️' },
      { name: 'Plank',                     reps: 30, unit: 'sec',  emoji: '🧘' },
      { name: 'Push Ups',                  reps: 25, unit: 'reps', emoji: '💪' },
      { name: 'Step Ups',                  reps: 20, unit: 'reps', emoji: '🪜' },
      { name: 'Burpees',                   reps: 35, unit: 'reps', emoji: '🔥' },
      { name: 'Single Leg Glute Bridges',  reps: 20, unit: 'reps', emoji: '🍑' },
      { name: 'Flutter Kicks',             reps: 30, unit: 'reps', emoji: '🦵' },
    ],
  },
  friday: {
    label: 'Fredag',
    exercises: [
      { name: 'Squats',       reps: 20, unit: 'reps', emoji: '🏋️' },
      { name: 'Plank',        reps: 50, unit: 'sec',  emoji: '🧘' },
      { name: 'Push Ups',     reps: 20, unit: 'reps', emoji: '💪' },
      { name: 'Side Lunges',  reps: 30, unit: 'reps', emoji: '↔️' },
      { name: 'High Knees',   reps: 30, unit: 'reps', emoji: '🏃' },
      { name: 'Hip Raises',   reps: 20, unit: 'reps', emoji: '⬆️' },
      { name: 'V-Ups',        reps: 30, unit: 'reps', emoji: '✌️' },
    ],
  },
  saturday: {
    label: 'Lørdag',
    exercises: [
      { name: 'Squats',          reps: 25, unit: 'reps', emoji: '🏋️' },
      { name: 'Plank',           reps: 40, unit: 'sec',  emoji: '🧘' },
      { name: 'Push Ups',        reps: 15, unit: 'reps', emoji: '💪' },
      { name: 'Side Lunges',     reps: 30, unit: 'reps', emoji: '↔️' },
      { name: 'Jump Squats',     reps: 30, unit: 'reps', emoji: '🦘' },
      { name: 'Bridge Marches',  reps: 20, unit: 'reps', emoji: '🌉' },
      { name: 'Leg Raises',      reps: 35, unit: 'reps', emoji: '🦿' },
    ],
  },
  sunday: {
    label: 'Søndag',
    exercises: [],
    rest: true,
  },
};

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export function getDayWorkout(date = new Date()) {
  const key = DAY_KEYS[date.getDay()];
  return workouts[key];
}

export default workouts;
