# Action Atlas Design System Specification

**Version**: 1.0
**Date**: 2026-01-07
**Status**: Implementation Ready

---

## Overview

This document provides the complete design system specification for Action Atlas, including all design tokens, component specifications, and implementation guidelines. This is a companion to the UI Design Research document and provides actionable specifications for developers.

---

## Table of Contents

1. [Design Tokens](#design-tokens)
2. [Component Library](#component-library)
3. [Layout System](#layout-system)
4. [Animation Specifications](#animation-specifications)
5. [Accessibility Requirements](#accessibility-requirements)
6. [Responsive Design](#responsive-design)
7. [Implementation Guide](#implementation-guide)

---

## 1. Design Tokens

### 1.1 Colors

```css
/* /styles/tokens/colors.css */

:root {
  /* Brand Colors */
  --color-primary-50: #EEF2FF;
  --color-primary-100: #E0E7FF;
  --color-primary-200: #C7D2FE;
  --color-primary-300: #A5B4FC;
  --color-primary-400: #818CF8;
  --color-primary-500: #6366F1;  /* Primary brand color */
  --color-primary-600: #4F46E5;
  --color-primary-700: #4338CA;
  --color-primary-800: #3730A3;
  --color-primary-900: #312E81;
  --color-primary-950: #1E1B4B;

  /* Accent Colors (Amber) */
  --color-accent-50: #FFFBEB;
  --color-accent-100: #FEF3C7;
  --color-accent-200: #FDE68A;
  --color-accent-300: #FCD34D;
  --color-accent-400: #FBBF24;
  --color-accent-500: #F59E0B;  /* Accent brand color */
  --color-accent-600: #D97706;
  --color-accent-700: #B45309;
  --color-accent-800: #92400E;
  --color-accent-900: #78350F;

  /* Success (Emerald) */
  --color-success-50: #ECFDF5;
  --color-success-100: #D1FAE5;
  --color-success-200: #A7F3D0;
  --color-success-300: #6EE7B7;
  --color-success-400: #34D399;
  --color-success-500: #10B981;  /* Success color */
  --color-success-600: #059669;
  --color-success-700: #047857;
  --color-success-800: #065F46;
  --color-success-900: #064E3B;

  /* Warning (Amber - same as accent) */
  --color-warning-500: #F59E0B;

  /* Error (Red) */
  --color-error-50: #FEF2F2;
  --color-error-100: #FEE2E2;
  --color-error-200: #FECACA;
  --color-error-300: #FCA5A5;
  --color-error-400: #F87171;
  --color-error-500: #EF4444;  /* Error color */
  --color-error-600: #DC2626;
  --color-error-700: #B91C1C;
  --color-error-800: #991B1B;
  --color-error-900: #7F1D1D;

  /* Info (Cyan) */
  --color-info-50: #ECFEFF;
  --color-info-100: #CFFAFE;
  --color-info-200: #A5F3FC;
  --color-info-300: #67E8F9;
  --color-info-400: #22D3EE;
  --color-info-500: #06B6D4;  /* Info color */
  --color-info-600: #0891B2;
  --color-info-700: #0E7490;
  --color-info-800: #155E75;
  --color-info-900: #164E63;

  /* Grays (Warm) */
  --color-gray-50: #FAFAF9;
  --color-gray-100: #F5F5F4;
  --color-gray-200: #E7E5E4;
  --color-gray-300: #D6D3D1;
  --color-gray-400: #A8A29E;
  --color-gray-500: #78716C;
  --color-gray-600: #57534E;
  --color-gray-700: #44403C;
  --color-gray-800: #292524;
  --color-gray-900: #1C1917;
  --color-gray-950: #0C0A09;

  /* Semantic Aliases */
  --color-background: #FFFFFF;
  --color-foreground: var(--color-gray-900);
  --color-muted: var(--color-gray-100);
  --color-muted-foreground: var(--color-gray-500);
  --color-border: var(--color-gray-200);
}

/* Dark Mode */
:root[data-theme="dark"] {
  --color-background: #0A0A0A;
  --color-foreground: #FAFAFA;
  --color-muted: #171717;
  --color-muted-foreground: #A3A3A3;
  --color-border: #262626;

  /* Adjusted primary for dark mode */
  --color-primary-500: #A5B4FC;
  --color-primary-600: #818CF8;

  /* Adjusted accent for dark mode */
  --color-accent-500: #FBBF24;
  --color-accent-600: #F59E0B;
}
```

### 1.2 Typography

```css
/* /styles/tokens/typography.css */

:root {
  /* Font Families */
  --font-sans: 'Inter Variable', 'Inter', -apple-system, BlinkMacSystemFont,
    'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  --font-mono: 'Geist Mono Variable', 'Fira Code', 'Consolas', 'Monaco',
    monospace;

  /* Font Sizes */
  --font-size-xs: 0.75rem;      /* 12px */
  --font-size-sm: 0.875rem;     /* 14px */
  --font-size-base: 1rem;       /* 16px */
  --font-size-lg: 1.125rem;     /* 18px */
  --font-size-xl: 1.25rem;      /* 20px */
  --font-size-2xl: 1.5rem;      /* 24px */
  --font-size-3xl: 1.875rem;    /* 30px */
  --font-size-4xl: 2.25rem;     /* 36px */
  --font-size-5xl: 3rem;        /* 48px */
  --font-size-6xl: 3.75rem;     /* 60px */

  /* Font Weights */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-extrabold: 800;

  /* Line Heights */
  --line-height-none: 1;
  --line-height-tight: 1.25;
  --line-height-snug: 1.375;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.625;
  --line-height-loose: 2;

  /* Letter Spacing */
  --letter-spacing-tighter: -0.05em;
  --letter-spacing-tight: -0.025em;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.025em;
  --letter-spacing-wider: 0.05em;
  --letter-spacing-widest: 0.1em;
}

/* Typography Classes */
.text-xs { font-size: var(--font-size-xs); }
.text-sm { font-size: var(--font-size-sm); }
.text-base { font-size: var(--font-size-base); }
.text-lg { font-size: var(--font-size-lg); }
.text-xl { font-size: var(--font-size-xl); }
.text-2xl { font-size: var(--font-size-2xl); }
.text-3xl { font-size: var(--font-size-3xl); }
.text-4xl { font-size: var(--font-size-4xl); }
.text-5xl { font-size: var(--font-size-5xl); }

.font-normal { font-weight: var(--font-weight-normal); }
.font-medium { font-weight: var(--font-weight-medium); }
.font-semibold { font-weight: var(--font-weight-semibold); }
.font-bold { font-weight: var(--font-weight-bold); }

.leading-tight { line-height: var(--line-height-tight); }
.leading-snug { line-height: var(--line-height-snug); }
.leading-normal { line-height: var(--line-height-normal); }
.leading-relaxed { line-height: var(--line-height-relaxed); }
```

### 1.3 Spacing

```css
/* /styles/tokens/spacing.css */

:root {
  /* Spacing Scale (8px base) */
  --space-0: 0;
  --space-px: 1px;
  --space-0-5: 0.125rem;   /* 2px */
  --space-1: 0.25rem;      /* 4px */
  --space-1-5: 0.375rem;   /* 6px */
  --space-2: 0.5rem;       /* 8px */
  --space-2-5: 0.625rem;   /* 10px */
  --space-3: 0.75rem;      /* 12px */
  --space-3-5: 0.875rem;   /* 14px */
  --space-4: 1rem;         /* 16px */
  --space-5: 1.25rem;      /* 20px */
  --space-6: 1.5rem;       /* 24px */
  --space-7: 1.75rem;      /* 28px */
  --space-8: 2rem;         /* 32px */
  --space-9: 2.25rem;      /* 36px */
  --space-10: 2.5rem;      /* 40px */
  --space-11: 2.75rem;     /* 44px */
  --space-12: 3rem;        /* 48px */
  --space-14: 3.5rem;      /* 56px */
  --space-16: 4rem;        /* 64px */
  --space-20: 5rem;        /* 80px */
  --space-24: 6rem;        /* 96px */
  --space-28: 7rem;        /* 112px */
  --space-32: 8rem;        /* 128px */
}
```

### 1.4 Border Radius

```css
/* /styles/tokens/radius.css */

:root {
  --radius-none: 0;
  --radius-sm: 0.125rem;     /* 2px */
  --radius-base: 0.25rem;    /* 4px */
  --radius-md: 0.375rem;     /* 6px */
  --radius-lg: 0.5rem;       /* 8px */
  --radius-xl: 0.75rem;      /* 12px */
  --radius-2xl: 1rem;        /* 16px */
  --radius-3xl: 1.5rem;      /* 24px */
  --radius-full: 9999px;     /* Fully rounded */
}
```

### 1.5 Shadows

```css
/* /styles/tokens/shadows.css */

:root {
  /* Light Mode Shadows */
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-base: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-md: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);

  /* Focus Ring */
  --shadow-focus: 0 0 0 3px var(--color-primary-500) / 0.1;
}

/* Dark Mode Shadows */
:root[data-theme="dark"] {
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.3);
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3);
  --shadow-base: 0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3);
  --shadow-md: 0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4);
  --shadow-lg: 0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5);
  --shadow-xl: 0 25px 50px -12px rgb(0 0 0 / 0.6);
}
```

### 1.6 Transitions

```css
/* /styles/tokens/transitions.css */

:root {
  /* Timing Functions */
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

  /* Durations */
  --duration-75: 75ms;
  --duration-100: 100ms;
  --duration-150: 150ms;
  --duration-200: 200ms;
  --duration-300: 300ms;
  --duration-500: 500ms;
  --duration-700: 700ms;
  --duration-1000: 1000ms;

  /* Common Transitions */
  --transition-base: all var(--duration-150) var(--ease-in-out);
  --transition-colors: color var(--duration-150) var(--ease-in-out),
                       background-color var(--duration-150) var(--ease-in-out),
                       border-color var(--duration-150) var(--ease-in-out);
  --transition-transform: transform var(--duration-200) var(--ease-out);
  --transition-shadow: box-shadow var(--duration-200) var(--ease-out);
}
```

---

## 2. Component Library

### 2.1 Button Component

**Visual Specifications:**

| Variant | Background | Text Color | Border | Hover State |
|---------|------------|------------|--------|-------------|
| Primary | Accent-500 | White | None | Accent-600 + Lift |
| Secondary | Transparent | Primary-600 | Primary-300 | Primary-50 bg |
| Ghost | Transparent | Gray-700 | None | Gray-100 bg |
| Danger | Error-500 | White | None | Error-600 + Lift |

**Sizes:**

| Size | Height | Padding X | Font Size | Icon Size |
|------|--------|-----------|-----------|-----------|
| sm | 32px | 12px | 14px | 16px |
| md | 40px | 16px | 16px | 20px |
| lg | 48px | 24px | 18px | 24px |

**Implementation:**

```tsx
// /components/ui/button.tsx
import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700 shadow-sm hover:shadow-md hover:-translate-y-0.5',
        secondary:
          'border border-primary-300 text-primary-600 hover:bg-primary-50 active:bg-primary-100',
        ghost:
          'text-gray-700 hover:bg-gray-100 active:bg-gray-200',
        danger:
          'bg-error-500 text-white hover:bg-error-600 active:bg-error-700 shadow-sm hover:shadow-md hover:-translate-y-0.5',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
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

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
```

---

### 2.2 Search Input Component

**Specifications:**

- Height: 48px (comfortable typing)
- Padding: 16px left (with icon: 44px left)
- Font size: 18px (prevents iOS zoom)
- Border: 1px solid gray-300
- Border radius: 12px
- Focus: Ring (4px, primary-500 at 10% opacity)

**Implementation:**

```tsx
// /components/ui/search-input.tsx
import { forwardRef } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  showClearButton?: boolean;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onClear, showClearButton = true, value, ...props }, ref) => {
    return (
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          className={cn(
            'flex h-12 w-full rounded-xl border border-gray-300 bg-white px-4 pl-11 pr-11 text-lg text-gray-900 placeholder:text-gray-500',
            'transition-all duration-200',
            'focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          ref={ref}
          value={value}
          {...props}
        />
        {showClearButton && value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    );
  }
);
SearchInput.displayName = 'SearchInput';

export { SearchInput };
```

---

### 2.3 Activity Card Component

**Specifications:**

- Padding: 24px
- Border: 1px solid gray-200
- Border radius: 12px
- Shadow: sm (default), md (hover)
- Gap: 16px between elements
- Hover: Lift 2px + shadow increase

**Implementation:**

```tsx
// /components/ui/activity-card.tsx
import { MapPin, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface ActivityCardProps {
  id: string;
  title: string;
  organization: string;
  description: string;
  location: {
    city: string;
    distance?: number;
  };
  category: string;
  skills: string[];
  timeCommitment: string;
  imageUrl?: string;
  relevanceScore?: number;
  className?: string;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  title,
  organization,
  description,
  location,
  category,
  skills,
  timeCommitment,
  imageUrl,
  relevanceScore,
  className,
}) => {
  return (
    <article
      className={cn(
        'group relative flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md',
        className
      )}
    >
      {/* Image */}
      {imageUrl && (
        <div className="-mx-6 -mt-6 mb-2 aspect-video overflow-hidden rounded-t-xl">
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">{organization}</span>
        <Badge variant="primary">{category}</Badge>
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold leading-tight text-gray-800 transition-colors group-hover:text-primary-600">
        {title}
      </h3>

      {/* Description */}
      <p className="line-clamp-2 text-base leading-relaxed text-gray-600">
        {description}
      </p>

      {/* Metadata */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>
            {location.city}
            {location.distance && ` • ${location.distance}km away`}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>{timeCommitment}</span>
        </div>
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="secondary">
              {skill}
            </Badge>
          ))}
          {skills.length > 3 && (
            <span className="text-sm text-gray-500">+{skills.length - 3} more</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto border-t border-gray-200 pt-4">
        <Button variant="primary" size="md" className="w-full">
          View Details
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Relevance Score */}
      {relevanceScore && (
        <div className="absolute right-3 top-3 rounded-md bg-white/90 px-2 py-1 text-xs text-gray-600 backdrop-blur-sm">
          {Math.round(relevanceScore * 100)}% match
        </div>
      )}
    </article>
  );
};
```

---

### 2.4 Badge Component

**Specifications:**

| Variant | Background | Text | Border |
|---------|------------|------|--------|
| Primary | Primary-100 | Primary-700 | None |
| Secondary | Gray-100 | Gray-700 | None |
| Success | Success-100 | Success-700 | None |
| Warning | Warning-100 | Warning-700 | None |
| Error | Error-100 | Error-700 | None |

**Implementation:**

```tsx
// /components/ui/badge.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-primary-100 text-primary-700',
        secondary: 'bg-gray-100 text-gray-700',
        success: 'bg-success-100 text-success-700',
        warning: 'bg-warning-100 text-warning-700',
        error: 'bg-error-100 text-error-700',
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

export const Badge: React.FC<BadgeProps> = ({ className, variant, ...props }) => {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
};
```

---

### 2.5 Command Palette Component

**Specifications:**

- Modal overlay with backdrop
- Centered, max-width 600px
- Search input at top
- Grouped results below
- Keyboard navigation (arrows, enter, escape)

**Implementation:**

```tsx
// /components/ui/command-palette.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

export const CommandPalette: React.FC = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-gray-500">
          <CommandInput placeholder="Search activities..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem>Environmental cleanup</CommandItem>
              <CommandItem>Teaching kids programming</CommandItem>
              <CommandItem>Help seniors with technology</CommandItem>
            </CommandGroup>
            <CommandGroup heading="Recent Searches">
              <CommandItem>Food bank volunteer</CommandItem>
              <CommandItem>Animal shelter</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};
```

---

## 3. Layout System

### 3.1 Container Widths

```css
/* /styles/layout.css */

.container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--space-6);
  padding-right: var(--space-6);
}

/* Breakpoint-specific max-widths */
@media (min-width: 640px) {
  .container { max-width: 640px; }
}

@media (min-width: 768px) {
  .container { max-width: 768px; }
}

@media (min-width: 1024px) {
  .container { max-width: 1024px; }
}

@media (min-width: 1280px) {
  .container { max-width: 1280px; }
}

@media (min-width: 1536px) {
  .container { max-width: 1536px; }
}
```

### 3.2 Grid System

```css
/* Results Grid */
.results-grid {
  display: grid;
  gap: var(--space-6);
  grid-template-columns: repeat(1, 1fr);
}

@media (min-width: 768px) {
  .results-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1280px) {
  .results-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Search Layout (Sidebar + Results) */
.search-layout {
  display: grid;
  gap: var(--space-8);
  grid-template-columns: 1fr;
}

@media (min-width: 1024px) {
  .search-layout {
    grid-template-columns: 280px 1fr;
  }
}
```

---

## 4. Animation Specifications

### 4.1 Keyframe Animations

```css
/* /styles/animations.css */

/* Fade In */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Fade Out */
@keyframes fadeOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(8px);
  }
}

/* Shimmer (Loading) */
@keyframes shimmer {
  0% {
    background-position: -100% 0;
  }
  100% {
    background-position: 100% 0;
  }
}

/* Spin (Loading) */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Pulse */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Bounce */
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
```

### 4.2 Animation Utilities

```css
/* Animation Classes */
.animate-fade-in {
  animation: fadeIn var(--duration-300) var(--ease-out);
}

.animate-fade-out {
  animation: fadeOut var(--duration-200) var(--ease-in);
}

.animate-shimmer {
  animation: shimmer var(--duration-1000) linear infinite;
}

.animate-spin {
  animation: spin var(--duration-1000) linear infinite;
}

.animate-pulse {
  animation: pulse var(--duration-1000) cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

---

## 5. Accessibility Requirements

### 5.1 Color Contrast Ratios

| Element | Minimum Ratio | Target Ratio |
|---------|---------------|--------------|
| Body text (16px) | 4.5:1 (AA) | 7:1 (AAA) |
| Large text (18px+) | 3:1 (AA) | 4.5:1 (AAA) |
| UI components | 3:1 (AA) | 4.5:1 (AAA) |
| Disabled text | 3:1 (AA) | - |

### 5.2 Focus Indicators

```css
/* Focus Visible Styles */
*:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* Button Focus */
.button:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--color-primary-500) / 0.3;
}

/* Input Focus */
.input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 4px var(--color-primary-500) / 0.1;
}
```

### 5.3 Screen Reader Support

```tsx
// Example: Accessible Button with Icon
<button aria-label="Search activities">
  <Search className="h-5 w-5" aria-hidden="true" />
</button>

// Example: Loading State
<div role="status" aria-live="polite" aria-busy="true">
  <span className="sr-only">Loading results...</span>
  <Spinner />
</div>

// Example: Error Message
<div role="alert" aria-live="assertive">
  <p>Failed to load activities. Please try again.</p>
</div>
```

---

## 6. Responsive Design

### 6.1 Breakpoints

```css
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}
```

### 6.2 Mobile-First Approach

```css
/* Mobile (Default) */
.search-bar {
  width: 100%;
  font-size: 16px; /* Prevents iOS zoom */
}

/* Tablet */
@media (min-width: 768px) {
  .search-bar {
    font-size: 18px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .search-bar {
    max-width: 600px;
  }
}
```

---

## 7. Implementation Guide

### 7.1 Setup Instructions

1. **Install Dependencies**

```bash
pnpm add @fontsource-variable/inter
pnpm add lucide-react
pnpm add class-variance-authority clsx tailwind-merge
pnpm add @radix-ui/react-dialog @radix-ui/react-slot
pnpm add cmdk sonner
```

2. **Configure Tailwind**

```js
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EEF2FF',
          // ... (full palette from tokens)
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
      },
    },
  },
  plugins: [],
};

