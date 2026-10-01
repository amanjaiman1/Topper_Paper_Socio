"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Search, Sheet } from "lucide-react";
import { REPO_URL, sheetUrl } from "@/lib/dataset";
import Logo from "./Logo";

const LINKS = [
  ["Explore", "#explore"],
  ["Thinkers", "#thinkers"],
  ["Toppers", "#toppers"],
  ["About", "#about"],
] as const;

export default function Nav({ onSearch }: { onSearch: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-4 z-40 flex justify-center px-4 sm:top-6">
      <nav
        aria-label="Primary"
        className={`pointer-events-auto flex w-full max-w-4xl items-center gap-2 rounded-full border p-1.5 backdrop-blur-xl transition-all duration-500 ease-out-expo ${
          scrolled
            ? "border-black/10 bg-white/70 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.25)]"
            : "border-white/15 bg-white/10 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)]"
        }`}
      >
        <a href="#top" aria-label="Socio Top Paper — home" className="shrink-0">
          <Logo className="size-10" />
        </a>

        <ul className="mx-auto hidden items-center gap-1 md:flex">
          {LINKS.map(([label, href]) => (
            <li key={href}>
              <a
                href={href}
                className={`rounded-full px-4 py-2 text-[15px] font-medium transition-colors ${
                  scrolled ? "text-ink/70 hover:bg-black/5 hover:text-ink" : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
        <span className={`ml-1 font-display text-sm font-bold md:hidden ${scrolled ? "text-ink" : "text-white"}`}>
          Socio Top Paper
        </span>

        <div className="ml-auto flex items-center gap-1.5 md:ml-0">
          <button
            type="button"
            onClick={onSearch}
            aria-label="Search answers (press /)"
            title="Search  ( / )"
            className="grid size-10 place-items-center rounded-full bg-ink text-white transition-transform hover:scale-105 active:scale-95"
          >
            <Search className="size-[18px]" strokeWidth={2.2} />
          </button>
          <a
            href={sheetUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Open the source Google Sheet"
            title="Source sheet"
            className="hidden size-10 place-items-center rounded-full bg-ink text-white transition-transform hover:scale-105 active:scale-95 sm:grid"
          >
            <Sheet className="size-[18px]" strokeWidth={2.2} />
          </a>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="View source on GitHub"
            title="GitHub"
            className="grid size-10 place-items-center rounded-full bg-ink text-white transition-transform hover:scale-105 active:scale-95"
          >
            <ArrowUpRight className="size-[18px]" strokeWidth={2.2} />
          </a>
        </div>
      </nav>
    </header>
  );
}
