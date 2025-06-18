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
import { useMemo, useState } from 'react';
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

export function ModelSelector() {
  const [sessionId] = useSessionId();
  const userConfig = useQueryWithStatus(api.user.getUserConfig, sessionId ? { sessionId } : 'skip');
  const updateCurrentlySelectedModel = useMutation(api.user.updateCurrentlySelectedModel).withOptimisticUpdate((localStore, args) => {
    if (!sessionId) {
      return;
    }

    const currentValue = localStore.getQuery(api.user.getUserConfig, { sessionId });

    if (!currentValue) {
      return;
    }

    localStore.setQuery(
      api.user.getUserConfig,
      { sessionId },
      {
        ...currentValue,
        currentlySelectedModel: args.currentlySelectedModel,
      },
    );
  });

  const [open, setOpen] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const selectedModel = useMemo(() => {
    return getModelFromId(userConfig?.data?.currentlySelectedModel);
  }, [userConfig?.data?.currentlySelectedModel]);

  const filteredModels = useMemo(() => {
    if (selectedFeatures.length === 0) {
      return MODELS;
    }

    return MODELS.filter((model) => {
      let isMatch = false;

      for (const selectedFeature of selectedFeatures) {
        if (selectedFeature === 'reasoning' && model.supported_parameters.includes('reasoning')) {
          isMatch = true;
        }
        if (selectedFeature === 'vision' && model.architecture.input_modalities.includes('image')) {
          isMatch = true;
        }
        if (selectedFeature === 'pdfs' && model.architecture.input_modalities.includes('file')) {
          isMatch = true;
        }
        if (selectedFeature === 'fast' && model.description.includes('fast')) {
          isMatch = true;
        }

        return isMatch;
      }
    });
  }, [selectedFeatures]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-muted/40 hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50 h-8 rounded-md text-xs relative gap-2 px-2 py-1.5 -mb-2 text-muted-foreground"
          type="button"
        >
          <div className="text-left text-sm font-medium">{getModelName(selectedModel?.name)}</div>
          <ChevronDownIcon className="right-0 size-4" />
        </button>
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
                      });
                    } else {
                      updateCurrentlySelectedModel({
                        currentlySelectedModel: currentValue,
                        sessionId,
                      });
                    }

                    setOpen(false);
                  }}
                >
                  <div className="flex w-full items-center justify-between" tabIndex={-1}>
                    <div className="flex items-center gap-2 pr-2 font-medium text-muted-foreground transition-colors">
                      <ModelIcon modelId={model.id} />
                      <span className="w-fit">{getModelName(model.name)}</span>
                      {/* <button className="p-1.5">
                        <InfoIcon className="size-3 text-color-heading" />
                      </button> */}
                    </div>
                    <ModelFeatures model={model} />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <div className="flex items-center justify-end rounded-b-lg bg-popover pb-1 pl-1 pr-2.5 pt-1.5 sm:inset-x-0 relative">
            <div className="absolute inset-x-3 top-0 border-b border-chat-border"></div>
            {/* <button className="justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-muted/40 hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50 h-9 px-4 py-2 flex items-center gap-2 pl-2 text-sm text-muted-foreground">
              <ChevronUpIcon className="size-4" />
              Show all
            </button> */}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-muted/40 hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50 h-8 rounded-md text-xs relative gap-2 px-2 text-muted-foreground"
                  type="button"
                >
                  <FilterIcon className="size-4" />
                </button>
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
