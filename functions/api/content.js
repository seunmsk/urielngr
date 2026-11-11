import { json, setupProblem, isAuthed } from '../../lib/auth.js';

const KEY = 'content';
const MAX_BYTES = 1_000_000;

// Public: the website reads its content here. 404 means "use the built-in defaults".
export async function onRequestGet({ env }) {
  if (!env.CONTENT) return json({ error: 'not set up' }, 404);
  const text = await env.CONTENT.get(KEY);
  if (!text) return json({ error: 'no saved content yet' }, 404);
  return new Response(text, { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
}

// Dashboard: save the whole content document.
export async function onRequestPut({ request, env }) {
  const problem = setupProblem(env);
  if (problem) return json({ error: problem }, 503);
  if (!(await isAuthed(request, env))) return json({ error: 'Please log in again.' }, 401);
  const text = await request.text();
  if (text.length > MAX_BYTES) return json({ error: 'The content is too large to save.' }, 413);
  let doc;
  try { doc = JSON.parse(text); } catch (e) { return json({ error: 'The content could not be read.' }, 400); }
  if (!doc || !Array.isArray(doc.projects) || !Array.isArray(doc.now) || typeof doc.contact !== 'object') {
    return json({ error: 'The content is missing projects, updates or contact details.' }, 400);
  }
  doc.savedAt = new Date().toISOString();
  // Keep the previous version so a bad save can be undone.
  const prev = await env.CONTENT.get(KEY);
  if (prev) await env.CONTENT.put(KEY + ':previous', prev);
  await env.CONTENT.put(KEY, JSON.stringify(doc));
  return json({ ok: true, savedAt: doc.savedAt });
}
