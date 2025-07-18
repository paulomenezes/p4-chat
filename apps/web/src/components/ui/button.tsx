import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center cursor-pointer justify-center gap-2 transition-colors whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: 'border border-solid border-secondary-foreground/10 bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'disabled:hover:bg-destructive text-destructive-foreground border-red-800/20 bg-red-800/80 hover:bg-red-600 dark:bg-red-800/20 hover:dark:bg-red-800',
        outline:
          'border border-solid border-secondary-foreground/10 hover:bg-muted/40 hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50 text-muted-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-muted-foreground/10 hover:text-muted-foreground dark:hover:bg-muted-foreground/5',
        ghost: 'hover:bg-accent hover:bg-muted/40 hover:text-foreground disabled:hover:bg-transparent dark:text-muted-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        xs: 'h-auto px-3 py-1.5 text-xs',
        sm: 'h-8 rounded-md gap-1.5 px-3',
        lg: 'h-10 rounded-md px-6',
        icon: 'size-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
