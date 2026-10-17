import Link from "next/link";

const navItems = [
  { href: "/search", label: "Search" },
  { href: "/saved", label: "Saved trips" },
  { href: "/about", label: "About" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md text-foreground"
          aria-label="RouteWise home"
        >
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-semibold text-white"
            aria-hidden
          >
            RW
          </span>
          <span className="text-base font-semibold tracking-tight">
            RouteWise
          </span>
        </Link>
        <nav aria-label="Primary">
          <ul className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-background hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
