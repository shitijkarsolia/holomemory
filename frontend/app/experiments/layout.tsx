import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Retrieval experiments — keyword vs holographic vs hybrid",
  description:
    "Benchmark Recall@1/3/5 and per-mode latency for keyword, holographic, and hybrid retrieval against synthetic queries — the HRR backend running against an evaluation harness.",
  alternates: { canonical: "/experiments" },
  openGraph: {
    title: "Retrieval experiments — keyword vs holographic vs hybrid",
    description:
      "Recall@1/3/5 and latency benchmarks for keyword, holographic, and hybrid retrieval.",
    url: "/experiments",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HoloMem retrieval experiments",
    description: "Recall and latency benchmarks across keyword, holographic, and hybrid retrieval.",
  },
};

export default function ExperimentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
