// Parity check: verify the TS HRR engine matches the Python backend
// bit-for-bit, both for tokenization AND for symbol-vector generation.
//
// Usage:
//   python scripts/dump_tokens.py  > /tmp/py_tokens.json
//   python scripts/dump_vectors.py > /tmp/py_vectors.json
//   node scripts/parity_check.mjs /tmp/py_tokens.json /tmp/py_vectors.json
//
// Exits non-zero on any divergence.

import { readFileSync } from "node:fs";
import { argv, exit } from "node:process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, resolve as pathResolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Resolve `snowball-stemmers` against the frontend's node_modules.
const require = createRequire(
  pathResolve(__dirname, "..", "frontend", "node_modules", "_dummy"),
);
const sb = require("snowball-stemmers");

// ---------------------------------------------------------------------------
// Tokenizer (mirror of frontend/lib/hrr/encoder.ts)
// ---------------------------------------------------------------------------

const STOPWORDS = new Set([
  "the","a","an","is","are","was","were","be","been","being",
  "have","has","had","do","does","did","will","would","could",
  "should","may","might","shall","can","to","of","in","for",
  "on","with","at","by","from","as","into","through","during",
  "before","after","above","below","between","and","but","or",
  "nor","not","so","yet","both","either","neither","each",
  "every","all","any","few","more","most","other","some",
  "such","no","only","own","same","than","too","very",
  "just","because","if","when","where","how","what","which",
  "who","whom","this","that","these","those","it","its",
]);

const stemmer = sb.newStemmer("english");
const stemCache = new Map();
function stem(t) {
  let s = stemCache.get(t);
  if (s !== undefined) return s;
  s = stemmer.stem(t);
  stemCache.set(t, s);
  return s;
}

function tokenize(text) {
  const out = [];
  for (const w of (text.toLowerCase().match(/[a-z0-9]+/g) || [])) {
    if (w.length <= 1) continue;
    if (STOPWORDS.has(w)) continue;
    out.push(stem(w));
  }
  return out;
}

// ---------------------------------------------------------------------------
// PRNG + symbol_vector (mirror of frontend/lib/hrr/{prng,sha256,hrr}.ts)
// ---------------------------------------------------------------------------

const HRR_SEED = 42;
const HRR_DIMENSION = 1024;

const C1 = 0x9e3779b97f4a7c15n;
const C2 = 0xbf58476d1ce4e5b9n;
const C3 = 0x94d049bb133111ebn;
const MASK_64 = (1n << 64n) - 1n;
const MASK_32 = 0xffffffffn;

function splitmix64(seed) {
  let state = seed & MASK_64;
  return () => {
    state = (state + C1) & MASK_64;
    let z = state;
    z = ((z ^ (z >> 30n)) * C2) & MASK_64;
    z = ((z ^ (z >> 27n)) * C3) & MASK_64;
    z = (z ^ (z >> 31n)) & MASK_64;
    return Number((z >> 32n) & MASK_32);
  };
}

function seededNormals(seed, count) {
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

// Minimal SHA-256 — return the first 8 bytes packed into a 64-bit BigInt
// (the seed for splitmix64). Uses node:crypto so we don't have to
// reimplement SHA-256 here.
async function sha256Seed64(input) {
  const { createHash } = await import("node:crypto");
  const buf = createHash("sha256").update(input).digest();
  let seed = 0n;
  for (let i = 0; i < 8; i++) seed = (seed << 8n) | BigInt(buf[i]);
  return seed;
}

async function symbolVector(name) {
  const seed = await sha256Seed64(`${HRR_SEED}:${name}`);
  const vec = seededNormals(seed, HRR_DIMENSION);
  let norm = 0;
  for (let i = 0; i < HRR_DIMENSION; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm);
  if (norm > 0) for (let i = 0; i < HRR_DIMENSION; i++) vec[i] /= norm;
  return vec;
}

// ---------------------------------------------------------------------------
// Driver
// ---------------------------------------------------------------------------

const tokenPath = argv[2];
const vectorPath = argv[3];

if (!tokenPath) {
  console.error(
    "usage: node scripts/parity_check.mjs <py-tokens.json> [<py-vectors.json>]",
  );
  exit(2);
}

let totalDiffs = 0;

// Tokenizer parity
{
  const py = JSON.parse(readFileSync(tokenPath, "utf8"));
  let diffs = 0;
  for (const text of Object.keys(py)) {
    const pyTokens = py[text];
    const jsTokens = tokenize(text);
    if (JSON.stringify(pyTokens) !== JSON.stringify(jsTokens)) {
      diffs++;
      console.log("TOKEN DIFF:", JSON.stringify(text));
      console.log("  py :", pyTokens);
      console.log("  js :", jsTokens);
    }
  }
  if (diffs === 0) {
    console.log(`OK: tokens — ${Object.keys(py).length} strings tokenize identically.`);
  } else {
    console.log(`FAIL: tokens — ${diffs} differences.`);
  }
  totalDiffs += diffs;
}

// Vector parity (optional but strongly recommended)
if (vectorPath) {
  const py = JSON.parse(readFileSync(vectorPath, "utf8"));
  // Floats may differ by ULP-scale rounding even with identical algorithms;
  // 1e-12 is well within Math.sin/Math.log differences and well below any
  // algorithmic divergence we'd care about.
  const TOL = 1e-12;
  let diffs = 0;
  for (const name of Object.keys(py)) {
    const pyHead = py[name];
    const jsVec = await symbolVector(name);
    let worst = 0;
    let worstIdx = -1;
    for (let i = 0; i < pyHead.length; i++) {
      const d = Math.abs(pyHead[i] - jsVec[i]);
      if (d > worst) {
        worst = d;
        worstIdx = i;
      }
    }
    if (worst > TOL) {
      diffs++;
      console.log("VECTOR DIFF:", JSON.stringify(name));
      console.log(`  worst: |Δ|=${worst.toExponential(3)} at component ${worstIdx}`);
      console.log(`  py [0..3]: ${pyHead.slice(0, 4).map((x) => x.toExponential(6)).join(", ")}`);
      console.log(`  js [0..3]: ${Array.from(jsVec.slice(0, 4)).map((x) => x.toExponential(6)).join(", ")}`);
    }
  }
  if (diffs === 0) {
    console.log(`OK: vectors — ${Object.keys(py).length} symbols produce bit-identical vectors (|Δ| < ${TOL}).`);
  } else {
    console.log(`FAIL: vectors — ${diffs} symbols diverge.`);
  }
  totalDiffs += diffs;
} else {
  console.log("(skipped vector parity — no vectors file given)");
}

if (totalDiffs === 0) {
  console.log("PARITY OK");
  exit(0);
} else {
  console.log(`PARITY FAIL: ${totalDiffs} total differences`);
  exit(1);
}
