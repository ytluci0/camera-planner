export function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...init.headers
    },
    status: init.status || 200
  });
}

export function badRequest(message, status = 400) {
  return json({ error: message }, { status });
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function getCookie(request, name) {
  const cookie = request.headers.get('cookie') || '';
  const part = cookie.split(';').map((v) => v.trim()).find((v) => v.startsWith(`${name}=`));
  return part ? decodeURIComponent(part.split('=').slice(1).join('=')) : null;
}

export function cookieHeaders(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  parts.push(`Path=${options.path || '/'}`);
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  if (options.httpOnly !== false) parts.push('HttpOnly');
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  if (options.secure !== false) parts.push('Secure');
  return parts.join('; ');
}

export async function sha256(input) {
  const bytes = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function requireUser(context) {
  const sessionCookieName = context.env.SESSION_COOKIE_NAME || 'camplanner_session';
  const token = getCookie(context.request, sessionCookieName);
  if (!token) return null;

  const sessionHash = await sha256(token);
  const query = `
    SELECT u.id, u.name, u.email, r.name AS role_name
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    LEFT JOIN roles r ON r.id = u.role_id
    WHERE s.token_hash = ?1 AND s.expires_at > datetime('now')
    LIMIT 1
  `;
  const session = await context.env.CAMERA_DB.prepare(query).bind(sessionHash).first();
  if (!session) return null;

  const perms = await context.env.CAMERA_DB.prepare(`
    SELECT p.code
    FROM permissions p
    JOIN role_permissions rp ON rp.permission_id = p.id
    JOIN roles r ON r.id = rp.role_id
    JOIN users u ON u.role_id = r.id
    WHERE u.id = ?1
  `).bind(session.id).all();

  return {
    ...session,
    permissions: (perms.results || []).map((row) => row.code)
  };
}

export async function requirePermission(context, permission) {
  const user = await requireUser(context);
  if (!user) return { error: json({ error: 'Unauthorized' }, { status: 401 }) };
  if (user.role_name !== 'admin' && !user.permissions.includes(permission)) {
    return { error: json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { user };
}
