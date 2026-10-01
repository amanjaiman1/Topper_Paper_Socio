/** Crimson badge in the spirit of the lorolabs.ai mark, with stacked answer sheets. */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-[#f0405f] to-accent shadow-[inset_0_-2px_6px_rgba(0,0,0,0.25)] ring-1 ring-white/15 ${className}`}
    >
      <svg viewBox="0 0 32 32" className="size-[60%]" aria-hidden>
        <rect x="9" y="5" width="15" height="19" rx="3" fill="#fff" opacity="0.35" transform="rotate(8 16 16)" />
        <rect x="8" y="7" width="15" height="19" rx="3" fill="#fff" />
        <path d="M11.5 12h8M11.5 15.5h8M11.5 19h5" stroke="#da1b3e" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </span>
  );
}
