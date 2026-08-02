import React from 'react';
import { Clapperboard } from 'lucide-react';

// Stylized flat popcorn bucket mark — the app's logo.
export function LogoMark({ className = 'w-11 h-11' }) {
  return (
    <svg viewBox="0 0 48 48" className={`${className} shrink-0`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="bucketClip">
          <polygon points="13,20 35,20 31,42 17,42" />
        </clipPath>
      </defs>
      {/* popcorn kernels */}
      <circle cx="17" cy="15" r="6" fill="var(--text-main)" stroke="var(--accent)" strokeWidth="1.5" />
      <circle cx="24" cy="11" r="7" fill="var(--text-main)" stroke="var(--accent)" strokeWidth="1.5" />
      <circle cx="31" cy="15" r="6" fill="var(--text-main)" stroke="var(--accent)" strokeWidth="1.5" />
      {/* bucket body */}
      <polygon points="13,20 35,20 31,42 17,42" fill="var(--accent)" />
      <g clipPath="url(#bucketClip)">
        <rect x="18.5" y="18" width="4" height="26" fill="var(--text-main)" />
        <rect x="27.5" y="18" width="4" height="26" fill="var(--text-main)" />
      </g>
      {/* rim */}
      <rect x="12" y="17.5" width="24" height="4" rx="2" fill="#c1613f" />
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
