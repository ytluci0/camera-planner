import { badRequest, json, readJson, requirePermission } from '../../_lib/utils';

function normalizeText(value) {
  return String(value || '').trim();
}

export async function onRequestGet(context) {
  const auth = await requirePermission(context, 'reference:manage');
  if (auth.error) return auth.error;

  const db = context.env.CAMERA_DB;
  const rows = await db.prepare('SELECT id, name, sort_order FROM lenses ORDER BY sort_order, name').all();
  return json({ items: rows.results || [] });
}

export async function onRequestPost(context) {
  const auth = await requirePermission(context, 'reference:manage');
  if (auth.error) return auth.error;

  const body = await readJson(context.request);
  const name = normalizeText(body?.name);
  if (!name) return badRequest('name is required');

  const db = context.env.CAMERA_DB;
  await db.prepare('INSERT INTO lenses (name, sort_order) VALUES (?1, ?2)')
    .bind(name, 100)
    .run();

  return json({ ok: true });
}

export async function onRequestPut(context) {
  const auth = await requirePermission(context, 'reference:manage');
  if (auth.error) return auth.error;

  const body = await readJson(context.request);
  const id = Number(body?.id);
  const name = normalizeText(body?.name);
  if (!id || !name) return badRequest('id and name are required');

  const db = context.env.CAMERA_DB;
  await db.prepare('UPDATE lenses SET name = ?1 WHERE id = ?2')
    .bind(name, id)
    .run();

  return json({ ok: true });
}

export async function onRequestDelete(context) {
  const auth = await requirePermission(context, 'reference:manage');
  if (auth.error) return auth.error;

  const body = await readJson(context.request);
  const id = Number(body?.id);
  if (!id) return badRequest('id is required');

  const db = context.env.CAMERA_DB;
  await db.prepare('DELETE FROM lenses WHERE id = ?1')
    .bind(id)
    .run();

  return json({ ok: true });
}