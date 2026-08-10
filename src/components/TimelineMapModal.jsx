import React, { useState, useRef, useEffect } from 'react';
import { X, AlertCircle, PlayCircle, Crown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useModalA11y } from '../hooks/useModalA11y';

export default function TimelineMapModal({ character, seriesTitle, onClose }) {
  const [selectedEventIndex, setSelectedEventIndex] = useState(0);

  const panelRef = useRef(null);
  const trackRef = useRef(null);
  const nodeRefs = useRef([]);
  const pendingFocusRef = useRef(false);

  useModalA11y(panelRef, onClose);

  if (!character || !character.events || character.events.length === 0) return null;

  const currentEvent = character.events[selectedEventIndex] || character.events[0];
  const lastIndex = character.events.length - 1;

  // Moves selection, optionally moving keyboard focus along with it (for
  // arrow-key navigation between nodes).
  const goTo = (idx, { focus = false } = {}) => {
    const clamped = Math.max(0, Math.min(lastIndex, idx));
    pendingFocusRef.current = focus;
    setSelectedEventIndex(clamped);
  };

  // Keeps the selected bubble scrolled into view (and focused, if the change
  // came from the keyboard) after any navigation — click, arrow key, or the
  // Anterior/Siguiente buttons.
  useEffect(() => {
    const node = nodeRefs.current[selectedEventIndex];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    node?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
    if (pendingFocusRef.current) {
      pendingFocusRef.current = false;
      node?.focus();
    }
  }, [selectedEventIndex]);

  // Global arrow-key navigation: works as soon as the map is open, no need
  // to click/tab into a bubble first. Ignored while typing in a form field.
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goTo(selectedEventIndex + 1, { focus: true });
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goTo(selectedEventIndex - 1, { focus: true });
      } else if (e.key === 'Home') {
        e.preventDefault();
        goTo(0, { focus: true });
      } else if (e.key === 'End') {
        e.preventDefault();
        goTo(lastIndex, { focus: true });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEventIndex, lastIndex]);

  // Lets a plain vertical mouse wheel pan the strip horizontally, while
  // leaving native horizontal input (trackpad, shift+wheel) untouched.
  const handleWheel = (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      e.currentTarget.scrollLeft += e.deltaY;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 overflow-y-auto font-opensans">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="map-modal-title"
        className="relative w-full max-w-6xl glass-panel rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
      >

        {/* Top Header Bar */}
        <div className="p-4 border-b border-[var(--border-soft)] flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-3">
            <img
              src={character.avatar}
              alt={character.name}
              className="w-11 h-11 rounded-full object-cover border-2 border-[var(--accent)]/60"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 id="map-modal-title" className="font-baloo text-xl sm:text-2xl font-bold text-white leading-none">
                  {character.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--accent-soft)] text-[var(--accent)]">
                  {seriesTitle}
                </span>
              </div>
              <p className="text-xs text-gray-300 font-opensans mt-1">
                {character.actor && <span>Actor: {character.actor} • </span>}
                <span className="text-emerald-300 font-semibold">{character.status}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-[var(--accent-soft)] text-gray-300 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            title="Cerrar Mapa"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Split Layout: Horizontal Event Strip + Event Card */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-soft)]">

          {/* LEFT SECTION: Horizontally Scrollable Event Strip */}
          <div className="w-full lg:w-3/5 shrink-0 relative h-[380px] lg:h-auto bg-[var(--bg-app)] overflow-hidden flex flex-col">

            {/* Edge fade hints: signal there's more content off-screen */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-10 z-10 bg-gradient-to-r from-[var(--bg-app)] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 z-10 bg-gradient-to-l from-[var(--bg-app)] to-transparent" />

            {/* Carousel arrow controls */}
            <button
              onClick={() => goTo(selectedEventIndex - 1)}
              disabled={selectedEventIndex === 0}
              aria-label="Evento anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/60 hover:bg-black/80 text-gray-200 hover:text-white disabled:opacity-0 disabled:pointer-events-none transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => goTo(selectedEventIndex + 1)}
              disabled={selectedEventIndex === lastIndex}
              aria-label="Evento siguiente"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/60 hover:bg-black/80 text-gray-200 hover:text-white disabled:opacity-0 disabled:pointer-events-none transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Native scroll-snap strip: works with touch, trackpad, wheel and keyboard for free */}
            <div
              ref={trackRef}
              onWheel={handleWheel}
              className="w-full h-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth flex items-center"
            >
              <div className="relative flex items-center gap-12 sm:gap-16 pt-14 pb-10 px-16 min-w-max">
                {/* Connecting Track Line */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  <line
                    x1="0"
                    y1="50%"
                    x2="100%"
                    y2="50%"
                    stroke="var(--accent)"
                    strokeWidth="2"
                    strokeDasharray="5 7"
                    className="opacity-40"
                  />
                </svg>

                {/* Event Bubble Nodes */}
                {character.events.map((event, idx) => {
                  const isSelected = idx === selectedEventIndex;
                  const isFinal = idx === lastIndex;

                  return (
                    <button
                      key={event.id || idx}
                      type="button"
                      ref={(el) => (nodeRefs.current[idx] = el)}
                      onClick={() => goTo(idx)}
                      aria-current={isSelected ? 'true' : undefined}
                      aria-label={`Evento ${idx + 1} de ${character.events.length}: ${event.title}${isFinal ? ' (Destino final)' : ''}`}
                      className="snap-center shrink-0 relative flex flex-col items-center group z-10 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-app)]"
                    >
                      {/* Final Destiny Header */}
                      {isFinal && (
                        <div className="absolute -top-9 text-[10px] font-bold text-[var(--accent)] bg-[var(--accent-soft)] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                          <Crown className="w-3.5 h-3.5" /> DESTINO FINAL
                        </div>
                      )}

                      {/* Event Node Circle - Final Event Bubble is bigger */}
                      <div className={`relative transition-all duration-300 rounded-full p-1 ${
                        isFinal
                          ? isSelected
                            ? 'w-24 h-24 sm:w-28 sm:h-28 scale-110 bg-[var(--accent)]'
                            : 'w-20 h-20 sm:w-22 sm:h-22 bg-[var(--accent)]/70 border-2 border-[var(--accent)]'
                          : isSelected
                            ? 'w-16 h-16 sm:w-18 sm:h-18 scale-110 bg-[var(--accent)]'
                            : 'w-12 h-12 sm:w-14 sm:h-14 bg-black/60 border-2 border-[var(--border-soft)] group-hover:border-[var(--accent)]/70'
                      }`}>
                        <img
                          src={event.image}
                          alt=""
                          loading="lazy"
                          className="w-full h-full object-cover rounded-full filter brightness-90 group-hover:brightness-100"
                        />

                        {/* Season badge */}
                        <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[var(--accent)] text-[#1e1d1b] font-opensans">
                          T{event.season}
                        </div>
                      </div>

                      {/* Label under node */}
                      <div className="mt-3 text-center max-w-[110px]">
                        <span className={`text-xs font-semibold block leading-snug ${
                          isSelected ? 'text-[var(--accent)] font-bold' : isFinal ? 'text-[var(--accent)] font-bold' : 'text-gray-300 group-hover:text-white'
                        }`}>
                          {isFinal ? `🏁 ${event.title}` : event.title}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Quick Jump Bar */}
            <div className="p-3 bg-black/30 border-t border-[var(--border-soft)] flex items-center justify-between z-20">
              <button
                onClick={() => goTo(lastIndex)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--accent-soft)] hover:brightness-110 text-[var(--accent)] text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              >
                <Crown className="w-4 h-4" />
                <span>Ver Burbuja Final de Destino</span>
              </button>

              {/* Prev / Next buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goTo(selectedEventIndex - 1)}
                  disabled={selectedEventIndex === 0}
                  className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-xs text-gray-300 disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                >
                  Anterior
                </button>
                <span className="text-xs text-gray-400 font-bold" aria-hidden="true">{selectedEventIndex + 1}/{character.events.length}</span>
                <button
                  onClick={() => goTo(selectedEventIndex + 1)}
                  disabled={selectedEventIndex === lastIndex}
                  className="px-3 py-1 rounded-full bg-[var(--accent-soft)] hover:brightness-110 text-[var(--accent)] text-xs font-semibold disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                >
                  Siguiente
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT SECTION: Detailed Canonical Event Card */}
          <div className="w-full lg:w-2/5 p-5 flex flex-col justify-between overflow-y-auto bg-black/20">

            {/* Event Image */}
            <div className="relative rounded-2xl overflow-hidden mb-4 aspect-video border border-[var(--border-soft)]">
              <img
                src={currentEvent.image}
                alt={currentEvent.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>

              <div className="absolute top-3 left-3 flex gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--accent)] text-[#1e1d1b] font-opensans">
                  {currentEvent.episode}
                </span>
                {selectedEventIndex === lastIndex && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/70 text-[var(--accent)] flex items-center gap-1 font-opensans">
                    <Crown className="w-3.5 h-3.5" /> DESTINO FINAL
                  </span>
                )}
              </div>

              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="font-baloo text-xl font-bold text-white drop-shadow" aria-live="polite" aria-atomic="true">
                  {currentEvent.title}
                </h3>
              </div>
            </div>

            {/* Event Explanation Content */}
            <div className="space-y-3.5 flex-1">

              <div className="p-3 rounded-xl bg-[var(--accent-soft)] text-xs text-[var(--text-main)] font-opensans">
                <strong className="text-[var(--accent)] font-bold block mb-0.5">Resumen del Evento:</strong>
                {currentEvent.summary}
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-[var(--border-soft)]">
                <h4 className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider mb-1.5 flex items-center gap-1.5 font-opensans">
                  <PlayCircle className="w-4 h-4" />
                  {selectedEventIndex === lastIndex ? "CÓMO ACABA EL PERSONAJE?" : "Y QUÉ PASÓ REALMENTE?"}
                </h4>
                <p className="text-xs sm:text-sm text-gray-200 font-opensans leading-relaxed">
                  {currentEvent.details}
                </p>
              </div>

              {currentEvent.impact && (
                <div className="p-3 rounded-xl bg-white/5 border border-[var(--border-soft)] text-xs text-gray-300 flex items-start gap-2 font-opensans">
                  <AlertCircle className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[var(--text-main)] block mb-0.5">Impacto Canónico:</span>
                    {currentEvent.impact}
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
