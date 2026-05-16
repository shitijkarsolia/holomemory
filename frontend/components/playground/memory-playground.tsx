"use client";

import { useState, useCallback } from "react";
import { TeachPanel } from "./teach-panel";
import { MemoryField } from "./memory-field";
import { RecallChallenge } from "./recall-challenge";

export function MemoryPlayground() {
  const [highlightedIds, setHighlightedIds] = useState<string[]>([]);
  const [lastEncodedId, setLastEncodedId] = useState<string | null>(null);

  const handleEncoded = useCallback((id: string) => {
    setLastEncodedId(id);
    setTimeout(() => setLastEncodedId(null), 2000);
  }, []);

  const handleResults = useCallback((ids: string[]) => {
    setHighlightedIds(ids);
    setTimeout(() => setHighlightedIds([]), 4000);
  }, []);

  return (
    <section className="px-6 pb-16">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-6 lg:grid-cols-[300px_1fr_320px]">
          <div className="rounded-xl border border-border/30 bg-card/50 p-5">
            <TeachPanel onEncoded={handleEncoded} />
          </div>

          <div className="min-h-[400px]">
            <MemoryField
              highlightedIds={highlightedIds}
              lastEncodedId={lastEncodedId}
            />
          </div>

          <div className="rounded-xl border border-border/30 bg-card/50 p-5">
            <RecallChallenge onResults={handleResults} />
          </div>
        </div>
      </div>
    </section>
  );
}
