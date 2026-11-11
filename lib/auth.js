// Shared helpers for the Uriel dashboard (Cloudflare Pages Functions).
const COOKIE = 'uriel_admin';
const DAY = 24 * 60 * 60;

const enc = new TextEncoder();

async function hmac(secret, data) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  });
}

export function setupProblem(env) {
  if (!env.CONTENT) return 'The dashboard storage is not connected yet. In Cloudflare, add a KV binding named CONTENT to this Pages project.';
  if (!env.ADMIN_PASSWORD) return 'The dashboard password is not set yet. In Cloudflare, add a secret named ADMIN_PASSWORD to this Pages project.';
  return null;
}

export async function passwordOk(env, given) {
  if (!env.ADMIN_PASSWORD || typeof given !== 'string') return false;
  // Compare HMACs so the comparison takes the same time whatever the input length.
  const [a, b] = await Promise.all([hmac('cmp', given), hmac('cmp', env.ADMIN_PASSWORD)]);
  return safeEqual(a, b);
}

export async function makeSessionCookie(env) {
  const exp = Math.floor(Date.now() / 1000) + 7 * DAY;
  const sig = await hmac(env.ADMIN_PASSWORD, 'session:' + exp);
  return `${COOKIE}=${exp}.${sig}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * DAY}`;
}

export function clearSessionCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export async function isAuthed(request, env) {
  if (!env.ADMIN_PASSWORD) return false;
  const cookie = request.headers.get('cookie') || '';
  const m = cookie.match(new RegExp('(?:^|;\\s*)' + COOKIE + '=([^;]+)'));
  if (!m) return false;
  const [exp, sig] = m[1].split('.');
  if (!exp || !sig || Number(exp) < Date.now() / 1000) return false;
  return safeEqual(sig, await hmac(env.ADMIN_PASSWORD, 'session:' + exp));
}
