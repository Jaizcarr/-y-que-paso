import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import HomeView from './components/HomeView';
import SeriesView from './components/SeriesView';
import TimelineMapModal from './components/TimelineMapModal';
import SuggestionBox from './components/SuggestionBox';
import NotFoundView from './components/NotFoundView';
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

// Resolves /:seriesId/:characterId against the loaded database. A bad slug
// (broken link, deleted character) falls back to the 404 view instead of
// crashing or silently showing the wrong thing.
function SeriesRoute({ seriesDatabase }) {
  const { seriesId, characterId } = useParams();
  const navigate = useNavigate();
  const series = seriesDatabase.find(s => s.id === seriesId);

  if (!series) return <NotFoundView />;

  const character = characterId ? series.characters.find(c => c.id === characterId) : null;
  if (characterId && !character) return <NotFoundView />;

  return (
    <>
      <SeriesView series={series} />
      {character && (
        <TimelineMapModal
          character={character}
          seriesTitle={series.title}
          onClose={() => navigate(`/${series.id}`)}
        />
      )}
    </>
  );
}

export default function App() {
  const [seriesDatabase, setSeriesDatabase] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    fetchSeriesDatabase()
      .then(data => setSeriesDatabase(data))
      .catch(err => setLoadError(err.message || 'Error al cargar la base de datos.'))
      .finally(() => setIsLoading(false));
  }, []);

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
        currentView={location.pathname === '/' ? 'home' : 'series'}
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
        ) : (
          <Routes>
            <Route
              path="/"
              element={
                <HomeView
                  seriesList={seriesDatabase}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              }
            />
            <Route path="/:seriesId" element={<SeriesRoute seriesDatabase={seriesDatabase} />} />
            <Route path="/:seriesId/:characterId" element={<SeriesRoute seriesDatabase={seriesDatabase} />} />
            <Route path="*" element={<NotFoundView />} />
          </Routes>
        )}
      </main>

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
