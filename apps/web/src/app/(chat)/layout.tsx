import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@p4-chat/backend/convex/_generated/api';
import { convexAuthNextjsToken } from '@convex-dev/auth/nextjs/server';
import { cookies } from 'next/headers';
import type { SessionId } from 'convex-helpers/server/sessions';

export default async function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionId = (await cookies()).get('sessionId')?.value as SessionId | null;
  const sidebarOpen = (await cookies()).get('sidebarOpen')?.value === 'true';
  const token = { token: await convexAuthNextjsToken() };

  const [user, threads] = await Promise.allSettled([
    fetchQuery(api.user.currentUser, {}, token),
    sessionId
      ? fetchQuery(
          api.threads.getByUserIdOrSessionId,
          {
            sessionId,
          },
          token,
        )
      : fetchQuery(api.threads.getByUserId, {}, token),
  ]);

  return (
    <SidebarProvider className="relative" defaultOpen={sidebarOpen}>
      <SidebarTrigger className="absolute left-4.5 top-4.5 z-50" />

      <AppSidebar
        serverUser={user.status === 'fulfilled' ? user.value : null}
        serverThreads={threads.status === 'fulfilled' ? threads.value : []}
      />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
