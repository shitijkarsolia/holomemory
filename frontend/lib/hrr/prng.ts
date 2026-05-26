// Custom splitmix64 + Box-Muller pipeline. Must stay bit-identical to
// the Python implementation in backend/app/memory/hrr.py — the parity
// check at scripts/parity_check.mjs verifies this on every run.
//
// We use the textbook splitmix64 (64-bit state, 64-bit constants) so
// that the symbol-vector seed can use 8 bytes of SHA-256 instead of 4,
// eliminating the 32-bit birthday-collision risk that the previous
// 32-bit murmur-finalizer stream had.

const C1 = 0x9e3779b97f4a7c15n;
const C2 = 0xbf58476d1ce4e5b9n;
const C3 = 0x94d049bb133111ebn;
const MASK_64 = (1n << 64n) - 1n;
const MASK_32 = 0xffffffffn;

/** Iterator returning u32 values from a 64-bit splitmix64 stream. */
export function splitmix64(seed: bigint): () => number {
  let state = seed & MASK_64;
  return () => {
    state = (state + C1) & MASK_64;
    let z = state;
    z = ((z ^ (z >> 30n)) * C2) & MASK_64;
    z = ((z ^ (z >> 27n)) * C3) & MASK_64;
    z = (z ^ (z >> 31n)) & MASK_64;
    // Take the upper 32 bits — the lower bits of splitmix64 are
    // weaker (this is the standard reduction). Box-Muller only needs
    // a uniform u32 per call.
    return Number((z >> 32n) & MASK_32);
  };
}

export function seededNormals(seed: bigint, count: number): Float64Array {
  const rng = splitmix64(seed);
  const result = new Float64Array(count);
  for (let i = 0; i < count; i += 2) {
    const u1 = (rng() + 1) / 4294967297;
    const u2 = (rng() + 1) / 4294967297;
    const r = Math.sqrt(-2 * Math.log(u1));
    const theta = 2 * Math.PI * u2;
    result[i] = r * Math.cos(theta);
    if (i + 1 < count) result[i + 1] = r * Math.sin(theta);
  }
  return result;
}
