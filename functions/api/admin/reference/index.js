import { json, requirePermission } from '../../_lib/utils';

export async function onRequestGet(context) {
  const auth = await requirePermission(context, 'reference:manage');
  if (auth.error) return auth.error;

  const db = context.env.CAMERA_DB;

  const [cameraTypes, cameraPurposes, lenses, pictures] = await Promise.all([
    db.prepare('SELECT id, name, sort_order FROM camera_types ORDER BY sort_order, name').all(),
    db.prepare('SELECT id, name, sort_order FROM camera_purposes ORDER BY sort_order, name').all(),
    db.prepare('SELECT id, name, sort_order FROM lenses ORDER BY sort_order, name').all(),
    db.prepare('SELECT id, file_name, r2_key, public_url FROM camera_assets ORDER BY id DESC').all()
  ]);

  return json({
    cameraTypes: cameraTypes.results || [],
    cameraPurposes: cameraPurposes.results || [],
    lenses: lenses.results || [],
    pictures: (pictures.results || []).map((row) => ({
      id: row.id,
      name: row.file_name,
      key: row.r2_key,
      url: row.public_url || ''
    }))
  });
}