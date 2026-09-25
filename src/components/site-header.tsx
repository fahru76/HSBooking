import type { SiteConfig } from "@/lib/config/site-config";

/**
 * All public page components render owner-supplied strings as plain React
 * children (react escapes them). We never set HTML from config content.
 */

export function SiteHeader({ config }: { config: SiteConfig }) {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
        <p className="text-xl font-semibold text-zinc-900">{config.siteName}</p>
        <nav className="flex gap-6 text-sm text-zinc-600">
          <a href="#rooms" className="hover:text-zinc-900">Rooms</a>
          <a href="#amenities" className="hover:text-zinc-900">Amenities</a>
          <a href="#policies" className="hover:text-zinc-900">Policies</a>
          <a href="#book" className="hover:text-zinc-900">Book</a>
        </nav>
      </div>
    </header>
  );
}
