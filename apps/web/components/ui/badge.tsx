import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border-2 border-black px-3 py-1 text-xs font-bold uppercase tracking-wide shadow-brutal-sm transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2',
  {
    variants: {
      variant: {
        primary:
          'bg-primary-200 text-primary-800 border-primary-400 hover:bg-primary-300',
        secondary:
          'bg-secondary-100 text-secondary-800 border-secondary-400 hover:bg-secondary-200',
        accent:
          'bg-accent-100 text-accent-800 border-accent-400 hover:bg-accent-200',
        destructive:
          'bg-destructive-500 text-white hover:bg-destructive-600',
        success:
          'bg-success-100 text-success-800 border-success-400 hover:bg-success-200',
        warning:
          'bg-warning-100 text-warning-800 border-warning-400 hover:bg-warning-200',
        outline:
          'bg-white text-black hover:bg-gray-100',
        ghost:
          'border-transparent bg-gray-100 text-black shadow-none hover:bg-gray-200',
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
