import { cn, getModelNameFromId, isImageGenerationModel, sanitizeText } from '@/lib/utils';
import type { Doc } from '@p4-chat/backend/convex/_generated/dataModel';
import { SquarePenIcon } from 'lucide-react';
import { Markdown } from './markdown';
import { CopyImageToClipboard, CopyToClipboard } from './copy-to-clipboard';
import type { SessionId } from 'convex-helpers/server/sessions';
import { Retry } from './retry';
import { BranchOff } from './branch-off';
import { MessageReasoning } from './message-reasoning';
import { MessageSearch } from './message-search';
import { MessageStats, MessageStatsMobile } from './message-stats';
import { MessageFiles } from './message-files';
import { MessageAIContent } from './message-ai-content';

export function Message({
  message,
  sessionId,
  onRetry,
}: {
  message: Doc<'messages'>;
  sessionId: SessionId | undefined;
  onRetry: (modelId: string | undefined) => void;
}) {
  return (
    <div data-message-id={message._id} className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}>
      {message.role === 'user' ? (
        <UserMessage message={message} onRetry={onRetry} />
      ) : (
        <AssistantMessage message={message} sessionId={sessionId} onRetry={onRetry} />
      )}
    </div>
  );
}

function UserMessage({ message, onRetry }: { message: Doc<'messages'>; onRetry: (modelId: string | undefined) => void }) {
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

        <MessageFiles files={message.files ?? []} />
      </div>
      <div className="absolute right-0 mt-5 flex items-center gap-1 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100">
        <Retry onRetry={onRetry} variant="ghost" />
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

function AssistantMessage({
  message,
  sessionId,
  onRetry,
}: {
  message: Doc<'messages'>;
  sessionId: SessionId | undefined;
  onRetry: (modelId: string | undefined) => void;
}) {
  return (
    <div className="group relative w-full max-w-full break-words">
      <MessageReasoning message={message} />
      <MessageAIContent message={message} />
      <MessageFiles files={message.files ?? []} />
      <MessageSearch message={message} />

      {message.stopped && (
        <div className="mt-4 flex items-start gap-3 rounded-lg bg-red-500/15 px-4 py-3 text-sm text-red-900 dark:text-red-400" role="alert">
          <div className="leading-relaxed">Stopped by user</div>
        </div>
      )}

      <div className="absolute left-0 -ml-0.5 mt-2 flex w-full flex-row justify-start gap-1 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100">
        <div className="flex w-full flex-row justify-between gap-1 sm:w-auto">
          <div className="flex items-center gap-1">
            {isImageGenerationModel(message.model) && message.files?.[0] ? (
              <CopyImageToClipboard storageId={message.files[0]} variant="ghost" />
            ) : (
              <CopyToClipboard content={message.content} variant="ghost" />
            )}

            <BranchOff message={message} sessionId={sessionId} variant="ghost" />
            <Retry onRetry={onRetry} variant="ghost" />

            <div className="flex items-center gap-1 text-xs text-muted-foreground sm:hidden">
              <span>{getModelNameFromId(message.model)}</span>
            </div>
          </div>

          <MessageStatsMobile message={message} />
        </div>
        <div className="hidden flex-row gap-2 sm:flex">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>{getModelNameFromId(message.model)}</span>
          </div>

          <MessageStats message={message} />
        </div>
      </div>
    </div>
  );
}
