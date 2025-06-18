import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@p4-chat/backend/convex/_generated/api';
import { convexAuthNextjsToken } from '@convex-dev/auth/nextjs/server';
import { cookies } from 'next/headers';
import type { SessionId } from 'convex-helpers/server/sessions';
import { Suspense } from 'react';

export const experimental_ppr = true;

export default async function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookiesData = await cookies();
  const sessionId = cookiesData.get('sessionId')?.value as SessionId | null;
  const sidebarOpen = (cookiesData.get('sidebarOpen')?.value ?? 'true') === 'true';

  return (
    <SidebarProvider className="relative" defaultOpen={sidebarOpen}>
      <SidebarTrigger className="absolute left-4.5 top-4.5 z-50" />

      <Suspense fallback={<AppSidebar serverUser={null} serverThreads={[]} />}>
        <ChatLayoutSidebar sessionId={sessionId} />
      </Suspense>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}

async function ChatLayoutSidebar({
  sessionId,
}: Readonly<{
  sessionId: SessionId | null;
}>) {
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
    <AppSidebar
      serverUser={user.status === 'fulfilled' ? user.value : null}
      serverThreads={threads.status === 'fulfilled' ? threads.value : []}
    />
  );
}
