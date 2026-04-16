import { badRequest, json, readJson, requirePermission } from '../_lib/utils';

export async function onRequestGet(context) {
  const auth = await requirePermission(context, 'projects:view');
  if (auth.error) return auth.error;

  const limit = Number(new URL(context.request.url).searchParams.get('limit') || 20);
  const result = await context.env.CAMERA_DB.prepare(`
    SELECT id, name, event_date, event_time, sport_type, payload_json, created_at, updated_at
    FROM projects
    ORDER BY updated_at DESC, id DESC
    LIMIT ?1
  `).bind(Math.max(1, Math.min(limit, 100))).all();

  const projects = (result.results || []).map((row) => ({
    ...row,
    payload_json: row.payload_json ? JSON.parse(row.payload_json) : null
  }));

  return json({ projects });
}

export async function onRequestPost(context) {
  const auth = await requirePermission(context, 'projects:edit');
  if (auth.error) return auth.error;

  const body = await readJson(context.request);
  if (!body?.name) return badRequest('Project name is required.');

  const payloadJson = JSON.stringify(body.payload_json || {});
  const result = await context.env.CAMERA_DB.prepare(`
    INSERT INTO projects (name, event_date, event_time, sport_type, payload_json, created_by, updated_by)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?6)
    RETURNING id, name, event_date, event_time, sport_type, payload_json
  `).bind(
    body.name,
    body.event_date || null,
    body.event_time || null,
    body.sport_type || 'football',
    payloadJson,
    auth.user.id
  ).first();

  return json({
    project: {
      ...result,
      payload_json: result.payload_json ? JSON.parse(result.payload_json) : null
    }
  }, { status: 201 });
}
