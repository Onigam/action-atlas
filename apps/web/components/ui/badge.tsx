import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        primary:
          'uppercase font-bold border-2 border-black shadow-brutal-sm bg-primary-200 text-primary-800 border-primary-400 hover:bg-primary-300 focus:ring-black',
        secondary:
          'border border-secondary-300 bg-secondary-100 text-secondary-800 hover:bg-secondary-200 focus:ring-secondary-400',
        accent:
          'border border-accent-300 bg-accent-100 text-accent-800 hover:bg-accent-200 focus:ring-accent-400',
        destructive:
          'border border-destructive-600 bg-destructive-500 text-white hover:bg-destructive-600 focus:ring-destructive-400',
        success:
          'border border-success-300 bg-success-100 text-success-800 hover:bg-success-200 focus:ring-success-400',
        warning:
          'border border-warning-300 bg-warning-100 text-warning-800 hover:bg-warning-200 focus:ring-warning-400',
        outline:
          'border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 focus:ring-zinc-400',
        ghost:
          'border-transparent bg-zinc-100 text-zinc-700 hover:bg-zinc-200 focus:ring-zinc-400',
        muted:
          'border border-zinc-200 bg-zinc-100 text-zinc-600 hover:bg-zinc-150 focus:ring-zinc-300',
        subtle:
          'border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 focus:ring-teal-300',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
