import { ImageIcon } from 'lucide-react';

export function Loading() {
  return (
    <div className="flex items-center space-x-2">
      <div className="h-2 w-2 animate-bounce rounded-full bg-secondary-foreground/40 [animation-delay:-0.3s]" />
      <div className="h-2 w-2 animate-bounce rounded-full bg-secondary-foreground/40 [animation-delay:-0.15s]" />
      <div className="h-2 w-2 animate-bounce rounded-full bg-secondary-foreground/40" />
    </div>
  );
}

export function LoadingImage() {
  return (
    <div className="bg-sidebar-background size-[300px] flex justify-center items-center rounded-md">
      <ImageIcon className="size-10 text-muted-foreground" />
    </div>
  );
}
