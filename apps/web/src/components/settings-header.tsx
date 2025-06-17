'use client';

import { ArrowLeftIcon } from 'lucide-react';
import { ModeToggle } from './mode-toggle';
import { useAuthActions } from '@convex-dev/auth/react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';

export function SettingsHeader() {
  const { signOut } = useAuthActions();
  const router = useRouter();

  return (
    <header className="flex items-center justify-between pb-8">
      <Button onClick={() => router.back()} variant="ghost" size="sm" type="button">
        <ArrowLeftIcon className="mr-2 size-4" />
        Back to Chat
      </Button>
      <div className="flex flex-row items-center gap-2">
        <ModeToggle />
        <Button onClick={signOut} variant="ghost" size="sm" type="button">
          Sign out
        </Button>
      </div>
    </header>
  );
}
