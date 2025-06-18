import { ZapIcon, EyeIcon, GlobeIcon, FileTextIcon, BrainIcon, Settings2Icon } from 'lucide-react';

export const MODEL_FEATURES = {
  fast: {
    icon: ZapIcon,
    name: 'Fast',
    style: { '--color-dark': 'hsl(46 77% 79%)', '--color': 'hsl(46 77% 52%)' } as React.CSSProperties,
  },
  vision: {
    icon: EyeIcon,
    name: 'Vision',
    style: { '--color-dark': 'hsl(168 54% 74%)', '--color': 'hsl(168 54% 52%)' } as React.CSSProperties,
  },
  search: {
    icon: GlobeIcon,
    name: 'Search',
    style: { '--color-dark': 'hsl(208 56% 74%)', '--color': 'hsl(208 56% 52%)' } as React.CSSProperties,
  },
  pdfs: {
    icon: FileTextIcon,
    name: 'PDFs',
    style: { '--color-dark': 'hsl(237 75% 77%)', '--color': 'hsl(237 55% 57%)' } as React.CSSProperties,
  },
  reasoning: {
    icon: BrainIcon,
    name: 'Reasoning',
    style: { '--color-dark': 'hsl(263 58% 75%)', '--color': 'hsl(263 58% 53%)' } as React.CSSProperties,
  },
  effortControl: {
    icon: Settings2Icon,
    name: 'Effort Control',
    style: { '--color-dark': 'hsl(304 44% 72%)', '--color': 'hsl(304 44% 51%)' } as React.CSSProperties,
  },
};

export function ModelFeature({ feature, hideLabel }: { feature: keyof typeof MODEL_FEATURES; hideLabel?: boolean }) {
  const Icon = MODEL_FEATURES[feature].icon;

  return (
    <>
      <div className="-ml-0.5 flex items-center gap-2">
        <div
          className="relative flex h-6 w-6 items-center justify-center overflow-hidden rounded-md text-(--color) dark:text-(--color-dark)"
          style={MODEL_FEATURES[feature].style}
        >
          <div className="absolute inset-0 bg-current opacity-20 dark:opacity-15"></div>
          <Icon className="size-4" />
        </div>
        {!hideLabel && <span>{MODEL_FEATURES[feature].name}</span>}
      </div>
    </>
  );
}
