'use client';

import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { useQuery } from 'convex/react';
import { api } from '@p4-chat/backend/convex/_generated/api';
import Link from 'next/link';

export function NavMain() {
  const threads = useQuery(api.theads.getByUserId);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {threads?.map((thread) => (
          <SidebarMenuItem key={thread._id}>
            <SidebarMenuButton asChild tooltip={thread.title}>
              <Link href={`/?chat=${thread._id}`}>
                <span>{thread.title || 'New Chat'}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
