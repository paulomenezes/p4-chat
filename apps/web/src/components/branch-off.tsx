import { SplitIcon } from 'lucide-react';
import { useMutation } from 'convex/react';
import { useQueryState } from 'nuqs';
import type { Doc } from '@p4-chat/backend/convex/_generated/dataModel';
import { api } from '@p4-chat/backend/convex/_generated/api';
import type { SessionId } from 'convex-helpers/server/sessions';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ModelFeatures } from './model-features';
import { useCallback } from 'react';
import { MODEL_GROUPS } from '@/lib/model-groups';
import { getModelName } from '@/lib/utils';

export function BranchOff({
  message,
  sessionId,
  variant = 'secondary',
}: {
  message: Doc<'messages'>;
  sessionId: SessionId | undefined;
  variant?: 'secondary' | 'ghost';
}) {
  const branchOff = useMutation(api.threads.branchOff);
  const [, setChatId] = useQueryState('chat');

  const onSelect = useCallback(
    async (modelId: string | undefined) => {
      if (sessionId) {
        const newThreadId = await branchOff({ id: message.threadId, messageId: message._id, sessionId, modelId });
        setChatId(newThreadId);
      }
    },
    [branchOff, message.threadId, message._id, sessionId, setChatId],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} aria-label="Branch off message" size="icon">
          <div className="relative size-4">
            <SplitIcon className="size-4" />
            <span className="sr-only">Branch off</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem className="flex items-center gap-4" onClick={() => onSelect(undefined)}>
          <SplitIcon className="size-4 text-foreground" />
          Branch off
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {MODEL_GROUPS.map((group) => (
          <DropdownMenuGroup key={group.name}>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex items-center gap-4">
                <group.icon className="size-4 text-foreground" />
                {group.name}
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  {group.models.map((model) => (
                    <DropdownMenuItem key={model.id} className="flex items-center justify-between gap-4" onClick={() => onSelect(model.id)}>
                      <div className="flex items-center gap-2">
                        <group.icon className="size-4 text-foreground" />
                        <span>{getModelName(model.name)}</span>
                      </div>

                      <ModelFeatures model={model} />
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
