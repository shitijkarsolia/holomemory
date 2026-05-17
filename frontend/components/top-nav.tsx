"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Atom } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/playground", label: "Playground" },
  { href: "/about", label: "About" },
];

export function TopNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="fixed top-0 inset-x-0 z-40 h-16 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <Atom className="h-[18px] w-[18px] text-primary-foreground" weight="bold" />
          </div>
          <span className="font-serif text-[18px] font-semibold tracking-tight text-foreground">
            HoloMem
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative rounded-md px-3.5 py-2 text-[14px] font-medium transition-colors duration-150",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
                {active && (
                  <span className="pointer-events-none absolute inset-x-2.5 -bottom-px h-px bg-[color:var(--signal-amber)]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
