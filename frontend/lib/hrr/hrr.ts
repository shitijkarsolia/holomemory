import { fft, ifft, complexMultiply, complexMultiplyConj } from "./fft";
import { sha256 } from "./sha256";
import { seededNormals } from "./prng";

export const HRR_DIMENSION = 1024;
const HRR_SEED = 42;

const symbolCache = new Map<string, Float64Array>();

export function symbolVector(name: string): Float64Array {
  const cached = symbolCache.get(name);
  if (cached) return cached;

  const hash = sha256(`${HRR_SEED}:${name}`);
  // Use 8 bytes of the SHA-256 digest as a 64-bit seed for splitmix64.
  // Previously took 4 bytes (32-bit), which had a non-negligible
  // birthday-collision probability at large symbol vocabularies.
  let seed = 0n;
  for (let i = 0; i < 8; i++) seed = (seed << 8n) | BigInt(hash[i]);
  const vec = seededNormals(seed, HRR_DIMENSION);

  let norm = 0;
  for (let i = 0; i < HRR_DIMENSION; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm);
  if (norm > 0) for (let i = 0; i < HRR_DIMENSION; i++) vec[i] /= norm;

  symbolCache.set(name, vec);
  return vec;
}

export function bind(a: Float64Array, b: Float64Array): Float64Array {
  const [aRe, aIm] = fft(a);
  const [bRe, bIm] = fft(b);
  const [cRe, cIm] = complexMultiply(aRe, aIm, bRe, bIm);
  return ifft(cRe, cIm);
}

export function unbind(bound: Float64Array, key: Float64Array): Float64Array {
  const [bRe, bIm] = fft(bound);
  const [kRe, kIm] = fft(key);
  const [cRe, cIm] = complexMultiplyConj(bRe, bIm, kRe, kIm);
  return ifft(cRe, cIm);
}

export function superpose(vectors: Float64Array[]): Float64Array {
  if (vectors.length === 0) return new Float64Array(HRR_DIMENSION);
  const result = new Float64Array(HRR_DIMENSION);
  for (const v of vectors) {
    for (let i = 0; i < HRR_DIMENSION; i++) result[i] += v[i];
  }
  let norm = 0;
  for (let i = 0; i < HRR_DIMENSION; i++) norm += result[i] * result[i];
  norm = Math.sqrt(norm);
  if (norm > 0) for (let i = 0; i < HRR_DIMENSION; i++) result[i] /= norm;
  return result;
}

export function cosineSimilarity(a: Float64Array, b: Float64Array): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  if (normA === 0 || normB === 0) return 0;
  // Clamp: floating-point summation can push the dot/norm ratio
  // microscopically outside [-1, 1] for unit vectors.
  const sim = dot / (normA * normB);
  if (sim > 1) return 1;
  if (sim < -1) return -1;
  return sim;
}

export function cleanup(
  probe: Float64Array,
  vocabulary: Record<string, Float64Array>,
  topK = 5,
): { symbol: string; similarity: number }[] {
  const scored: { symbol: string; similarity: number }[] = [];
  for (const [name, vec] of Object.entries(vocabulary)) {
    scored.push({ symbol: name, similarity: cosineSimilarity(probe, vec) });
  }
  scored.sort((a, b) => b.similarity - a.similarity);
  return scored.slice(0, topK);
}

// Box-Muller transform driven by Math.random (used only inside demos that
// explicitly need stochasticity — production code paths use seeded PRNG).
function gaussianNoise(n: number): Float64Array {
  const out = new Float64Array(n);
  for (let i = 0; i < n; i += 2) {
    let u1 = Math.random(), u2 = Math.random();
    if (u1 < 1e-12) u1 = 1e-12;
    const mag = Math.sqrt(-2 * Math.log(u1));
    out[i] = mag * Math.cos(2 * Math.PI * u2);
    if (i + 1 < n) out[i + 1] = mag * Math.sin(2 * Math.PI * u2);
  }
  return out;
}

/** Mix `level` fraction of unit-norm Gaussian noise into a vector. */
export function corruptVector(vec: Float64Array, level: number): Float64Array {
  const noise = gaussianNoise(vec.length);
  let norm = 0;
  for (let i = 0; i < noise.length; i++) norm += noise[i] * noise[i];
  norm = Math.sqrt(norm);
  if (norm > 0) for (let i = 0; i < noise.length; i++) noise[i] /= norm;
  const out = new Float64Array(vec.length);
  const a = 1 - level;
  for (let i = 0; i < vec.length; i++) out[i] = a * vec[i] + level * noise[i];
  let on = 0;
  for (let i = 0; i < out.length; i++) on += out[i] * out[i];
  on = Math.sqrt(on);
  if (on > 0) for (let i = 0; i < out.length; i++) out[i] /= on;
  return out;
}
