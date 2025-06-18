import { convexAuthNextjsToken } from '@convex-dev/auth/nextjs/server';
import { fetchQuery } from 'convex/nextjs';
import { InfoIcon } from 'lucide-react';
import Image from 'next/image';
import { api } from '@p4-chat/backend/convex/_generated/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GitHub } from '@/icons/github';
import { ApiKeys } from '@/components/api-keys';
import { SettingsHeader } from '@/components/settings-header';
import { redirect } from 'next/navigation';
import { SettingsAttachments } from '@/components/settings-attachments';

export default async function SettingsPage() {
  const user = await fetchQuery(
    api.user.currentUser,
    {},
    {
      token: await convexAuthNextjsToken(),
    },
  );

  if (!user) {
    redirect('/');
  }

  return (
    <div className="max-h-screen w-full overflow-y-auto" style={{ scrollbarGutter: 'stable' }}>
      <div className="inset-0 -z-50 dark:bg-sidebar !fixed">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(closest-corner at 180px 36px, rgba(255, 255, 255, 0.17), rgba(255, 255, 255, 0)), linear-gradient(rgb(254, 247, 255) 15%, rgb(244, 214, 250))',
          }}
        ></div>
        <div className="absolute inset-0 bg-noise"></div>
      </div>

      <div className="mx-auto flex max-w-[1200px] flex-col overflow-y-auto px-4 pb-24 pt-safe-offset-6 md:px-6 lg:px-8">
        <SettingsHeader />

        <div className="flex flex-grow flex-col gap-4 md:flex-row">
          <div className="hidden space-y-8 md:block md:w-1/4 shrink-0">
            <div className="relative text-center">
              {user?.image && (
                <Image
                  alt="Profile picture"
                  loading="lazy"
                  width="160"
                  height="160"
                  decoding="async"
                  className="mx-auto rounded-full transition-opacity duration-200"
                  style={{ color: 'transparent' }}
                  src={user?.image}
                />
              )}
              <h1 className="mt-4 text-2xl font-bold transition-opacity duration-200">{user?.name}</h1>
              <div className="relative flex items-center justify-center">
                <p className="break-all text-muted-foreground transition-opacity duration-200"></p>
              </div>
              <p className="break-all text-muted-foreground">{user?.email}</p>
              <span className="mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-primary text-primary-foreground">
                Open Source
              </span>
            </div>
            <div className="space-y-6 rounded-lg bg-card p-4">
              <span className="text-sm font-semibold">Keyboard Shortcuts</span>
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Search</span>
                  <div className="flex gap-1">
                    <kbd className="rounded bg-background px-2 py-1 font-sans text-sm">⌘</kbd>
                    <kbd className="rounded bg-background px-2 py-1 font-sans text-sm">K</kbd>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">New Chat</span>
                  <div className="flex gap-1">
                    <kbd className="rounded bg-background px-2 py-1 font-sans text-sm">⌘</kbd>
                    <kbd className="rounded bg-background px-2 py-1 font-sans text-sm">Shift</kbd>
                    <kbd className="rounded bg-background px-2 py-1 font-sans text-sm">O</kbd>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Toggle Sidebar</span>
                  <div className="flex gap-1">
                    <kbd className="rounded bg-background px-2 py-1 font-sans text-sm">⌘</kbd>
                    <kbd className="rounded bg-background px-2 py-1 font-sans text-sm">B</kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="md:w-3/4 md:pl-12">
            <div dir="ltr" data-orientation="horizontal" className="space-y-6">
              <Tabs defaultValue="api-key" className="w-full">
                <TabsList>
                  <TabsTrigger value="api-key">API Key</TabsTrigger>
                  <TabsTrigger value="attachments">Attachments</TabsTrigger>
                  <TabsTrigger value="about">About</TabsTrigger>
                </TabsList>
                <TabsContent value="api-key">
                  <div className="mt-2 space-y-8">
                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold">API Key</h2>
                      <ApiKeys />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="attachments">
                  <div className="mt-2 space-y-4">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-bold">Attachments</h2>
                      <p className="mt-2 text-sm text-muted-foreground/80 sm:text-base">
                        Manage your uploaded files and attachments. Note that deleting files here will remove them from the relevant
                        threads, but not delete the threads. This may lead to unexpected behavior if you delete a file that is still being
                        used in a thread.
                      </p>
                    </div>

                    <SettingsAttachments />
                  </div>
                </TabsContent>
                <TabsContent value="about">
                  <div className="mt-2 space-y-8">
                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold">About P4 Chat</h2>
                      <div className="space-y-4 md:max-w-lg">
                        <a
                          rel="noopener noreferrer"
                          className="block rounded-lg border border-secondary p-4 transition-colors hover:bg-secondary/40"
                          href="https://github.com/paulomenezes/p4-chat"
                          target="_blank"
                        >
                          <div className="flex items-center gap-4">
                            <GitHub className="h-5 w-5 text-primary" />
                            <div>
                              <h3 className="font-medium">GitHub</h3>
                              <p className="text-sm text-muted-foreground/80">View the source code and contribute to P4 Chat</p>
                            </div>
                          </div>
                        </a>
                        <div className="block rounded-lg border border-secondary p-4 transition-colors hover:bg-secondary/40">
                          <div className="flex items-center gap-4">
                            <InfoIcon className="size-5 text-primary shrink-0" />
                            <div>
                              <h3 className="font-medium">About</h3>
                              <p className="text-sm text-muted-foreground/80">
                                P4 Chat is an open-source project built with Next.js, Shadcn UI, and Convex. It was created to participate
                                the{' '}
                                <a href="https://cloneathon.t3.chat/" target="_blank" rel="noopener noreferrer" className="underline">
                                  T3 Cloneathon
                                </a>
                                .
                              </p>
                              <p className="text-sm text-muted-foreground/80 mt-2">
                                The project was created by{' '}
                                <a href="https://github.com/paulomenezes" target="_blank" rel="noopener noreferrer" className="underline">
                                  Paulo Menezes
                                </a>{' '}
                                and built entirely in the period of the event.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
