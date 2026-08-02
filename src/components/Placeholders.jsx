import React from 'react';
import { Clapperboard } from 'lucide-react';

// Minimal flat logo mark used in place of the old popcorn photo.
export function LogoMark({ className = 'w-11 h-11', iconClassName = 'w-5 h-5' }) {
  return (
    <div className={`${className} rounded-xl bg-[var(--accent)] flex items-center justify-center shrink-0`}>
      <Clapperboard className={`${iconClassName} text-[#1e1d1b]`} strokeWidth={2.25} />
    </div>
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
