import { Anthropic } from '@/icons/anthropic';
import { DeepSeek } from '@/icons/deep-seek';
import { Gemini } from '@/icons/gemini';
import { Grok } from '@/icons/grok';
import { Meta } from '@/icons/meta';
import { OpenAI } from '@/icons/open-ai';
import { Qwen } from '@/icons/qwen';
import { MODELS } from '@p4-chat/backend/models';

export const MODEL_GROUPS = [
  {
    name: 'DeepSeek',
    models: MODELS.filter((model) => model.id.startsWith('deepseek')),
    icon: DeepSeek,
  },
  {
    name: 'Meta',
    models: MODELS.filter((model) => model.id.startsWith('meta')),
    icon: Meta,
  },
  {
    name: 'Qwen',
    models: MODELS.filter((model) => model.id.startsWith('eva-unit')),
    icon: Qwen,
  },
  {
    name: 'Gemini',
    models: MODELS.filter((model) => model.id.startsWith('google')),
    icon: Gemini,
  },
  {
    name: 'OpenAI',
    models: MODELS.filter((model) => model.id.startsWith('openai')),
    icon: OpenAI,
  },
  {
    name: 'Grok',
    models: MODELS.filter((model) => model.id.startsWith('x-ai')),
    icon: Grok,
  },
  {
    name: 'Anthropic',
    models: MODELS.filter((model) => model.id.startsWith('anthropic')),
    icon: Anthropic,
  },
];
