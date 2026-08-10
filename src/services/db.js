import { supabase } from './supabaseClient';

// Reads the full series → characters → events tree from Supabase and shapes
// it into exactly the nested structure the rest of the app already expects.
export async function fetchSeriesDatabase() {
  const [{ data: seriesRows, error: seriesErr }, { data: charRows, error: charErr }, { data: eventRows, error: eventErr }] =
    await Promise.all([
      supabase.from('series').select('*').order('title'),
      supabase.from('characters').select('*').order('sort_order'),
      supabase.from('events').select('*').order('sort_order'),
    ]);

  if (seriesErr) throw seriesErr;
  if (charErr) throw charErr;
  if (eventErr) throw eventErr;

  // Group children by parent id once (O(n)) instead of re-scanning the full
  // events/characters list per parent (O(n·m)) — keeps this fast as the
  // catalog grows well beyond a handful of series. Rows arrive pre-sorted by
  // sort_order, and pushing in that order preserves it within each group.
  const eventsByCharId = new Map();
  for (const e of eventRows || []) {
    const list = eventsByCharId.get(e.character_id);
    if (list) list.push(e);
    else eventsByCharId.set(e.character_id, [e]);
  }

  const charsBySeriesId = new Map();
  for (const c of charRows || []) {
    const list = charsBySeriesId.get(c.series_id);
    if (list) list.push(c);
    else charsBySeriesId.set(c.series_id, [c]);
  }

  return (seriesRows || []).map(s => ({
    id: s.id,
    title: s.title,
    originalTitle: s.original_title,
    poster: s.poster,
    backdrop: s.backdrop,
    genre: s.genre,
    seasons: s.seasons,
    episodes: s.episodes,
    network: s.network,
    tagline: s.tagline,
    description: s.description,
    characters: (charsBySeriesId.get(s.id) || []).map(c => ({
      id: c.id,
      name: c.name,
      aliases: c.aliases || [],
      zona: c.zona,
      edad: c.edad,
      actor: c.actor,
      house: c.house,
      role: c.role,
      status: c.status,
      avatar: c.avatar,
      quote: c.quote,
      summary: c.summary,
      events: (eventsByCharId.get(c.id) || []).map(e => ({
        id: e.id,
        season: e.season,
        episode: e.episode,
        title: e.title,
        image: e.image,
        summary: e.summary,
        details: e.details,
        impact: e.impact,
        isFinalFate: e.is_final_fate,
      })),
    })),
  }));
}

// Writes the whole app-shaped dataset back to Supabase: upserts every row,
// then deletes anything that exists in the DB but no longer exists locally
// (so deleted series/characters/events actually disappear).
export async function syncSeriesDatabase(seriesArray) {
  const seriesRows = seriesArray.map(s => ({
    id: s.id,
    title: s.title,
    original_title: s.originalTitle,
    poster: s.poster,
    backdrop: s.backdrop,
    genre: s.genre,
    seasons: s.seasons,
    episodes: s.episodes,
    network: s.network,
    tagline: s.tagline,
    description: s.description,
    updated_at: new Date().toISOString(),
  }));

  const charRows = [];
  const eventRows = [];
  seriesArray.forEach(s => {
    s.characters.forEach((c, ci) => {
      charRows.push({
        id: c.id,
        series_id: s.id,
        name: c.name,
        aliases: c.aliases || [],
        zona: c.zona,
        edad: c.edad,
        actor: c.actor,
        house: c.house,
        role: c.role,
        status: c.status,
        avatar: c.avatar,
        quote: c.quote,
        summary: c.summary,
        sort_order: ci,
        updated_at: new Date().toISOString(),
      });
      c.events.forEach((e, ei) => {
        eventRows.push({
          id: e.id,
          character_id: c.id,
          season: e.season,
          episode: e.episode,
          title: e.title,
          image: e.image,
          summary: e.summary,
          details: e.details,
          impact: e.impact,
          is_final_fate: !!e.isFinalFate,
          sort_order: ei,
          updated_at: new Date().toISOString(),
        });
      });
    });
  });

  // Parents before children, so foreign keys always resolve.
  if (seriesRows.length) {
    const { error } = await supabase.from('series').upsert(seriesRows);
    if (error) throw error;
  }
  if (charRows.length) {
    const { error } = await supabase.from('characters').upsert(charRows);
    if (error) throw error;
  }
  if (eventRows.length) {
    const { error } = await supabase.from('events').upsert(eventRows);
    if (error) throw error;
  }

  // Children before parents, so nothing gets orphaned mid-cleanup.
  await deleteMissing('events', 'id', new Set(eventRows.map(r => r.id)));
  await deleteMissing('characters', 'id', new Set(charRows.map(r => r.id)));
  await deleteMissing('series', 'id', new Set(seriesRows.map(r => r.id)));
}

async function deleteMissing(table, idColumn, keepIds) {
  const { data: existing, error } = await supabase.from(table).select(idColumn);
  if (error) throw error;
  const toDelete = (existing || []).map(r => r[idColumn]).filter(id => !keepIds.has(id));
  if (toDelete.length) {
    const { error: delErr } = await supabase.from(table).delete().in(idColumn, toDelete);
    if (delErr) throw delErr;
  }
}
