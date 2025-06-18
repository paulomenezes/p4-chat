'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { useAuthActions } from '@convex-dev/auth/react';
import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';

export default function AuthPage() {
  const { signIn } = useAuthActions();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="inset-0 -z-50 dark:bg-sidebar !fixed">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(closest-corner at 120px 36px, rgba(255, 255, 255, 0.17), rgba(255, 255, 255, 0)), linear-gradient(rgb(254, 247, 255) 15%, rgb(244, 214, 250))',
          }}
        ></div>
        <div className="absolute inset-0 bg-noise"></div>
      </div>
      <div className="absolute left-4 top-4">
        <Link
          href="/"
          className={buttonVariants({
            variant: 'ghost',
          })}
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Chat
        </Link>
      </div>
      <h1 className="mb-5 h-5 text-xl font-bold text-foreground">
        Welcome to
        <span className="text-primary ml-1.5 font-extrabold">p4-chat</span>
      </h1>
      <div className="mb-8 text-center text-muted-foreground">
        <p className="">Sign in below (but I can&apos;t increase your message limits if you do 🥲)</p>
      </div>
      <div className="w-full max-w-sm">
        <Button className="px-4 py-2 h-14 w-full text-lg" onClick={() => signIn('google', { redirectTo: '/' })}>
          <svg className="mr-3 h-6 w-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="white"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            ></path>
            <path
              fill="white"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            ></path>
            <path
              fill="white"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            ></path>
            <path
              fill="white"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            ></path>
          </svg>
          Continue with Google
        </Button>
      </div>
      <div className="mt-6 text-center text-sm text-muted-foreground/60">
        <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
      </div>
    </div>
  );
}
