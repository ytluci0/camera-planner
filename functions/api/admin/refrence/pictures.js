import { badRequest, json, readJson, requirePermission } from '../../_lib/utils';

function normalizeText(value) {
  return String(value || '').trim();
}

export async function onRequest(context) {
  const auth = await requirePermission(context, 'reference:manage');
  if (auth.error) return auth.error;

  const db = context.env.CAMERA_DB;
  const method = context.request.method;
  const body = ['POST', 'PUT', 'DELETE'].includes(method) ? await readJson(context.request) : null;

  if (method === 'GET') {
    const rows = await db.prepare('SELECT id, file_name, r2_key, public_url FROM camera_assets ORDER BY id DESC').all();
    return json({
      items: (rows.results || []).map((row) => ({
        id: row.id,
        name: row.file_name,
        key: row.r2_key,
        url: row.public_url || ''
      }))
    });
  }

  if (method === 'POST') {
    const name = normalizeText(body?.name);
    const key = normalizeText(body?.key);
    const url = normalizeText(body?.url);
    if (!name || !key || !url) return badRequest('name, key, and url are required');

    await db.prepare(
      'INSERT INTO camera_assets (file_name, r2_key, public_url, content_type) VALUES (?1, ?2, ?3, ?4)'
    ).bind(name, key, url, 'image/*').run();

    return json({ ok: true });
  }

  if (method === 'PUT') {
    const id = Number(body?.id);
    const name = normalizeText(body?.name);
    const key = normalizeText(body?.key);
    const url = normalizeText(body?.url);
    if (!id || !name || !key || !url) return badRequest('id, name, key, and url are required');

    await db.prepare(
      'UPDATE camera_assets SET file_name = ?1, r2_key = ?2, public_url = ?3 WHERE id = ?4'
    ).bind(name, key, url, id).run();

    return json({ ok: true });
  }

  if (method === 'DELETE') {
    const id = Number(body?.id);
    if (!id) return badRequest('id is required');

    await db.prepare('DELETE FROM camera_assets WHERE id = ?1').bind(id).run();
    return json({ ok: true });
  }

  return json({ error: 'Method not allowed' }, { status: 405 });
}