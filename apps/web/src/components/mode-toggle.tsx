'use client';

import * as React from 'react';
import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button tabIndex={-1} onClick={() => setTheme((v) => (v === 'light' ? 'dark' : 'light'))} size="icon" variant="ghost">
      {theme === 'light' ? (
        <MoonIcon className="size-4 rotate-0 scale-100 transition-all duration-200" />
      ) : (
        <SunIcon className="size-4 rotate-0 scale-100 transition-all duration-200" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
