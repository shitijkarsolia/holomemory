import Link from "next/link";
import { SITE_AUTHOR, SITE_NAME } from "@/lib/seo";

const REPO_URL = "https://github.com/shitijkarsolia/holomemory";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-border/40 px-6 py-10">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
          <span className="font-serif text-[15px] tracking-tight text-foreground">
            {SITE_NAME}
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            © {year} {SITE_AUTHOR.name}
          </span>
        </div>

        <nav aria-label="Footer" className="flex items-center gap-5 text-[13px]">
          <Link
            href={REPO_URL}
            className="text-muted-foreground transition-colors hover:text-foreground"
            target="_blank"
            rel="noreferrer noopener"
          >
            Source
          </Link>
          <Link
            href={SITE_AUTHOR.url}
            className="text-muted-foreground transition-colors hover:text-foreground"
            target="_blank"
            rel="noreferrer noopener"
          >
            {SITE_AUTHOR.name}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
