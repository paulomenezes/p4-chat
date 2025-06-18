import { formatBytes } from '@/hooks/use-file-upload';
import { Loader2Icon, PaperclipIcon } from 'lucide-react';
import Image from 'next/image';

export function FileItem({
  isLoading,
  isImage,
  name,
  size,
  preview,
}: {
  isLoading: boolean | undefined;
  isImage: boolean | undefined;
  name: string;
  size: number;
  preview: string | undefined;
}) {
  return (
    <div className="flex items-center gap-3 overflow-hidden">
      {isLoading ? (
        <div className="bg-accent aspect-square shrink-0 rounded size-12 flex items-center justify-center">
          <Loader2Icon className="size-4 rounded-[inherit] object-contain m-1 animate-spin" />
        </div>
      ) : isImage && preview ? (
        <div className="bg-accent aspect-square shrink-0 rounded">
          <Image src={preview} alt={name} className="size-12 rounded-[inherit] object-cover" width={48} height={48} />
        </div>
      ) : (
        <PaperclipIcon className="size-4 rounded-[inherit] object-contain m-1" />
      )}

      {!isImage && (
        <div className="flex min-w-0 flex-col gap-0.5 items-start">
          <p className="truncate text-[13px] font-medium">{name}</p>
          <p className="text-muted-foreground text-xs">{formatBytes(size)}</p>
        </div>
      )}
    </div>
  );
}
