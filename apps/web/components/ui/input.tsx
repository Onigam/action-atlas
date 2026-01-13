import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-12 w-full rounded-md border-3 border-black bg-white px-4 py-3 text-base font-medium text-black shadow-brutal-sm transition-all placeholder:text-gray-500 focus-visible:outline-none focus-visible:shadow-brutal focus-visible:-translate-x-0.5 focus-visible:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100',
          'file:border-0 file:bg-transparent file:text-sm file:font-bold file:text-black',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
