import { Chat } from '@/components/chat';
import { convexAuthNextjsToken } from '@convex-dev/auth/nextjs/server';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@p4-chat/backend/convex/_generated/api';

export default async function Home() {
  const user = await fetchQuery(
    api.user.currentUser,
    {},
    {
      token: await convexAuthNextjsToken(),
    },
  );

  return <Chat serverUser={user} />;
}
