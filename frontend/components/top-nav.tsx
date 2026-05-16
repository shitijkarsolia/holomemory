"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Atom } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/playground", label: "Playground" },
  { href: "/about", label: "About" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 inset-x-0 z-40 h-12 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
            <Atom className="h-3.5 w-3.5 text-primary-foreground" weight="bold" />
          </div>
          <span className="font-serif text-[15px] font-semibold tracking-tight text-foreground">
            HoloMem
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors duration-150",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
                {active && (
                  <span className="pointer-events-none absolute inset-x-2 -bottom-px h-px bg-[color:var(--signal-amber)]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
