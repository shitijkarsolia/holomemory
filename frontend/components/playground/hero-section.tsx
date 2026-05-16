"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Atom, ListBullets } from "@phosphor-icons/react";
import { useState } from "react";
import { DemoScriptModal } from "./demo-script-modal";

export function HeroSection() {
  const queryClient = useQueryClient();
  const [showScript, setShowScript] = useState(false);

  const seedMutation = useMutation({
    mutationFn: () => api.demo.seed(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["field"] });
      queryClient.invalidateQueries({ queryKey: ["memories"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });

  return (
    <section className="px-6 py-16 md:py-24">
      <div className="mx-auto max-w-[1400px]">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
              <Atom className="h-4 w-4 text-primary" weight="duotone" />
            </div>
            <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
              Interactive Demo
            </span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            HoloMem Lab
          </h1>
          <p className="mt-3 text-base text-muted-foreground leading-relaxed max-w-lg">
            Teach an agent. Disturb its memory. Watch it remember.
          </p>
          <p className="mt-2 text-sm text-muted-foreground/70 max-w-lg">
            An interactive prototype of holographic reduced representations for agent memory.
            Add facts, ask fuzzy questions, inject noise, and see how approximate algebraic
            recall compares to keyword search.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <Button
              onClick={() => seedMutation.mutate()}
              disabled={seedMutation.isPending}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              size="sm"
            >
              <Atom className="h-3.5 w-3.5" weight="bold" />
              {seedMutation.isPending ? "Seeding..." : "Seed Demo"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setShowScript(true)}
            >
              <ListBullets className="h-3.5 w-3.5" weight="bold" />
              Demo Script
            </Button>
            {seedMutation.isSuccess && (
              <span className="text-xs text-primary">
                Loaded {seedMutation.data.memories_created} memories
              </span>
            )}
          </div>
        </div>
      </div>

      <DemoScriptModal open={showScript} onOpenChange={setShowScript} />
    </section>
  );
}
