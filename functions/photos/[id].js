// Public: serve a photo uploaded from the dashboard.
export async function onRequestGet({ params, env }) {
  const id = String(params.id || '');
  if (!env.CONTENT || !/^[a-z0-9]{8,40}\.(jpg|png|webp)$/.test(id)) return new Response('Not found', { status: 404 });
  const { value, metadata } = await env.CONTENT.getWithMetadata('photo:' + id, { type: 'arrayBuffer' });
  if (!value) return new Response('Not found', { status: 404 });
  return new Response(value, {
    headers: { 'content-type': (metadata && metadata.type) || 'image/jpeg', 'cache-control': 'public, max-age=31536000, immutable' },
  });
}
