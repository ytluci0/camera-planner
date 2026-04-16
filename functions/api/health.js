import { json } from './_lib/utils';

export async function onRequestGet(context) {
  const dbCheck = await context.env.CAMERA_DB.prepare('SELECT 1 AS ok').first();
  return json({ ok: true, db: dbCheck?.ok === 1, app: context.env.APP_NAME || 'Camera Planner' });
}
