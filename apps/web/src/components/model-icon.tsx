import { Anthropic } from '@/icons/anthropic';
import { DeepSeek } from '@/icons/deep-seek';
import { Gemini } from '@/icons/gemini';
import { Grok } from '@/icons/grok';
import { Meta } from '@/icons/meta';
import { OpenAI } from '@/icons/open-ai';
import { Qwen } from '@/icons/qwen';

export const MODEL_ICONS = [
  {
    id: 'deepseek',
    icon: DeepSeek,
  },
  {
    id: 'meta',
    icon: Meta,
  },
  {
    id: 'eva-unit',
    icon: Qwen,
  },
  {
    id: 'google',
    icon: Gemini,
  },
  {
    id: 'openai',
    icon: OpenAI,
  },
  {
    id: 'x-ai',
    icon: Grok,
  },
  {
    id: 'anthropic',
    icon: Anthropic,
  },
];

export function ModelIcon({ modelId }: { modelId: string }) {
  const Icon = MODEL_ICONS.find((model) => modelId.startsWith(model.id))?.icon;

  if (!Icon) {
    return null;
  }

  return <Icon className="size-4" />;
}
