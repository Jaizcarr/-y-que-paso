import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Home, Lock } from 'lucide-react';
import { LogoMark } from './Placeholders';

export default function Header({ currentView, searchQuery, setSearchQuery, onOpenAdmin }) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-[var(--border-soft)]">
      <div className="cinema-curtain-top"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">

        {/* Top Left Logo & Name */}
        <Link
          to="/"
          onClick={() => setSearchQuery('')}
          className="flex items-center gap-3 group text-left transition-colors duration-200 focus:outline-none"
          title="Ir a la página principal"
        >
          <LogoMark className="w-9 h-9 sm:w-11 sm:h-11 shrink-0 group-hover:brightness-110 transition-all" />
          <div>
            <span className="font-baloo text-base sm:text-2xl font-extrabold tracking-tight text-[var(--text-main)] whitespace-nowrap">
              Y QUÉ PASÓ?
            </span>
          </div>
        </Link>

        {/* Global Search Bar */}
        {currentView !== 'home' && (
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                aria-label="Buscar serie, personaje o actor"
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
            <Link
              to="/"
              onClick={() => setSearchQuery('')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/5 hover:bg-[var(--accent-soft)] border border-[var(--border-soft)] hover:border-[var(--accent)]/40 text-xs font-medium text-gray-200 hover:text-white transition-all"
            >
              <Home className="w-4 h-4 text-[var(--accent)]" />
              <span className="hidden sm:inline">Inicio</span>
            </Link>
          )}

          {/* Admin Button */}
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full bg-[var(--accent)] text-[#1e1d1b] text-xs font-bold whitespace-nowrap shadow-md shadow-[var(--accent)]/20 hover:shadow-lg hover:shadow-[var(--accent)]/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            title="Abrir Panel Admin y Carga Masiva Excel/CSV"
          >
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Admin / Excel</span>
            <span className="sm:hidden">Admin</span>
          </button>
        </div>

      </div>
    </header>
  );
}
