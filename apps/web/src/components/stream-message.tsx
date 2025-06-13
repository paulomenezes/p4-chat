import { useStream } from '@convex-dev/persistent-text-streaming/react';
import { getConvexSiteUrl } from '@/lib/get-convex-site-url';
import type { StreamId } from '@convex-dev/persistent-text-streaming';
import type { Doc, Id } from '@p4-chat/backend/convex/_generated/dataModel';
import { api } from '@p4-chat/backend/convex/_generated/api';
import { useEffect, useMemo, useState } from 'react';
import { useAuthToken } from '@convex-dev/auth/react';
import { useSessionId } from 'convex-helpers/react/sessions';
import { sanitizeText } from '@/lib/utils';
import { Markdown } from './markdown';
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react';

export default function ServerMessage({
  message,
  isDriven,
  threadId,
  stopStreaming,
  scrollToBottom,
}: {
  message: Doc<'messages'>;
  isDriven: boolean;
  threadId: Id<'threads'>;
  stopStreaming: () => void;
  scrollToBottom: () => void;
}) {
  const token = useAuthToken();
  const [sessionId] = useSessionId();
  const [isReasoningOpen, setIsReasoningOpen] = useState(false);

  const { text, status } = useStream(
    api.streaming.getStreamBody,
    new URL(`${getConvexSiteUrl()}/chat-stream?threadId=${threadId}&sessionId=${sessionId}`),
    isDriven,
    message.responseStreamId as StreamId,
    {
      authToken: token,
    },
  );

  const [textContent, reasoningContent] = useMemo(() => {
    const hasReasoningStart = text?.includes('<reasoning>');
    const hasReasoningEnd = text?.includes('</reasoning>');

    let reasoningContent = '';
    let textContent = '';

    if (hasReasoningStart) {
      if (hasReasoningEnd) {
        // If we have both tags, extract content between them
        const reasoningRegex = /<reasoning>(.*?)<\/reasoning>/s;
        const reasoningMatch = text?.match(reasoningRegex);
        reasoningContent = reasoningMatch ? reasoningMatch[1] : '';
        textContent = text?.replace(reasoningRegex, '');
      } else {
        // If only start tag, everything after is reasoning
        const parts = text?.split('<reasoning>');
        reasoningContent = parts[1] || '';
      }
    } else {
      textContent = text || '';
    }

    return [textContent, reasoningContent];
  }, [text]);

  const isCurrentlyStreaming = useMemo(() => {
    if (!isDriven) {
      return false;
    }

    return status === 'pending' || status === 'streaming';
  }, [isDriven, status]);

  useEffect(() => {
    if (!isDriven) {
      return;
    }

    if (isCurrentlyStreaming) {
      return;
    }

    stopStreaming();
  }, [isDriven, isCurrentlyStreaming, stopStreaming]);

  useEffect(() => {
    if (!text) {
      return;
    }

    scrollToBottom();
  }, [text, scrollToBottom]);

  return (
    <div className="md-answer">
      <div className="group relative w-full max-w-full break-words">
        {reasoningContent && reasoningContent.length > 0 && (
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
                  <Markdown disableHighlight>{sanitizeText(reasoningContent)}</Markdown>
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
          <Markdown disableHighlight>{sanitizeText(textContent)}</Markdown>
        </div>
      </div>
      {status === 'error' && <div className="text-red-500 mt-2">Error loading response</div>}
    </div>
  );
}
