import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const inputVariants = cva(
  'flex h-12 w-full px-4 py-3 text-base font-medium text-black transition-all placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 file:border-0 file:bg-transparent file:text-sm file:font-bold file:text-black',
  {
    variants: {
      variant: {
        brutal:
          'rounded-md border-3 border-black bg-white shadow-brutal-sm focus-visible:outline-none focus-visible:shadow-brutal focus-visible:-translate-x-0.5 focus-visible:-translate-y-0.5',
        soft:
          'rounded-lg border border-zinc-200 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/20 focus-visible:border-teal-500 hover:border-zinc-300',
      },
    },
    defaultVariants: {
      variant: 'soft',
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input, inputVariants };
