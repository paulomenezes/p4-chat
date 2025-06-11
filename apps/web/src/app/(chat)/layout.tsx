import { SidebarInset } from '@/components/ui/sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { fetchMutation, fetchQuery } from 'convex/nextjs';
import { api } from '@p4-chat/backend/convex/_generated/api';
import { convexAuthNextjsToken } from '@convex-dev/auth/nextjs/server';

export default async function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, threads] = await Promise.all([
    fetchQuery(
      api.user.currentUser,
      {},
      {
        token: await convexAuthNextjsToken(),
      },
    ),
    fetchQuery(
      api.theads.getByUserId,
      {},
      {
        token: await convexAuthNextjsToken(),
      },
    ),
  ]);

  return (
    <SidebarProvider>
      <AppSidebar serverUser={user} serverThreads={threads} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
