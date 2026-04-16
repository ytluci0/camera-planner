import { cookieHeaders, json } from '../_lib/utils';

export async function onRequestPost(context) {
  const sessionCookieName = context.env.SESSION_COOKIE_NAME || 'camplanner_session';
  return json({ ok: true }, {
    headers: {
      'Set-Cookie': cookieHeaders(sessionCookieName, '', { maxAge: 0, sameSite: 'Lax' })
    }
  });
}
