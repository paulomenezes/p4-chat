'use client';

import type { ChatRequestOptions } from 'ai';
import { ArrowUpIcon, GlobeIcon, PaperclipIcon, SquareIcon } from 'lucide-react';
import { ModelSelector } from './model-selector';
import { useMutation } from 'convex/react';
import { api } from '@p4-chat/backend/convex/_generated/api';

export function ChatForm({
  input,
  currentStreamId,
  inputRef,
  handleInputChange,
  handleSubmit,
}: {
  input: string;
  currentStreamId: string | undefined;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions,
  ) => void;
}) {
  const stopStreaming = useMutation(api.messages.stopStreaming);

  return (
    <div>
      <form
        className="relative flex w-full flex-col items-stretch gap-2 rounded-t-xl border border-b-0 border-white/70 bg-chat-input-background px-3 pt-3 text-secondary-foreground outline-8 outline-chat-input-gradient/50 pb-safe-offset-3 max-sm:pb-6 sm:max-w-3xl dark:border-[hsl(0,0%,83%)]/[0.04] dark:bg-secondary/[0.045] dark:outline-chat-background/40"
        style={{
          boxShadow:
            'rgba(0, 0, 0, 0.1) 0px 80px 50px 0px, rgba(0, 0, 0, 0.07) 0px 50px 30px 0px, rgba(0, 0, 0, 0.06) 0px 30px 15px 0px, rgba(0, 0, 0, 0.04) 0px 15px 8px, rgba(0, 0, 0, 0.04) 0px 6px 4px, rgba(0, 0, 0, 0.02) 0px 2px 2px',
        }}
        onSubmit={handleSubmit}
      >
        <div className="flex flex-grow flex-col">
          <div></div>
          <div className="flex flex-grow flex-row items-start">
            <textarea
              placeholder="Type your message here..."
              className="w-full resize-none bg-transparent text-base leading-6 text-foreground outline-none placeholder:text-secondary-foreground/60 disabled:opacity-0"
              aria-label="Message input"
              aria-describedby="chat-input-description"
              autoComplete="off"
              id="message"
              name="message"
              value={input}
              ref={inputRef}
              onBlur={handleInputChange}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            ></textarea>
            <div id="chat-input-description" className="sr-only">
              Press Enter to send, Shift + Enter for new line
            </div>
          </div>
          <div className="-mb-px mt-2 flex w-full flex-row-reverse justify-between">
            <div className="-mr-0.5 -mt-0.5 flex items-center justify-center gap-2" aria-label="Message actions">
              <button
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border-reflect button-reflect bg-[rgb(162,59,103)] font-semibold shadow hover:bg-[#d56698] active:bg-[rgb(162,59,103)] disabled:hover:bg-[rgb(162,59,103)] disabled:active:bg-[rgb(162,59,103)] dark:bg-primary/20 dark:hover:bg-pink-800/70 dark:active:bg-pink-800/40 disabled:dark:hover:bg-primary/20 disabled:dark:active:bg-primary/20 h-9 w-9 relative rounded-lg p-2 text-pink-50"
                type="submit"
                disabled={input.length === 0 && !currentStreamId}
                aria-label="Message requires text"
                data-state="closed"
                onClick={() => {
                  if (currentStreamId) {
                    stopStreaming({ streamId: currentStreamId });
                  }
                }}
              >
                {currentStreamId ? <SquareIcon className="!size-5 fill-current" /> : <ArrowUpIcon className="!size-5" />}
              </button>
            </div>

            <div className="flex flex-col gap-2 pr-2 sm:flex-row sm:items-center">
              <div className="ml-[-7px] flex items-center gap-1">
                <ModelSelector />
                <button
                  className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-muted/40 hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50 px-3 text-xs -mb-1.5 h-auto gap-2 rounded-full border border-solid border-secondary-foreground/10 py-1.5 pl-2 pr-2.5 text-muted-foreground max-sm:p-2"
                  type="button"
                  aria-label="Enable search"
                  data-state="closed"
                >
                  <GlobeIcon className="h-4 w-4 scale-x-[-1]" />
                  <span className="max-sm:hidden">Search</span>
                </button>
                <label
                  className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-muted/40 hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50 text-xs cursor-pointer -mb-1.5 h-auto gap-2 rounded-full border border-solid border-secondary-foreground/10 px-2 py-1.5 pr-2.5 text-muted-foreground max-sm:p-2"
                  aria-label="Attach a file"
                  data-state="closed"
                >
                  <input multiple={false} className="sr-only" type="file" />
                  <div className="flex gap-1">
                    <PaperclipIcon className="size-4" />
                    <span className="max-sm:hidden sm:ml-0.5">Attach</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
