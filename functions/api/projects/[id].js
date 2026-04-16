import { badRequest, json, readJson, requirePermission } from '../_lib/utils';

export async function onRequestGet(context) {
  const auth = await requirePermission(context, 'projects:view');
  if (auth.error) return auth.error;

  const id = Number(context.params.id);
  const row = await context.env.CAMERA_DB.prepare(`
    SELECT id, name, event_date, event_time, sport_type, payload_json, created_at, updated_at
    FROM projects WHERE id = ?1 LIMIT 1
  `).bind(id).first();

  if (!row) return json({ error: 'Project not found.' }, { status: 404 });
  return json({ project: { ...row, payload_json: row.payload_json ? JSON.parse(row.payload_json) : null } });
}

export async function onRequestPut(context) {
  const auth = await requirePermission(context, 'projects:edit');
  if (auth.error) return auth.error;

  const id = Number(context.params.id);
  if (!id) return badRequest('Invalid project id.');
  const body = await readJson(context.request);
  if (!body?.name) return badRequest('Project name is required.');

  const payloadJson = JSON.stringify(body.payload_json || {});
  const row = await context.env.CAMERA_DB.prepare(`
    UPDATE projects
    SET name = ?1,
        event_date = ?2,
        event_time = ?3,
        sport_type = ?4,
        payload_json = ?5,
        updated_by = ?6,
        updated_at = datetime('now')
    WHERE id = ?7
    RETURNING id, name, event_date, event_time, sport_type, payload_json, updated_at
  `).bind(
    body.name,
    body.event_date || null,
    body.event_time || null,
    body.sport_type || 'football',
    payloadJson,
    auth.user.id,
    id
  ).first();

  if (!row) return json({ error: 'Project not found.' }, { status: 404 });
  return json({ project: { ...row, payload_json: row.payload_json ? JSON.parse(row.payload_json) : null } });
}

export async function onRequestDelete(context) {
  const auth = await requirePermission(context, 'projects:edit');
  if (auth.error) return auth.error;
  const id = Number(context.params.id);
  await context.env.CAMERA_DB.prepare('DELETE FROM projects WHERE id = ?1').bind(id).run();
  return json({ ok: true });
}
