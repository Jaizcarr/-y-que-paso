import React, { useState, useRef } from 'react';
import { X, ZoomIn, ZoomOut, Maximize2, Sparkles, AlertCircle, PlayCircle, Crown, Move, ChevronRight, ChevronLeft } from 'lucide-react';

export default function TimelineMapModal({ character, seriesTitle, onClose }) {
  const [selectedEventIndex, setSelectedEventIndex] = useState(0);

  // Canvas pan & zoom state (Google Maps style)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);

  if (!character || !character.events || character.events.length === 0) return null;

  const currentEvent = character.events[selectedEventIndex] || character.events[0];
  const lastIndex = character.events.length - 1;

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.6));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom(prev => Math.min(prev + 0.1, 2.5));
    } else {
      setZoom(prev => Math.max(prev - 0.1, 0.6));
    }
  };

  // Pan / Drag handlers (Google Maps behavior)
  const handleMouseDown = (e) => {
    // Only drag if clicking on the canvas backdrop, not on interactive nodes
    if (e.target.closest('.interactive-node')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 overflow-y-auto font-opensans">
      <div className="relative w-full max-w-6xl glass-panel rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">

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
                <h2 className="font-baloo text-xl sm:text-2xl font-bold text-white leading-none">
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
            className="p-2 rounded-full bg-white/5 hover:bg-[var(--accent-soft)] text-gray-300 hover:text-white transition-colors"
            title="Cerrar Mapa"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Split Layout: Google Maps Canvas + Event Card */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-soft)]">

          {/* LEFT / CANVAS SECTION: Google Maps-style Interactive Spatial Map */}
          <div className="w-full lg:w-3/5 relative h-[380px] lg:h-auto bg-[var(--bg-app)] overflow-hidden flex flex-col select-none">

            {/* Google Maps Top Overlay Bar */}
            <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
              <div className="bg-black/60 px-3 py-1.5 rounded-full text-xs text-gray-300 font-medium flex items-center gap-1.5 pointer-events-auto">
                <Move className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Mapa Interactivo (Arrastra y usa el Zoom)</span>
              </div>

              {/* Map Controls (+ / - / Reset) */}
              <div className="flex items-center gap-1 bg-black/60 p-1 rounded-full pointer-events-auto">
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                  title="Acercar (Zoom In)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                  title="Alejar (Zoom Out)"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={handleResetView}
                  className="p-1.5 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors text-[10px] font-bold px-2"
                  title="Restablecer Vista"
                >
                  100%
                </button>
              </div>
            </div>

            {/* Draggable & Zoomable Map Canvas Area */}
            <div
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              className={`w-full h-full relative flex items-center justify-center ${
                isDragging ? 'canvas-grabbing' : 'canvas-grab'
              }`}
            >
              {/* Minimal Dot Grid Background */}
              <div
                className="absolute inset-0 opacity-40 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(rgba(245, 242, 235, 0.14) 1px, transparent 1px)`,
                  backgroundSize: '28px 28px',
                  transform: `translate(${pan.x % 28}px, ${pan.y % 28}px) scale(${zoom})`
                }}
              />

              {/* Transformable Canvas Group */}
              <div
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transition: isDragging ? 'none' : 'transform 0.15s cubic-bezier(0,0,0.2,1)'
                }}
                className="relative flex items-center gap-12 sm:gap-16 py-12 px-16 min-w-max"
              >
                {/* Connecting Track Line */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  <line
                    x1="10%"
                    y1="50%"
                    x2="90%"
                    y2="50%"
                    stroke="var(--accent)"
                    strokeWidth="2"
                    strokeDasharray="5 7"
                    className="opacity-40"
                  />
                </svg>

                {/* Spatial Map Bubble Nodes */}
                {character.events.map((event, idx) => {
                  const isSelected = idx === selectedEventIndex;
                  const isFinal = idx === lastIndex;

                  return (
                    <div
                      key={event.id || idx}
                      onClick={() => setSelectedEventIndex(idx)}
                      className="interactive-node relative flex flex-col items-center cursor-pointer group z-10"
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
                            : 'w-12 h-12 sm:w-14 sm:h-14 bg-black/60 border-2 border-[var(--border-soft)] hover:border-[var(--accent)]/70'
                      }`}>
                        <img
                          src={event.image}
                          alt={event.title}
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
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Quick Jump Button */}
            <div className="p-3 bg-black/30 border-t border-[var(--border-soft)] flex items-center justify-between z-20">
              <button
                onClick={() => setSelectedEventIndex(lastIndex)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--accent-soft)] hover:brightness-110 text-[var(--accent)] text-xs font-semibold transition-all"
              >
                <Crown className="w-4 h-4" />
                <span>Ver Burbuja Final de Destino</span>
              </button>

              {/* Prev / Next buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedEventIndex(Math.max(0, selectedEventIndex - 1))}
                  disabled={selectedEventIndex === 0}
                  className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-xs text-gray-300 disabled:opacity-30"
                >
                  Anterior
                </button>
                <span className="text-xs text-gray-400 font-bold">{selectedEventIndex + 1}/{character.events.length}</span>
                <button
                  onClick={() => setSelectedEventIndex(Math.min(lastIndex, selectedEventIndex + 1))}
                  disabled={selectedEventIndex === lastIndex}
                  className="px-3 py-1 rounded-full bg-[var(--accent-soft)] hover:brightness-110 text-[var(--accent)] text-xs font-semibold disabled:opacity-30"
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
                <h3 className="font-baloo text-xl font-bold text-white drop-shadow">
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
