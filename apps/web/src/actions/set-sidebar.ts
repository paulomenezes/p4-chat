'use server';

import { cookies } from 'next/headers';

export async function setSidebarOpenCookie(open: boolean) {
  const cookieStore = await cookies();

  cookieStore.set('sidebarOpen', open.toString(), { secure: true, httpOnly: true });
}
