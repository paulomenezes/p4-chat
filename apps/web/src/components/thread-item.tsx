import { PinIcon, PinOffIcon, XIcon } from 'lucide-react';
import type { Doc } from '@p4-chat/backend/convex/_generated/dataModel';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useMutation } from 'convex/react';
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
import { useQueryState } from 'nuqs';
import { cn } from '@/lib/utils';

export function ThreadItem({ thread }: { thread: Doc<'threads'> }) {
  const [chatId, setChatId] = useQueryState('chat');

  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);
  const [value, setValue] = useState(thread.title);
  const togglePin = useMutation(api.theads.togglePin);
  const remove = useMutation(api.theads.remove);

  useEffect(() => {
    setValue(thread.title);
  }, [thread.title]);

  return (
    <>
      <Link
        className={cn(
          'group/link relative flex h-9 w-full items-center overflow-hidden rounded-lg px-2 py-1 text-sm outline-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring hover:focus-visible:bg-sidebar-accent',
          chatId === thread._id && 'bg-sidebar-accent text-sidebar-accent-foreground',
        )}
        href={`/?chat=${thread._id}`}
        data-discover="true"
      >
        <div className="relative flex w-full items-center">
          <button data-state="closed" className="w-full">
            <div className="relative w-full">
              <input
                aria-label="Thread title"
                aria-describedby="thread-title-hint"
                aria-readonly="true"
                tabIndex={-1}
                className="hover:truncate-none h-full w-full rounded bg-transparent px-1 py-1 text-sm text-muted-foreground outline-none pointer-events-none cursor-pointer overflow-hidden truncate"
                title={value}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
          </button>
          <div className="pointer-events-auto absolute -right-1 bottom-0 top-0 z-50 flex translate-x-full items-center justify-end text-muted-foreground transition-transform group-hover/link:translate-x-0 group-hover/link:bg-sidebar-accent">
            <div className="pointer-events-none absolute bottom-0 right-[100%] top-0 h-12 w-8 bg-gradient-to-l from-sidebar-accent to-transparent opacity-0 group-hover/link:opacity-100"></div>
            <button
              className="rounded-md p-1.5 hover:bg-muted/40"
              tabIndex={-1}
              aria-label={thread.pinned ? 'Unpin thread' : 'Pin thread'}
              onClick={() => togglePin({ id: thread._id })}
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

      <AlertDialog open={isOpenDeleteDialog} onOpenChange={setIsOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Thread</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete "{thread.title}"? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                remove({ id: thread._id });
                if (chatId === thread._id) {
                  setChatId(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
