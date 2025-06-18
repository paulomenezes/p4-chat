'use client';

import { ConvexReactClient } from 'convex/react';
import { ThemeProvider } from './theme-provider';
import { Toaster } from './ui/sonner';
import { TooltipProvider } from './ui/tooltip';
import { ConvexAuthNextjsProvider } from '@convex-dev/auth/nextjs';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { ConvexQueryCacheProvider } from 'convex-helpers/react/cache/provider';
import { SessionProvider } from 'convex-helpers/react/sessions';
import { useLocalStorage } from 'usehooks-ts';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <ConvexAuthNextjsProvider client={convex}>
      <QueryClientProvider client={queryClient}>
        <ConvexQueryCacheProvider>
          <SessionProvider ssrFriendly useStorage={useLocalStorage}>
            <TooltipProvider>
              <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
                <NuqsAdapter>{children}</NuqsAdapter>
                <Toaster richColors />
              </ThemeProvider>
            </TooltipProvider>
          </SessionProvider>
        </ConvexQueryCacheProvider>
      </QueryClientProvider>
    </ConvexAuthNextjsProvider>
  );
}
