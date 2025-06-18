import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '../index.css';
import Providers from '@/components/providers';
import { ConvexAuthNextjsServerProvider } from '@convex-dev/auth/nextjs/server';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'p4-chat',
  description: 'p4-chat',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <ConvexAuthNextjsServerProvider>
        <body
          className={`proportional-nums selection:bg-primary selection:text-white font-sans ${geistSans.variable} ${geistMono.variable} antialiased`}
          suppressHydrationWarning
        >
          <Providers>{children}</Providers>
        </body>
      </ConvexAuthNextjsServerProvider>
    </html>
  );
}
