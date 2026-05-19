import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Memory store — inspect, filter, and edit HRR memories",
  description:
    "Browse the structured-memory store backing the HRR engine: search, filter by kind or status, sort by trust, and inspect or edit individual memory traces.",
  alternates: { canonical: "/memories" },
  openGraph: {
    title: "Memory store — inspect HRR memories",
    description:
      "Browse, filter, and edit the structured memory traces stored in HoloMem's HRR engine.",
    url: "/memories",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HoloMem memory store",
    description: "Browse, filter, and edit the structured HRR memory traces.",
  },
};

export default function MemoriesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
