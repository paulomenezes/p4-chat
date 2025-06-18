'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { CheckIcon, XIcon } from 'lucide-react';
import type { Doc, Id } from '@p4-chat/backend/convex/_generated/dataModel';
import { MessageFiles } from './message-files';

interface MessageEditProps {
  message: Doc<'messages'>;
  onSave: (content: string, files: Id<'_storage'>[]) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export function MessageEdit({ message, onSave, onCancel, isEditing }: MessageEditProps) {
  const [editContent, setEditContent] = useState(message.content);
  const [editFiles, setEditFiles] = useState(message.files ?? []);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      const value = textareaRef.current.value;
      textareaRef.current.setSelectionRange(value.length, value.length);
    }
  }, [isEditing]);

  function handleSave() {
    if (editContent.trim() !== message.content.trim() || editFiles.length !== (message.files?.length ?? 0)) {
      onSave(editContent.trim(), editFiles);
    } else {
      onCancel();
    }
  }

  function handleCancel() {
    setEditContent(message.content);
    setEditFiles(message.files ?? []);
    onCancel();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        handleCancel();
      }
    };
  }

  function handleRemoveFile(file: Id<'_storage'>) {
    setEditFiles((prev) => prev.filter((f) => f !== file));
  }

  return (
    <div className="flex flex-col gap-3">
      <textarea
        ref={textareaRef}
        value={editContent}
        onChange={(e) => setEditContent(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-96 resize-none bg-transparent text-base leading-6 text-foreground outline-none border border-secondary/50 rounded-lg px-3 py-2 focus:border-primary"
        placeholder="Edit your message..."
        rows={Math.max(1, editContent.split('\n').length)}
      />
      <MessageFiles files={editFiles} isEditing onRemove={handleRemoveFile} />
      <div className="flex items-center gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={handleCancel} className="h-8 px-2">
          <XIcon className="size-4" />
          <span className="sr-only">Cancel</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={handleSave} className="h-8 px-2">
          <CheckIcon className="size-4" />
          <span>Save</span>
        </Button>
      </div>
    </div>
  );
}
