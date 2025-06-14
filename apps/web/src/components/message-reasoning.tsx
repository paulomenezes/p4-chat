import { sanitizeText } from '@/lib/utils';
import type { Doc } from '@p4-chat/backend/convex/_generated/dataModel';
import { ChevronRightIcon, ChevronDownIcon } from 'lucide-react';
import { Markdown } from './markdown';
import { useState } from 'react';

export function MessageReasoning({ message }: { message: Doc<'messages'> }) {
  const [isReasoningOpen, setIsReasoningOpen] = useState(false);

  return (
    <>
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
    </>
  );
}
