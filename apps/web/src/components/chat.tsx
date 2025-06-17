'use client';

import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { ChatForm } from '@/components/chat-form';
import { Message } from '@/components/message';
import type { Doc, Id } from '@p4-chat/backend/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { api } from '@p4-chat/backend/convex/_generated/api';
import { useQueryState } from 'nuqs';
import dynamic from 'next/dynamic';
import { NewChatMessages } from './new-chat-messages';
import { ChevronDownIcon, Settings2Icon } from 'lucide-react';
import { useQueryWithStatus } from '@/hooks/use-query';
import { useSessionId } from 'convex-helpers/react/sessions';
import { setSessionIdCookie } from '@/actions/set-cookies';
import type { SessionId } from 'convex-helpers/server/sessions';
import { ModeToggle } from './mode-toggle';
import { useFileUpload } from '@/hooks/use-file-upload';

const ServerMessage = dynamic(() => import('./stream-message'), { ssr: false });

const maxSizeMB = 5;
const maxSize = maxSizeMB * 1024 * 1024; // 5MB default
const maxFiles = 2;

export function Chat({ serverUser, serverSessionId }: { serverUser: Doc<'users'> | null; serverSessionId: SessionId | null }) {
  const [chatId, setChatId] = useQueryState('chat');
  const [sessionId] = useSessionId() ?? [serverSessionId];

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
  const sendMessage = useMutation(api.messages.sendMessage);
  const retryMessage = useMutation(api.messages.retryMessage);
  const [inputValue, setInputValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isIntersecting, setIntersecting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  const scrollToBottom = useCallback(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTo({
        top: messageContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, []);

  const currentStreamId = useMemo(() => {
    return messages?.data?.find((message) => message.responseStreamId)?.responseStreamId;
  }, [messages]);

  const [{ files }, { openFileDialog, removeFile, getInputProps, clearFiles }] = useFileUpload({
    accept: 'image/svg+xml,image/png,image/jpeg,image/jpg,image/gif,application/pdf,text/plain',
    maxSize,
    multiple: true,
    maxFiles,
    sessionId,
  });

  useEffect(() => {
    setShowNewChatMessages(!chatId);
  }, [chatId]);

  return (
    <div className="firefox-scrollbar-margin-fix min-h-pwa relative flex w-full flex-1 flex-col overflow-hidden transition-[width,height]">
      <div className="absolute bottom-0 top-0 w-full overflow-hidden border-l border-t border-chat-border bg-chat-background bg-fixed pb-[140px] transition-all ease-snappy max-sm:border-none sm:translate-y-3.5 sm:rounded-tl-xl">
        <div className="bg-noise absolute inset-0 -top-3.5 bg-fixed transition-transform ease-snappy [background-position:right_bottom]"></div>
      </div>
      <div className="absolute inset-x-3 top-0 z-10 box-content overflow-hidden border-b border-chat-border bg-gradient-noise-top/80 backdrop-blur-md transition-[transform,border] ease-snappy blur-fallback:bg-gradient-noise-top max-sm:hidden sm:h-3.5">
        <div className="absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-gradient-noise-top to-transparent blur-fallback:hidden"></div>
        <div className="absolute right-24 top-0 h-full w-8 bg-gradient-to-l from-gradient-noise-top to-transparent blur-fallback:hidden"></div>
        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-noise-top blur-fallback:hidden"></div>
      </div>
      <div className="absolute bottom-0 top-0 w-full">
        <div className="fixed right-0 top-0 max-sm:hidden">
          <div className="group pointer-events-none absolute top-3.5 z-10 -mb-8 h-32 w-full origin-top transition-all ease-snappy">
            <svg
              className="absolute -right-8 h-9 origin-top-left skew-x-[30deg] overflow-visible"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              viewBox="0 0 128 32"
              xmlSpace="preserve"
            >
              <line
                stroke="var(--gradient-noise-top)"
                strokeWidth="2px"
                shapeRendering="optimizeQuality"
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeMiterlimit="10"
                x1="1"
                y1="0"
                x2="128"
                y2="0"
              ></line>
              <path
                stroke="var(--chat-border)"
                className="translate-y-[0.5px]"
                fill="var(--gradient-noise-top)"
                shapeRendering="optimizeQuality"
                strokeWidth="1px"
                strokeLinecap="round"
                strokeMiterlimit="10"
                vectorEffect="non-scaling-stroke"
                d="M0,0c5.9,0,10.7,4.8,10.7,10.7v10.7c0,5.9,4.8,10.7,10.7,10.7H128V0"
              ></path>
            </svg>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-0 z-10 w-full px-2">
          <div className="relative mx-auto flex w-full max-w-3xl flex-col text-center">
            <div className="flex justify-center pb-4">
              {!isIntersecting && !!messages?.data?.length && (
                <button
                  className="justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 disabled:hover:bg-secondary/50 h-8 px-3 text-xs pointer-events-auto flex items-center gap-2 rounded-full border border-secondary/40 bg-(--chat-overlay) text-secondary-foreground/70 backdrop-blur-xl hover:bg-secondary"
                  onClick={scrollToBottom}
                >
                  <span className="pb-0.5">Scroll to bottom</span>
                  <ChevronDownIcon className="size-4 -mr-1" />
                </button>
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
                    input={inputValue}
                    handleInputChange={(event) => setInputValue(event.target.value)}
                    isSearching={isSearching}
                    setIsSearching={setIsSearching}
                    currentStreamId={currentStreamId}
                    inputRef={inputRef}
                    files={files}
                    removeFile={removeFile}
                    getInputProps={getInputProps}
                    openFileDialog={openFileDialog}
                    handleSubmit={async (e) => {
                      e?.preventDefault?.();
                      setShowNewChatMessages(false);

                      if (!inputValue.trim() || !sessionId) {
                        return;
                      }

                      setInputValue('');
                      setSessionIdCookie(sessionId);

                      const { threadId, messageId } = await sendMessage({
                        prompt: inputValue,
                        threadId: (chatId ?? undefined) as Id<'threads'> | undefined,
                        sessionId,
                        isSearching,
                        files: files.map((file) => file.storageId).filter((storageId) => storageId !== undefined),
                      });

                      setChatId(threadId);
                      clearFiles();

                      setDrivenIds((prev) => {
                        prev.add(messageId);
                        return prev;
                      });

                      inputRef.current?.focus();
                    }}
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
          <div className="fixed right-0 top-0 z-20 h-16 w-28 max-sm:hidden">
            <div
              className="group pointer-events-none absolute top-3.5 z-10 -mb-8 h-32 w-full origin-top transition-all ease-snappy"
              style={{
                boxShadow: '10px -10px 8px 2px var(--gradient-noise-top)',
              }}
            >
              <svg
                className="absolute -right-8 h-9 origin-top-left skew-x-[30deg] overflow-visible"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 128 32"
                xmlSpace="preserve"
              >
                <line
                  stroke="var(--gradient-noise-top)"
                  strokeWidth="2px"
                  shapeRendering="optimizeQuality"
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                  strokeMiterlimit="10"
                  x1="1"
                  y1="0"
                  x2="128"
                  y2="0"
                ></line>
                <path
                  stroke="var(--chat-border)"
                  className="translate-y-[0.5px]"
                  fill="var(--gradient-noise-top)"
                  shapeRendering="optimizeQuality"
                  strokeWidth="1px"
                  strokeLinecap="round"
                  strokeMiterlimit="10"
                  vectorEffect="non-scaling-stroke"
                  d="M0,0c5.9,0,10.7,4.8,10.7,10.7v10.7c0,5.9,4.8,10.7,10.7,10.7H128V0"
                ></path>
              </svg>
            </div>
          </div>
          <div className="fixed right-2 top-2 z-20 max-sm:hidden">
            <div className="flex flex-row items-center bg-gradient-noise-top text-muted-foreground gap-0.5 rounded-md p-1 transition-all rounded-bl-xl">
              <a aria-label="Go to settings" role="button" data-state="closed" href="/settings/customization" data-discover="true">
                <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-muted/40 hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50 size-8 rounded-bl-xl">
                  <Settings2Icon className="size-4" />
                </button>
              </a>

              <ModeToggle />
            </div>
          </div>
          <div
            role="log"
            aria-label="Chat messages"
            aria-live="polite"
            className="mx-auto flex w-full max-w-3xl flex-col space-y-12 px-4 pb-10 pt-safe-offset-10"
          >
            {showNewChatMessages && inputValue.length === 0 ? (
              <NewChatMessages
                serverUser={serverUser}
                onSelectMessage={(message) => {
                  setInputValue(message);
                  inputRef.current?.focus();
                }}
              />
            ) : (
              <>
                {messages?.data?.map((message) => (
                  <Fragment key={message._id}>
                    <Message
                      message={message}
                      sessionId={sessionId}
                      onRetry={async (modelId: string | undefined) => {
                        if (!sessionId) {
                          return;
                        }

                        setSessionIdCookie(sessionId);

                        const { threadId, messageId } = await retryMessage({
                          messageId: message._id,
                          sessionId,
                          modelId,
                        });

                        setChatId(threadId);

                        setDrivenIds((prev) => {
                          prev.add(messageId);
                          return prev;
                        });
                      }}
                    />

                    {message.responseStreamId && (
                      <ServerMessage message={message} isDriven={drivenIds.has(message._id)} threadId={chatId as Id<'threads'>} />
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
