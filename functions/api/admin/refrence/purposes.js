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
    const rows = await db.prepare('SELECT id, name, sort_order FROM camera_purposes ORDER BY sort_order, name').all();
    return json({ items: rows.results || [] });
  }

  if (method === 'POST') {
    const name = normalizeText(body?.name);
    if (!name) return badRequest('name is required');

    await db.prepare('INSERT INTO camera_purposes (name, sort_order) VALUES (?1, ?2)')
      .bind(name, 100)
      .run();

    return json({ ok: true });
  }

  if (method === 'PUT') {
    const id = Number(body?.id);
    const name = normalizeText(body?.name);
    if (!id || !name) return badRequest('id and name are required');

    await db.prepare('UPDATE camera_purposes SET name = ?1 WHERE id = ?2')
      .bind(name, id)
      .run();

    return json({ ok: true });
  }

  if (method === 'DELETE') {
    const id = Number(body?.id);
    if (!id) return badRequest('id is required');

    await db.prepare('DELETE FROM camera_purposes WHERE id = ?1')
      .bind(id)
      .run();

    return json({ ok: true });
  }

  return json({ error: 'Method not allowed' }, { status: 405 });
}