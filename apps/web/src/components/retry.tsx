import { RefreshCcwIcon } from 'lucide-react';
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
import { MODEL_GROUPS } from '@/lib/model-groups';
import { ModelFeatures } from './model-features';
import { getModelName } from '@/lib/utils';

export function Retry({
  variant = 'secondary',
  onRetry,
}: {
  onRetry: (modelId: string | undefined) => void;
  variant?: 'secondary' | 'ghost';
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} aria-label="Retry message" size="icon">
          <div className="relative size-4">
            <RefreshCcwIcon className="size-4" />
            <span className="sr-only">Retry</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem className="flex items-center gap-4" onClick={() => onRetry(undefined)}>
          <RefreshCcwIcon className="size-4 text-foreground" />
          Retry same
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
                    <DropdownMenuItem key={model.id} className="flex items-center justify-between gap-4" onClick={() => onRetry(model.id)}>
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
