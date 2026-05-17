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
  const seed = ((hash[0] << 24) | (hash[1] << 16) | (hash[2] << 8) | hash[3]) >>> 0;
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
  return dot / (normA * normB);
}
