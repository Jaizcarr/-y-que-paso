import React, { useState, useMemo, useDeferredValue } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronLeft, Sparkles, MapPin, User, Calendar, Play, Info } from 'lucide-react';
import { PosterPlaceholder } from './Placeholders';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

export default function SeriesView({ series }) {
  useDocumentMeta({
    title: series.title,
    description: series.description || `Personajes y destino final de ${series.title}.`,
  });

  const [characterFilter, setCharacterFilter] = useState('');
  const [selectedHouse, setSelectedHouse] = useState('ALL');
  const deferredFilter = useDeferredValue(characterFilter);

  const houses = useMemo(
    () => ['ALL', ...new Set(series.characters.map(c => c.house))],
    [series.characters]
  );

  const filteredCharacters = useMemo(() => {
    const q = deferredFilter.toLowerCase();
    return series.characters.filter(c => {
      const matchesName = c.name.toLowerCase().includes(q) ||
                          (c.actor && c.actor.toLowerCase().includes(q)) ||
                          c.role.toLowerCase().includes(q);
      const matchesHouse = selectedHouse === 'ALL' || c.house === selectedHouse;
      return matchesName && matchesHouse;
    });
  }, [series.characters, deferredFilter, selectedHouse]);

  return (
    <div className="min-h-screen pb-16">
      {/* Series Hero Banner */}
      <div className="relative w-full h-72 sm:h-88 overflow-hidden border-b border-[var(--border-soft)]">
        {(series.backdrop || series.poster) ? (
          <img
            src={series.backdrop || series.poster}
            alt={series.title}
            className="w-full h-full object-cover object-center filter brightness-60 contrast-110"
          />
        ) : (
          <PosterPlaceholder title={series.title} className="w-full h-full" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-app)] via-[var(--bg-app)]/70 to-transparent"></div>

        {/* Back Button Overlay */}
        <div className="absolute top-6 left-4 sm:left-8 z-10">
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel hover:border-[var(--accent)]/40 text-xs sm:text-sm text-gray-200 hover:text-white transition-colors shadow-lg"
          >
            <ChevronLeft className="w-4 h-4 text-[var(--accent)]" />
            <span>Volver a Inicio</span>
          </Link>
        </div>

        {/* Hero Details */}
        <div className="absolute bottom-6 left-4 sm:left-8 right-4 max-w-5xl">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/30">
              {series.network}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-gray-200 border border-white/10">
              {series.genre}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-gray-300 border border-white/10">
              {series.seasons} Temporadas
            </span>
          </div>

          <h1 className="font-baloo text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
            {series.title}
          </h1>

          <p className="mt-1.5 text-xs sm:text-sm text-gray-300 max-w-2xl font-opensans line-clamp-2">
            {series.description}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold font-baloo text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[var(--accent)]" />
              Personajes de la Serie
            </h2>
            <p className="text-xs text-gray-400">
              Haz clic en cualquier carta de personaje para ver su mapa histórico con la burbuja final de su destino.
            </p>
          </div>

          {/* Search & House Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                aria-label="Buscar por personaje o actor"
                placeholder="Buscar por personaje o actor..."
                value={characterFilter}
                onChange={(e) => setCharacterFilter(e.target.value)}
                className="w-full bg-black/20 text-xs text-gray-200 placeholder-gray-400 pl-9 pr-3 py-2 rounded-full border border-[var(--border-soft)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {houses.slice(0, 4).map(h => (
                <button
                  key={h}
                  onClick={() => setSelectedHouse(h)}
                  aria-pressed={selectedHouse === h}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedHouse === h
                      ? 'bg-[var(--accent)] text-[#1e1d1b]'
                      : 'bg-white/5 text-gray-300 hover:text-white border border-[var(--border-soft)]'
                  }`}
                >
                  {h === 'ALL' ? 'Todos' : h}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Character Presentation Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCharacters.map((character) => (
            <Link
              key={character.id}
              to={`/${series.id}/${character.id}`}
              aria-label={`Ver mapa de destino de ${character.name}`}
              className="group relative rounded-2xl glass-panel glass-panel-hover p-5 flex flex-col text-left overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-app)]"
            >
              {/* Avatar Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-1 bg-[var(--bg-subtle)] shrink-0">
                  <img
                    src={character.avatar}
                    alt={character.name}
                    loading="lazy"
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-[var(--accent)] text-[#1e1d1b] rounded-full p-1 shadow">
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold tracking-wider text-[var(--accent)] uppercase block mb-0.5 truncate">
                    {character.house}
                  </span>
                  <h3 className="font-baloo text-lg font-bold text-white truncate transition-colors">
                    {character.name}
                  </h3>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {character.role}
                  </p>
                </div>
              </div>

              {/* Carta de Presentación Mínima: Zona, Edad, Actor */}
              <div className="grid grid-cols-3 gap-2 mb-4 p-3 rounded-xl bg-black/20 border border-[var(--border-soft)] text-center">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-gray-400 flex items-center gap-1 font-semibold uppercase">
                    <MapPin className="w-3 h-3 text-[var(--accent)]" /> Zona
                  </span>
                  <span className="text-xs text-gray-200 font-bold mt-1 line-clamp-1">
                    {character.zona || 'Desconocida'}
                  </span>
                </div>

                <div className="flex flex-col items-center border-x border-[var(--border-soft)] px-1">
                  <span className="text-[10px] text-gray-400 flex items-center gap-1 font-semibold uppercase">
                    <Calendar className="w-3 h-3 text-[var(--accent)]" /> Edad del Actor
                  </span>
                  <span className="text-xs text-gray-200 font-bold mt-1 line-clamp-1">
                    {character.edad || 'N/A'}
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-gray-400 flex items-center gap-1 font-semibold uppercase">
                    <User className="w-3 h-3 text-[var(--accent)]" /> Actor
                  </span>
                  <span className="text-xs text-gray-200 font-bold mt-1 line-clamp-1">
                    {character.actor || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Quote & Summary */}
              {character.quote && (
                <div className="mb-3 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[11px] text-gray-300 italic truncate">
                  "{character.quote}"
                </div>
              )}

              {/* Action Strip */}
              <div className="mt-auto pt-3 border-t border-[var(--border-soft)] flex items-center justify-between">
                <span className="text-[11px] text-gray-400">
                  {character.events.length} Eventos Canónicos
                </span>
                <span className="text-xs font-bold text-[var(--accent)] flex items-center gap-1">
                  Ver Mapa de Destino <ChevronLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {filteredCharacters.length === 0 && (
          <div className="text-center py-16 glass-panel rounded-2xl">
            <Info className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-300 font-medium">No se encontraron personajes que coincidan.</p>
          </div>
        )}

      </div>
    </div>
  );
}
