// Parity check: dump tokens through the TS tokenizer over the same corpus
// the Python script uses, then compare to the JSON dumped by
// `scripts/dump_tokens.py`. Exits non-zero on any diff.
//
// Usage:
//   python scripts/dump_tokens.py > /tmp/py_tokens.json
//   node scripts/parity_check.mjs /tmp/py_tokens.json

import { readFileSync } from "node:fs";
import { argv, exit } from "node:process";
import { createRequire } from "node:module";

// Resolve `snowball-stemmers` against the frontend's node_modules.
import { fileURLToPath } from "node:url";
import { dirname, resolve as pathResolve } from "node:path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(
  pathResolve(__dirname, "..", "frontend", "node_modules", "_dummy"),
);
const sb = require("snowball-stemmers");

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
const cache = new Map();
function stem(t) {
  let s = cache.get(t);
  if (s !== undefined) return s;
  s = stemmer.stem(t);
  cache.set(t, s);
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

const pyPath = argv[2];
if (!pyPath) {
  console.error("usage: node scripts/parity_check.mjs <path-to-py-token-dump.json>");
  exit(2);
}
const py = JSON.parse(readFileSync(pyPath, "utf8"));

let diffs = 0;
for (const text of Object.keys(py)) {
  const pyTokens = py[text];
  const jsTokens = tokenize(text);
  if (JSON.stringify(pyTokens) !== JSON.stringify(jsTokens)) {
    diffs++;
    console.log("DIFF:", JSON.stringify(text));
    console.log("  py :", pyTokens);
    console.log("  js :", jsTokens);
  }
}

if (diffs === 0) {
  console.log(`OK: ${Object.keys(py).length} strings tokenize identically in Python and TS.`);
  exit(0);
} else {
  console.log(`FAIL: ${diffs} differences.`);
  exit(1);
}
