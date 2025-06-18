'use server';

import { cookies } from 'next/headers';

export async function setSessionIdCookie(sessionId: string) {
  const cookieStore = await cookies();

  cookieStore.set('sessionId', sessionId, { secure: true, httpOnly: true });
}
