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
      setTimeout(() => setShowSuccess(false), 2000);
      queryClient.invalidateQueries({ queryKey: ["field"] });
      queryClient.invalidateQueries({ queryKey: ["memories"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      onEncoded?.(mem.id);
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold tracking-tight">Teach the Agent</h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Add memories in natural language
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {EXAMPLE_CHIPS.map((chip) => (
          <button
            key={chip}
            onClick={() => setText(chip)}
            className="rounded-md bg-secondary px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
          >
            {chip.length > 35 ? chip.slice(0, 35) + "..." : chip}
          </button>
        ))}
      </div>

      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a fact, preference, or observation..."
        className="min-h-[80px] resize-none bg-secondary/50 text-sm border-border/50 placeholder:text-muted-foreground/50"
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-[10px] text-muted-foreground">Source</Label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="mt-1 w-full rounded-md border border-border/50 bg-secondary/50 px-2.5 py-1.5 text-xs"
          >
            <option value="user">User</option>
            <option value="document">Document</option>
            <option value="chat">Chat</option>
            <option value="synthetic">Synthetic</option>
          </select>
        </div>
        <div>
          <Label className="text-[10px] text-muted-foreground">
            Trust: {trust.toFixed(2)}
          </Label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={trust}
            onChange={(e) => setTrust(parseFloat(e.target.value))}
            className="mt-2 w-full accent-primary h-1"
          />
        </div>
      </div>

      <div>
        <Label className="text-[10px] text-muted-foreground">Tags</Label>
        <Input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="preference, fact, project"
          className="mt-1 bg-secondary/50 text-xs border-border/50"
        />
      </div>

      <Button
        onClick={() => mutation.mutate()}
        disabled={!text.trim() || mutation.isPending}
        className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        size="sm"
      >
        <Lightning className="h-3.5 w-3.5" weight="fill" />
        {mutation.isPending ? "Encoding..." : "Encode Memory"}
      </Button>

      <AnimatePresence>
        {showSuccess && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-[11px] text-primary text-center"
          >
            Memory encoded into holographic trace
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
