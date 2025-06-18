'use client';

import { deleteApiKey, setApiKey } from '@/actions/set-api-key';
import { CheckIcon, KeyIcon, Trash2Icon } from 'lucide-react';
import { useCallback, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { api } from '@p4-chat/backend/convex/_generated/api';
import { useQuery } from 'convex/react';
import { Input } from './ui/input';

export function ApiKeys() {
  const keys = useQuery(api.keys.getApiKeys);

  const [openRouterKey, setOpenRouterKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [googleKey, setGoogleKey] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSave = useCallback(async (type: 'openRouter' | 'openai' | 'google', key: string) => {
    if (!key) {
      toast.error('API key is required');
      return;
    }

    startTransition(async () => {
      toast.promise(setApiKey(type, key), {
        loading: 'Saving...',
        success: 'API key saved',
        error: 'Failed to save API key',
      });

      if (type === 'openRouter') {
        setOpenRouterKey('');
      } else if (type === 'openai') {
        setOpenaiKey('');
      } else if (type === 'google') {
        setGoogleKey('');
      }
    });
  }, []);

  const handleDelete = useCallback(async (type: 'openRouter' | 'openai' | 'google') => {
    startTransition(async () => {
      toast.promise(deleteApiKey(type), {
        loading: 'Deleting...',
        success: 'API key deleted',
        error: 'Failed to delete API key',
      });
    });
  }, []);

  return (
    <div className="space-y-4 w-full">
      <div className="space-y-4 rounded-lg border border-input p-4">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between h-8">
            <div className="flex items-center gap-2">
              <KeyIcon className="size-4" />
              <h3 className="font-semibold">OpenRouter API Key</h3>
            </div>

            {keys?.openRouterDefined && (
              <Button type="button" size="sm" variant="secondary" onClick={() => handleDelete('openRouter')} disabled={isPending}>
                <Trash2Icon className="size-3" />
              </Button>
            )}
          </div>
        </div>
        {keys?.openRouterDefined ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckIcon className="size-4 text-green-500" />
            API key configured
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Input placeholder="sk-..." type="password" value={openRouterKey} onChange={(e) => setOpenRouterKey(e.target.value)} />
              <p className="prose prose-blue text-xs text-muted-foreground">
                Get your API key from the{' '}
                <a
                  href="https://openrouter.ai/settings/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-underline hover:underline"
                >
                  OpenRouter's Console
                </a>
              </p>
            </div>
            <div className="flex w-full justify-end gap-2">
              <Button type="button" onClick={() => handleSave('openRouter', openRouterKey)} disabled={isPending}>
                Save
              </Button>
            </div>
          </div>
        )}
      </div>
      <div className="space-y-4 rounded-lg border border-input p-4">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between h-8">
            <div className="flex items-center gap-2">
              <KeyIcon className="size-4" />
              <h3 className="font-semibold">OpenAI API Key</h3>
            </div>

            {keys?.openaiDefined && (
              <Button type="button" size="sm" variant="secondary" onClick={() => handleDelete('openai')} disabled={isPending}>
                <Trash2Icon className="size-3" />
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">Used for the following models:</p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-secondary px-2 py-1 text-xs">GPT ImageGen</span>
          </div>
        </div>
        {keys?.openaiDefined ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckIcon className="size-4 text-green-500" />
            API key configured
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Input placeholder="sk-ant-..." type="password" value={openaiKey} onChange={(e) => setOpenaiKey(e.target.value)} />
              <p className="prose prose-blue text-xs text-muted-foreground">
                Get your API key from the{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-underline hover:underline"
                >
                  OpenAI's Console
                </a>
              </p>
            </div>
            <div className="flex w-full justify-end gap-2">
              <Button type="button" onClick={() => handleSave('openai', openaiKey)} disabled={isPending}>
                Save
              </Button>
            </div>
          </div>
        )}
      </div>
      <div className="space-y-4 rounded-lg border border-input p-4">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between h-8">
            <div className="flex items-center gap-2">
              <KeyIcon className="size-4" />
              <h3 className="font-semibold">Google API Key</h3>
            </div>

            {keys?.googleDefined && (
              <Button type="button" size="sm" variant="secondary" onClick={() => handleDelete('google')} disabled={isPending}>
                <Trash2Icon className="size-3" />
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">Used for the following models:</p>
          <div className="flex flex-wrap gap-2">
            {['Gemini 2.0 Flash', 'Gemini 2.0 Flash Lite', 'Gemini 2.5 Flash', 'Gemini 2.5 Flash (Thinking)', 'Gemini 2.5 Pro'].map(
              (model) => (
                <span key={model} className="rounded-full bg-secondary px-2 py-1 text-xs">
                  {model}
                </span>
              ),
            )}
          </div>
        </div>
        {keys?.googleDefined ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckIcon className="size-4 text-green-500" />
            API key configured
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Input placeholder="sk-ant-..." type="password" value={googleKey} onChange={(e) => setGoogleKey(e.target.value)} />
              <p className="prose prose-blue text-xs text-muted-foreground">
                Get your API key from the{' '}
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-underline hover:underline"
                >
                  Google's Console
                </a>
              </p>
            </div>
            <div className="flex w-full justify-end gap-2">
              <Button type="button" onClick={() => handleSave('google', googleKey)} disabled={isPending}>
                Save
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
