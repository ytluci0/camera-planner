import { badRequest, json, readJson, requirePermission } from '../../_lib/utils';

const TABLES = {
  'camera-types': 'camera_types',
  purposes: 'camera_purposes',
  lenses: 'lenses'
};

function normalizeText(value) {
  return String(value || '').trim();
}

export async function onRequest(context) {
  const auth = await requirePermission(context, 'reference:manage');
  if (auth.error) return auth.error;

  const db = context.env.CAMERA_DB;
  const type = context.params.type;
  const body = ['POST', 'PUT', 'DELETE'].includes(context.request.method) ? await readJson(context.request) : null;

  if (type === 'pictures') {
    if (context.request.method === 'GET') {
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

    if (context.request.method === 'POST') {
      const name = normalizeText(body?.name);
      const key = normalizeText(body?.key);
      const url = normalizeText(body?.url);
      if (!name || !key || !url) return badRequest('name, key, and url are required');

      await db.prepare(
        'INSERT INTO camera_assets (file_name, r2_key, public_url, content_type) VALUES (?1, ?2, ?3, ?4)'
      ).bind(name, key, url, 'image/*').run();

      return json({ ok: true });
    }

    if (context.request.method === 'PUT') {
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

    if (context.request.method === 'DELETE') {
      const id = Number(body?.id);
      if (!id) return badRequest('id is required');

      await db.prepare('DELETE FROM camera_assets WHERE id = ?1').bind(id).run();
      return json({ ok: true });
    }

    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const table = TABLES[type];
  if (!table) return badRequest('Unknown reference type', 404);

  if (context.request.method === 'GET') {
    const rows = await db.prepare(`SELECT id, name, sort_order FROM ${table} ORDER BY sort_order, name`).all();
    return json({ items: rows.results || [] });
  }

  if (context.request.method === 'POST') {
    const name = normalizeText(body?.name);
    if (!name) return badRequest('name is required');

    await db.prepare(`INSERT INTO ${table} (name, sort_order) VALUES (?1, ?2)`)
      .bind(name, 100)
      .run();

    return json({ ok: true });
  }

  if (context.request.method === 'PUT') {
    const id = Number(body?.id);
    const name = normalizeText(body?.name);
    if (!id || !name) return badRequest('id and name are required');

    await db.prepare(`UPDATE ${table} SET name = ?1 WHERE id = ?2`)
      .bind(name, id)
      .run();

    return json({ ok: true });
  }

  if (context.request.method === 'DELETE') {
    const id = Number(body?.id);
    if (!id) return badRequest('id is required');

    await db.prepare(`DELETE FROM ${table} WHERE id = ?1`)
      .bind(id)
      .run();

    return json({ ok: true });
  }

  return json({ error: 'Method not allowed' }, { status: 405 });
}