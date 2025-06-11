import { useStream } from '@convex-dev/persistent-text-streaming/react';
import { getConvexSiteUrl } from '@/lib/get-convex-site-url';
import type { StreamId } from '@convex-dev/persistent-text-streaming';
import type { Doc, Id } from '@p4-chat/backend/convex/_generated/dataModel';
import { api } from '@p4-chat/backend/convex/_generated/api';
import { useEffect, useMemo } from 'react';
import Markdown from 'react-markdown';
import { useAuthToken } from '@convex-dev/auth/react';
import { useSessionId } from 'convex-helpers/react/sessions';

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

  const { text, status } = useStream(
    api.streaming.getStreamBody,
    new URL(`${getConvexSiteUrl()}/chat-stream?threadId=${threadId}&sessionId=${sessionId}`),
    isDriven,
    message.responseStreamId as StreamId,
    {
      authToken: token,
    },
  );

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
      <Markdown>{text || 'Thinking...'}</Markdown>
      {status === 'error' && <div className="text-red-500 mt-2">Error loading response</div>}
    </div>
  );
}
