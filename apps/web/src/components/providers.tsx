'use client';

import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ThemeProvider } from './theme-provider';
import { Toaster } from './ui/sonner';
import { TooltipProvider } from './ui/tooltip';
import { ConvexAuthNextjsProvider } from '@convex-dev/auth/nextjs';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConvexAuthNextjsProvider client={convex}>
      <TooltipProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster richColors />
        </ThemeProvider>
      </TooltipProvider>
    </ConvexAuthNextjsProvider>
  );
}
