'use client';

import { Fragment, useEffect, useRef, useState, type CSSProperties } from 'react';
import { ChatForm } from '@/components/chat-form';
import { Message } from '@/components/message';
import type { Doc, Id } from '@p4-chat/backend/convex/_generated/dataModel';
import { api } from '@p4-chat/backend/convex/_generated/api';
import { useQueryState } from 'nuqs';
import dynamic from 'next/dynamic';
import { ChevronDownIcon, Settings2Icon } from 'lucide-react';
import { useQueryWithStatus } from '@/hooks/use-query';
import { useSessionId } from 'convex-helpers/react/sessions';
import type { SessionId } from 'convex-helpers/server/sessions';
import { ModeToggle } from './mode-toggle';
import Link from 'next/link';
import { Button } from './ui/button';
import { useSidebar } from './ui/sidebar';
import { cn } from '@/lib/utils';

const MessageStream = dynamic(() => import('./message-stream'), { ssr: false });

export function Chat({ serverUser, serverSessionId }: { serverUser: Doc<'users'> | null; serverSessionId: SessionId | null }) {
  const [chatId] = useQueryState('chat');
  const [sessionId] = useSessionId() ?? [serverSessionId];

  const [isEmpty, setIsEmpty] = useState(true);
  const [showNewChatMessages, setShowNewChatMessages] = useState(!chatId);
  const [drivenIds, setDrivenIds] = useState<Set<string>>(new Set());

  const messages = useQueryWithStatus(
    api.messages.listMessages,
    sessionId && chatId
      ? {
          sessionId,
          threadId: chatId as Id<'threads'>,
        }
      : 'skip',
  );

  const [isSearching, setIsSearching] = useState(false);
  const [isIntersecting, setIntersecting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { open } = useSidebar();

  useEffect(() => {
    if (!messagesEndRef.current) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        setIntersecting(entry.isIntersecting);
      });
    });

    observer.observe(messagesEndRef.current);

    return () => observer.disconnect();
  }, [messagesEndRef, chatId]);

  function scrollToBottom() {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTo({
        top: messageContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }

  const currentStreamId = messages?.data?.find((message) => message.responseStreamId)?.responseStreamId;

  useEffect(() => {
    setShowNewChatMessages(!chatId);
  }, [chatId]);

  return (
    <div className="firefox-scrollbar-margin-fix min-h-pwa relative flex w-full flex-1 flex-col overflow-hidden transition-[width,height]">
      <div
        className={cn(
          'absolute bottom-0 top-0 w-full overflow-hidden border-l border-t border-chat-border bg-chat-background bg-fixed pb-[140px] transition-all ease-snappy max-sm:border-none sm:translate-y-3.5',
          {
            'sm:rounded-tl-xl': open,
          },
        )}
      >
        <div className="bg-noise absolute inset-0 -top-3.5 bg-fixed transition-transform ease-snappy [background-position:right_bottom]"></div>
      </div>
      <div className="absolute inset-x-3 top-0 z-10 box-content overflow-hidden border-b border-chat-border bg-gradient-noise-top/80 backdrop-blur-md transition-[transform,border] ease-snappy blur-fallback:bg-gradient-noise-top max-sm:hidden sm:h-3.5">
        <div className="absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-gradient-noise-top to-transparent blur-fallback:hidden"></div>
        <div className="absolute right-24 top-0 h-full w-8 bg-gradient-to-l from-gradient-noise-top to-transparent blur-fallback:hidden"></div>
        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-noise-top blur-fallback:hidden"></div>
      </div>
      <div className="absolute bottom-0 top-0 w-full">
        <div className="pointer-events-none absolute bottom-0 z-10 w-full px-2">
          <div className="relative mx-auto flex w-full max-w-3xl flex-col text-center">
            <div className="flex justify-center pb-4">
              {!isIntersecting && !!messages?.data?.length && (
                <Button
                  variant="secondary"
                  className="rounded-full border border-secondary/40 bg-(--chat-overlay) text-secondary-foreground/70 backdrop-blur-xl hover:bg-secondary pointer-events-auto"
                  onClick={scrollToBottom}
                >
                  <span className="pb-0.5">Scroll to bottom</span>
                  <ChevronDownIcon className="size-4 -mr-1" />
                </Button>
              )}
            </div>
            <div className="pointer-events-none">
              <div className="pointer-events-auto mx-auto w-fit"></div>
              <div className="pointer-events-auto">
                <div
                  className="border-reflect rounded-t-[20px] bg-chat-input-background p-2 pb-0 backdrop-blur-lg ![--c:--chat-input-gradient]"
                  style={
                    {
                      '--gradientBorder-gradient':
                        'linear-gradient(180deg, var(--min), var(--max), var(--min)), linear-gradient(15deg, var(--min) 50%, var(--max))',
                      '--start': '#000000e0',
                      '--opacity': '1',
                    } as CSSProperties
                  }
                >
                  <ChatForm
                    serverSessionId={serverSessionId}
                    serverUser={serverUser}
                    isSearching={isSearching}
                    currentStreamId={currentStreamId}
                    inputRef={inputRef}
                    showNewChatMessages={showNewChatMessages}
                    setIsSearching={setIsSearching}
                    setIsEmpty={setIsEmpty}
                    setShowNewChatMessages={setShowNewChatMessages}
                    setDrivenIds={setDrivenIds}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className="absolute inset-0 overflow-y-scroll sm:pt-3.5"
          style={{
            paddingBottom: '144px',
            scrollbarGutter: 'stable both-edges',
          }}
          ref={messageContainerRef}
        >
          <div className="fixed right-2 top-5 z-20 max-sm:hidden">
            <div className="flex flex-row items-center bg-gradient-noise-top text-muted-foreground gap-0.5 rounded-md p-1 transition-all rounded-bl-xl">
              {serverUser && (
                <Link aria-label="Go to settings" href="/settings">
                  <Button variant="ghost" size="icon" type="button">
                    <Settings2Icon className="size-4" />
                  </Button>
                </Link>
              )}

              <ModeToggle />
            </div>
          </div>
          <div
            role="log"
            aria-label="Chat messages"
            aria-live="polite"
            className="mx-auto flex w-full max-w-3xl flex-col space-y-12 px-4 pb-10 pt-safe-offset-10"
          >
            <div id="new-chat-messages" />
            {(!showNewChatMessages || !isEmpty) && (
              <>
                {messages?.data?.map((message) => (
                  <Fragment key={message._id}>
                    <Message message={message} sessionId={sessionId} setDrivenIds={setDrivenIds} />
                    {message.responseStreamId && (
                      <MessageStream message={message} isDriven={drivenIds.has(message._id)} threadId={chatId as Id<'threads'>} />
                    )}
                  </Fragment>
                ))}
                <div ref={messagesEndRef} className="size-2" />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
