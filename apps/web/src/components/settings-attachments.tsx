'use client';

import { api } from '@p4-chat/backend/convex/_generated/api';
import { useSessionId } from 'convex-helpers/react/sessions';
import { useMutation, useQuery } from 'convex/react';
import { useState, useTransition } from 'react';
import { Button } from './ui/button';
import { ExternalLinkIcon, PaperclipIcon, Trash2Icon } from 'lucide-react';
import type { Doc, Id } from '@p4-chat/backend/convex/_generated/dataModel';
import { toast } from 'sonner';
import { Checkbox } from './ui/checkbox';

export function SettingsAttachments() {
  const [sessionId] = useSessionId();
  const attachments = useQuery(api.files.getAttachments, sessionId ? { sessionId } : 'skip');
  const deleteAttachments = useMutation(api.files.deleteByIds);

  const [selectedAttachments, setSelectedAttachments] = useState<Id<'_storage'>[]>([]);

  const isAllSelected = selectedAttachments.length > 0 && selectedAttachments.length === attachments?.length;

  function handleSelectAll() {
    if (isAllSelected) {
      setSelectedAttachments([]);
    } else {
      setSelectedAttachments(attachments?.map((attachment) => attachment.storageId) ?? []);
    }
  }

  function handleClearSelection() {
    setSelectedAttachments([]);
  }

  function handleDeleteSelected() {
    toast.promise(deleteAttachments({ storageIds: selectedAttachments }), {
      loading: 'Deleting attachments...',
      success: 'Attachments deleted',
      error: 'Failed to delete attachments',
    });
    setSelectedAttachments([]);
  }

  if (attachments && attachments.length === 0) {
    return (
      <div className="flex flex-col gap-2 border border-input rounded-lg p-4">
        <p className="text-sm text-muted-foreground">No attachments found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="mb-2 flex h-10 items-end justify-between gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button type="button" variant={isAllSelected ? 'default' : 'outline'} onClick={handleSelectAll}>
              {isAllSelected ? (
                <Checkbox checked />
              ) : (
                <div className="shrink-0 rounded-sm border border-input brightness-75 dark:brightness-200 h-4 w-4"></div>
              )}
              <span className="text-sm">
                <span className="hidden md:inline">Select All</span>
                <span className="md:hidden">All</span>
              </span>
            </Button>
          </div>
          {selectedAttachments.length > 0 && (
            <Button type="button" variant="outline" onClick={handleClearSelection}>
              Clear<span className="hidden md:inline"> Selection</span>
            </Button>
          )}
        </div>

        {selectedAttachments.length > 0 && (
          <Button type="button" variant="destructive" onClick={handleDeleteSelected}>
            <Trash2Icon className="size-4" />
            <span className="hidden md:inline">Delete Selected ({selectedAttachments.length})</span>
          </Button>
        )}
      </div>
      <div className="relative overflow-x-hidden overflow-y-scroll rounded-lg border border-input">
        <div className="no-scrollbar h-[250px] overflow-y-auto md:h-[calc(100vh-360px)] md:min-h-[670px]">
          {attachments?.map((attachment) => (
            <AttachmentItem
              key={attachment._id}
              attachment={attachment}
              selectedAttachments={selectedAttachments}
              setSelectedAttachments={setSelectedAttachments}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function AttachmentItem({
  attachment,
  selectedAttachments,
  setSelectedAttachments,
}: {
  attachment: Doc<'attachments'>;
  selectedAttachments: Id<'_storage'>[];
  setSelectedAttachments: (attachments: Id<'_storage'>[]) => void;
}) {
  const url = useQuery(api.files.getFileUrl, { storageId: attachment.storageId });
  const deleteAttachment = useMutation(api.files.deleteById);

  const [isDeleting, startDeleting] = useTransition();

  const isImage = url?.metadata?.contentType?.startsWith('image/');

  function handleDelete() {
    startDeleting(() => {
      toast.promise(deleteAttachment({ storageId: attachment.storageId }), {
        loading: 'Deleting attachment...',
        success: 'Attachment deleted',
        error: 'Failed to delete attachment',
      });
    });
  }

  function handleSelect(checked: boolean) {
    if (checked) {
      setSelectedAttachments([...selectedAttachments, attachment.storageId]);
    } else {
      setSelectedAttachments(selectedAttachments.filter((id) => id !== attachment.storageId));
    }
  }

  return (
    <div className="flex items-center gap-4 border-b border-input p-4 last:border-0" role="button" tabIndex={0}>
      <Checkbox checked={selectedAttachments.includes(attachment.storageId)} onCheckedChange={handleSelect} />

      <div className="flex flex-1 gap-8 items-center justify-between overflow-hidden">
        <div className="flex min-w-0 items-center gap-4">
          {url?.url && isImage ? (
            <img alt="Preview" className="h-12 w-12 shrink-0 rounded object-cover" src={url?.url} />
          ) : url?.url ? (
            <div className="h-12 w-12 shrink-0 rounded bg-muted flex items-center justify-center">
              <PaperclipIcon className="size-4" />
            </div>
          ) : (
            <div className="h-12 w-12 shrink-0 rounded bg-muted"></div>
          )}
          <div className="flex min-w-0 flex-col">
            <div className="flex min-w-0 items-center gap-2">
              <a href={url?.url ?? ''} target="_blank" rel="noopener noreferrer" className="group flex min-w-0 items-center gap-2">
                <span className="truncate text-sm text-foreground group-hover:underline">{attachment.name}</span>
                <ExternalLinkIcon className="hidden size-4 shrink-0 text-muted-foreground/80 group-hover:text-muted-foreground sm:inline-block" />
              </a>
            </div>
            <div className="text-xs text-muted-foreground/80">{attachment.type}</div>
          </div>
        </div>
        <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
          <Trash2Icon className="size-4" />
        </Button>
      </div>
    </div>
  );
}
