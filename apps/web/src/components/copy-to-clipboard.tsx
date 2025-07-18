import { CheckIcon, CopyIcon, Loader2Icon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import type { Id } from '@p4-chat/backend/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { api } from '@p4-chat/backend/convex/_generated/api';

export function CopyToClipboard({ variant = 'secondary', content }: { content: string; variant?: 'secondary' | 'ghost' }) {
  const [copied, setCopied] = useState(false);

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy text');
    }
  }

  return (
    <Button variant={variant} aria-label="Copy to clipboard" onClick={copyToClipboard} size="icon">
      <div className="relative size-4">
        <CopyIcon
          className={`absolute inset-0 transition-all duration-200 ease-snappy ${copied ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        />
        <CheckIcon
          className={`absolute inset-0 transition-all duration-200 ease-snappy ${copied ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
        />
      </div>
    </Button>
  );
}

export function CopyImageToClipboard({ variant = 'secondary', storageId }: { storageId: Id<'_storage'>; variant?: 'secondary' | 'ghost' }) {
  const url = useQuery(api.files.getFileUrl, { storageId });
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function copyToClipboard() {
    if (!url?.url) {
      return;
    }

    setIsLoading(true);
    fetch(url.url)
      .then((res) => res.blob())
      .then(async (blob) => {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Copied to clipboard');
        setIsLoading(false);
      })
      .catch(() => {
        toast.error('Failed to copy image to clipboard');
        setIsLoading(false);
      });
  }

  return (
    <Button variant={variant} aria-label="Copy to clipboard" onClick={copyToClipboard} size="icon" disabled={isLoading}>
      <div className="relative size-4">
        {isLoading ? (
          <Loader2Icon className="absolute inset-0 size-4 animate-spin" />
        ) : (
          <>
            <CopyIcon
              className={`absolute inset-0 transition-all duration-200 ease-snappy ${copied ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
            />
            <CheckIcon
              className={`absolute inset-0 transition-all duration-200 ease-snappy ${copied ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
            />
          </>
        )}
      </div>
    </Button>
  );
}
