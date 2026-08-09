import React from 'react';
import { Clapperboard } from 'lucide-react';

// Stylized cinema-chair mascot mark — popcorn-cloud head with 3D glasses,
// sitting on a chair silhouette. Flat, two-tone (accent + cream), no
// background shape, so it blends straight into whatever sits behind it.
export function LogoMark({ className = 'w-11 h-11' }) {
  return (
    <svg viewBox="0 0 64 64" className={`${className} shrink-0`} xmlns="http://www.w3.org/2000/svg">
      {/* popcorn-cloud head */}
      <circle cx="22" cy="16" r="8" fill="var(--text-main)" stroke="var(--accent)" strokeWidth="2.5" />
      <circle cx="32" cy="10" r="9" fill="var(--text-main)" stroke="var(--accent)" strokeWidth="2.5" />
      <circle cx="42" cy="16" r="8" fill="var(--text-main)" stroke="var(--accent)" strokeWidth="2.5" />

      {/* face band */}
      <rect x="18" y="14" width="28" height="16" rx="5" fill="var(--text-main)" stroke="var(--accent)" strokeWidth="2.5" />

      {/* 3D glasses */}
      <rect x="21" y="19" width="9" height="7" rx="2" fill="var(--accent)" />
      <rect x="34" y="19" width="9" height="7" rx="2" fill="#9c4c31" />
      <line x1="30" y1="22.5" x2="34" y2="22.5" stroke="var(--accent)" strokeWidth="2" />

      {/* chair body */}
      <rect x="14" y="28" width="36" height="22" rx="6" fill="var(--text-main)" stroke="var(--accent)" strokeWidth="2.5" />

      {/* armrests */}
      <rect x="8" y="32" width="10" height="16" rx="5" fill="var(--text-main)" stroke="var(--accent)" strokeWidth="2.5" />
      <rect x="46" y="32" width="10" height="16" rx="5" fill="var(--text-main)" stroke="var(--accent)" strokeWidth="2.5" />

      {/* popcorn spilling on the seat */}
      <circle cx="27" cy="37" r="3.5" fill="var(--text-main)" stroke="var(--accent)" strokeWidth="1.75" />
      <circle cx="34" cy="36" r="4" fill="var(--text-main)" stroke="var(--accent)" strokeWidth="1.75" />
      <circle cx="30.5" cy="41" r="3" fill="var(--text-main)" stroke="var(--accent)" strokeWidth="1.75" />
    </svg>
  );
}

// Minimal flat placeholder shown when a series has no poster image set.
export function PosterPlaceholder({ title, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 bg-[var(--bg-subtle)] border border-[var(--border-soft)] text-center px-3 ${className}`}>
      <Clapperboard className="w-6 h-6 text-[var(--accent)]" strokeWidth={1.75} />
      <span className="text-[11px] font-semibold text-[var(--text-muted)] leading-snug line-clamp-3">
        {title}
      </span>
    </div>
  );
}
