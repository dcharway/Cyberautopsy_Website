export function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden focusable="false">
      <defs>
        <linearGradient id="portal-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F2E6B5" />
          <stop offset="55%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#8C6E1F" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="none" stroke="url(#portal-gold)" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="24" fill="none" stroke="url(#portal-gold)" strokeWidth="0.6" opacity="0.4" />
      <path
        d="M32 14 L46 20 V32 C46 41 39 47 32 50 C25 47 18 41 18 32 V20 Z"
        fill="none"
        stroke="url(#portal-gold)"
        strokeWidth="1.4"
      />
      <line x1="22" y1="44" x2="44" y2="22" stroke="url(#portal-gold)" strokeWidth="1.2" />
      <circle cx="22" cy="44" r="1.6" fill="url(#portal-gold)" />
    </svg>
  );
}
