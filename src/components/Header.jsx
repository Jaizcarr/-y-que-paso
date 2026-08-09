import React from 'react';
import { Search, Home, Lock, Sparkles } from 'lucide-react';
import { LogoMark } from './Placeholders';

export default function Header({ currentView, selectedSeries, onNavigateHome, searchQuery, setSearchQuery, onOpenAdmin }) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-[var(--border-soft)]">
      <div className="cinema-curtain-top"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">

        {/* Top Left Logo & Name */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-3 group text-left transition-colors duration-200 focus:outline-none"
          title="Ir a la página principal"
        >
          <LogoMark className="w-11 h-11 group-hover:brightness-110 transition-all" />
          <div>
            <span className="font-baloo text-2xl font-extrabold tracking-tight text-[var(--text-main)]">
              Y QUÉ PASÓ?
            </span>
          </div>
        </button>

        {/* Global Search Bar */}
        {currentView !== 'home' && (
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar serie, personaje o actor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/20 text-sm text-gray-100 placeholder-gray-400 pl-10 pr-4 py-2.5 rounded-full border border-[var(--border-soft)] focus:outline-none focus:border-[var(--accent)]/60 font-opensans transition-all"
              />
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 font-opensans">
          {currentView !== 'home' && (
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/5 hover:bg-[var(--accent-soft)] border border-[var(--border-soft)] hover:border-[var(--accent)]/40 text-xs font-medium text-gray-200 hover:text-white transition-all"
            >
              <Home className="w-4 h-4 text-[var(--accent)]" />
              <span className="hidden sm:inline">Inicio</span>
            </button>
          )}

          {/* Admin Button */}
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--accent)] text-[#1e1d1b] text-xs font-bold shadow-md shadow-[var(--accent)]/20 hover:shadow-lg hover:shadow-[var(--accent)]/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            title="Abrir Panel Admin y Carga Masiva Excel/CSV"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Admin / Excel</span>
          </button>
        </div>

      </div>
    </header>
  );
}
