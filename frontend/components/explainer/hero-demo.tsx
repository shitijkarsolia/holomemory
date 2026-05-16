"use client";

export function HeroDemo() {
  return (
    <div className="demo-panel relative w-full p-6 sm:p-7">
      <div className="flex items-center justify-between">
        <p className="eyebrow">Structured fact → vector trace</p>
        <span className="text-[10px] font-mono text-muted-foreground/70">
          dim 1024
        </span>
      </div>

      {/* Fact card */}
      <div className="mt-4 rounded-md border border-border bg-card/60 px-4 py-3">
        <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">
          Fact
        </p>
        <p className="mt-1 text-[15px] leading-snug text-foreground">
          Sarah owns the auth service and maintains the login flow.
        </p>
      </div>

      {/* Triple rows */}
      <div className="mt-4 grid grid-cols-[80px_1fr] gap-y-2 gap-x-3 text-sm">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground/70 self-center">
          subject
        </span>
        <span className="rounded-md border border-[color:var(--signal-amber)]/40 bg-[color:var(--signal-amber)]/10 px-2.5 py-1 text-[color:var(--signal-amber)] font-medium w-fit">
          Sarah
        </span>

        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground/70 self-center">
          predicate
        </span>
        <span className="rounded-md border border-[color:var(--signal-blue)]/40 bg-[color:var(--signal-blue)]/10 px-2.5 py-1 text-[color:var(--signal-blue)] font-medium w-fit">
          owns
        </span>

        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground/70 self-center">
          object
        </span>
        <span className="rounded-md border border-[color:var(--signal-violet)]/40 bg-[color:var(--signal-violet)]/10 px-2.5 py-1 text-[color:var(--signal-violet)] font-medium w-fit">
          auth service
        </span>
      </div>

      {/* Vector trace panel */}
      <div className="relative mt-5 h-[160px] rounded-md border border-border bg-[oklch(0.09_0.012_75)] overflow-hidden">
        {/* radial rings */}
        <div className="absolute inset-0 opacity-60">
          <div className="absolute left-1/2 top-1/2 h-[120px] w-[120px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[color:var(--signal-amber)]/15" />
          <div className="absolute left-1/2 top-1/2 h-[80px] w-[80px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[color:var(--signal-amber)]/20" />
          <div className="absolute left-1/2 top-1/2 h-[44px] w-[44px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[color:var(--signal-amber)]/30" />
        </div>
        {/* highlighted main node */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="trace-glow pulse-trace h-3 w-3 rounded-full bg-[color:var(--signal-amber)]" />
        </div>
        {/* satellite nodes */}
        <Dot x="22%" y="34%" color="var(--signal-blue)" size={7} />
        <Dot x="78%" y="28%" color="var(--signal-violet)" size={8} />
        <Dot x="74%" y="74%" color="var(--signal-amber)" size={6} />
        <Dot x="18%" y="72%" color="var(--signal-amber)" size={5} />
        <Dot x="34%" y="52%" color="var(--signal-violet)" size={4} />
        <Dot x="62%" y="46%" color="var(--signal-blue)" size={4} />
        {/* faint connection lines */}
        <svg className="absolute inset-0 h-full w-full opacity-40" aria-hidden>
          <line x1="50%" y1="50%" x2="22%" y2="34%" stroke="oklch(0.78 0.13 72 / 0.35)" strokeWidth="1" />
          <line x1="50%" y1="50%" x2="78%" y2="28%" stroke="oklch(0.78 0.13 72 / 0.35)" strokeWidth="1" />
          <line x1="50%" y1="50%" x2="74%" y2="74%" stroke="oklch(0.78 0.13 72 / 0.3)" strokeWidth="1" />
          <line x1="50%" y1="50%" x2="18%" y2="72%" stroke="oklch(0.78 0.13 72 / 0.25)" strokeWidth="1" />
        </svg>
        <p className="absolute left-3 top-2.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
          memory field
        </p>
        <p className="absolute right-3 bottom-2 text-[10px] font-mono text-muted-foreground/60">
          bind(s) ⊕ bind(p) ⊕ bind(o)
        </p>
      </div>

      {/* Probe result */}
      <div className="mt-4 rounded-md border border-[color:var(--signal-amber)]/30 bg-[color:var(--signal-amber)]/[0.06] px-4 py-3">
        <p className="text-[10px] font-mono uppercase tracking-wider text-[color:var(--signal-amber)]/80">
          Probe
        </p>
        <p className="mt-1 text-[14px] text-foreground/90">
          “Who handles login?”
          <span className="text-muted-foreground"> → </span>
          <span className="text-[color:var(--signal-amber)] font-medium">
            Sarah
          </span>
          <span className="text-muted-foreground"> · </span>
          <span className="text-[color:var(--signal-violet)] font-medium">
            auth service
          </span>
        </p>
      </div>
    </div>
  );
}

function Dot({
  x,
  y,
  color,
  size,
}: {
  x: string;
  y: string;
  color: string;
  size: number;
}) {
  return (
    <span
      className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        background: color,
        boxShadow: `0 0 8px ${color}`,
        opacity: 0.85,
      }}
    />
  );
}