export default config;
```

3. **Import Fonts**

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

4. **Setup Design Tokens**

```css
/* app/globals.css */
@import './styles/tokens/colors.css';
@import './styles/tokens/typography.css';
@import './styles/tokens/spacing.css';
@import './styles/tokens/radius.css';
@import './styles/tokens/shadows.css';
@import './styles/tokens/transitions.css';
@import './styles/animations.css';
@import './styles/layout.css';
```

### 7.2 Usage Examples

**Search Page:**

```tsx
// app/search/page.tsx
import { SearchInput } from '@/components/ui/search-input';
import { ActivityCard } from '@/components/ui/activity-card';

export default function SearchPage() {
  return (
    <div className="container py-12">
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold">
          Find Volunteering Activities
        </h1>
        <SearchInput placeholder="Search for activities..." />
      </div>

      <div className="results-grid">
        {activities.map((activity) => (
          <ActivityCard key={activity.id} {...activity} />
        ))}
      </div>
    </div>
  );
}
```

---

## 8. Quality Checklist

Before marking a component as complete, verify:

- [ ] Accessible (WCAG AA minimum)
- [ ] Keyboard navigable
- [ ] Screen reader friendly
- [ ] Responsive (mobile, tablet, desktop)
- [ ] Dark mode support
- [ ] Loading states
- [ ] Error states
- [ ] Focus indicators
- [ ] Smooth animations
- [ ] Performance optimized

---

## 9. Resources

**Design Tools:**
- Figma: [Action Atlas Design File](#) (TBD)
- Component Playground: [Storybook](#) (TBD)

**External References:**
- shadcn/ui: https://ui.shadcn.com
- Radix UI: https://radix-ui.com
- Tailwind CSS: https://tailwindcss.com
- Lucide Icons: https://lucide.dev

---

**Document Status**: Implementation Ready
**Last Updated**: 2026-01-07
**Version**: 1.0
**Maintainer**: UI Designer
