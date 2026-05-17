export function splitmix64(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x9e3779b9) >>> 0;
    let z = state;
    z = Math.imul(z ^ (z >>> 16), 0x85ebca6b) >>> 0;
    z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35) >>> 0;
    z = (z ^ (z >>> 16)) >>> 0;
    return z;
  };
}

export function seededNormals(seed: number, count: number): Float64Array {
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
