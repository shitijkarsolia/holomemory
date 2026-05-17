"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Lightning } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

const EXAMPLE_CHIPS = [
  "Maya prefers concise technical answers.",
  "The Atlas project uses FastAPI and SQLite.",
  "Old fact: Maya's favorite editor is Vim.",
  "Updated fact: Maya now prefers Cursor.",
  "Noisy fact: Atlas stores vectors in bananas.",
];

interface Props {
  onEncoded?: (memoryId: string) => void;
}

export function TeachPanel({ onEncoded }: Props) {
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [source, setSource] = useState("user");
  const [trust, setTrust] = useState(0.8);
  const [tags, setTags] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      api.memories.create({
        text,
        source,
        trust,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      }),
    onSuccess: (mem) => {
      setText("");
      setTags("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
      queryClient.invalidateQueries({ queryKey: ["field"] });
      queryClient.invalidateQueries({ queryKey: ["memories"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      onEncoded?.(mem.id);
    },
  });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[14px] leading-relaxed text-muted-foreground">
          Type a fact, preference, or observation. It gets encoded into a 1024-dim
          trace and joins the field on the right.
        </p>
      </div>

      <div>
        <Label className="text-[12px] text-muted-foreground">Try one of these</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {EXAMPLE_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => setText(chip)}
              className="rounded-md border border-border bg-card/40 px-2.5 py-1.5 text-left text-[12.5px] text-foreground/80 transition-colors hover:border-[color:var(--signal-amber)]/40 hover:text-foreground"
            >
              {chip.length > 36 ? chip.slice(0, 36) + "…" : chip}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-[12px] text-muted-foreground">Memory text</Label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="The auth service uses PostgreSQL for sessions."
          className="mt-2 min-h-[96px] resize-none border-border/50 bg-secondary/40 text-[14.5px] leading-relaxed placeholder:text-muted-foreground/50"
        />
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced((s) => !s)}
          className="font-mono text-[11.5px] uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-foreground"
        >
          {showAdvanced ? "− Hide" : "+ Show"} advanced (source, trust, tags)
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[12px] text-muted-foreground">Source</Label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-border/50 bg-secondary/40 px-3 py-2 text-[13px]"
                >
                  <option value="user">User</option>
                  <option value="document">Document</option>
                  <option value="chat">Chat</option>
                  <option value="synthetic">Synthetic</option>
                </select>
              </div>
              <div>
                <Label className="text-[12px] text-muted-foreground">
                  Trust: {trust.toFixed(2)}
                </Label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={trust}
                  onChange={(e) => setTrust(parseFloat(e.target.value))}
                  className="mt-3 h-1 w-full accent-primary"
                />
              </div>
            </div>
            <div>
              <Label className="text-[12px] text-muted-foreground">Tags</Label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="preference, fact, project"
                className="mt-1.5 border-border/50 bg-secondary/40 text-[13px]"
              />
            </div>
          </div>
        )}
      </div>

      <Button
        onClick={() => mutation.mutate()}
        disabled={!text.trim() || mutation.isPending}
        className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 text-[14px]"
      >
        <Lightning className="h-4 w-4" weight="fill" />
        {mutation.isPending ? "Encoding…" : "Encode memory"}
      </Button>

      <AnimatePresence>
        {showSuccess && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center text-[12.5px] text-[color:var(--signal-amber)]"
          >
            Encoded. Look at the field for the new node.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
