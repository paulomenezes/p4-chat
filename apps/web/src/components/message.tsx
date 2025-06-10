import { cn } from '@/lib/utils';
import type { Doc } from '@p4-chat/backend/convex/_generated/dataModel';
import { RefreshCcwIcon, SquarePenIcon, CopyIcon, SplitIcon } from 'lucide-react';
import Shiki from '@shikijs/markdown-it';
import MarkdownIt from 'markdown-it';

const md = MarkdownIt();

md.use(
  await Shiki({
    themes: {
      light: 'vitesse-light',
      dark: 'vitesse-dark',
    },
  }),
);

export function Message({ message }: { message: Doc<'messages'> }) {
  return (
    <div data-message-id={message._id} className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}>
      {message.role === 'user' ? <UserMessage message={message} /> : <AssistantMessage message={message} />}
    </div>
  );
}

function UserMessage({ message }: { message: Doc<'messages'> }) {
  const html = md.render(message.content);

  return (
    <div
      role="article"
      aria-label="Your message"
      className="group relative inline-block max-w-[80%] break-words rounded-xl border border-secondary/50 bg-secondary/50 px-4 py-3 text-left"
    >
      <span className="sr-only">Your message: </span>
      <div className="flex flex-col gap-3">
        <div
          className="prose prose-pink max-w-none dark:prose-invert prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
      <div className="absolute right-0 mt-5 flex items-center gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100">
        <button
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-muted/40 hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50 text-xs h-8 w-8 rounded-lg p-0"
          aria-label="Retry message"
          data-action="retry"
          data-state="closed"
          type="button"
          id="radix-:r13:"
          aria-haspopup="menu"
          aria-expanded="false"
        >
          <div className="relative size-4">
            <RefreshCcwIcon className="size-4" />
            <span className="sr-only">Retry</span>
          </div>
        </button>
        <button
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-muted/40 hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50 text-xs h-8 w-8 rounded-lg p-0"
          aria-label="Edit message"
          data-state="closed"
        >
          <SquarePenIcon className="size-4" />
          <span className="sr-only">Edit</span>
        </button>
        <button
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-muted/40 hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50 text-xs h-8 w-8 rounded-lg p-0"
          aria-label="Copy message"
          data-state="closed"
        >
          <div className="relative size-4">
            <CopyIcon className="size-4" />
            <span className="sr-only">Copy</span>
          </div>
        </button>
      </div>
    </div>
  );
}

function AssistantMessage({ message }: { message: Doc<'messages'> }) {
  const html = md.render(message.content);

  return (
    <div className="group relative w-full max-w-full break-words">
      <div
        role="article"
        aria-label="Assistant message"
        className="prose prose-pink max-w-none dark:prose-invert prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0"
      >
        <span className="sr-only">Assistant Reply: </span>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      <div className="absolute left-0 -ml-0.5 mt-2 flex w-full flex-row justify-start gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100">
        <div className="flex w-full flex-row justify-between gap-1 sm:w-auto">
          <div className="flex items-center gap-1">
            <button
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-muted/40 hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50 text-xs h-8 w-8 rounded-lg p-0"
              aria-label="Copy response to clipboard"
              data-state="closed"
            >
              <div className="relative size-4">
                <CopyIcon className="size-4" />
                <span className="sr-only">Copy</span>
              </div>
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-muted/40 hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50 text-xs h-8 w-8 rounded-lg p-0"
              aria-label="Branch off message"
              data-state="closed"
              type="button"
              id="radix-:r1c:"
              aria-haspopup="menu"
              aria-expanded="false"
            >
              <div className="relative size-4">
                <SplitIcon className="size-4" />
                <span className="sr-only">Branch off</span>
              </div>
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-muted/40 hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50 text-xs h-8 w-8 rounded-lg p-0"
              aria-label="Retry message"
              data-action="retry"
              data-state="closed"
              type="button"
              id="radix-:r1f:"
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
