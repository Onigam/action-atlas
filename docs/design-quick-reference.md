# Action Atlas Design System - Quick Reference

**Quick access guide for developers implementing the design system**

---

## Color Palette (Copy-Paste Ready)

```css
/* Action Atlas Brand Colors */
:root {
  /* Primary - Indigo (Trust, Intelligence) */
  --primary-500: #6366F1;
  --primary-600: #4F46E5;
  --primary-700: #4338CA;

  /* Accent - Amber (Energy, Action) */
  --accent-500: #F59E0B;
  --accent-600: #D97706;

  /* Success - Emerald (Growth, Impact) */
  --success-500: #10B981;
  --success-600: #059669;

  /* Semantic */
  --error-500: #EF4444;
  --warning-500: #F59E0B;
  --info-500: #06B6D4;

  /* Grays (Warm) */
  --gray-50: #FAFAF9;
  --gray-100: #F5F5F4;
  --gray-200: #E7E5E4;
  --gray-600: #57534E;
  --gray-700: #44403C;
  --gray-800: #292524;
  --gray-900: #1C1917;
}

/* Dark Mode */
:root[data-theme="dark"] {
  --primary-500: #A5B4FC;
  --accent-500: #FBBF24;
  --background: #0A0A0A;
  --text: #FAFAFA;
}
```

---

## Typography

```css
/* Font Import */
@import '@fontsource-variable/inter';

/* Font Stack */
font-family: 'Inter Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Type Scale */
--text-xs: 0.75rem;    /* 12px - Badges, labels */
--text-sm: 0.875rem;   /* 14px - Metadata */
--text-base: 1rem;     /* 16px - Body text */
--text-lg: 1.125rem;   /* 18px - Search input */
--text-xl: 1.25rem;    /* 20px - Card titles */
--text-2xl: 1.5rem;    /* 24px - Section headers */
--text-3xl: 1.875rem;  /* 30px - Page titles */
--text-4xl: 2.25rem;   /* 36px - Hero sections */

/* Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

---

## Spacing (8px Grid)

```css
/* Most Common Values */
--space-2: 0.5rem;     /* 8px */
--space-4: 1rem;       /* 16px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-12: 3rem;      /* 48px */

/* Usage */
padding: var(--space-6);        /* Card padding: 24px */
gap: var(--space-4);            /* Element spacing: 16px */
margin-bottom: var(--space-8);  /* Section spacing: 32px */
```

---

## Border Radius

```css
--radius-md: 0.375rem;   /* 6px - Small elements */
--radius-lg: 0.5rem;     /* 8px - Inputs */
--radius-xl: 0.75rem;    /* 12px - Cards */
--radius-full: 9999px;   /* Full rounded - Badges */
```

---

## Shadows

```css
/* Light Mode */
--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1);
--shadow-md: 0 10px 15px -3px rgb(0 0 0 / 0.1);

/* Usage */
box-shadow: var(--shadow-sm);         /* Default card */
box-shadow: var(--shadow-md);         /* Hover card */
box-shadow: 0 0 0 4px var(--primary-500) / 0.1;  /* Focus ring */
```

---

## Component Snippets

### Button

```tsx
<Button variant="primary" size="md">
  View Details
</Button>

// Variants: primary, secondary, ghost, danger
// Sizes: sm (32px), md (40px), lg (48px)
```

### Search Input

```tsx
<SearchInput
  placeholder="Search activities..."
  onClear={() => setQuery('')}
/>

// Props: placeholder, value, onChange, onClear
// Features: Icon left, clear button right, 18px font
```

### Activity Card

```tsx
<ActivityCard
  title="Teach Kids Programming"
  organization="Code.org"
  description="Help children learn coding basics..."
  location={{ city: "San Francisco", distance: 2.5 }}
  category="Education"
  skills={["Teaching", "JavaScript"]}
  timeCommitment="2 hours/week"
  relevanceScore={0.95}
/>
```

### Badge

```tsx
<Badge variant="primary">Education</Badge>
<Badge variant="secondary">JavaScript</Badge>

