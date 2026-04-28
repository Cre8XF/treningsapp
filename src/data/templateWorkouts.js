const templateWorkouts = [
  {
    id: 'template_fullbody',
    name: 'Fullkropp',
    emoji: '💪',
    description: '2 øvelser fra hver kategori – balansert total-økt',
    settings: {
      warmup: 'before',
      warmupTime: 8,
      interval: '30/15',
      rounds: 3,
    },
    exercises: [
      'squat',
      'lunge',
      'push_up',
      'shoulder_tap',
      'plank',
      'russian_twist',
      'burpee',
      'high_knee',
      'glute_bridge',
      'donkey_kick',
    ],
  },
  {
    id: 'template_core',
    name: 'Core-fokus',
    emoji: '🔥',
    description: '6 core-øvelser – sterk mage og stabilitet',
    settings: {
      warmup: 'none',
      warmupTime: 5,
      interval: '40/20',
      rounds: 3,
    },
    exercises: [
      'plank',
      'mountain_climber',
      'bicycle_crunch',
      'leg_raise',
      'russian_twist',
      'hollow_hold',
    ],
  },
  {
    id: 'template_legs_glutes',
    name: 'Bein og sete',
    emoji: '🦵',
    description: 'Blanding av bein- og seteøvelser – form og styrke',
    settings: {
      warmup: 'after',
      warmupTime: 5,
      interval: '30/15',
      rounds: 4,
    },
    exercises: [
      'squat',
      'sumo_squat',
      'lunge',
      'glute_bridge',
      'single_leg_glute_bridge',
      'donkey_kick',
      'fire_hydrant',
      'clamshell',
    ],
  },
  {
    id: 'template_quick_fullbody',
    name: 'Rask helkropp',
    emoji: '⚡',
    description: '6 helkroppsøvelser med korte intervaller – høy intensitet',
    settings: {
      warmup: 'none',
      warmupTime: 5,
      interval: '20/10',
      rounds: 2,
    },
    exercises: [
      'burpee',
      'jumping_jack',
      'high_knee',
      'skater_jump',
      'star_jump',
      'squat_jump_rotation',
    ],
  },
];

export default templateWorkouts;

export function getTemplate(id) {
  return templateWorkouts.find(t => t.id === id) ?? null;
}
