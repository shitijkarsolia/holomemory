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
    <section className="border-t border-border/30 px-6 pb-16 pt-12">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-6 lg:grid-cols-[360px_1fr_360px] lg:gap-8">
          <div className="flex flex-col">
            <PanelLabel n="01" title="Teach" />
            <div className="mt-3 flex-1 rounded-xl border border-border/40 bg-card/40 p-6">
              <TeachPanel onEncoded={handleEncoded} />
            </div>
          </div>

          <div className="flex flex-col">
            <PanelLabel n="02" title="Memory field" />
            <div className="mt-3 min-h-[440px] flex-1">
              <MemoryField
                highlightedIds={highlightedIds}
                lastEncodedId={lastEncodedId}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <PanelLabel n="03" title="Recall" />
            <div className="mt-3 flex-1 rounded-xl border border-border/40 bg-card/40 p-6">
              <RecallChallenge onResults={handleResults} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PanelLabel({ n, title }: { n: string; title: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="font-mono text-[12px] tracking-[0.04em] text-[color:var(--signal-amber)]">
        {n}
      </span>
      <span className="font-serif text-[20px] leading-none tracking-tight text-foreground">
        {title}
      </span>
    </div>
  );
}
