// Lightweight text-similarity helpers for catching near-duplicate names
// (typos, accents, casing, extra spaces) during mass Excel/CSV uploads.
// Pure string comparison — no external AI call, no API key, runs instantly.

export function normalizeText(str) {
  return (str || '')
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;

  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = temp;
    }
  }
  return dp[n];
}

// Returns a 0-1 similarity score (1 = identical after normalization).
export function similarity(a, b) {
  const normA = normalizeText(a);
  const normB = normalizeText(b);
  if (!normA && !normB) return 1;
  if (!normA || !normB) return 0;
  const distance = levenshtein(normA, normB);
  const maxLen = Math.max(normA.length, normB.length);
  return 1 - distance / maxLen;
}

// Finds the closest candidate to `query` by comparing candidate[key].
// Skips very short names (min 4 normalized chars) to avoid false positives
// like "Ana" vs "Ada" being merged. Returns { match, score } or null.
export function findSimilarMatch(query, candidates, { threshold = 0.85, key = 'name', minLength = 4 } = {}) {
  if (normalizeText(query).length < minLength) return null;

  let best = null;
  let bestScore = 0;
  for (const candidate of candidates) {
    const score = similarity(query, candidate[key]);
    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }
  return best && bestScore >= threshold ? { match: best, score: bestScore } : null;
}
