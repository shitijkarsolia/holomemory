export const SITE_NAME = "HoloMem";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const SITE_TAGLINE = "Holographic Reduced Representations, explained";

export const SITE_DESCRIPTION =
  "An interactive explainer for Holographic Reduced Representations (HRR): how to store structured facts inside a single fixed-size vector using bind, superpose, unbind, and cleanup. Includes a live HRR lab, an applied memory system with role-aware retrieval and source trust, and identical Python and TypeScript implementations.";

export const SITE_KEYWORDS = [
  "Holographic Reduced Representations",
  "HRR",
  "vector symbolic architecture",
  "VSA",
  "structured vector memory",
  "agent memory",
  "algebraic memory",
  "binding and unbinding",
  "circular convolution",
  "associative memory",
  "neural-symbolic",
  "Plate HRR",
  "high-dimensional computing",
  "hyperdimensional computing",
  "compositional embeddings",
];

export const SITE_AUTHOR = {
  name: "Shitij Mathur",
  url: "https://github.com/shitijkarsolia",
};
