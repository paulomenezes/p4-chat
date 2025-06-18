import { api } from '@p4-chat/backend/convex/_generated/api';
import type { Id } from '@p4-chat/backend/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import Image from 'next/image';
import { Button } from './ui/button';
import { DownloadIcon, ExternalLinkIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { LoadingImage } from './loading';
import { FileItem } from './file-item';

export function MessageFiles({
  files,
  isEditing,
  onRemove,
}: {
  files: Id<'_storage'>[];
  isEditing?: boolean;
  onRemove?: (file: Id<'_storage'>) => void;
}) {
  if (files.length === 0) {
    return null;
  }

  return (
    <div>
      {files.map((file) => (
        <MessageFile key={file} file={file} isEditing={isEditing} onRemove={onRemove} />
      ))}
    </div>
  );
}

function MessageFile({
  file,
  isEditing,
  onRemove,
}: {
  file: Id<'_storage'>;
  isEditing?: boolean;
  onRemove?: (file: Id<'_storage'>) => void;
}) {
  const url = useQuery(api.files.getFileUrl, { storageId: file });
  const [failed, setFailed] = useState(false);

  const isImage = url?.metadata?.contentType?.startsWith('image/');

  function download() {
    if (!url?.url) {
      return;
    }

    fetch(url.url)
      .then((res) => res.blob())
      .then((blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = isImage ? 'image.png' : 'file.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(objectUrl);

        toast.success('File downloaded successfully');
      })
      .catch(() => {
        toast.error('Failed to download file');
      });
  }

  function openInNewTab() {
    if (!url?.url) {
      return;
    }

    window.open(url.url, '_blank');
  }

  return failed ? (
    <div className="text-red-500">Failed to load file</div>
  ) : !url?.url ? (
    <LoadingImage />
  ) : (
    <div className="flex flex-row gap-6 items-center">
      <Dialog>
        <DialogTrigger className="cursor-pointer">
          {isImage ? (
            <Image
              src={url.url}
              alt="File"
              width={300}
              height={300}
              className="rounded-md cursor-pointer"
              onError={() => setFailed(true)}
            />
          ) : (
            <FileItem
              isLoading={false}
              isImage={isImage}
              name={isImage ? 'image.png' : 'file.pdf'}
              size={url.metadata?.size ?? 0}
              preview={url.url}
            />
          )}
        </DialogTrigger>
        <DialogContent className="w-full !max-w-4xl max-h-[90vh]" showCloseButton={false}>
          <DialogHeader>
            <div className="flex flex-row justify-between items-center">
              <DialogTitle>{isImage ? 'image.png' : 'file.pdf'}</DialogTitle>

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
          {isImage ? (
            <Image src={url.url} alt="File" width={900} height={900} className="max-h-[70vh] max-w-full rounded-md object-contain" />
          ) : (
            <iframe src={url.url} className="w-full h-[70vh] rounded-md" />
          )}
        </DialogContent>
      </Dialog>
      {isEditing ? (
        <Button variant="secondary" size="icon" className="rounded-full" onClick={() => onRemove?.(file)}>
          <XIcon className="size-4" /> <span className="sr-only">Remove</span>
        </Button>
      ) : (
        <Button variant="secondary" size="icon" className="rounded-full" onClick={download}>
          <DownloadIcon className="size-4" /> <span className="sr-only">Download</span>
        </Button>
      )}
    </div>
  );
}
