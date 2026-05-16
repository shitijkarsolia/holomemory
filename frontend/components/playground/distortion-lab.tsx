"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { FieldResponse, Memory } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Waveform, Warning, Trash } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

export function DistortionLab() {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

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

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["field"] });
    queryClient.invalidateQueries({ queryKey: ["memories"] });
    queryClient.invalidateQueries({ queryKey: ["stats"] });
  };

  const noiseMutation = useMutation({
    mutationFn: () => api.noise(3),
    onSuccess: (data) => {
      invalidateAll();
      showFeedback(`Injected ${data.memories_created} noise memories`);
    },
  });

  const contradictionMutation = useMutation({
    mutationFn: (id: string) => api.contradiction(id),
    onSuccess: () => {
      invalidateAll();
      setSelectedMemory(null);
      showFeedback("Contradiction created — watch trust scores shift");
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => api.reset(),
    onSuccess: () => {
      invalidateAll();
      showFeedback("All memories cleared");
    },
  });

  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-6">
          <h2 className="text-lg font-semibold tracking-tight">Distortion Lab</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Stress-test the memory system. Add noise, create contradictions, see how trust adapts.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border/30 bg-card/50 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Waveform className="h-4 w-4 text-primary" weight="bold" />
              <h3 className="text-sm font-medium">Inject Noise</h3>
            </div>
            <p className="text-[11px] text-muted-foreground mb-4">
              Add 3 random low-trust nonsense memories. Watch them appear as dim nodes in the field.
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

          <div className="rounded-xl border border-border/30 bg-card/50 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Warning className="h-4 w-4 text-destructive" weight="bold" />
              <h3 className="text-sm font-medium">Contradict</h3>
            </div>
            <p className="text-[11px] text-muted-foreground mb-3">
              Pick a memory to contradict. The system creates a conflicting version and flags both.
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

          <div className="rounded-xl border border-border/30 bg-card/50 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Trash className="h-4 w-4 text-muted-foreground" weight="bold" />
              <h3 className="text-sm font-medium">Reset</h3>
            </div>
            <p className="text-[11px] text-muted-foreground mb-4">
              Wipe all memories, vectors, and symbols. Start fresh.
            </p>
            <Button
              onClick={() => resetMutation.mutate()}
              disabled={resetMutation.isPending}
              size="sm"
              variant="outline"
              className="w-full border-border/50"
            >
              {resetMutation.isPending ? "Resetting..." : "Clear All"}
            </Button>
          </div>
        </div>

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
    </section>
  );
}
