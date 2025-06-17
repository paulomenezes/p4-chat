import { XIcon } from 'lucide-react';
import { Button } from './ui/button';
import { type FileWithPreview } from '@/hooks/use-file-upload';
import { FileItem } from './file-item';

export function UploaderFileList({ files, removeFile }: { files: FileWithPreview[]; removeFile: (id: string) => void }) {
  return (
    <>
      {files.length > 0 && (
        <div className="flex flex-row gap-2 mb-2 flex-wrap pt-1">
          {files.map((file) => {
            const isImage = file.file.type.startsWith('image/');

            return (
              <div key={file.id} className="bg-background flex items-center justify-between gap-2 p-1 rounded-lg border relative group">
                <FileItem isLoading={file.isLoading} isImage={isImage} name={file.file.name} size={file.file.size} preview={file.preview} />

                {!file.isLoading && (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="-me-2 size-4 absolute -top-1 right-0 rounded-full hidden group-hover:flex z-30 hover:bg-secondary"
                    onClick={() => removeFile(file.id)}
                    aria-label="Remove file"
                  >
                    <XIcon className="size-3" aria-hidden="true" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