// Variants: primary, secondary, success, warning, error
```

---

## Layout Classes

```css
/* Container */
.container {
  max-width: 1024px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

/* Results Grid */
.results-grid {
  display: grid;
  gap: var(--space-6);
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

/* Search Layout (Sidebar + Results) */
.search-layout {
  display: grid;
  gap: var(--space-8);
  grid-template-columns: 280px 1fr;  /* Desktop */
}

@media (max-width: 1024px) {
  .search-layout {
    grid-template-columns: 1fr;  /* Mobile: stacked */
  }
}
```

---

## Common Patterns

### Card with Hover

```css
.card {
  padding: var(--space-6);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  transition: all 200ms ease;
}

.card:hover {
  transform: translateY(-2px);
  border-color: var(--primary-200);
  box-shadow: var(--shadow-md);
}
```

### Focus State

```css
.input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 4px var(--primary-500) / 0.1;
}
```

### Skeleton Loading

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--gray-200) 0%,
    var(--gray-100) 50%,
    var(--gray-200) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-md);
}

@keyframes shimmer {
  0% { background-position: -100% 0; }
  100% { background-position: 100% 0; }
}
```

---

## Accessibility Checklist

```tsx
// Focus visible
<button className="focus:ring-2 focus:ring-primary-500">

// ARIA labels for icons
<button aria-label="Clear search">
  <X className="h-5 w-5" />
</button>

// Screen reader text
<span className="sr-only">Loading results...</span>

// Keyboard navigation
onKeyDown={(e) => {
  if (e.key === 'Enter') handleSearch();
  if (e.key === 'Escape') clearSearch();
}}
```

---

## Responsive Breakpoints

```css
/* Mobile First */
.element { /* Mobile styles */ }

@media (min-width: 640px) { /* Tablet */ }
@media (min-width: 768px) { /* Desktop small */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1280px) { /* Desktop large */ }
```

---

## Animation Timing

```css
/* Standard durations */
--duration-150: 150ms;  /* Quick feedback */
--duration-200: 200ms;  /* Default transitions */
--duration-300: 300ms;  /* Page transitions */

/* Easing functions */
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

/* Usage */
transition: transform 200ms cubic-bezier(0, 0, 0.2, 1);
```

---

## Installation Commands

```bash
# Fonts
pnpm add @fontsource-variable/inter

# Icons
pnpm add lucide-react

# UI Utilities
pnpm add class-variance-authority clsx tailwind-merge

# Components
pnpm add @radix-ui/react-dialog @radix-ui/react-slot
pnpm add cmdk sonner
```

---

## File Structure

```
/styles/
  /tokens/
    colors.css
    typography.css
    spacing.css
    radius.css
    shadows.css
  animations.css
  layout.css
  globals.css

/components/
  /ui/
    button.tsx
    search-input.tsx
    activity-card.tsx
    badge.tsx
    command-palette.tsx
  /layout/
    container.tsx
    grid.tsx
    sidebar.tsx
```

---

## Common Tasks

### Add a new color

```css
/* 1. Add to tokens/colors.css */
--color-purple-500: #A855F7;

/* 2. Use in component */
.element { color: var(--color-purple-500); }
```

### Create a new component

```tsx
// 1. Create file: /components/ui/my-component.tsx
import { cn } from '@/lib/utils';

interface MyComponentProps {
  className?: string;
}

export const MyComponent: React.FC<MyComponentProps> = ({ className }) => {
  return (
    <div className={cn('base-styles', className)}>
      Content
    </div>
  );
};
```

### Update dark mode

```css
/* Add to :root[data-theme="dark"] */
:root[data-theme="dark"] {
  --color-new: #ADJUSTED_HEX;
}
```

---

## Resources

- **Full Design System**: `/docs/design-system-specification.md`
- **Design Research**: `/docs/ui-design-research-2025-2026.md`
- **Visual Inspiration**: `/docs/design-mood-board.md`
- **Summary**: `/docs/ui-design-summary.md`

---

**Quick Reference Version**: 1.0
**Last Updated**: 2026-01-07
**For Questions**: See full documentation or create GitHub issue
