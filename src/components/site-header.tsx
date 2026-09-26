import type { SiteConfig } from "@/lib/config/site-config";

/**
 * All public page components render owner-supplied strings as plain React
 * children (react escapes them). We never set HTML from config content.
 */

export function SiteHeader({ config }: { config: SiteConfig }) {
  return (
    <header className="border-b border-line bg-background/80 backdrop-blur-md sticky top-0 z-40">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-4">
        <p className="font-display text-xl font-medium text-foreground">{config.siteName}</p>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
          <a href="#rooms" className="transition-colors hover:text-foreground">Rooms</a>
          <a href="#amenities" className="transition-colors hover:text-foreground">Amenities</a>
          <a href="#policies" className="transition-colors hover:text-foreground">Policies</a>
          <a
            href="#book"
            className="rounded-full border border-line px-4 py-1.5 text-foreground transition-colors hover:border-gold hover:text-gold"
          >
            Book
          </a>
        </nav>
      </div>
    </header>
  );
}
