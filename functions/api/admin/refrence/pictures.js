import { badRequest, json, readJson, requirePermission } from '../../_lib/utils';

function normalizeText(value) {
  return String(value || '').trim();
}

export async function onRequestGet(context) {
  const auth = await requirePermission(context, 'reference:manage');
  if (auth.error) return auth.error;

  const db = context.env.CAMERA_DB;
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

export async function onRequestPost(context) {
  const auth = await requirePermission(context, 'reference:manage');
  if (auth.error) return auth.error;

  const body = await readJson(context.request);
  const name = normalizeText(body?.name);
  const key = normalizeText(body?.key);
  const url = normalizeText(body?.url);

  if (!name || !key || !url) return badRequest('name, key, and url are required');

  const db = context.env.CAMERA_DB;
  await db.prepare(
    'INSERT INTO camera_assets (file_name, r2_key, public_url, content_type) VALUES (?1, ?2, ?3, ?4)'
  ).bind(name, key, url, 'image/*').run();

  return json({ ok: true });
}

export async function onRequestPut(context) {
  const auth = await requirePermission(context, 'reference:manage');
  if (auth.error) return auth.error;

  const body = await readJson(context.request);
  const id = Number(body?.id);
  const name = normalizeText(body?.name);
  const key = normalizeText(body?.key);
  const url = normalizeText(body?.url);

  if (!id || !name || !key || !url) return badRequest('id, name, key, and url are required');

  const db = context.env.CAMERA_DB;
  await db.prepare(
    'UPDATE camera_assets SET file_name = ?1, r2_key = ?2, public_url = ?3 WHERE id = ?4'
  ).bind(name, key, url, id).run();

  return json({ ok: true });
}

export async function onRequestDelete(context) {
  const auth = await requirePermission(context, 'reference:manage');
  if (auth.error) return auth.error;

  const body = await readJson(context.request);
  const id = Number(body?.id);
  if (!id) return badRequest('id is required');

  const db = context.env.CAMERA_DB;
  await db.prepare('DELETE FROM camera_assets WHERE id = ?1')
    .bind(id)
    .run();

  return json({ ok: true });
}