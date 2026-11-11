import { json, setupProblem, passwordOk, makeSessionCookie, clearSessionCookie, isAuthed } from '../../lib/auth.js';

// GET: is this browser logged in?
export async function onRequestGet({ request, env }) {
  return json({ authed: await isAuthed(request, env), setup: setupProblem(env) });
}

// POST {password}: log in.
export async function onRequestPost({ request, env }) {
  const problem = setupProblem(env);
  if (problem) return json({ error: problem }, 503);
  let body = {};
  try { body = await request.json(); } catch (e) {}
  if (!(await passwordOk(env, body.password))) {
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    return json({ error: 'That password is not right. Check it and try again.' }, 401);
  }
  return json({ ok: true }, 200, { 'set-cookie': await makeSessionCookie(env) });
}

// DELETE: log out.
export async function onRequestDelete() {
  return json({ ok: true }, 200, { 'set-cookie': clearSessionCookie() });
}
