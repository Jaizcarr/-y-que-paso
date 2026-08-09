import React, { useState } from 'react';
import { X, Lock, Save, Plus, Trash2, Edit3, RefreshCw, Download, Upload, FileSpreadsheet, Check, AlertCircle, Film, Users, Search, Image, Loader2, KeyRound, Copy, Sparkles, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import * as XLSX from 'xlsx';
import { initialSeriesDatabase } from '../data/seriesData';
import { PosterPlaceholder } from './Placeholders';
import {
  getTmdbKey,
  setTmdbKey as persistTmdbKey,
  searchTvShow,
  searchPersonPhoto,
  getEpisodeStill,
  parseSeasonEpisode,
} from '../services/tmdb';
import { findSimilarMatch } from '../utils/similarity';
import {
  getClaudeKey,
  setClaudeKey as persistClaudeKey,
  findSemanticDuplicate,
} from '../services/claude';

export default function AdminPanel({ seriesData, onSaveData, onClose }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [editableData, setEditableData] = useState(seriesData);
  const [selectedSeriesId, setSelectedSeriesId] = useState(seriesData[0]?.id || '');
  const [uploadStatus, setUploadStatus] = useState('');
  const [forceRefreshImages, setForceRefreshImages] = useState(false);

  // Character card collapse/expand + drag-to-reorder
  const [expandedCharIds, setExpandedCharIds] = useState(() => new Set());
  const [dragCharIndex, setDragCharIndex] = useState(null);
  const [dragOverCharIndex, setDragOverCharIndex] = useState(null);

  // Claude (Anthropic) semantic duplicate detection — optional, no default key
  // (unlike TMDB, this key can spend money, so it's never baked into the code).
  const [claudeKey, setClaudeKeyState] = useState(() => getClaudeKey());
  const [claudeKeyInput, setClaudeKeyInput] = useState(() => getClaudeKey());

  // TMDB automatic image search
  const [tmdbKey, setTmdbKeyState] = useState(() => getTmdbKey());
  const [tmdbKeyInput, setTmdbKeyInput] = useState(() => getTmdbKey());
  const [tmdbStatus, setTmdbStatus] = useState('');
  const [searchingKey, setSearchingKey] = useState(null); // e.g. 'bulk' | 'series' | `avatar-${id}` | `event-${id}`
  const [seriesTmdbIds, setSeriesTmdbIds] = useState({}); // seriesId -> tmdb tv id (cache)

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Credenciales incorrectas. Pruebe admin / admin');
    }
  };

  const selectedSeries = editableData.find(s => s.id === selectedSeriesId);

  // Manual Update Helpers (functional form so async TMDB loops never work off stale state)
  const handleUpdateSeries = (field, value, seriesId = selectedSeriesId) => {
    setEditableData(prev => prev.map(s => s.id === seriesId ? { ...s, [field]: value } : s));
  };

  const handleUpdateCharacter = (charId, field, value, seriesId = selectedSeriesId) => {
    setEditableData(prev => prev.map(s => {
      if (s.id !== seriesId) return s;
      return {
        ...s,
        characters: s.characters.map(c => c.id === charId ? { ...c, [field]: value } : c)
      };
    }));
  };

  const handleUpdateEvent = (charId, eventId, field, value, seriesId = selectedSeriesId) => {
    setEditableData(prev => prev.map(s => {
      if (s.id !== seriesId) return s;
      return {
        ...s,
        characters: s.characters.map(c => {
          if (c.id !== charId) return c;
          return { ...c, events: c.events.map(e => e.id === eventId ? { ...e, [field]: value } : e) };
        })
      };
    }));
  };

  const handleAddEvent = (charId) => {
    const newEvent = {
      id: `evt-${Date.now()}`,
      season: 1,
      episode: 'T1E1: Nuevo Evento',
      title: 'Nuevo Evento Canónico',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      summary: 'Resumen breve del evento.',
      details: 'Explicación detallada de lo que pasó.',
      impact: 'Impacto histórico.'
    };

    setEditableData(prev => prev.map(s => {
      if (s.id !== selectedSeriesId) return s;
      return {
        ...s,
        characters: s.characters.map(c => c.id === charId ? { ...c, events: [...c.events, newEvent] } : c)
      };
    }));
  };

  const handleDeleteEvent = (charId, eventId) => {
    setEditableData(prev => prev.map(s => {
      if (s.id !== selectedSeriesId) return s;
      return {
        ...s,
        characters: s.characters.map(c => c.id === charId ? { ...c, events: c.events.filter(e => e.id !== eventId) } : c)
      };
    }));
  };

  const handleDeleteCharacter = (charId, charName) => {
    if (!confirm(`¿Borrar a "${charName}" y todos sus eventos canónicos? Esta acción no se puede deshacer.`)) return;
    setEditableData(prev => prev.map(s => {
      if (s.id !== selectedSeriesId) return s;
      return { ...s, characters: s.characters.filter(c => c.id !== charId) };
    }));
    setExpandedCharIds(prev => {
      const next = new Set(prev);
      next.delete(charId);
      return next;
    });
  };

  const toggleCharExpanded = (charId) => {
    setExpandedCharIds(prev => {
      const next = new Set(prev);
      if (next.has(charId)) next.delete(charId);
      else next.add(charId);
      return next;
    });
  };

  // --- Drag-to-reorder character cards ---
  const handleCharDragStart = (index) => (e) => {
    setDragCharIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCharDragOver = (index) => (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (index !== dragOverCharIndex) setDragOverCharIndex(index);
  };

  const handleCharDrop = (index) => (e) => {
    e.preventDefault();
    if (dragCharIndex === null || dragCharIndex === index) {
      setDragCharIndex(null);
      setDragOverCharIndex(null);
      return;
    }
    setEditableData(prev => prev.map(s => {
      if (s.id !== selectedSeriesId) return s;
      const reordered = [...s.characters];
      const [moved] = reordered.splice(dragCharIndex, 1);
      reordered.splice(index, 0, moved);
      return { ...s, characters: reordered };
    }));
    setDragCharIndex(null);
    setDragOverCharIndex(null);
  };

  const handleCharDragEnd = () => {
    setDragCharIndex(null);
    setDragOverCharIndex(null);
  };

  // --- Claude semantic duplicate detection ---

  const handleSaveClaudeKey = () => {
    const trimmed = claudeKeyInput.trim();
    persistClaudeKey(trimmed);
    setClaudeKeyState(trimmed);
    setUploadStatus(trimmed ? 'API Key de Claude guardada en este navegador.' : 'API Key de Claude eliminada.');
  };

  // --- TMDB automatic image search ---

  const handleSaveTmdbKey = () => {
    const trimmed = tmdbKeyInput.trim();
    persistTmdbKey(trimmed);
    setTmdbKeyState(trimmed);
    setTmdbStatus(trimmed ? 'API Key de TMDB guardada.' : 'API Key eliminada.');
  };

  const handleCopyTmdbKey = async () => {
    if (!tmdbKey) return;
    try {
      await navigator.clipboard.writeText(tmdbKey);
      setTmdbStatus('API Key copiada al portapapeles.');
    } catch (err) {
      setTmdbStatus('No se pudo copiar automáticamente. Selecciona el texto del campo manualmente.');
    }
  };

  const ensureTmdbId = async (series) => {
    if (seriesTmdbIds[series.id]) return seriesTmdbIds[series.id];
    const result = await searchTvShow(series.originalTitle || series.title, tmdbKey);
    setSeriesTmdbIds(prev => ({ ...prev, [series.id]: result.tmdbId }));
    return result.tmdbId;
  };

  const handleSearchSeriesImages = async () => {
    if (!tmdbKey) { setTmdbStatus('Configura tu API Key de TMDB primero.'); return; }
    setSearchingKey('series');
    try {
      const result = await searchTvShow(selectedSeries.originalTitle || selectedSeries.title, tmdbKey);
      setSeriesTmdbIds(prev => ({ ...prev, [selectedSeries.id]: result.tmdbId }));
      if (result.poster) handleUpdateSeries('poster', result.poster, selectedSeries.id);
      if (result.backdrop) handleUpdateSeries('backdrop', result.backdrop, selectedSeries.id);
      setTmdbStatus(`Poster y backdrop de "${result.name}" actualizados desde TMDB.`);
    } catch (err) {
      setTmdbStatus(err.message);
    } finally {
      setSearchingKey(null);
    }
  };

  const handleSearchAvatar = async (char) => {
    if (!tmdbKey) { setTmdbStatus('Configura tu API Key de TMDB primero.'); return; }
    if (!char.actor) { setTmdbStatus('Este personaje no tiene actor asignado.'); return; }
    setSearchingKey(`avatar-${char.id}`);
    try {
      const photo = await searchPersonPhoto(char.actor, tmdbKey);
      handleUpdateCharacter(char.id, 'avatar', photo);
      setTmdbStatus(`Foto de ${char.actor} actualizada desde TMDB.`);
    } catch (err) {
      setTmdbStatus(err.message);
    } finally {
      setSearchingKey(null);
    }
  };

  const handleSearchEventImage = async (char, evt) => {
    if (!tmdbKey) { setTmdbStatus('Configura tu API Key de TMDB primero.'); return; }
    setSearchingKey(`event-${evt.id}`);
    try {
      const tmdbId = await ensureTmdbId(selectedSeries);
      const { season, episode } = parseSeasonEpisode(evt);
      const still = await getEpisodeStill(tmdbId, season, episode, tmdbKey);
      handleUpdateEvent(char.id, evt.id, 'image', still);
      setTmdbStatus(`Imagen de "${evt.episode}" actualizada desde TMDB.`);
    } catch (err) {
      setTmdbStatus(err.message);
    } finally {
      setSearchingKey(null);
    }
  };

  const handleAutoFillSeries = async () => {
    if (!tmdbKey) { setTmdbStatus('Configura tu API Key de TMDB primero.'); return; }
    setSearchingKey('bulk');
    try {
      const result = await searchTvShow(selectedSeries.originalTitle || selectedSeries.title, tmdbKey);
      setSeriesTmdbIds(prev => ({ ...prev, [selectedSeries.id]: result.tmdbId }));
      if (result.poster) handleUpdateSeries('poster', result.poster, selectedSeries.id);
      if (result.backdrop) handleUpdateSeries('backdrop', result.backdrop, selectedSeries.id);

      for (const char of selectedSeries.characters) {
        if (char.actor) {
          setTmdbStatus(`Buscando foto de ${char.actor}...`);
          try {
            const photo = await searchPersonPhoto(char.actor, tmdbKey);
            handleUpdateCharacter(char.id, 'avatar', photo);
          } catch (e) {
            console.warn(e.message);
          }
        }

        for (const evt of char.events) {
          setTmdbStatus(`Buscando imagen de ${char.name} - ${evt.episode}...`);
          try {
            const { season, episode } = parseSeasonEpisode(evt);
            const still = await getEpisodeStill(result.tmdbId, season, episode, tmdbKey);
            handleUpdateEvent(char.id, evt.id, 'image', still);
          } catch (e) {
            console.warn(e.message);
          }
        }
      }
      setTmdbStatus(`¡Listo! Imágenes de "${result.name}" autocompletadas desde TMDB.`);
    } catch (err) {
      setTmdbStatus(err.message);
    } finally {
      setSearchingKey(null);
    }
  };

  // Excel / CSV Mass Upload Handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadStatus('Procesando archivo...');
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (!data || data.length === 0) {
          setUploadStatus('El archivo Excel/CSV está vacío.');
          return;
        }

        // Process bulk dataset
        const newSeriesMap = {};

        // Retain existing structure if series already present
        editableData.forEach(s => {
          newSeriesMap[s.title.toLowerCase()] = { ...s, characters: [...s.characters] };
        });

        // Track rows that omitted an image so TMDB can fill them in afterwards
        const needsPosterIds = new Set();
        const needsAvatarList = []; // { charObj, actorName }
        const needsEventImageList = []; // { seriesId, eventObj }
        const fuzzyMatchLog = []; // human-readable log of near-duplicate merges
        let aiChecksUsed = 0;
        const MAX_AI_CHECKS = 40; // cap Claude calls per upload to bound cost on large files

        for (const row of data) {
          const rawSeriesTitle = (row.Serie || 'Juego de Tronos').toString().trim();
          let seriesKey = rawSeriesTitle.toLowerCase();

          // Fuzzy-match against already-known series titles before creating a new one
          // (catches typos/casing/accents like "Juego de tronos " vs "Juego de Tronos").
          if (!newSeriesMap[seriesKey]) {
            const fuzzySeries = findSimilarMatch(rawSeriesTitle, Object.values(newSeriesMap), { key: 'title' });
            if (fuzzySeries) {
              seriesKey = fuzzySeries.match.title.toLowerCase();
              fuzzyMatchLog.push(`Serie "${rawSeriesTitle}" → "${fuzzySeries.match.title}" (${Math.round(fuzzySeries.score * 100)}% similar)`);
            }
          }

          if (!newSeriesMap[seriesKey]) {
            newSeriesMap[seriesKey] = {
              id: rawSeriesTitle.toLowerCase().replace(/\s+/g, '-'),
              title: rawSeriesTitle,
              originalTitle: rawSeriesTitle,
              poster: row.PosterSerie || null,
              backdrop: row.BackdropSerie || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
              genre: row.GeneroSerie || 'Drama',
              seasons: parseInt(row.TemporadasSerie) || 5,
              episodes: 50,
              network: row.CadenaSerie || 'HBO',
              tagline: row.TaglineSerie || 'Serie Épica',
              description: row.DescripcionSerie || 'Descripción de la serie.',
              characters: []
            };
          }

          const currentSeries = newSeriesMap[seriesKey];
          if (forceRefreshImages || !row.PosterSerie) needsPosterIds.add(currentSeries.id);

          const charName = (row.NombrePersonaje || row.Nombre || 'Personaje').toString().trim();
          const explicitCharId = row.PersonajeID;

          let charObj = null;
          if (explicitCharId) {
            charObj = currentSeries.characters.find(c => c.id === explicitCharId);
          }
          if (!charObj) {
            const derivedCharId = charName.toLowerCase().replace(/\s+/g, '-');
            charObj = currentSeries.characters.find(c => c.id === derivedCharId);
          }
          if (!charObj && !explicitCharId) {
            // No exact ID match — check for a near-duplicate name (small typos, accents, casing)
            const fuzzyChar = findSimilarMatch(charName, currentSeries.characters, { key: 'name' });
            if (fuzzyChar) {
              charObj = fuzzyChar.match;
              fuzzyMatchLog.push(`Personaje "${charName}" → "${fuzzyChar.match.name}" (${Math.round(fuzzyChar.score * 100)}% similar)`);
            }
          }

          if (!charObj && !explicitCharId && claudeKey && currentSeries.characters.length > 0 && aiChecksUsed < MAX_AI_CHECKS) {
            // Text similarity found nothing — ask Claude in case it's a known alias/
            // translation (e.g. "Jon Snow" vs "Jon Nieve") rather than a distinct character.
            aiChecksUsed += 1;
            try {
              const semanticMatchName = await findSemanticDuplicate(
                charName,
                currentSeries.characters.map(c => c.name),
                claudeKey
              );
              if (semanticMatchName) {
                charObj = currentSeries.characters.find(c => c.name === semanticMatchName);
                fuzzyMatchLog.push(`Personaje "${charName}" → "${semanticMatchName}" (detectado por IA)`);
              }
            } catch (err) {
              console.warn(err.message);
            }
          }

          if (!charObj) {
            charObj = {
              id: explicitCharId || charName.toLowerCase().replace(/\s+/g, '-'),
              name: charName,
              zona: row.Zona || 'Desconocida',
              edad: row.Edad || 'N/A',
              actor: row.Actor || 'N/A',
              house: row.Casa || 'Casa / Facción',
              role: row.Rol || 'Protagonista',
              status: row.Estatus || 'Activo',
              avatar: row.Avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
              quote: row.Frase || '',
              summary: row.ResumenPersonaje || 'Resumen del personaje.',
              events: []
            };
            currentSeries.characters.push(charObj);
          }

          const actorForSearch = row.Actor || charObj.actor;
          if (actorForSearch && actorForSearch !== 'N/A' && (forceRefreshImages || !row.Avatar)) {
            needsAvatarList.push({ charObj, actorName: actorForSearch });
          }

          // Add event if event columns present
          if (row.TituloEvento) {
            const eventObj = {
              id: row.EventoID || `evt-${Date.now()}-${Math.random()}`,
              season: parseInt(row.Temporada) || 1,
              episode: row.Episodio || 'T1E1',
              title: row.TituloEvento,
              image: row.ImagenEvento || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
              summary: row.ResumenEvento || 'Resumen del evento',
              details: row.DetallesCanonicos || row.Detalles || 'Detalles canónicos del evento',
              impact: row.Impacto || '',
              isFinalFate: row.EsDestinoFinal === true || row.EsDestinoFinal === 'true' || row.EsDestinoFinal === 1
            };
            charObj.events.push(eventObj);
            if (forceRefreshImages || !row.ImagenEvento) {
              needsEventImageList.push({ seriesId: currentSeries.id, eventObj });
            }
          }
        }

        const currentTmdbKey = getTmdbKey();
        const pendingImages = needsPosterIds.size + needsAvatarList.length + needsEventImageList.length;

        if (currentTmdbKey && pendingImages > 0) {
          setUploadStatus(`Datos importados. Buscando ${pendingImages} imágenes automáticamente en TMDB...`);
          const tmdbIdBySeriesId = {};

          for (const series of Object.values(newSeriesMap)) {
            const needsId = needsPosterIds.has(series.id) || needsEventImageList.some(x => x.seriesId === series.id);
            if (!needsId) continue;
            try {
              const result = await searchTvShow(series.originalTitle || series.title, currentTmdbKey);
              tmdbIdBySeriesId[series.id] = result.tmdbId;
              if (needsPosterIds.has(series.id)) {
                if (result.poster) series.poster = result.poster;
                if (result.backdrop) series.backdrop = result.backdrop;
              }
            } catch (err) {
              console.warn(err.message);
            }
          }

          for (const { charObj, actorName } of needsAvatarList) {
            try {
              charObj.avatar = await searchPersonPhoto(actorName, currentTmdbKey);
            } catch (err) {
              console.warn(err.message);
            }
          }

          for (const { seriesId, eventObj } of needsEventImageList) {
            const tmdbId = tmdbIdBySeriesId[seriesId];
            if (!tmdbId) continue;
            try {
              const { season, episode } = parseSeasonEpisode(eventObj);
              eventObj.image = await getEpisodeStill(tmdbId, season, episode, currentTmdbKey);
            } catch (err) {
              console.warn(err.message);
            }
          }
        }

        const updatedArray = Object.values(newSeriesMap);
        setEditableData(updatedArray);
        onSaveData(updatedArray);

        const parts = [`¡Éxito! Se importaron ${data.length} filas del Excel/CSV.`];
        if (currentTmdbKey && pendingImages > 0) {
          parts.push(`Se autocompletaron ${pendingImages} imágenes vía TMDB.`);
        }
        if (fuzzyMatchLog.length > 0) {
          const preview = fuzzyMatchLog.slice(0, 3).join(' · ');
          const extra = fuzzyMatchLog.length > 3 ? ` y ${fuzzyMatchLog.length - 3} más` : '';
          parts.push(`Se detectaron ${fuzzyMatchLog.length} posibles duplicados y se fusionaron en vez de crear personajes nuevos: ${preview}${extra}.`);
        }
        setUploadStatus(parts.join(' '));

      } catch (err) {
        console.error(err);
        setUploadStatus('Error al leer el archivo Excel/CSV. Verifique el formato.');
      }
    };

    reader.readAsBinaryString(file);
  };

  // Download Standard Excel CSV Template
  const handleDownloadTemplate = () => {
    const templateRows = [
      {
        Serie: 'Juego de Tronos',
        PersonajeID: 'jon-snow',
        NombrePersonaje: 'Jon Nieve',
        Zona: 'Invernalia & El Muro',
        Edad: '24 años',
        Actor: 'Kit Harington',
        Casa: 'Casa Targaryen',
        Rol: 'Rey en el Norte',
        Estatus: 'Exiliado al Norte',
        Avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        Frase: 'No sabes nada, Jon Nieve',
        ResumenPersonaje: 'Líder del Norte',
        EventoID: 'got-jon-5',
        Temporada: 8,
        Episodio: 'T8E6: El Trono de Hierro',
        TituloEvento: 'Asesinato de Daenerys & Exilio',
        ImagenEvento: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80',
        ResumenEvento: 'Jon apuñala a Daenerys',
        DetallesCanonicos: 'Jon clava la daga en el corazón de Daenerys para salvar Poniente y es desterrado al Muro.',
        Impacto: 'Fin de la dinastía Targaryen.',
        EsDestinoFinal: 'true'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'PlantillaPersonajes');
    XLSX.writeFile(workbook, 'Plantilla_Y_QUE_PASO_MassUpload.xlsx');
  };

  const handleSaveAll = () => {
    onSaveData(editableData);
    alert('¡Cambios guardados correctamente!');
  };

  const handleResetDefaults = () => {
    if (confirm('¿Restablecer datos originales?')) {
      setEditableData(initialSeriesDatabase);
      onSaveData(initialSeriesDatabase);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto font-opensans">
      <div className="relative w-full max-w-5xl glass-panel rounded-3xl border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-soft)] flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-[var(--accent)]" />
            <h2 className="font-baloo text-xl font-bold text-white">
              Plataforma Admin & Carga Masiva (Excel / CSV)
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-[var(--accent-soft)] text-gray-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* LOGIN FORM IF NOT AUTHENTICATED */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 text-center max-w-md mx-auto my-auto w-full">
            <div className="w-16 h-16 rounded-full bg-[var(--accent-soft)] flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-[var(--accent)]" />
            </div>

            <h3 className="text-xl font-bold text-white font-baloo mb-2">
              Acceso Administrador
            </h3>
            <p className="text-xs text-gray-300 mb-6">
              Ingrese credenciales para acceder a la carga gigante de Excel/CSV y edición manual.
            </p>

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="text-xs text-gray-300 font-semibold block mb-1">Usuario</label>
                <input
                  type="text"
                  placeholder="Usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/30 text-sm text-gray-100 px-4 py-2.5 rounded-xl border border-[var(--border-soft)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="text-xs text-gray-300 font-semibold block mb-1">Contraseña</label>
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/30 text-sm text-gray-100 px-4 py-2.5 rounded-xl border border-[var(--border-soft)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              {loginError && (
                <p className="text-xs text-red-300 bg-red-950/30 p-2.5 rounded-lg border border-red-800/30">
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[var(--accent)] text-[#1e1d1b] font-bold text-sm shadow-lg shadow-[var(--accent)]/20 hover:brightness-110 hover:shadow-xl hover:shadow-[var(--accent)]/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 font-baloo"
              >
                Entrar al Panel
              </button>
            </form>
          </div>
        ) : (
          /* ADMIN DASHBOARD WITH EXCEL MASS UPLOAD */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-6">
            
            {/* MASS UPLOAD BOX (Carga Gigante por Excel) */}
            <div className="p-5 rounded-2xl bg-amber-300/10 border border-amber-300/30 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-amber-200 font-baloo flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-amber-300" />
                    Carga Gigante Masiva por Excel / CSV
                  </h3>
                  <p className="text-xs text-gray-300">
                    Sube una hoja de cálculo estructurada para actualizar o insertar cientos de personajes y eventos a la vez.
                  </p>
                </div>

                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-200/20 hover:bg-amber-200/30 text-amber-200 border border-amber-200/40 text-xs font-bold transition-all shadow"
                >
                  <Download className="w-4 h-4" /> Descargar Plantilla Excel
                </button>
              </div>

              {/* Upload Input */}
              <div className="flex items-center gap-4 pt-2 flex-wrap">
                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-400/20 hover:bg-rose-400/30 text-rose-200 border border-rose-300/40 text-xs font-bold cursor-pointer transition-all">
                  <Upload className="w-4 h-4" /> Seleccionar Archivo Excel/CSV
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <label className="flex items-center gap-1.5 text-xs text-gray-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={forceRefreshImages}
                    onChange={(e) => setForceRefreshImages(e.target.checked)}
                    className="accent-[var(--accent)]"
                  />
                  Forzar actualización de imágenes con TMDB (incluso si el Excel ya trae una URL)
                </label>
              </div>

              {uploadStatus && (
                <p className="text-xs font-semibold text-emerald-300 bg-emerald-950/20 px-3 py-2 rounded-lg">
                  {uploadStatus}
                </p>
              )}
            </div>

            {/* TMDB AUTOMATIC IMAGE SEARCH BOX */}
            <div className="p-5 rounded-2xl bg-purple-300/10 border border-purple-300/30 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-base font-bold text-purple-200 font-baloo flex items-center gap-2">
                    <Image className="w-5 h-5 text-purple-300" />
                    Búsqueda Automática de Imágenes (TMDB)
                  </h3>
                  <p className="text-xs text-gray-300">
                    Conecta tu API Key gratuita de{' '}
                    <a
                      href="https://www.themoviedb.org/settings/api"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-200 underline hover:text-purple-100"
                    >
                      themoviedb.org
                    </a>{' '}
                    para reemplazar posters, fotos de actores e imágenes de eventos con imágenes reales.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 bg-black/50 rounded-xl border border-white/15 px-3 py-2">
                  <KeyRound className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                  <input
                    type="text"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    placeholder="Pega aquí tu API Key (v3) de TMDB"
                    value={tmdbKeyInput}
                    onChange={(e) => setTmdbKeyInput(e.target.value)}
                    className="bg-transparent text-xs text-gray-100 focus:outline-none w-64"
                  />
                </div>
                <button
                  onClick={handleSaveTmdbKey}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-300/20 hover:bg-purple-300/30 text-purple-200 border border-purple-300/40 text-xs font-bold transition-all"
                >
                  <Save className="w-3.5 h-3.5" /> Guardar Key
                </button>

                {tmdbKey && (
                  <button
                    onClick={handleCopyTmdbKey}
                    title="Copia la key ya guardada en este navegador, sin escribir su valor en el código"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 border border-white/15 text-xs font-bold transition-all"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copiar mi API Key
                  </button>
                )}

                <button
                  onClick={handleAutoFillSeries}
                  disabled={!tmdbKey || searchingKey === 'bulk'}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-400/20 hover:bg-rose-400/30 disabled:opacity-40 disabled:cursor-not-allowed text-rose-200 border border-rose-300/40 text-xs font-bold transition-all"
                >
                  {searchingKey === 'bulk' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Search className="w-3.5 h-3.5" />
                  )}
                  Autocompletar Todas las Imágenes de {selectedSeries?.title}
                </button>

                {tmdbKey && (
                  <span className="text-[10px] text-emerald-300 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Key configurada
                  </span>
                )}
              </div>

              {tmdbStatus && (
                <p className="text-xs font-semibold text-purple-200 bg-purple-950/30 px-3 py-2 rounded-lg border border-purple-800/30">
                  {tmdbStatus}
                </p>
              )}
            </div>

            {/* CLAUDE AI SEMANTIC DUPLICATE DETECTION BOX (optional) */}
            <div className="p-5 rounded-2xl bg-sky-300/10 border border-sky-300/30 space-y-3">
              <div>
                <h3 className="text-base font-bold text-sky-200 font-baloo flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-sky-300" />
                  Detección de Duplicados con IA (opcional)
                </h3>
                <p className="text-xs text-gray-300">
                  Durante la carga masiva por Excel, si un nombre no coincide ni por texto (typos/acentos) se consulta a Claude por si es un alias o traducción del mismo personaje (ej. "Jon Snow" = "Jon Nieve"). Necesita tu propia{' '}
                  <a
                    href="https://console.anthropic.com/settings/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-200 underline hover:text-sky-100"
                  >
                    API Key de Anthropic
                  </a>{' '}
                  — tiene coste por uso y por seguridad nunca se guarda en el código, solo en este navegador.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 bg-black/50 rounded-xl border border-white/15 px-3 py-2">
                  <KeyRound className="w-3.5 h-3.5 text-sky-300 shrink-0" />
                  <input
                    type="text"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    placeholder="Pega aquí tu API Key de Anthropic (sk-ant-...)"
                    value={claudeKeyInput}
                    onChange={(e) => setClaudeKeyInput(e.target.value)}
                    className="bg-transparent text-xs text-gray-100 focus:outline-none w-72"
                  />
                </div>
                <button
                  onClick={handleSaveClaudeKey}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-300/20 hover:bg-sky-300/30 text-sky-200 border border-sky-300/40 text-xs font-bold transition-all"
                >
                  <Save className="w-3.5 h-3.5" /> Guardar Key
                </button>

                {claudeKey && (
                  <span className="text-[10px] text-emerald-300 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Key configurada — la carga masiva verificará duplicados con IA
                  </span>
                )}
              </div>
            </div>

            {/* Global Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-black/40 border border-white/10">
              <div className="flex items-center gap-3">
                <label className="text-xs text-gray-300 font-bold">Seleccionar Serie para Editar:</label>
                <select
                  value={selectedSeriesId}
                  onChange={(e) => setSelectedSeriesId(e.target.value)}
                  className="bg-black text-xs text-amber-200 px-3 py-2 rounded-xl border border-white/20 font-bold"
                >
                  {editableData.map(s => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleResetDefaults}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-xs text-gray-300 border border-white/10"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Restaurar Originales
                </button>

                <button
                  onClick={handleSaveAll}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg"
                >
                  <Save className="w-4 h-4" /> Guardar Todo
                </button>
              </div>
            </div>

            {/* Series-level Poster & Backdrop */}
            {selectedSeries && (
              <div className="p-4 rounded-2xl glass-panel border border-white/10 flex flex-wrap items-center gap-4">
                {selectedSeries.poster ? (
                  <img src={selectedSeries.poster} alt={selectedSeries.title} className="w-16 h-20 object-cover rounded-lg border border-white/15" />
                ) : (
                  <PosterPlaceholder title={selectedSeries.title} className="w-16 h-20 rounded-lg" />
                )}
                {selectedSeries.backdrop && (
                  <img src={selectedSeries.backdrop} alt="" className="w-28 h-20 object-cover rounded-lg border border-white/15 hidden sm:block" />
                )}
                <div className="flex-1 min-w-[160px]">
                  <span className="text-sm font-bold text-white block font-baloo">{selectedSeries.title}</span>
                  <span className="text-[11px] text-gray-400">Poster y Backdrop de la serie</span>
                </div>
                <button
                  onClick={handleSearchSeriesImages}
                  disabled={!tmdbKey || searchingKey === 'series'}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-300/20 hover:bg-purple-300/30 disabled:opacity-40 disabled:cursor-not-allowed text-purple-200 border border-purple-300/40 text-xs font-bold transition-all"
                >
                  {searchingKey === 'series' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  Buscar en TMDB
                </button>
              </div>
            )}

            {/* Manual Form Editors */}
            {selectedSeries && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5 font-baloo">
                  <Users className="w-4 h-4" /> Personajes de {selectedSeries.title} ({selectedSeries.characters.length})
                </h3>
                <p className="text-[11px] text-gray-500 -mt-2">
                  Arrastra el icono ⠿ para reordenar. Haz clic en una tarjeta para ver/ocultar sus eventos.
                </p>

                <div className="space-y-3">
                  {selectedSeries.characters.map((char, index) => {
                    const isExpanded = expandedCharIds.has(char.id);
                    const isDragging = dragCharIndex === index;
                    const isDragOver = dragOverCharIndex === index && dragCharIndex !== null && dragCharIndex !== index;

                    return (
                      <div
                        key={char.id}
                        onDragOver={handleCharDragOver(index)}
                        onDrop={handleCharDrop(index)}
                        className={`rounded-2xl glass-panel border transition-all ${
                          isDragOver ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/40' : 'border-white/10'
                        } ${isDragging ? 'opacity-40' : 'opacity-100'}`}
                      >
                        <div
                          onClick={() => toggleCharExpanded(char.id)}
                          className="flex items-center justify-between p-4 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              draggable
                              onDragStart={handleCharDragStart(index)}
                              onDragEnd={handleCharDragEnd}
                              onClick={(e) => e.stopPropagation()}
                              title="Arrastra para reordenar"
                              className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300 p-1 shrink-0"
                            >
                              <GripVertical className="w-4 h-4" />
                            </span>
                            <img src={char.avatar} alt={char.name} className="w-9 h-9 rounded-full object-cover border border-rose-300 shrink-0" />
                            <div className="min-w-0">
                              <span className="text-sm font-bold text-white block truncate">{char.name}</span>
                              <span className="text-[11px] text-gray-400 block truncate">Zona: {char.zona} • Edad Real: {char.edad} • Actor: {char.actor}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] text-gray-500 hidden sm:inline">{char.events.length} eventos</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteCharacter(char.id, char.name); }}
                              title="Borrar personaje"
                              className="p-1.5 rounded-lg bg-rose-400/10 hover:bg-rose-400/25 text-rose-300 hover:text-white transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-3">
                            <div className="flex justify-end">
                              <button
                                onClick={() => handleSearchAvatar(char)}
                                disabled={!tmdbKey || searchingKey === `avatar-${char.id}`}
                                title="Buscar foto real del actor en TMDB"
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-300/15 hover:bg-purple-300/25 disabled:opacity-40 disabled:cursor-not-allowed text-purple-200 border border-purple-300/30 text-[10px] font-bold transition-all shrink-0"
                              >
                                {searchingKey === `avatar-${char.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                                Avatar TMDB
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                              <div>
                                <label className="text-[10px] text-gray-400 block mb-1">Nombre</label>
                                <input
                                  type="text"
                                  value={char.name}
                                  onChange={(e) => handleUpdateCharacter(char.id, 'name', e.target.value)}
                                  className="w-full bg-black/50 text-white px-2.5 py-1.5 rounded-lg border border-white/15"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] text-gray-400 block mb-1">Zona / Origen</label>
                                <input
                                  type="text"
                                  value={char.zona || ''}
                                  onChange={(e) => handleUpdateCharacter(char.id, 'zona', e.target.value)}
                                  className="w-full bg-black/50 text-white px-2.5 py-1.5 rounded-lg border border-white/15"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] text-gray-400 block mb-1">Edad Real del Actor</label>
                                <input
                                  type="text"
                                  value={char.edad || ''}
                                  onChange={(e) => handleUpdateCharacter(char.id, 'edad', e.target.value)}
                                  className="w-full bg-black/50 text-white px-2.5 py-1.5 rounded-lg border border-white/15"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] text-gray-400 block mb-1">Actor / Actriz</label>
                                <input
                                  type="text"
                                  value={char.actor || ''}
                                  onChange={(e) => handleUpdateCharacter(char.id, 'actor', e.target.value)}
                                  className="w-full bg-black/50 text-white px-2.5 py-1.5 rounded-lg border border-white/15"
                                />
                              </div>
                            </div>

                            {/* Events Quick Manager */}
                            <div className="pt-2">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-bold text-amber-200">Eventos Canónicos ({char.events.length})</span>
                                <button
                                  onClick={() => handleAddEvent(char.id)}
                                  className="text-[11px] text-emerald-300 font-bold hover:underline flex items-center gap-1"
                                >
                                  <Plus className="w-3.5 h-3.5" /> Añadir Evento
                                </button>
                              </div>

                              <div className="space-y-1.5">
                                {char.events.map((evt, idx) => (
                                  <div key={evt.id || idx} className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between text-xs gap-2">
                                    <img src={evt.image} alt="" className="w-8 h-8 rounded-lg object-cover border border-white/10 shrink-0" />
                                    <div className="flex-1 truncate">
                                      <span className="font-bold text-white">{evt.episode}: </span>
                                      <span className="text-gray-300">{evt.title}</span>
                                      {idx === char.events.length - 1 && (
                                        <span className="ml-2 px-1.5 py-0.5 text-[9px] bg-amber-300/20 text-amber-200 rounded border border-amber-300/40">Burbuja Final</span>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => handleSearchEventImage(char, evt)}
                                      disabled={!tmdbKey || searchingKey === `event-${evt.id}`}
                                      title="Buscar captura real del episodio en TMDB"
                                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-300/15 hover:bg-purple-300/25 disabled:opacity-40 disabled:cursor-not-allowed text-purple-200 border border-purple-300/30 text-[9px] font-bold transition-all shrink-0"
                                    >
                                      {searchingKey === `event-${evt.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                                    </button>
                                    <button
                                      onClick={() => handleDeleteEvent(char.id, evt.id)}
                                      className="text-rose-300 p-1 hover:text-white"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
