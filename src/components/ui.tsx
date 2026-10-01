import { ChevronDown } from "lucide-react";
import type { ReactNode, SelectHTMLAttributes } from "react";

export function Select({
  label,
  className = "",
  size = "md",
  children,
  ...props
}: Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & { label: string; size?: "sm" | "md"; children: ReactNode }) {
  const active = Boolean(props.value);
  return (
    <label className={`relative inline-flex ${className}`}>
      <span className="sr-only">{label}</span>
      <select
        {...props}
        className={`${size === "sm" ? "h-9 pl-3.5 pr-9 text-[13px]" : "h-11 pl-4 pr-10 text-[14px]"} w-full cursor-pointer appearance-none truncate rounded-full border font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent/40 ${
          active ? "border-ink bg-ink text-white" : "border-black/10 bg-white text-copy hover:border-black/25"
        }`}
      >
        {children}
      </select>
      <ChevronDown
        className={`pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 ${active ? "text-white/70" : "text-copy/40"}`}
      />
    </label>
  );
}

export function Toggle({
  on,
  onChange,
  children,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`inline-flex h-11 shrink-0 items-center gap-2.5 whitespace-nowrap rounded-full border px-4 text-[14px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
        on ? "border-ink bg-ink text-white" : "border-black/10 bg-white text-copy hover:border-black/25"
      }`}
    >
      <span
        className={`relative h-[18px] w-8 rounded-full transition-colors ${on ? "bg-white/25" : "bg-black/10"}`}
        aria-hidden
      >
        <span
          className={`absolute top-[2px] size-[14px] rounded-full transition-all duration-300 ease-out-expo ${
            on ? "left-[16px] bg-white" : "left-[2px] bg-white shadow"
          }`}
        />
      </span>
      {children}
    </button>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex h-11 shrink-0 rounded-full border border-black/10 bg-paper p-1">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={`whitespace-nowrap rounded-full px-4 text-[14px] font-medium transition-all duration-300 ease-out-expo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
              on ? "bg-ink text-white shadow-[0_6px_16px_-6px_rgba(0,0,0,0.5)]" : "text-copy/60 hover:text-copy"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Avatar({ name, className = "" }: { name: string; className?: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-ink-3 to-ink font-display font-bold text-white ring-1 ring-black/5 ${className}`}
    >
      {initials || "?"}
    </span>
  );
}
