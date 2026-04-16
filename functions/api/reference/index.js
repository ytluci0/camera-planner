import { json, requirePermission } from '../_lib/utils';

export async function onRequestGet(context) {
  const auth = await requirePermission(context, 'projects:view');
  if (auth.error) return auth.error;

  const [cameraTypes, cameraPurposes, lenses] = await Promise.all([
    context.env.CAMERA_DB.prepare('SELECT id, name FROM camera_types ORDER BY sort_order, name').all(),
    context.env.CAMERA_DB.prepare('SELECT id, name FROM camera_purposes ORDER BY sort_order, name').all(),
    context.env.CAMERA_DB.prepare('SELECT id, name FROM lenses ORDER BY sort_order, name').all()
  ]);

  return json({
    cameraTypes: cameraTypes.results || [],
    cameraPurposes: cameraPurposes.results || [],
    lenses: lenses.results || []
  });
}
