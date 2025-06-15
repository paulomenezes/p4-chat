import { PaperclipIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { InputHTMLAttributes } from 'react';

export function Uploader({
  getInputProps,
  openFileDialog,
}: {
  getInputProps: (
    props?: InputHTMLAttributes<HTMLInputElement>,
  ) => InputHTMLAttributes<HTMLInputElement> & { ref: React.Ref<HTMLInputElement> };
  openFileDialog: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <input {...getInputProps()} className="sr-only" aria-label="Upload image file" />

      <Button size="xs" className="rounded-full pl-2 pr-2.5 -mb-1.5" variant="outline" onClick={openFileDialog}>
        <PaperclipIcon className="h-4 w-4" />
        <span className="max-sm:hidden">Attach</span>
      </Button>
    </div>
  );
}
