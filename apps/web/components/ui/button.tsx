import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold uppercase tracking-wide rounded-md border-3 border-black transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black focus-visible:ring-offset-4 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed active:translate-x-1 active:translate-y-1 active:shadow-none',
  {
    variants: {
      variant: {
        primary:
          'bg-primary-500 text-black shadow-brutal hover:bg-primary-600 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-md',
        secondary:
          'bg-secondary-500 text-white shadow-brutal hover:bg-secondary-600 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-md',
        accent:
          'bg-accent-500 text-black shadow-brutal hover:bg-accent-600 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-md',
        destructive:
          'bg-destructive-500 text-white shadow-brutal hover:bg-destructive-600 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-md',
        outline:
          'bg-white text-black shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-md',
        ghost:
          'border-transparent bg-transparent shadow-none hover:bg-gray-100 rounded-md',
        link:
          'border-transparent bg-transparent shadow-none text-primary-600 underline-offset-4 hover:underline rounded-none',
      },
      size: {
        sm: 'h-9 px-3 py-2 text-xs',
        md: 'h-11 px-6 py-3 text-sm',
        lg: 'h-14 px-8 py-4 text-base',
        xl: 'h-16 px-10 py-5 text-lg',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
