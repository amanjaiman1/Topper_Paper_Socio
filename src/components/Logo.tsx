export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`relative grid place-items-center overflow-hidden rounded-full bg-gradient-to-br from-white to-neutral-300 shadow-[inset_0_-2px_6px_rgba(0,0,0,0.25)] ring-1 ring-black/10 ${className}`}
    >
      <svg viewBox="0 0 32 32" className="size-[62%]" aria-hidden>
        {/* stacked answer sheets */}
        <rect x="9" y="5" width="15" height="19" rx="3" fill="#0b0b0c" opacity="0.25" transform="rotate(8 16 16)" />
        <rect x="8" y="7" width="15" height="19" rx="3" fill="#0b0b0c" />
        <path d="M11.5 12h8M11.5 15.5h8M11.5 19h5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </span>
  );
}
