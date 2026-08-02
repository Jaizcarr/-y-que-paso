import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HomeView from './components/HomeView';
import SeriesView from './components/SeriesView';
import TimelineMapModal from './components/TimelineMapModal';
import AdminPanel from './components/AdminPanel';
import { LogoMark } from './components/Placeholders';
import { getStoredSeriesDatabase, saveStoredSeriesDatabase } from './data/seriesData';

export default function App() {
  const [seriesDatabase, setSeriesDatabase] = useState(getStoredSeriesDatabase);
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'series'
  const [selectedSeriesId, setSelectedSeriesId] = useState('juego-de-tronos');
  const [selectedCharacterId, setSelectedCharacterId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdminOpen, setIsAdminOpen] = useState(false);

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

  const handleSaveAdminData = (newData) => {
    setSeriesDatabase(newData);
    saveStoredSeriesDatabase(newData);
  };

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
        {currentView === 'home' ? (
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
        <AdminPanel
          seriesData={seriesDatabase}
          onSaveData={handleSaveAdminData}
          onClose={() => setIsAdminOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-[var(--border-soft)] py-6 bg-[var(--bg-card)] text-center text-xs text-[var(--text-muted)]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <LogoMark className="w-6 h-6 rounded-md" iconClassName="w-3.5 h-3.5" />
            <span className="font-baloo font-bold text-gray-200">Y QUÉ PASÓ?</span>
            <span>• Wiki Cinéfila & Admin Platform</span>
          </div>
          <p className="text-gray-400">
            Usuario Admin: <code className="text-[var(--accent)]">admin</code> | Contraseña: <code className="text-[var(--accent)]">admin</code>
          </p>
        </div>
      </footer>
    </div>
  );
}
