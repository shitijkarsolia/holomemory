"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { FieldResponse, Memory } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Waveform, Warning, Trash } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

export function DistortionLab() {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  const { data } = useQuery<FieldResponse>({
    queryKey: ["field"],
    queryFn: api.field,
    refetchInterval: 5000,
  });

  const memories = data?.memories || [];

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const showError = (err: unknown, fallback: string) => {
    const msg = err instanceof Error ? err.message : fallback;
    setErrorMsg(msg);
  };

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["field"] });
    queryClient.invalidateQueries({ queryKey: ["memories"] });
    queryClient.invalidateQueries({ queryKey: ["stats"] });
  };

  const noiseMutation = useMutation({
    mutationFn: () => api.noise(3),
    onMutate: () => setErrorMsg(null),
    onSuccess: (data) => {
      invalidateAll();
      showFeedback(`Injected ${data.memories_created} noise memories`);
    },
    onError: (err) => showError(err, "Couldn't inject noise."),
  });

  const contradictionMutation = useMutation({
    mutationFn: (id: string) => api.contradiction(id),
    onMutate: () => setErrorMsg(null),
    onSuccess: () => {
      invalidateAll();
      setSelectedMemory(null);
      showFeedback("Contradiction created. Watch trust scores shift.");
    },
    onError: (err) => showError(err, "Couldn't create contradiction."),
  });

  const resetMutation = useMutation({
    mutationFn: () => api.reset(),
    onMutate: () => setErrorMsg(null),
    onSuccess: () => {
      invalidateAll();
      setResetOpen(false);
      showFeedback("All memories cleared");
    },
    onError: (err) => {
      setResetOpen(false);
      showError(err, "Couldn't reset the field.");
    },
  });

  return (
    <section className="border-t border-border/30 px-6 py-16">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8 max-w-2xl">
          <h2 className="font-serif text-[28px] leading-tight tracking-tight text-foreground sm:text-[32px]">
            Distortion lab
          </h2>
          <p className="mt-3 text-[15.5px] leading-relaxed text-muted-foreground">
            Stress-test the system. Add noise, create contradictions, watch
            how trust adapts. Each action updates the memory field above.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div className="rounded-xl border border-border/40 bg-card/40 p-6">
            <div className="mb-3 flex items-center gap-2">
              <Waveform className="h-5 w-5 text-[color:var(--signal-amber)]" weight="bold" />
              <h3 className="font-serif text-[18px] tracking-tight text-foreground">
                Inject noise
              </h3>
            </div>
            <p className="mb-5 text-[13.5px] leading-relaxed text-muted-foreground">
              Add 3 random low-trust nonsense memories. Watch them appear as
              dim nodes in the field above.
            </p>
            <Button
              onClick={() => noiseMutation.mutate()}
              disabled={noiseMutation.isPending}
              size="sm"
              variant="outline"
              className="w-full border-border/50"
            >
              {noiseMutation.isPending ? "Injecting..." : "Add Noise"}
            </Button>
          </div>

          <div className="rounded-xl border border-border/40 bg-card/40 p-6">
            <div className="mb-3 flex items-center gap-2">
              <Warning className="h-5 w-5 text-[color:var(--signal-red)]" weight="bold" />
              <h3 className="font-serif text-[18px] tracking-tight text-foreground">
                Contradict
              </h3>
            </div>
            <p className="mb-4 text-[13.5px] leading-relaxed text-muted-foreground">
              Pick a memory to contradict. The system creates a conflicting
              version and flags both.
            </p>
            {memories.length > 0 ? (
              <div className="space-y-2">
                <select
                  value={selectedMemory?.id || ""}
                  onChange={(e) => {
                    const mem = memories.find((m) => m.id === e.target.value);
                    setSelectedMemory(mem || null);
                  }}
                  className="w-full rounded-md border border-border/50 bg-secondary/50 px-2.5 py-1.5 text-[11px]"
                >
                  <option value="">Select a memory...</option>
                  {memories
                    .filter((m) => !m.tags.includes("noise"))
                    .slice(0, 10)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.text.slice(0, 50)}
                        {m.text.length > 50 ? "..." : ""}
                      </option>
                    ))}
                </select>
                <Button
                  onClick={() =>
                    selectedMemory && contradictionMutation.mutate(selectedMemory.id)
                  }
                  disabled={!selectedMemory || contradictionMutation.isPending}
                  size="sm"
                  variant="outline"
                  className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
                >
                  {contradictionMutation.isPending ? "Creating..." : "Create Contradiction"}
                </Button>
              </div>
            ) : (
              <p className="text-[10px] text-muted-foreground/50 text-center py-2">
                No memories to contradict yet
              </p>
            )}
          </div>

          <div className="rounded-xl border border-border/40 bg-card/40 p-6">
            <div className="mb-3 flex items-center gap-2">
              <Trash className="h-5 w-5 text-muted-foreground" weight="bold" />
              <h3 className="font-serif text-[18px] tracking-tight text-foreground">
                Reset
              </h3>
            </div>
            <p className="mb-5 text-[13.5px] leading-relaxed text-muted-foreground">
              Wipe all memories, vectors, and symbols. Start fresh.
            </p>
            <Button
              onClick={() => setResetOpen(true)}
              disabled={resetMutation.isPending || memories.length === 0}
              size="sm"
              variant="outline"
              className="w-full border-border/50"
            >
              {resetMutation.isPending ? "Resetting..." : "Clear All"}
            </Button>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-5 rounded-md border border-[color:var(--signal-red)]/30 bg-[color:var(--signal-red)]/5 px-4 py-3 text-[13px] text-foreground/85">
            {errorMsg}
            <button
              onClick={() => setErrorMsg(null)}
              className="ml-3 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Dismiss
            </button>
          </div>
        )}

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 flex justify-center"
            >
              <Badge
                variant="outline"
                className="text-[11px] border-primary/30 text-primary px-3 py-1"
              >
                {feedback}
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Clear the memory field?</DialogTitle>
            <DialogDescription>
              This permanently deletes all{" "}
              <span className="font-mono text-foreground/85">
                {memories.length}
              </span>{" "}
              memories, their stored vectors, and the symbol table. The action
              cannot be undone — you&rsquo;ll need to re-seed or teach
              memories from scratch.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResetOpen(false)}
              disabled={resetMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => resetMutation.mutate()}
              disabled={resetMutation.isPending}
            >
              {resetMutation.isPending ? "Clearing…" : "Clear all memories"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
