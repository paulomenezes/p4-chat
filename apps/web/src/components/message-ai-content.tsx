import { sanitizeText } from '@/lib/utils';
import type { Doc } from '@p4-chat/backend/convex/_generated/dataModel';
import { Markdown } from './markdown';

export function MessageAIContent({ message }: { message: Doc<'messages'> }) {
  return (
    <div
      role="article"
      aria-label="Assistant message"
      className="prose prose-blue max-w-none dark:prose-invert prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0"
    >
      <span className="sr-only">Assistant Reply: </span>
      <Markdown>{sanitizeText(message.content)}</Markdown>
    </div>
  );
}
