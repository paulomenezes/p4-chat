'use client';

import * as React from 'react';
import { LogInIcon, PinIcon, SearchIcon, XIcon } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar';
import Link from 'next/link';
import { useConvexAuth, useQuery } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { api } from '@p4-chat/backend/convex/_generated/api';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { startOfDay, subDays, isAfter, isSameDay } from 'date-fns';
import type { Doc } from '@p4-chat/backend/convex/_generated/dataModel';
import { ThreadItem } from './thread-item';

type ThreadsGroup = {
  pinned?: Doc<'threads'>[];
  today?: Doc<'threads'>[];
  yesterday?: Doc<'threads'>[];
  last7Days?: Doc<'threads'>[];
  last30Days?: Doc<'threads'>[];
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const user = useQuery(api.user.currentUser);
  const threads = useQuery(api.theads.getByUserId);
  const [search, setSearch] = useState('');

  const threadsGroups = useMemo(() => {
    if (!threads) {
      return {} as ThreadsGroup;
    }

    const now = new Date();
    const today = startOfDay(now);
    const yesterday = subDays(today, 1);
    const last7Days = subDays(today, 7);
    const last30Days = subDays(today, 30);

    return threads
      .filter((thread) => thread.title.toLowerCase().includes(search.toLowerCase()))
      .reduce((acc, thread) => {
        const threadDate = new Date(thread._creationTime);

        if (thread.pinned) {
          acc.pinned = [...(acc.pinned || []), thread];
        } else if (isAfter(threadDate, today) || isSameDay(threadDate, today)) {
          acc.today = [...(acc.today || []), thread];
        } else if (isSameDay(threadDate, yesterday)) {
          acc.yesterday = [...(acc.yesterday || []), thread];
        } else if (isAfter(threadDate, last7Days)) {
          acc.last7Days = [...(acc.last7Days || []), thread];
        } else if (isAfter(threadDate, last30Days)) {
          acc.last30Days = [...(acc.last30Days || []), thread];
        }

        return acc;
      }, {} as ThreadsGroup);
  }, [threads, search]);

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <h1 className="flex h-8 shrink-0 items-center justify-center text-lg text-muted-foreground transition-opacity delay-75 duration-75">
          <Link className="relative flex h-8 w-24 items-center justify-center text-sm font-semibold text-foreground" href="/">
            <span className="text-primary ml-1.5 font-extrabold text-lg">p4-chat</span>
          </Link>
        </h1>
        <div className="px-1">
          <Link
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border-reflect button-reflect rounded-lg bg-[rgb(162,59,103)] p-2 font-semibold text-primary-foreground shadow hover:bg-[#d56698] active:bg-[rgb(162,59,103)] disabled:hover:bg-[rgb(162,59,103)] disabled:active:bg-[rgb(162,59,103)] dark:bg-primary/20 dark:hover:bg-pink-800/70 dark:active:bg-pink-800/40 disabled:dark:hover:bg-primary/20 disabled:dark:active:bg-primary/20 h-9 px-4 py-2 w-full select-none text-sm"
            href="/"
          >
            <span className="w-full select-none text-center">New Chat</span>
          </Link>
        </div>
        <div className="border-b border-chat-border px-3">
          <div className="flex items-center">
            <SearchIcon className="-ml-[3px] mr-3 !size-4 text-muted-foreground" />

            <input
              role="searchbox"
              aria-label="Search threads"
              placeholder="Search your threads..."
              className="w-full bg-transparent py-2 text-sm text-foreground placeholder-muted-foreground/50 placeholder:select-none focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
              <button className="ml-2 rounded-md p-1 text-muted-foreground hover:bg-muted/40" onClick={() => setSearch('')}>
                <XIcon className="size-4" />
              </button>
            )}
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div
          style={{ overflowAnchor: 'none', flex: '0 0 auto', position: 'relative', visibility: 'hidden', width: '100%', height: '616px' }}
        >
          <div style={{ position: 'absolute', width: '100%', left: '0px', top: '0px', visibility: 'visible' }}>
            {threadsGroups.pinned && (
              <div data-sidebar="group" className="relative flex w-full min-w-0 flex-col p-2">
                <div
                  data-sidebar="group-label"
                  className="flex h-8 shrink-0 select-none items-center rounded-md text-xs font-medium outline-none ring-sidebar-ring transition-[margin,opa] duration-200 ease-snappy focus-visible:ring-2 [&amp;&gt;svg]:size-4 [&amp;&gt;svg]:shrink-0 group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 px-1.5 text-color-heading"
                >
                  <PinIcon className="-ml-0.5 mr-1 mt-px !size-3" />
                  Pinned
                </div>
                <div className="w-full text-sm gap-1 flex flex-col">
                  {threadsGroups.pinned?.map((thread) => <ThreadItem key={thread._id} thread={thread} />)}
                </div>
              </div>
            )}
            {threadsGroups.today && (
              <div data-sidebar="group" className="relative flex w-full min-w-0 flex-col p-2">
                <div
                  data-sidebar="group-label"
                  className="flex h-8 shrink-0 select-none items-center rounded-md text-xs font-medium outline-none ring-sidebar-ring transition-[margin,opa] duration-200 ease-snappy focus-visible:ring-2 [&amp;&gt;svg]:size-4 [&amp;&gt;svg]:shrink-0 group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 px-1.5 text-color-heading"
                >
                  <span>Today</span>
                </div>
                <div className="w-full text-sm gap-1 flex flex-col">
                  {threadsGroups.today?.map((thread) => <ThreadItem key={thread._id} thread={thread} />)}
                </div>
              </div>
            )}
            {threadsGroups.yesterday && (
              <div data-sidebar="group" className="relative flex w-full min-w-0 flex-col p-2">
                <div
                  data-sidebar="group-label"
                  className="flex h-8 shrink-0 select-none items-center rounded-md text-xs font-medium outline-none ring-sidebar-ring transition-[margin,opa] duration-200 ease-snappy focus-visible:ring-2 [&amp;&gt;svg]:size-4 [&amp;&gt;svg]:shrink-0 group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 px-1.5 text-color-heading"
                >
                  <span>Yesterday</span>
                </div>
                <div className="w-full text-sm gap-1 flex flex-col">
                  {threadsGroups.yesterday?.map((thread) => <ThreadItem key={thread._id} thread={thread} />)}
                </div>
              </div>
            )}
            {threadsGroups.last7Days && (
              <div data-sidebar="group" className="relative flex w-full min-w-0 flex-col p-2">
                <div
                  data-sidebar="group-label"
                  className="flex h-8 shrink-0 select-none items-center rounded-md text-xs font-medium outline-none ring-sidebar-ring transition-[margin,opa] duration-200 ease-snappy focus-visible:ring-2 [&amp;&gt;svg]:size-4 [&amp;&gt;svg]:shrink-0 group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 px-1.5 text-color-heading"
                >
                  <span>Last 7 Days</span>
                </div>
                <div className="w-full text-sm gap-1 flex flex-col">
                  {threadsGroups.last7Days?.map((thread) => <ThreadItem key={thread._id} thread={thread} />)}
                </div>
              </div>
            )}
            {threadsGroups.last30Days && (
              <div data-sidebar="group" className="relative flex w-full min-w-0 flex-col p-2">
                <div
                  data-sidebar="group-label"
                  className="flex h-8 shrink-0 select-none items-center rounded-md text-xs font-medium outline-none ring-sidebar-ring transition-[margin,opa] duration-200 ease-snappy focus-visible:ring-2 [&amp;&gt;svg]:size-4 [&amp;&gt;svg]:shrink-0 group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 px-1.5 text-color-heading"
                >
                  <span>Last 30 Days</span>
                </div>
                <div className="w-full text-sm gap-1 flex flex-col">
                  {threadsGroups.last30Days?.map((thread) => <ThreadItem key={thread._id} thread={thread} />)}
                </div>
              </div>
            )}
          </div>
        </div>
      </SidebarContent>
      <SidebarFooter>
        {isAuthenticated && user ? (
          <button
            aria-label="Go to settings"
            role="button"
            className="flex select-none flex-row items-center justify-between gap-3 rounded-lg px-3 py-3 hover:bg-sidebar-accent focus:bg-sidebar-accent focus:outline-2 text-left"
            onClick={() => signOut()}
          >
            <div className="flex w-full min-w-0 flex-row items-center gap-3">
              <Image
                alt={user.name ?? 'User'}
                src={user.image ?? ''}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full ring-1 ring-muted-foreground/20"
                style={{ color: 'transparent' }}
              />
              <div className="flex min-w-0 flex-col text-foreground">
                <span className="truncate text-sm font-medium">{user.name}</span>
                <span className="text-xs">Pro</span>
              </div>
            </div>
          </button>
        ) : (
          <Link
            aria-label="Login"
            role="button"
            className="flex w-full select-none items-center gap-4 rounded-lg p-4 text-muted-foreground hover:bg-sidebar-accent"
            href="/auth"
          >
            <LogInIcon className="size-4" />
            <span>Login</span>
          </Link>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
