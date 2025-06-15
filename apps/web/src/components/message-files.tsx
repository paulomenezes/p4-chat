import { api } from '@p4-chat/backend/convex/_generated/api';
import type { Id } from '@p4-chat/backend/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import Image from 'next/image';
import { Button } from './ui/button';
import { DownloadIcon, ExternalLinkIcon, XIcon } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { LoadingImage } from './loading';

export function MessageFiles({ files }: { files: Id<'_storage'>[] }) {
  if (files.length === 0) {
    return null;
  }

  return (
    <div>
      {files.map((file) => (
        <MessageFile key={file} file={file} />
      ))}
    </div>
  );
}

function MessageFile({ file }: { file: Id<'_storage'> }) {
  const url = useQuery(api.files.getImageUrl, { storageId: file });
  const [failed, setFailed] = useState(false);

  const download = useCallback(() => {
    if (!url) {
      return;
    }

    fetch(url)
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `image.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success('File downloaded successfully');
      })
      .catch(() => {
        toast.error('Failed to download file');
      });
  }, [url]);

  const openInNewTab = useCallback(() => {
    if (!url) {
      return;
    }

    window.open(url, '_blank');
  }, [url]);

  return failed ? (
    <div className="text-red-500">Failed to load file</div>
  ) : !url ? (
    <LoadingImage />
  ) : (
    <div className="flex flex-row gap-6 items-center">
      <Dialog>
        <DialogTrigger asChild>
          <Image src={url} alt="File" width={300} height={300} className="rounded-md cursor-pointer" onError={() => setFailed(true)} />
        </DialogTrigger>
        <DialogContent className="w-full max-w-4xl max-h-[90vh]" showCloseButton={false}>
          <DialogHeader>
            <div className="flex flex-row justify-between items-center">
              <DialogTitle>image.png</DialogTitle>

              <div className="flex flex-row gap-2">
                <Button variant="secondary" size="icon" onClick={download}>
                  <DownloadIcon className="size-4" /> <span className="sr-only">Download</span>
                </Button>
                <Button variant="secondary" size="icon" onClick={openInNewTab}>
                  <ExternalLinkIcon className="size-4" /> <span className="sr-only">Open in new tab</span>
                </Button>
                <DialogClose asChild>
                  <Button variant="secondary" size="icon">
                    <XIcon className="size-4" /> <span className="sr-only">Close</span>
                  </Button>
                </DialogClose>
              </div>
            </div>
          </DialogHeader>
          <Image src={url} alt="File" width={600} height={600} className="max-h-[70vh] max-w-full rounded-md object-contain" />
        </DialogContent>
      </Dialog>
      <Button variant="secondary" size="icon" className="rounded-full" onClick={download}>
        <DownloadIcon className="size-4" /> <span className="sr-only">Download</span>
      </Button>
    </div>
  );
}
