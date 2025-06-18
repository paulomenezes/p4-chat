import type { MODELS } from '@p4-chat/backend/models';
import { ModelFeature } from './model-feature';

export function ModelFeatures({ model }: { model: (typeof MODELS)[number] }) {
  return (
    <div className="flex items-center gap-2">
      {model.supported_parameters.includes('reasoning') && <ModelFeature feature="reasoning" hideLabel />}
      {model.supported_parameters.includes('vision') && <ModelFeature feature="vision" hideLabel />}
      {model.supported_parameters.includes('pdf') && <ModelFeature feature="pdfs" hideLabel />}
      {model.supported_parameters.includes('fast') && <ModelFeature feature="fast" hideLabel />}
      {model.supported_parameters.includes('search') && <ModelFeature feature="search" hideLabel />}
      {model.supported_parameters.includes('image-generation') && <ModelFeature feature="image-generation" hideLabel />}
    </div>
  );
}
