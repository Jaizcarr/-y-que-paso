// Anthropic Claude integration for semantic duplicate-character detection
// (catches aliases/translations like "Jon Snow" / "Jon Nieve" that plain
// text-similarity can't). Optional feature — requires the admin's own
// Anthropic API key, entered per-device. Never defaulted in source code,
// unlike the TMDB key: this one can spend real money if leaked.

const CLAUDE_KEY_STORAGE = 'y_que_paso_claude_key';
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-haiku-4-5-20251001';

export function getClaudeKey() {
  return localStorage.getItem(CLAUDE_KEY_STORAGE) || '';
}

export function setClaudeKey(key) {
  localStorage.setItem(CLAUDE_KEY_STORAGE, key);
}

// Asks Claude whether `newName` refers to the same character as any name in
// `existingNames`. Returns the matching existing name, or null if none / on
// any parsing issue (fails safe — treated as "no match" by the caller).
export async function findSemanticDuplicate(newName, existingNames, apiKey) {
  if (!apiKey || !newName || existingNames.length === 0) return null;

  const prompt = `Eres un verificador de personajes duplicados en una wiki de series de TV.
Nombre nuevo: "${newName}"
Nombres ya existentes en la misma serie: ${existingNames.map(n => `"${n}"`).join(', ')}

¿El nombre nuevo se refiere al MISMO personaje que alguno de los existentes, aunque el nombre sea distinto (traducción, apodo, nombre completo vs. corto, etc.)? Si es un personaje distinto, o no hay información suficiente, no hay coincidencia.

Responde ÚNICAMENTE con JSON válido, sin texto adicional ni markdown: {"match": "<nombre existente exacto tal cual aparece arriba>"} o {"match": null}`;

  const res = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 100,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error('API Key de Claude inválida.');
    throw new Error(`Error de la API de Claude (${res.status}).`);
  }

  const data = await res.json();
  const text = data?.content?.[0]?.text?.trim() || '';
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    const match = parsed?.match;
    return typeof match === 'string' && existingNames.includes(match) ? match : null;
  } catch {
    return null;
  }
}
