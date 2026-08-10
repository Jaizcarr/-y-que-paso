// Runs `worker` over `items` with at most `limit` running at the same time,
// instead of one-at-a-time. Used for TMDB image search during mass uploads,
// which otherwise does hundreds of sequential network round-trips.
export async function runWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function runNext() {
    while (nextIndex < items.length) {
      const current = nextIndex++;
      results[current] = await worker(items[current], current);
    }
  }

  const poolSize = Math.max(1, Math.min(limit, items.length));
  await Promise.all(Array.from({ length: poolSize }, runNext));
  return results;
}
