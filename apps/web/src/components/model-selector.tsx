import { ChevronDownIcon, FilterIcon, InfoIcon } from 'lucide-react';
import { MODEL_FEATURES, ModelFeature } from './model-feature';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { useMutation } from 'convex/react';
import { api } from '@p4-chat/backend/convex/_generated/api';
import { MODELS } from '@p4-chat/backend/models';
import { useSessionId } from 'convex-helpers/react/sessions';
import { useQueryWithStatus } from '@/hooks/use-query';
import { getModelFromId, getModelName } from '@/lib/utils';
import { ModelFeatures } from './model-features';
import { ModelIcon } from './model-icon';
import { Button } from './ui/button';
import { useQueryState } from 'nuqs';
import type { Id } from '@p4-chat/backend/convex/_generated/dataModel';

export function ModelSelector({ currentModel, setCurrentModel }: { currentModel: string; setCurrentModel: (model: string) => void }) {
  const [chatId] = useQueryState('chat');
  const [sessionId] = useSessionId();
  const userConfig = useQueryWithStatus(api.user.getUserConfig, sessionId ? { sessionId } : 'skip');
  const updateCurrentlySelectedModel = useMutation(api.user.updateCurrentlySelectedModel).withOptimisticUpdate((localStore, args) => {
    if (!sessionId) {
      return;
    }

    const getUserConfigCurrentValue = localStore.getQuery(api.user.getUserConfig, { sessionId });

    if (getUserConfigCurrentValue) {
      localStore.setQuery(
        api.user.getUserConfig,
        { sessionId },
        {
          ...getUserConfigCurrentValue,
          currentlySelectedModel: args.currentlySelectedModel,
        },
      );
    }

    if (args.threadId) {
      const threadCurrentValue = localStore.getQuery(api.threads.getById, { id: args.threadId });

      if (threadCurrentValue) {
        localStore.setQuery(api.threads.getById, { id: args.threadId }, { ...threadCurrentValue, model: args.currentlySelectedModel });
      }
    }
  });

  const [open, setOpen] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const selectedModel = getModelFromId(currentModel);

  const filteredModels =
    selectedFeatures.length === 0
      ? MODELS
      : MODELS.filter((model) => {
          let isMatch = false;

          for (const selectedFeature of selectedFeatures) {
            if (
              (selectedFeature === 'reasoning' && model.supported_parameters.includes('reasoning')) ||
              (selectedFeature === 'vision' && model.supported_parameters.includes('vision')) ||
              (selectedFeature === 'pdfs' && model.supported_parameters.includes('pdf')) ||
              (selectedFeature === 'fast' && model.supported_parameters.includes('fast')) ||
              (selectedFeature === 'search' && model.supported_parameters.includes('search')) ||
              // (selectedFeature === 'effortControl' && model.supported_parameters.includes('effort-control')) ||
              (selectedFeature === 'image-generation' && model.supported_parameters.includes('image-generation'))
            ) {
              isMatch = true;
            }
          }

          return isMatch;
        });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="secondary" size="xs" className="pl-2 pr-2.5 -mb-1.5" type="button">
          <div className="text-left text-sm font-medium">{getModelName(selectedModel?.name)}</div>
          <ChevronDownIcon className="right-0 size-4 scale-x-[-1]" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[420px] p-0">
        <Command>
          <CommandInput placeholder="Search models..." className="h-9" />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            <CommandGroup>
              {filteredModels.map((model) => (
                <CommandItem
                  key={model.id}
                  value={model.id}
                  onSelect={(currentValue) => {
                    if (!sessionId) {
                      return;
                    }

                    if (userConfig) {
                      updateCurrentlySelectedModel({
                        id: userConfig?.data?._id,
                        currentlySelectedModel: currentValue,
                        sessionId,
                        threadId: (chatId ?? undefined) as Id<'threads'> | undefined,
                      });
                    } else {
                      updateCurrentlySelectedModel({
                        currentlySelectedModel: currentValue,
                        sessionId,
                        threadId: (chatId ?? undefined) as Id<'threads'> | undefined,
                      });
                    }

                    setCurrentModel(model.id);
                    setOpen(false);
                  }}
                >
                  <div className="flex w-full items-center justify-between" tabIndex={-1}>
                    <div className="flex items-center gap-2 pr-2 font-medium text-muted-foreground transition-colors">
                      <ModelIcon modelId={model.id} />
                      <span className="w-fit">{getModelName(model.name)}</span>
                    </div>
                    <ModelFeatures model={model} />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <div className="flex items-center justify-end rounded-b-lg bg-popover pb-1 pl-1 pr-2.5 pt-1.5 sm:inset-x-0 relative">
            <div className="absolute inset-x-3 top-0 border-b border-chat-border"></div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" type="button" className="relative">
                  <FilterIcon className="size-4" />
                  {selectedFeatures.length > 0 && <div className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-red-500" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="right">
                <DropdownMenuItem onSelect={() => setSelectedFeatures([])}>Clear filters</DropdownMenuItem>
                <DropdownMenuSeparator />
                {Object.keys(MODEL_FEATURES).map((feature) => (
                  <DropdownMenuCheckboxItem
                    key={feature}
                    checked={selectedFeatures.includes(feature)}
                    onCheckedChange={() =>
                      setSelectedFeatures(
                        selectedFeatures.includes(feature) ? selectedFeatures.filter((f) => f !== feature) : [...selectedFeatures, feature],
                      )
                    }
                  >
                    <ModelFeature feature={feature as keyof typeof MODEL_FEATURES} />
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
