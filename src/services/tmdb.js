// TMDB (The Movie Database) integration for automatic image search.
// Free API key: https://www.themoviedb.org/settings/api

const TMDB_KEY_STORAGE = 'y_que_paso_tmdb_key';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';

// Default TMDB key so image search works on any device without manual setup.
// Visible in the public site's JS bundle by design (owner's choice) — override
// per-device by pasting a different key in the Admin panel.
const DEFAULT_TMDB_KEY = '359da37984af6e36228e89c7e692b877';

export function getTmdbKey() {
  return localStorage.getItem(TMDB_KEY_STORAGE) || DEFAULT_TMDB_KEY;
}

export function setTmdbKey(key) {
  localStorage.setItem(TMDB_KEY_STORAGE, key);
}

function assertKey(key) {
  if (!key) {
    throw new Error('Falta la API Key de TMDB. Configúrala arriba antes de buscar imágenes.');
  }
}

export async function searchTvShow(title, key) {
  assertKey(key);
  const url = `${TMDB_BASE}/search/tv?api_key=${encodeURIComponent(key)}&query=${encodeURIComponent(title)}&language=es-ES`;
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 401) throw new Error('API Key de TMDB inválida.');
    throw new Error(`Error TMDB (${res.status}) buscando la serie "${title}".`);
  }
  const data = await res.json();
  const match = data.results?.[0];
  if (!match) throw new Error(`No se encontró la serie "${title}" en TMDB.`);
  return {
    tmdbId: match.id,
    name: match.name,
    poster: match.poster_path ? `${IMG_BASE}/w500${match.poster_path}` : null,
    backdrop: match.backdrop_path ? `${IMG_BASE}/w1280${match.backdrop_path}` : null,
  };
}

export async function searchPersonPhoto(actorName, key) {
  assertKey(key);
  const url = `${TMDB_BASE}/search/person?api_key=${encodeURIComponent(key)}&query=${encodeURIComponent(actorName)}`;
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 401) throw new Error('API Key de TMDB inválida.');
    throw new Error(`Error TMDB (${res.status}) buscando al actor "${actorName}".`);
  }
  const data = await res.json();
  const match = data.results?.[0];
  if (!match || !match.profile_path) throw new Error(`No se encontró foto de "${actorName}" en TMDB.`);
  return `${IMG_BASE}/w400${match.profile_path}`;
}

// Parses TMDB season/episode numbers from an event's `season` field and its
// `episode` label (e.g. "T1E1: El invierno se acerca" -> episode 1).
export function parseSeasonEpisode(event) {
  const season = event.season || 1;
  const epMatch = /E(\d+)/i.exec(event.episode || '');
  const episode = epMatch ? parseInt(epMatch[1], 10) : 1;
  return { season, episode };
}

export async function getEpisodeStill(tmdbId, season, episode, key) {
  assertKey(key);
  const url = `${TMDB_BASE}/tv/${tmdbId}/season/${season}/episode/${episode}/images?api_key=${encodeURIComponent(key)}`;
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 401) throw new Error('API Key de TMDB inválida.');
    throw new Error(`Error TMDB (${res.status}) buscando imagen de T${season}E${episode}.`);
  }
  const data = await res.json();
  const still = data.stills?.[0];
  if (!still) throw new Error(`No hay imagen disponible para T${season}E${episode} en TMDB.`);
  return `${IMG_BASE}/w780${still.file_path}`;
}
