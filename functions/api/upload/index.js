import { json, requirePermission } from '../_lib/utils';

export async function onRequestPost(context) {
  const auth = await requirePermission(context, 'projects:edit');
  if (auth.error) return auth.error;

  const form = await context.request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return json({ error: 'No file uploaded.' }, { status: 400 });
  }

  const key = `camera-assets/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  await context.env.CAMERA_ASSETS.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type || 'application/octet-stream' }
  });

  const publicBaseUrl = context.env.PUBLIC_R2_BASE_URL || '';
  return json({
    ok: true,
    key,
    url: publicBaseUrl ? `${publicBaseUrl}/${key}` : key,
    uploadedBy: auth.user.email
  }, { status: 201 });
}
