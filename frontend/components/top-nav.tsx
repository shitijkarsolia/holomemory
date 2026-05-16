"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, Flask, HardDrives, Atom } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Playground", icon: Atom },
  { href: "/experiments", label: "Experiments", icon: Flask },
  { href: "/memories", label: "Memories", icon: HardDrives },
  { href: "/about", label: "About", icon: Brain },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 inset-x-0 z-40 h-12 border-b border-border/50 backdrop-blur-md bg-background/80">
      <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
            <Atom className="h-3.5 w-3.5 text-primary-foreground" weight="bold" />
          </div>
          <span className="text-sm font-semibold tracking-tight">HoloMem Lab</span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors duration-150",
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" weight={active ? "fill" : "regular"} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
