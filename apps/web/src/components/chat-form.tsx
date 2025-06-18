'use client';

import { ArrowUpIcon, GlobeIcon, SquareIcon } from 'lucide-react';
import { ModelSelector } from './model-selector';
import { useMutation } from 'convex/react';
import { api } from '@p4-chat/backend/convex/_generated/api';
import { Button } from './ui/button';
import { Uploader } from './uploader';
import { UploaderFileList } from './uploader-file-list';
import { useFileUpload } from '@/hooks/use-file-upload';
import { useState } from 'react';
import type { Doc, Id } from '@p4-chat/backend/convex/_generated/dataModel';
import type { SessionId } from 'convex-helpers/server/sessions';
import { setSessionIdCookie } from '@/actions/set-cookies';
import { useQueryState } from 'nuqs';
import { useSessionId } from 'convex-helpers/react/sessions';
import { createPortal } from 'react-dom';
import { NewChatMessages } from './new-chat-messages';

const maxSizeMB = 2;
const maxFiles = 2;
const maxSize = maxSizeMB * 1024 * 1024;

export function ChatForm({
  serverSessionId,
  currentStreamId,
  inputRef,
  isSearching,
  serverUser,
  showNewChatMessages,
  setIsSearching,
  setIsEmpty,
  setShowNewChatMessages,
  setDrivenIds,
}: {
  serverSessionId: SessionId | null;
  currentStreamId: string | undefined;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  isSearching: boolean;
  serverUser: Doc<'users'> | null;
  showNewChatMessages: boolean;
  setIsSearching: (isSearching: boolean) => void;
  setIsEmpty: (isEmpty: boolean) => void;
  setShowNewChatMessages: (showNewChatMessages: boolean) => void;
  setDrivenIds: (drivenIds: (prev: Set<string>) => Set<string>) => void;
}) {
  const [chatId, setChatId] = useQueryState('chat');
  const [sessionId] = useSessionId() ?? [serverSessionId];

  const [inputValue, setInputValue] = useState('');
  const stopStreaming = useMutation(api.messages.stopStreaming);

  const [{ files }, { openFileDialog, removeFile, getInputProps, clearFiles }] = useFileUpload({
    accept: 'image/png,image/jpeg,image/jpg,application/pdf',
    maxSize,
    multiple: true,
    maxFiles,
    sessionId,
  });

  function handleInputChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setInputValue(event.target.value);
    setIsEmpty(event.target.value.length === 0);
  }

  async function handleSubmit(event?: React.FormEvent<HTMLFormElement>) {
    if (!sessionId) {
      return;
    }

    event?.preventDefault?.();
    setShowNewChatMessages(false);

    const inputValue = inputRef.current?.value;

    if (!inputValue?.trim() || !sessionId) {
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
  }

  const sendMessage = useMutation(api.messages.sendMessage).withOptimisticUpdate((localStore, args) => {
    if (!sessionId) {
      return;
    }

    const currentValue = localStore.getQuery(api.messages.listMessages, { sessionId, threadId: chatId as Id<'threads'> });

    if (!currentValue || !chatId) {
      return;
    }

    const newMessage: (typeof currentValue)[number] = {
      role: 'user',
      content: args.prompt,
      userId: sessionId as unknown as Id<'users'>,
      threadId: chatId as Id<'threads'>,
      _creationTime: Date.now(),
      _id: 'new' as unknown as Id<'messages'>,
    };

    const newMessages = [...currentValue, newMessage];

    localStore.setQuery(api.messages.listMessages, { sessionId, threadId: chatId as Id<'threads'> }, newMessages);
  });

  const hasSomeFileLoading = files.some((file) => file.isLoading);
  const element = document.getElementById('new-chat-messages');

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
          <UploaderFileList files={files} removeFile={removeFile} />
          <div className="flex flex-grow flex-row items-start">
            <textarea
              placeholder="Type your message here..."
              className="w-full resize-none bg-transparent text-base leading-6 text-foreground outline-none placeholder:text-secondary-foreground/60 disabled:opacity-0"
              aria-label="Message input"
              aria-describedby="chat-input-description"
              autoComplete="off"
              id="message"
              name="message"
              value={inputValue}
              ref={inputRef}
              onBlur={handleInputChange}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !hasSomeFileLoading) {
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
              <Button
                size="icon"
                type="submit"
                disabled={(inputValue.length === 0 && !currentStreamId) || hasSomeFileLoading}
                aria-label="Message requires text"
                data-state="closed"
                onClick={() => {
                  if (currentStreamId) {
                    stopStreaming({ streamId: currentStreamId });
                  }
                }}
              >
                {currentStreamId ? <SquareIcon className="!size-5 fill-current" /> : <ArrowUpIcon className="!size-5" />}
              </Button>
            </div>

            <div className="flex flex-col gap-2 pr-2 sm:flex-row sm:items-center">
              <div className="ml-[-7px] flex items-center gap-1">
                <ModelSelector />

                <Button
                  size="xs"
                  type="button"
                  className="rounded-full pl-2 pr-2.5 -mb-1.5"
                  variant={isSearching ? 'default' : 'outline'}
                  onClick={() => setIsSearching(!isSearching)}
                >
                  <GlobeIcon className="size-4 scale-x-[-1]" />
                  <span className="max-sm:hidden">Search</span>
                </Button>

                <Uploader getInputProps={getInputProps} openFileDialog={openFileDialog} />
              </div>
            </div>
          </div>
        </div>
      </form>

      {!!element &&
        showNewChatMessages &&
        inputValue.length === 0 &&
        createPortal(
          <NewChatMessages
            serverUser={serverUser}
            onSelectMessage={(message) => {
              if (!inputRef.current) {
                return;
              }

              setInputValue(message);
              inputRef.current.focus();
            }}
          />,
          element,
        )}
    </div>
  );
}
