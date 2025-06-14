import type { Doc } from '@p4-chat/backend/convex/_generated/dataModel';
import { ZapIcon, CpuIcon, ClockIcon, InfoIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

export function MessageStats({ message }: { message: Doc<'messages'> }) {
  return (
    <div className="flex flex-row gap-2 text-xs text-muted-foreground">
      {!!message.tokensPerSecond && (
        <div className="flex items-center gap-1">
          <ZapIcon className="size-3" />
          <span>{message.tokensPerSecond.toFixed(2)} tok/sec</span>
        </div>
      )}
      {!!message.totalTokens && (
        <div className="flex items-center gap-1">
          <CpuIcon className="size-3" />
          <span>{message.totalTokens} tokens</span>
        </div>
      )}
      {!!message.durationSeconds && (
        <div className="flex items-center gap-1">
          <ClockIcon className="size-3" />
          <span>{message.durationSeconds.toFixed(2)} sec</span>
        </div>
      )}
    </div>
  );
}

export function MessageStatsMobile({ message }: { message: Doc<'messages'> }) {
  return (
    <>
      {!!message.tokensPerSecond ||
        !!message.totalTokens ||
        (!!message.durationSeconds && (
          <Popover>
            <PopoverTrigger asChild>
              <button type="button" className="flex h-8 w-8 flex-row items-center justify-center sm:hidden">
                <InfoIcon className="size-4 rounded-lg p-0 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-fit">
              <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                {!!message.tokensPerSecond && (
                  <div className="flex items-center gap-1">
                    <ZapIcon className="size-3" />
                    <span>{message.tokensPerSecond.toFixed(2)} tok/sec</span>
                  </div>
                )}
                {!!message.totalTokens && (
                  <div className="flex items-center gap-1">
                    <CpuIcon className="size-3" />
                    <span>{message.totalTokens} tokens</span>
                  </div>
                )}
                {!!message.durationSeconds && (
                  <div className="flex items-center gap-1">
                    <ClockIcon className="size-3" />
                    <span>{message.durationSeconds.toFixed(2)} sec</span>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        ))}
    </>
  );
}
