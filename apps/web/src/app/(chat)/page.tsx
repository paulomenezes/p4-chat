import { Chat } from '@/components/chat';
import { convexAuthNextjsToken } from '@convex-dev/auth/nextjs/server';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@p4-chat/backend/convex/_generated/api';
import type { SessionId } from 'convex-helpers/server/sessions';
import { cookies } from 'next/headers';

export default async function Home() {
  const [user, cookieResponse] = await Promise.all([
    fetchQuery(
      api.user.currentUser,
      {},
      {
        token: await convexAuthNextjsToken(),
      },
    ),
    cookies(),
  ]);
  const sessionId = cookieResponse.get('sessionId')?.value as SessionId | null;

  return <Chat serverUser={user} serverSessionId={sessionId} />;
}
