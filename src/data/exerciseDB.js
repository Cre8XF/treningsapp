const DB_URL =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const IMG_BASE =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

let cache = null;
let fetchPromise = null;

async function fetchExercises() {
  if (cache) return cache;
  if (!fetchPromise) {
    fetchPromise = fetch(DB_URL)
      .then(r => r.json())
      .then(data => { cache = data; return data; })
      .catch(() => { fetchPromise = null; return []; });
  }
  return fetchPromise;
}

function normalize(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function wordOverlapScore(a, b) {
  const wordsA = normalize(a).split(' ').filter(w => w.length > 2);
  const wordsB = new Set(normalize(b).split(' ').filter(w => w.length > 2));
  if (!wordsA.length || !wordsB.size) return 0;
  const common = wordsA.filter(w => wordsB.has(w)).length;
  return common / Math.max(wordsA.length, wordsB.size);
}

export async function findExerciseImages(searchName) {
  const exercises = await fetchExercises();
  if (!exercises.length) return null;

  const normSearch = normalize(searchName);

  let match = exercises.find(e => normalize(e.name) === normSearch);

  if (!match) {
    match = exercises.find(e => {
      const n = normalize(e.name);
      return n.includes(normSearch) || normSearch.includes(n);
    });
  }

  if (!match) {
    let bestScore = 0.4;
    for (const e of exercises) {
      const score = wordOverlapScore(e.name, searchName);
      if (score > bestScore) {
        bestScore = score;
        match = e;
      }
    }
  }

  if (!match || !match.images?.length) return null;
  return match.images.map(img => IMG_BASE + img);
}
