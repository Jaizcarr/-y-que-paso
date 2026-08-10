import { supabase } from './supabaseClient';

// Anyone can submit — no login required. Reading and deleting are restricted
// to the authenticated admin by the table's RLS policies (see
// supabase_suggestions.sql), so this is safe to call from the public site.
export async function submitSuggestion(message, name) {
  const trimmed = message.trim();
  if (!trimmed) return;
  const { error } = await supabase.from('suggestions').insert({
    message: trimmed,
    name: name?.trim() || null,
  });
  if (error) throw error;
}

// Admin-only (RLS blocks this for anonymous visitors).
export async function fetchSuggestions() {
  const { data, error } = await supabase
    .from('suggestions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// Admin-only (RLS blocks this for anonymous visitors).
export async function deleteSuggestion(id) {
  const { error } = await supabase.from('suggestions').delete().eq('id', id);
  if (error) throw error;
}
