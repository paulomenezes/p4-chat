import type { MODELS } from '@p4-chat/backend/models';
import { ModelFeature } from './model-feature';

export function ModelFeatures({ model }: { model: (typeof MODELS)[number] }) {
  return (
    <div className="flex items-center gap-2">
      {model.supported_parameters.includes('reasoning') && <ModelFeature feature="reasoning" hideLabel />}
      {model.architecture.input_modalities.includes('image') && <ModelFeature feature="vision" hideLabel />}
      {model.architecture.input_modalities.includes('file') && <ModelFeature feature="pdfs" hideLabel />}
      {model.description.includes('fast') && <ModelFeature feature="fast" hideLabel />}
      {/* {model.description.includes('search') && <ModelFeature feature="search" hideLabel />} */}
      {/* {model.description.includes('effortControl') && <ModelFeature feature="effortControl" hideLabel />} */}
    </div>
  );
}
