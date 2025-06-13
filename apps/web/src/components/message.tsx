import { cn, sanitizeText } from '@/lib/utils';
import type { Doc } from '@p4-chat/backend/convex/_generated/dataModel';
import { RefreshCcwIcon, SquarePenIcon, SplitIcon, ChevronRightIcon, ChevronDownIcon } from 'lucide-react';
import { Markdown } from './markdown';
import { CopyToClipboard } from './copy-to-clipboard';
import { useMutation } from 'convex/react';
import { api } from '@p4-chat/backend/convex/_generated/api';
import { useQueryState } from 'nuqs';
import type { SessionId } from 'convex-helpers/server/sessions';
import { useState } from 'react';

export function Message({ message, sessionId }: { message: Doc<'messages'>; sessionId: SessionId | undefined }) {
  return (
    <div data-message-id={message._id} className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}>
      {message.role === 'user' ? <UserMessage message={message} /> : <AssistantMessage message={message} sessionId={sessionId} />}
    </div>
  );
}

function UserMessage({ message }: { message: Doc<'messages'> }) {
  return (
    <div
      role="article"
      aria-label="Your message"
      className="group relative inline-block max-w-[80%] break-words rounded-xl border border-secondary/50 bg-secondary/50 px-4 py-3 text-left"
    >
      <span className="sr-only">Your message: </span>
      <div className="flex flex-col gap-3">
        <div className="prose prose-pink max-w-none dark:prose-invert prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0">
          <Markdown>{sanitizeText(message.content)}</Markdown>
        </div>
      </div>
      <div className="absolute right-0 mt-5 flex items-center gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100">
        <button
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-muted/40 hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50 text-xs h-8 w-8 rounded-lg p-0"
          aria-label="Retry message"
          data-action="retry"
          data-state="closed"
          type="button"
          aria-haspopup="menu"
          aria-expanded="false"
        >
          <div className="relative size-4">
            <RefreshCcwIcon className="size-4" />
            <span className="sr-only">Retry</span>
          </div>
        </button>
        <button
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-muted/40 hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50 text-xs h-8 w-8 rounded-lg p-0"
          aria-label="Edit message"
          data-state="closed"
        >
          <SquarePenIcon className="size-4" />
          <span className="sr-only">Edit</span>
        </button>

        <CopyToClipboard content={message.content} variant="ghost" />
      </div>
    </div>
  );
}

function AssistantMessage({ message, sessionId }: { message: Doc<'messages'>; sessionId: SessionId | undefined }) {
  const branchOff = useMutation(api.threads.branchOff);
  const [, setChatId] = useQueryState('chat');
  const [isReasoningOpen, setIsReasoningOpen] = useState(false);

  return (
    <div className="group relative w-full max-w-full break-words">
      {message.reasoning && (
        <div className="flex items-center gap-2">
          <div className="mb-4 max-w-full">
            <button
              className="mb-2 flex select-none items-center gap-2 text-sm text-secondary-foreground cursor-pointer"
              aria-label="Hide reasoning"
              onClick={() => setIsReasoningOpen((prev) => !prev)}
            >
              {isReasoningOpen ? <ChevronDownIcon className="size-4" /> : <ChevronRightIcon className="size-4" />}
              Reasoning
            </button>
            {isReasoningOpen && (
              <div className="prose prose-pink max-w-none rounded-lg bg-sidebar-background/40 p-3 opacity-80 dark:prose-invert prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0 dark:bg-chat-accent">
                <Markdown>{sanitizeText(message.reasoning)}</Markdown>
              </div>
            )}
          </div>
        </div>
      )}

      <div
        role="article"
        aria-label="Assistant message"
        className="prose prose-pink max-w-none dark:prose-invert prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0"
      >
        <span className="sr-only">Assistant Reply: </span>
        <Markdown>{sanitizeText(message.content)}</Markdown>
      </div>
      <div className="absolute left-0 -ml-0.5 mt-2 flex w-full flex-row justify-start gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100">
        <div className="flex w-full flex-row justify-between gap-1 sm:w-auto">
          <div className="flex items-center gap-1">
            <CopyToClipboard content={message.content} variant="ghost" />
            <button
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-muted/40 hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50 text-xs h-8 w-8 rounded-lg p-0"
              aria-label="Branch off message"
              data-state="closed"
              type="button"
              aria-haspopup="menu"
              aria-expanded="false"
              onClick={async () => {
                if (sessionId) {
                  const newThreadId = await branchOff({ id: message.threadId, messageId: message._id, sessionId });
                  setChatId(newThreadId);
                }
              }}
            >
              <div className="relative size-4">
                <SplitIcon className="size-4" />
                <span className="sr-only">Branch off</span>
              </div>
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-muted/40 hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50 text-xs h-8 w-8 rounded-lg p-0"
              aria-label="Retry message"
              data-action="retry"
              data-state="closed"
              type="button"
              aria-haspopup="menu"
              aria-expanded="false"
            >
              <div className="relative size-4">
                <RefreshCcwIcon className="size-4" />
                <span className="sr-only">Retry</span>
              </div>
            </button>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Gemini 2.5 Flash</span>
            </div>
          </div>
        </div>
        <div className="hidden flex-row gap-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>Gemini 2.5 Flash</span>
          </div>
        </div>
      </div>
    </div>
  );
}
