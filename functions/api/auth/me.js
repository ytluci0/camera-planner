import { json } from '../_lib/utils';
import { requireUser } from '../_lib/utils';

export async function onRequestGet(context) {
  const user = await requireUser(context);
  return json({ user });
}
