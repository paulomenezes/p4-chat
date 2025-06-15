import { PaperclipIcon, XIcon } from 'lucide-react';
import { Button } from './ui/button';
import { formatBytes, type FileWithPreview } from '@/hooks/use-file-upload';

export function UploaderFileList({ files, removeFile }: { files: FileWithPreview[]; removeFile: (id: string) => void }) {
  return (
    <>
      {files.length > 0 && (
        <div className="flex flex-row gap-2 mb-2 flex-wrap pt-1">
          {files.map((file) => {
            const isImage = file.file.type.startsWith('image/');

            return (
              <div key={file.id} className="bg-background flex items-center justify-between gap-2 p-1 rounded-lg border relative group">
                <div className="flex items-center gap-3 overflow-hidden">
                  {isImage ? (
                    <div className="bg-accent aspect-square shrink-0 rounded">
                      <img src={file.preview} alt={file.file.name} className="size-12 rounded-[inherit] object-cover" />
                    </div>
                  ) : (
                    <PaperclipIcon className="size-4 rounded-[inherit] object-contain m-1" />
                  )}

                  {!isImage && (
                    <div className="flex min-w-0 flex-col gap-0.5 items-start">
                      <p className="truncate text-[13px] font-medium">{file.file.name}</p>
                      <p className="text-muted-foreground text-xs">{formatBytes(file.file.size)}</p>
                    </div>
                  )}
                </div>

                <Button
                  size="icon"
                  variant="secondary"
                  className="-me-2 size-4 absolute -top-1 right-0 rounded-full hidden group-hover:flex z-30 hover:bg-secondary"
                  onClick={() => removeFile(file.id)}
                  aria-label="Remove file"
                >
                  <XIcon className="size-3" aria-hidden="true" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
