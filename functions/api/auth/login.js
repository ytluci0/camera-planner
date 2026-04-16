import { badRequest, cookieHeaders, json, randomToken, readJson, sha256 } from '../_lib/utils';

export async function onRequestPost(context) {
  const body = await readJson(context.request);
  if (!body?.email || !body?.password) return badRequest('Email and password are required.');

  const email = String(body.email).trim().toLowerCase();
  const passwordHash = await sha256(String(body.password));

  const user = await context.env.CAMERA_DB.prepare(`
    SELECT u.id, u.name, u.email, u.password_hash, r.name AS role_name
    FROM users u
    LEFT JOIN roles r ON r.id = u.role_id
    WHERE lower(u.email) = ?1
    LIMIT 1
  `).bind(email).first();

  if (!user || user.password_hash !== passwordHash) {
    return json({ error: 'Invalid email or password.' }, { status: 401 });
  }

  const token = await randomToken();
  const tokenHash = await sha256(token);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString();

  await context.env.CAMERA_DB.prepare(`
    INSERT INTO sessions (user_id, token_hash, expires_at)
    VALUES (?1, ?2, ?3)
  `).bind(user.id, tokenHash, expiresAt).run();

  const permissions = await context.env.CAMERA_DB.prepare(`
    SELECT p.code
    FROM permissions p
    JOIN role_permissions rp ON rp.permission_id = p.id
    JOIN roles r ON r.id = rp.role_id
    WHERE r.name = ?1
  `).bind(user.role_name).all();

  const sessionCookieName = context.env.SESSION_COOKIE_NAME || 'camplanner_session';
  return json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role_name: user.role_name,
      permissions: (permissions.results || []).map((row) => row.code)
    }
  }, {
    headers: {
      'Set-Cookie': cookieHeaders(sessionCookieName, token, { maxAge: 60 * 60 * 24 * 14, sameSite: 'Lax' })
    }
  });
}
