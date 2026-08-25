export function CupLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M7 12h14a1 1 0 0 1 1 1v7c0 3.3-2.7 6-6 6h-4c-3.3 0-6-2.7-6-6v-7a1 1 0 0 1 1-1zm16 2h2.2c1.5 0 2.8 1.3 2.8 2.8S26.7 20 25.2 20H23"
        className="text-primary"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        d="M11 11c0-2 1.2-3 2.4-3M16 10c.2-2 1.5-3.2 3-3.2"
        className="text-fg"
      />
      <rect x="10" y="27" width="12" height="2" rx="1" className="fill-muted" />
    </svg>
  );
}
