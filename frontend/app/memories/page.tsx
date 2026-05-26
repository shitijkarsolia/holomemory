"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Memory } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash, PencilSimple, MagnifyingGlass } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type SortMode = "recent" | "trust-asc" | "trust-desc";

export default function MemoriesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const [selected, setSelected] = useState<Memory | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: rawMemories = [], isLoading } = useQuery({
    queryKey: ["memories", search, kindFilter, statusFilter],
    queryFn: () => {
      const params: Record<string, string> = {};
      if (search) params.q = search;
      if (kindFilter) params.kind = kindFilter;
      if (statusFilter) params.status = statusFilter;
      return api.memories.list(params);
    },
  });

  const memories = useMemo(() => {
    if (sortMode === "recent") return rawMemories;
    return [...rawMemories].sort((a, b) =>
      sortMode === "trust-asc" ? a.trust - b.trust : b.trust - a.trust,
    );
  }, [rawMemories, sortMode]);

  // Clear stale selection when the inspected memory disappears from the
  // list (e.g. another tab deleted it, or the playground reset wiped it).
  useEffect(() => {
    if (!selected) return;
    if (!rawMemories.some((m) => m.id === selected.id)) {
      setSelected(null);
    }
  }, [rawMemories, selected]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.memories.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memories"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setSelected(null);
      setActionError(null);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Delete failed";
      setActionError(msg);
      // Refresh the list — the memory may have been removed elsewhere.
      queryClient.invalidateQueries({ queryKey: ["memories"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.memories.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memories"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setActionError(null);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Update failed";
      setActionError(msg);
      queryClient.invalidateQueries({ queryKey: ["memories"] });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Memories</h1>
        <p className="text-sm text-muted-foreground">Browse, filter, and manage stored memories</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlass className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search memories..."
            className="pl-9 text-sm"
          />
        </div>
        <select
          value={kindFilter}
          onChange={(e) => setKindFilter(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All kinds</option>
          <option value="fact">Fact</option>
          <option value="preference">Preference</option>
          <option value="note">Note</option>
          <option value="event">Event</option>
          <option value="task">Task</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="stale">Stale</option>
          <option value="superseded">Superseded</option>
          <option value="deleted">Deleted</option>
        </select>
        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as SortMode)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          aria-label="Sort order"
        >
          <option value="recent">Sort: most recent</option>
          <option value="trust-asc">Sort: lowest trust first</option>
          <option value="trust-desc">Sort: highest trust first</option>
        </select>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-2">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg border border-border bg-muted/40" />
            ))
          ) : memories.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-12 text-center">
              <p className="text-sm text-muted-foreground">No memories found.</p>
              <p className="mt-1 text-xs text-muted-foreground">Try adjusting your filters or seed the database.</p>
            </div>
          ) : (
            memories.map((mem) => (
              <button
                key={mem.id}
                onClick={() => setSelected(mem)}
                className={cn(
                  "w-full rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-foreground/20",
                  selected?.id === mem.id && "border-foreground/30 bg-secondary/50"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm leading-relaxed line-clamp-2">{mem.text}</p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "shrink-0 text-[10px]",
                      mem.status === "active" && "border-emerald-500/30 text-emerald-600",
                      mem.status === "stale" && "border-amber-500/30 text-amber-600",
                      mem.status === "superseded" && "border-zinc-500/30 text-zinc-500",
                      mem.status === "deleted" && "border-red-500/30 text-red-500"
                    )}
                  >
                    {mem.status}
                  </Badge>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">{mem.kind}</Badge>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    trust: {mem.trust}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(mem.created_at).toLocaleDateString()}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Inspector Panel */}
        {selected && (
          <div className="rounded-lg border border-border bg-card p-5 h-fit sticky top-8">
            <h3 className="text-[13px] font-medium uppercase tracking-wider text-muted-foreground mb-4">
              Inspector
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-muted-foreground">Text</p>
                <p className="text-sm">{selected.text}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-muted-foreground">Kind</p>
                  <p className="text-sm">{selected.kind}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Trust</p>
                  <p className="font-mono text-sm">{selected.trust}</p>
                </div>
              </div>
              {selected.subject && (
                <div>
                  <p className="text-[10px] text-muted-foreground">Subject</p>
                  <p className="text-sm">{selected.subject}</p>
                </div>
              )}
              {selected.predicate && (
                <div>
                  <p className="text-[10px] text-muted-foreground">Predicate</p>
                  <p className="text-sm">{selected.predicate}</p>
                </div>
              )}
              {selected.object && (
                <div>
                  <p className="text-[10px] text-muted-foreground">Object</p>
                  <p className="text-sm">{selected.object}</p>
                </div>
              )}
              {selected.entities.length > 0 && (
                <div>
                  <p className="text-[10px] text-muted-foreground">Entities</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selected.entities.map((e) => (
                      <Badge key={e} variant="secondary" className="text-[10px]">{e}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {selected.tags.length > 0 && (
                <div>
                  <p className="text-[10px] text-muted-foreground">Tags</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selected.tags.map((t) => (
                      <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-muted-foreground">Source</p>
                  <p className="text-xs">{selected.source}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Status</p>
                  <p className="text-xs">{selected.status}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">ID</p>
                <p className="font-mono text-[10px] break-all">{selected.id}</p>
              </div>

              <div className="flex gap-2 border-t border-border pt-3">
                {selected.status === "active" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-1 text-xs"
                    onClick={() => updateMutation.mutate({ id: selected.id, status: "stale" })}
                    disabled={updateMutation.isPending}
                  >
                    <PencilSimple className="h-3 w-3" />
                    Mark Stale
                  </Button>
                )}
                {selected.status !== "deleted" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-1 text-xs text-red-500 hover:text-red-600"
                    onClick={() => deleteMutation.mutate(selected.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash className="h-3 w-3" />
                    Delete
                  </Button>
                )}
              </div>
              {actionError && (
                <p className="rounded-md border border-red-500/30 bg-red-500/5 px-3 py-2 text-[11.5px] text-red-500">
                  {actionError}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
