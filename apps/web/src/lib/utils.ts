import { MODELS } from '@p4-chat/backend/models';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeText(text: string) {
  return text.replace('<has_function_call>', '');
}

export function getModelFromId(modelId?: string | null) {
  return (modelId ? MODELS.find((model) => model.id === modelId) : MODELS[0]) ?? MODELS[0];
}

export function getModelName(name: string) {
  const index = name.indexOf(':');

  if (index === -1) {
    return name;
  }

  return name.slice(index + 1).trim();
}

export function getModelNameFromId(modelId?: string | null) {
  const name = (modelId ? MODELS.find((model) => model.id === modelId)?.name : MODELS[0]?.name) ?? MODELS[0]?.name;

  return getModelName(name);
}
