import { cn } from '@/lib/utils';
import type { Doc } from '@p4-chat/backend/convex/_generated/dataModel';
import { ChevronRightIcon, ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@p4-chat/backend/convex/_generated/api';

export function MessageSearch({ message }: { message: Doc<'messages'> }) {
  const [isSearchGroundingOpen, setIsSearchGroundingOpen] = useState(false);
  const searchResults = useQuery(api.messages.getMessageSearchResults, {
    messageId: message._id,
  });

  return (
    <>
      {message.isSearching && message.searchQueries && message.searchQueries.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="mb-4 max-w-full">
            <button
              className="mb-2 mt-8 flex select-none items-center gap-2 text-sm text-secondary-foreground cursor-pointer"
              aria-label="Hide search grounding details"
              onClick={() => setIsSearchGroundingOpen((prev) => !prev)}
            >
              {isSearchGroundingOpen ? <ChevronDownIcon className="size-4" /> : <ChevronRightIcon className="size-4" />}
              Search Grounding Details
            </button>
            {isSearchGroundingOpen && (
              <div className="prose prose-blue mt-4 text-sm text-secondary-foreground dark:prose-invert">
                <div className="mt-2 space-y-4">
                  <div className="space-y-2">
                    <div className="font-medium text-foreground">Search Queries:</div>
                    <div className="space-y-1 text-xs">
                      {message.searchQueries.map((query) => (
                        <div key={query}>{query}</div>
                      ))}
                    </div>
                  </div>
                  {searchResults && searchResults.length > 0 && (
                    <div className="space-y-2">
                      <div className="font-medium text-foreground">Grounded Segments:</div>
                      {searchResults?.map((result) => (
                        <div key={result._id} className="flex flex-col gap-2 rounded-md bg-sidebar-background/40 p-3 dark:bg-chat-accent">
                          <span className="text-sm">{result.text}</span>
                          <div className="space-y-2">
                            {result.chunks.map((chunk) => (
                              <div className="flex items-baseline justify-between gap-2 text-xs" key={chunk.chunksUri}>
                                <div className="flex-1">
                                  <a href={chunk.chunksUri} target="_blank" rel="noopener noreferrer" className="">
                                    {chunk.chunksTitle}
                                  </a>
                                </div>
                                <div
                                  className={cn('shrink-0 rounded-full px-2 py-1', {
                                    'bg-green-400/60 text-green-900 dark:bg-green-800/30 dark:text-green-400': chunk.confidenceScore > 0.8,
                                    'bg-yellow-400/60 text-yellow-900 dark:bg-yellow-800/30 dark:text-yellow-400':
                                      chunk.confidenceScore > 0.5 && chunk.confidenceScore <= 0.8,
                                    'bg-red-400/60 text-red-900 dark:bg-red-800/30 dark:text-red-400': chunk.confidenceScore <= 0.5,
                                  })}
                                >
                                  {(chunk.confidenceScore * 100).toFixed(0)}% Confidence
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
