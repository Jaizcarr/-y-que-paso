import React from 'react';
import { Search, Tv, ArrowRight, Sparkles } from 'lucide-react';
import { LogoMark, PosterPlaceholder } from './Placeholders';

export default function HomeView({ seriesList, searchQuery, setSearchQuery, onSelectSeries, onSelectCharacter }) {
  const filteredSeries = seriesList.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.originalTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const matchedCharacters = [];
  if (searchQuery.trim().length > 0) {
    seriesList.forEach(s => {
      s.characters.forEach(c => {
        if (c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (c.actor && c.actor.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (c.zona && c.zona.toLowerCase().includes(searchQuery.toLowerCase())) ||
            c.house.toLowerCase().includes(searchQuery.toLowerCase())) {
          matchedCharacters.push({ ...c, seriesId: s.id, seriesTitle: s.title });
        }
      });
    });
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-start px-4 py-8 sm:py-12 max-w-6xl mx-auto text-center font-opensans">
      
      {/* Logo & Title */}
      <div className="mb-8 cursor-pointer" onClick={() => setSearchQuery('')}>
        <LogoMark className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-5" />

        <h1 className="font-baloo text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[var(--text-main)]">
          Y QUÉ PASÓ?
        </h1>

        <p className="mt-2 text-sm sm:text-base text-[var(--text-muted)] font-opensans max-w-xl mx-auto leading-relaxed">
          Wiki de cinefilia interactiva. Navega por mapas interactivos en 2D para conocer el destino canónico de tus personajes.
        </p>
      </div>

      {/* Clean & Minimalist Search Bar */}
      <div className="w-full max-w-2xl mb-12 relative">
        <div className="relative glass-panel rounded-full p-2 focus-within:border-[var(--accent)]/70 transition-colors">
          <div className="flex items-center">
            <Search className="w-5 h-5 ml-3.5 text-[var(--accent)]" />
            <input
              type="text"
              placeholder="Busca serie, personaje, actor o zona (ej: Juego de Tronos, Jon Nieve, Kit Harington)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent px-4 py-2.5 text-sm sm:text-base text-gray-100 placeholder-gray-400 focus:outline-none font-opensans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-3 text-xs text-gray-400 hover:text-white"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Live Search Dropdown */}
        {searchQuery.trim().length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-3 glass-panel rounded-2xl p-4 shadow-lg z-50 text-left max-h-96 overflow-y-auto">
            {filteredSeries.length > 0 && (
              <div className="mb-4">
                <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider block mb-2 px-2">Series encontradas</span>
                <div className="space-y-1.5">
                  {filteredSeries.map(s => (
                    <button
                      key={s.id}
                      onClick={() => onSelectSeries(s.id)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors text-left group"
                    >
                      <div className="flex items-center gap-3">
                        {s.poster ? (
                          <img src={s.poster} alt={s.title} className="w-9 h-11 object-cover rounded-md border border-[var(--border-soft)]" />
                        ) : (
                          <PosterPlaceholder title={s.title} className="w-9 h-11 rounded-md" />
                        )}
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-[var(--accent)] font-baloo">{s.title}</p>
                          <p className="text-xs text-gray-400 font-opensans">{s.genre} • {s.seasons} temporadas</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[var(--accent)] transition-transform group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {matchedCharacters.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider block mb-2 px-2">Personajes encontrados</span>
                <div className="space-y-1.5">
                  {matchedCharacters.map(c => (
                    <button
                      key={c.id}
                      onClick={() => onSelectCharacter(c.seriesId, c.id)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <img src={c.avatar} alt={c.name} className="w-9 h-9 object-cover rounded-full border border-[var(--border-soft)]" />
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-[var(--accent)] font-baloo">{c.name}</p>
                          <p className="text-xs text-gray-400 font-opensans">Actor: {c.actor || 'N/A'} • <span className="text-[var(--text-muted)]">{c.seriesTitle}</span></p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">Ver Mapa</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Series Grid */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-6 border-b border-[var(--border-soft)] pb-3">
          <div className="flex items-center gap-2">
            <Tv className="w-5 h-5 text-[var(--accent)]" />
            <h2 className="text-2xl font-bold font-baloo text-white tracking-wide">
              Catálogo de Series
            </h2>
          </div>
          <span className="text-xs text-gray-300 bg-white/5 px-3 py-1 rounded-full border border-[var(--border-soft)] font-opensans">
            {seriesList.length} disponibles
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {seriesList.map((series) => (
            <button
              key={series.id}
              onClick={() => onSelectSeries(series.id)}
              className="group relative rounded-2xl glass-panel glass-panel-hover p-4 flex flex-col text-left overflow-hidden focus:outline-none"
            >
              <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden mb-3 bg-black/20 border border-[var(--border-soft)] transition-colors">
                {series.poster ? (
                  <img
                    src={series.poster}
                    alt={series.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <PosterPlaceholder title={series.title} className="w-full h-full" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>

                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/70 text-[var(--accent)] border border-[var(--accent)]/30">
                    {series.network}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/70 text-gray-200 border border-white/15">
                    {series.seasons} Temporadas
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="font-baloo text-2xl font-bold text-white transition-colors leading-tight">
                    {series.title}
                  </h3>
                  <p className="text-xs text-gray-300 line-clamp-1 italic mt-0.5 font-opensans">
                    "{series.tagline}"
                  </p>
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between pt-2 border-t border-[var(--border-soft)] text-xs font-opensans">
                <span className="text-gray-400 group-hover:text-gray-200">
                  {series.characters.length} personajes
                </span>
                <span className="flex items-center gap-1 font-semibold text-[var(--accent)]">
                  Explorar Wiki <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
