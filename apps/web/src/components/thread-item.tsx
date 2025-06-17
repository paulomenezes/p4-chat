import { PinIcon, PinOffIcon, SplitIcon, XIcon, EditIcon, DownloadIcon } from 'lucide-react';
import type { Doc } from '@p4-chat/backend/convex/_generated/dataModel';
import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@p4-chat/backend/convex/_generated/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Input } from './ui/input';
import { useQueryState } from 'nuqs';
import { cn } from '@/lib/utils';
import { useSessionId } from 'convex-helpers/react/sessions';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from './ui/context-menu';

export function ThreadItem({ thread }: { thread: Doc<'threads'> }) {
  const [chatId, setChatId] = useQueryState('chat');
  const [sessionId] = useSessionId();

  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);
  const [value, setValue] = useState(thread.title);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const togglePin = useMutation(api.threads.togglePin);
  const remove = useMutation(api.threads.remove);
  const rename = useMutation(api.threads.rename).withOptimisticUpdate((localStore, args) => {
    if (!sessionId) {
      return;
    }

    const currentValue = localStore
      .getQuery(api.threads.getByUserIdOrSessionId, { sessionId })
      ?.map((t) => (t._id === thread._id ? { ...t, title: args.title } : t));

    if (!currentValue) {
      return;
    }

    localStore.setQuery(api.threads.getByUserIdOrSessionId, { sessionId }, currentValue);
  });
  const threadData = useQuery(api.threads.getThreadForExport, sessionId ? { threadId: thread._id, sessionId } : 'skip');

  useEffect(() => {
    setValue(thread.title);
  }, [thread.title]);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 0);
    }
  }, [isRenaming]);

  const handlePin = useCallback(() => {
    if (sessionId) {
      togglePin({ id: thread._id, sessionId });
    }
  }, [sessionId, thread._id, togglePin]);

  const handleRename = useCallback(() => {
    if (sessionId && value.trim() !== thread.title && value.trim()) {
      rename({ id: thread._id, title: value.trim(), sessionId });
    } else {
      setValue(thread.title);
    }
    setIsRenaming(false);
  }, [sessionId, value, thread.title, rename]);

  const handleCancelRename = useCallback(() => {
    setValue(thread.title);
    setIsRenaming(false);
  }, [thread.title]);

  const handleDelete = useCallback(() => {
    if (sessionId) {
      remove({ id: thread._id, sessionId });
      if (chatId === thread._id) {
        setChatId(null);
      }
    }
    setIsOpenDeleteDialog(false);
  }, [sessionId, thread._id, chatId, remove]);

  const handleExport = useCallback(() => {
    if (!threadData) return;

    setIsExporting(true);

    try {
      // Create markdown content
      const markdownContent = `# ${threadData.thread.title}
Created: ${new Date(threadData.thread._creationTime).toLocaleString()}
Last Updated: ${new Date().toLocaleString()}
---

${threadData.messages
  .map((msg) => {
    const role = msg.role === 'user' ? 'User' : 'Assistant';
    const model = msg.model ? ` (${msg.model})` : '';

    return `### ${role}${model}

${msg.content}

---
`;
  })
  .join('\n')}`;

      const blob = new Blob([markdownContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${threadData.thread.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [threadData]);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {isRenaming ? (
            <div
              className={cn(
                'group/link relative flex h-9 w-full items-center overflow-hidden rounded-lg px-2 py-1 text-sm outline-none bg-sidebar-accent text-sidebar-accent-foreground',
                chatId === thread._id && 'bg-sidebar-accent text-sidebar-accent-foreground',
              )}
            >
              <div className="relative flex w-full items-center">
                {thread.parentThreadId && (
                  <button type="button" onClick={() => setChatId(thread.parentThreadId!)}>
                    <SplitIcon className="mr-1 size-4 text-muted-foreground/50 hover:text-muted-foreground" />
                  </button>
                )}
                <div className="w-full">
                  <div className="relative w-full">
                    <Input
                      ref={inputRef}
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleRename();
                        } else if (e.key === 'Escape') {
                          e.preventDefault();
                          handleCancelRename();
                        }
                      }}
                      onBlur={handleCancelRename}
                      className="h-full w-full bg-transparent px-1 py-1 text-sm text-foreground outline-none border-none focus:ring-0 focus:border-none"
                      placeholder="Thread title"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Link
              className={cn(
                'group/link relative flex h-9 w-full items-center overflow-hidden rounded-lg px-2 py-1 text-sm outline-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring hover:focus-visible:bg-sidebar-accent',
                chatId === thread._id && 'bg-sidebar-accent text-sidebar-accent-foreground',
              )}
              href={`/?chat=${thread._id}`}
              prefetch={true}
            >
              <div className="relative flex w-full items-center">
                {thread.parentThreadId && (
                  <button type="button" onClick={() => setChatId(thread.parentThreadId!)}>
                    <SplitIcon className="mr-1 size-4 text-muted-foreground/50 hover:text-muted-foreground" />
                  </button>
                )}
                <div className="w-full">
                  <div className="relative w-full">
                    <div
                      className="hover:truncate-none h-full w-full rounded bg-transparent px-1 py-1 text-sm text-muted-foreground outline-none cursor-pointer overflow-hidden truncate"
                      title={thread.title}
                    >
                      {thread.title}
                    </div>
                  </div>
                </div>
                <div className="pointer-events-auto absolute -right-1 bottom-0 top-0 z-50 flex translate-x-full items-center justify-end text-muted-foreground transition-transform group-hover/link:translate-x-0 group-hover/link:bg-sidebar-accent">
                  <div className="pointer-events-none absolute bottom-0 right-[100%] top-0 h-12 w-8 bg-gradient-to-l from-sidebar-accent to-transparent opacity-0 group-hover/link:opacity-100"></div>
                  <button
                    className="rounded-md p-1.5 hover:bg-muted/40"
                    tabIndex={-1}
                    aria-label={thread.pinned ? 'Unpin thread' : 'Pin thread'}
                    onClick={() => sessionId && togglePin({ id: thread._id, sessionId })}
                  >
                    {thread.pinned ? <PinOffIcon className="size-4" /> : <PinIcon className="size-4" />}
                  </button>
                  <button
                    className="rounded-md p-1.5 hover:bg-destructive/50 hover:text-destructive-foreground"
                    tabIndex={-1}
                    aria-label="Delete thread"
                    onClick={(event) => {
                      event.stopPropagation();
                      event.preventDefault();
                      setIsOpenDeleteDialog(true);
                    }}
                  >
                    <XIcon className="size-4" />
                  </button>
                </div>
              </div>
            </Link>
          )}
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={handlePin}>
            {thread.pinned ? (
              <>
                <PinOffIcon className="mr-2 size-4" />
                Unpin
              </>
            ) : (
              <>
                <PinIcon className="mr-2 size-4" />
                Pin
              </>
            )}
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setIsRenaming(true)}>
            <EditIcon className="mr-2 size-4" />
            Rename
          </ContextMenuItem>
          <ContextMenuItem onClick={handleExport} disabled={!threadData || isExporting}>
            <DownloadIcon className="mr-2 size-4" />
            {isExporting ? 'Exporting...' : 'Export'}
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setIsOpenDeleteDialog(true)} className="text-destructive focus:text-destructive">
            <XIcon className="mr-2 size-4" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Delete Dialog */}
      <AlertDialog open={isOpenDeleteDialog} onOpenChange={setIsOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Thread</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete "{thread.title}"? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
