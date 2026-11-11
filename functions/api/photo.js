import { json, setupProblem, isAuthed } from '../../lib/auth.js';

const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const MAX_BYTES = 8 * 1024 * 1024;

// Dashboard: upload one photo. Body is the image file itself.
export async function onRequestPost({ request, env }) {
  const problem = setupProblem(env);
  if (problem) return json({ error: problem }, 503);
  if (!(await isAuthed(request, env))) return json({ error: 'Please log in again.' }, 401);
  const type = (request.headers.get('content-type') || '').split(';')[0].trim();
  if (!TYPES[type]) return json({ error: 'Only JPEG, PNG or WebP photos can be uploaded.' }, 415);
  const buf = await request.arrayBuffer();
  if (!buf.byteLength) return json({ error: 'The photo was empty.' }, 400);
  if (buf.byteLength > MAX_BYTES) return json({ error: 'That photo is too large. Use one under 8 MB.' }, 413);
  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 20) + '.' + TYPES[type];
  await env.CONTENT.put('photo:' + id, buf, { metadata: { type } });
  return json({ ok: true, url: '/photos/' + id });
}
