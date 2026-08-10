import React, { useState, useEffect, Suspense, lazy } from 'react';
import Header from './components/Header';
import HomeView from './components/HomeView';
import SeriesView from './components/SeriesView';
import TimelineMapModal from './components/TimelineMapModal';
import SuggestionBox from './components/SuggestionBox';
import { LogoMark } from './components/Placeholders';
import { fetchSeriesDatabase, syncSeriesDatabase } from './services/db';

// Loaded on demand: the Admin panel drags in the xlsx parsing library and is
// only ever opened by an admin, so regular visitors shouldn't pay for it.
const AdminPanel = lazy(() => import('./components/AdminPanel'));

function AdminPanelFallback() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
        <LogoMark className="w-12 h-12 animate-pulse" />
        <p className="text-sm">Cargando panel de administración...</p>
      </div>
    </div>
  );
}

export default function App() {
  const [seriesDatabase, setSeriesDatabase] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'series'
  const [selectedSeriesId, setSelectedSeriesId] = useState('juego-de-tronos');
  const [selectedCharacterId, setSelectedCharacterId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  useEffect(() => {
    fetchSeriesDatabase()
      .then(data => setSeriesDatabase(data))
      .catch(err => setLoadError(err.message || 'Error al cargar la base de datos.'))
      .finally(() => setIsLoading(false));
  }, []);

  const currentSeries = seriesDatabase.find(s => s.id === selectedSeriesId) || seriesDatabase[0];
  const selectedCharacter = currentSeries?.characters.find(c => c.id === selectedCharacterId);

  const handleNavigateHome = () => {
    setCurrentView('home');
    setSelectedCharacterId(null);
    setSearchQuery('');
  };

  const handleSelectSeries = (seriesId) => {
    setSelectedSeriesId(seriesId);
    setCurrentView('series');
    setSelectedCharacterId(null);
    setSearchQuery('');
  };

  const handleSelectCharacter = (seriesId, characterId) => {
    setSelectedSeriesId(seriesId);
    setCurrentView('series');
    setSelectedCharacterId(characterId);
  };

  const handleSaveAdminData = async (newData) => {
    setSeriesDatabase(newData); // optimistic UI update
    await syncSeriesDatabase(newData); // persist to the shared database
  };

  const buildTimestamp = new Date(__BUILD_TIME__).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-gray-100 flex flex-col font-opensans selection:bg-[var(--accent)] selection:text-white">
      {/* Header */}
      <Header
        currentView={currentView}
        selectedSeries={currentSeries}
        onNavigateHome={handleNavigateHome}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1">
        {isLoading ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-[var(--text-muted)]">
            <LogoMark className="w-16 h-16 animate-pulse" />
            <p className="text-sm">Cargando la wiki...</p>
          </div>
        ) : loadError ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center px-4">
            <p className="text-sm text-red-300 font-semibold">No se pudo cargar la base de datos</p>
            <p className="text-xs text-[var(--text-muted)] max-w-md">{loadError}</p>
          </div>
        ) : currentView === 'home' ? (
          <HomeView
            seriesList={seriesDatabase}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelectSeries={handleSelectSeries}
            onSelectCharacter={handleSelectCharacter}
          />
        ) : (
          <SeriesView
            series={currentSeries}
            onBackHome={handleNavigateHome}
            onSelectCharacter={(sId, cId) => setSelectedCharacterId(cId)}
          />
        )}
      </main>

      {/* Timeline Map Modal */}
      {selectedCharacter && (
        <TimelineMapModal
          character={selectedCharacter}
          seriesTitle={currentSeries.title}
          onClose={() => setSelectedCharacterId(null)}
        />
      )}

      {/* Admin Editing Platform Modal */}
      {isAdminOpen && (
        <Suspense fallback={<AdminPanelFallback />}>
          <AdminPanel
            seriesData={seriesDatabase}
            onSaveData={handleSaveAdminData}
            onClose={() => setIsAdminOpen(false)}
          />
        </Suspense>
      )}

      {/* Floating public suggestions widget */}
      <SuggestionBox />

      {/* Footer */}
      <footer className="border-t border-[var(--border-soft)] py-6 bg-[var(--bg-card)] text-center text-xs text-[var(--text-muted)]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center gap-1">
          <div className="flex items-center gap-2">
            <LogoMark className="w-6 h-6" />
            <span className="font-baloo font-bold text-gray-200">Y QUÉ PASÓ?</span>
            <span>• Wiki Cinéfila & Admin Platform</span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)]/70">
            Versión: {buildTimestamp}
          </span>
        </div>
      </footer>
    </div>
  );
}
