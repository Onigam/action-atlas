# Action Atlas - Neobrutalism Design System Summary

## Overview

A comprehensive neobrutalism design system for Action Atlas, the AI-powered volunteering search platform. The design is bold, energetic, minimalistic, and provides excellent user experience while maintaining strong visual hierarchy and accessibility.

---

## Design Philosophy

### Core Principles

1. **Bold & Confident**: 3-4px black borders, strong typography (700-900 weight)
2. **Flat & Vibrant**: Solid colors with no gradients, green/yellow/red dominance
3. **Strong Depth**: Offset box shadows (4px/4px) with no blur
4. **Geometric Clarity**: Minimal border radius (4px recommended max)
5. **High Contrast**: Black on white for maximum readability
6. **Energetic Motion**: Simple, direct animations with clear feedback

---

## Quick Reference

### Color Palette

#### Primary Colors
- **Green (Primary)**: #22C55E - Volunteering, action, growth
- **Yellow (Secondary)**: #EAB308 - Energy, optimism, positivity
- **Orange (Accent)**: #F97316 - Urgency, excitement, CTAs
- **Red (Error)**: #EF4444 - Errors, warnings, critical actions

#### Neutral Colors
- **Black**: #000000 - Text, borders, shadows
- **White**: #FFFFFF - Backgrounds, cards
- **Gray Scale**: #FAFAFA to #171717 - Subtle backgrounds, secondary text

---

### Typography

#### Font Families
- **Body**: Inter Variable (clean, highly legible)
- **Display**: Space Grotesk (geometric, bold - optional)

#### Font Sizes (Mobile → Desktop)
- **Hero (H1)**: 3rem → 4.5rem (48px → 72px)
- **Page Heading (H2)**: 2.25rem → 3rem (36px → 48px)
- **Section Heading (H3)**: 1.875rem → 2.25rem (30px → 36px)
- **Card Title (H4)**: 1.5rem → 1.875rem (24px → 30px)
- **Body Text**: 1rem (16px)
- **Small Text**: 0.875rem (14px)
- **Fine Print**: 0.75rem (12px)

#### Font Weights
- **Bold (700)**: Headings, buttons, emphasis
- **Extrabold (800)**: Display headings
- **Black (900)**: Ultra bold headings
- **Medium (500-600)**: Subheadings, emphasized text
- **Normal (400)**: Body text only

---

### Spacing System

4px base grid for consistent rhythm:

```
4px   8px   12px   16px   20px   24px   32px   48px   64px   96px
↓     ↓     ↓      ↓      ↓      ↓      ↓      ↓      ↓      ↓
Tight Small Compact Default Medium Large X-Large Component Section Hero
```

**Usage**:
- Component padding: 24px (6)
- Section spacing: 64-96px (16-24)
- Element gaps: 16-24px (4-6)
- Tight spacing: 8-12px (2-3)

---

### Shadows (Neobrutalism)

All shadows are **offset box shadows** with no blur:

```css
shadow-brutal-sm:  2px 2px 0px 0px black  /* Badges, small elements */
shadow-brutal:     4px 4px 0px 0px black  /* Buttons, cards, inputs */
shadow-brutal-md:  6px 6px 0px 0px black  /* Hover states */
shadow-brutal-lg:  8px 8px 0px 0px black  /* Modals, popovers */
shadow-brutal-xl:  12px 12px 0px 0px black /* Hero elements */
```

**Colored Shadows** (use sparingly):
- Green: 4px 4px 0px 0px #16A34A
- Yellow: 4px 4px 0px 0px #CA8A04
- Orange: 4px 4px 0px 0px #EA580C
- Red: 4px 4px 0px 0px #DC2626

---

### Borders

#### Border Widths
- **2px**: Subtle borders (badges, small elements)
- **3px**: Standard borders (buttons, inputs)
- **4px**: Emphasized borders (cards, panels)
- **6px**: Hero elements (sections, banners)

#### Border Radius
- **0px**: Pure neobrutalism (sharp corners)
- **4px**: Recommended default (subtle rounding)
- **8px**: Maximum recommended (avoid higher values)

#### Border Color
- **Primary**: Black (#000000) - 95% of use cases
- **Subtle**: Gray-200 (#E5E5E5) - Dividers only

---

### Component Patterns

#### Buttons

```html
<!-- Primary Button -->
<button class="
  h-11 px-6 py-3
  border-3 border-black
  bg-primary-500 text-black
  shadow-brutal
  font-bold uppercase tracking-wide text-sm
  transition-all
  hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-md
  active:translate-x-1 active:translate-y-1 active:shadow-none
">
  Get Started
</button>
```

**Sizes**: sm (h-9), md (h-11), lg (h-14), xl (h-16)

**Variants**: primary (green), secondary (yellow), accent (orange), destructive (red), outline (white)

---

#### Cards

```html
<!-- Basic Card -->
<div class="
  border-3 border-black
  bg-white
  shadow-brutal
  p-6
">
  <h3 class="text-2xl font-bold mb-2">Card Title</h3>
  <p class="text-sm text-gray-700 mb-4">Description</p>
  <button>Action</button>
</div>
```

**Hover Effect**: Add `hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brutal-md transition-all`

---

#### Badges

```html
<!-- Primary Badge -->
<span class="
  inline-flex items-center
  border-2 border-black
  bg-primary-400 text-black
  shadow-brutal-sm
  px-3 py-1
  text-xs font-bold uppercase tracking-wide
">
  Active
</span>
```

**Variants**: primary, secondary, success, warning, error, outline, ghost

---

#### Inputs

```html
<!-- Text Input -->
<input
  type="text"
  placeholder="Enter text..."
  class="
    h-12 w-full
    border-3 border-black
    bg-white
    px-4 py-3
    text-base font-medium text-black
    shadow-brutal-sm
    transition-all
    placeholder:text-gray-500
    focus:outline-none focus:shadow-brutal focus:-translate-x-0.5 focus:-translate-y-0.5
  "
/>
```

---

### Animation Patterns

#### Button Press
```css
active:translate-x-1 active:translate-y-1 active:shadow-none
```

#### Card Hover
```css
hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brutal-md
```

#### Input Focus
```css
focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-brutal
```

#### Timing
- **Fast**: 150ms (quick feedback)
- **Normal**: 200ms (standard transitions)
- **Slow**: 300ms (deliberate animations)

---

## Accessibility

### Color Contrast
All combinations meet **WCAG 2.1 AA** standards:
- Minimum 4.5:1 for normal text
- Minimum 3:1 for large text (18px+ or 14px+ bold)

### Focus States
All interactive elements have **4px black focus ring** with **4px offset**:
```css
focus-visible:ring-4 focus-visible:ring-black focus-visible:ring-offset-4
```

### Screen Readers
- Semantic HTML (proper heading hierarchy)
- ARIA labels for icon buttons
- Alt text for all images
- `.sr-only` class for visually hidden text

### Motion Preferences
Respect `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Responsive Design

### Breakpoints
- **sm**: 640px (small devices)
- **md**: 768px (tablets)
- **lg**: 1024px (laptops)
- **xl**: 1280px (desktops)
- **2xl**: 1536px (ultra-wide)

### Mobile-First Approach
```html
<!-- Responsive Typography -->
<h1 class="text-5xl md:text-6xl lg:text-7xl">Hero</h1>

<!-- Responsive Spacing -->
<section class="py-12 md:py-16 lg:py-24">Content</section>

<!-- Responsive Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Cards -->
</div>
```

---

## Do's and Don'ts

### ✅ Do's
- Use bold typography (700-900 weight)
- Strong 3-4px black borders
- Offset shadows (4px/4px)
- Vibrant green/yellow/red colors
- High contrast (black on white)
- Clear hover/active states
- Generous whitespace
- Uppercase labels for UI elements

### ❌ Don'ts
- No gradients (solid colors only)
- No soft/blurred shadows
- No rounded corners above 8px
- No subtle borders below 2px
- No muted/desaturated colors
- No complex animations
- No cluttered layouts
- No fine/thin typography

---

## Implementation Checklist

When creating a new component:

- [ ] 3-4px black borders on interactive elements
- [ ] Brutal box shadows (4px/4px offset, no blur)
- [ ] Bold typography (700+ weight) for headings
- [ ] High contrast colors (black on white/colors)
- [ ] Clear focus states (4px ring, 4px offset)
- [ ] Hover states with position/shadow changes
- [ ] Active states with pressed effect (translate + no shadow)
- [ ] Accessible contrast ratios (4.5:1 minimum)
- [ ] Responsive sizing (mobile-first)
- [ ] Consistent spacing (4px grid)
- [ ] Uppercase labels where appropriate
- [ ] Semantic HTML structure

---

## File Structure

```
/apps/web/
├── tailwind.config.ts          # Tailwind configuration with design tokens
├── app/globals.css             # Global styles, CSS variables, utilities
├── components/ui/              # Reusable UI components
│   ├── button.tsx              # Button variants
│   ├── card.tsx                # Card components
│   ├── badge.tsx               # Badge variants
│   └── input.tsx               # Input components
├── DESIGN_SYSTEM.md            # Full design system documentation
├── COMPONENT_EXAMPLES.md       # Real-world component examples
├── DESIGN_TOKENS.json          # Design tokens in JSON format
└── DESIGN_SYSTEM_SUMMARY.md    # This file (quick reference)
```

---

## Getting Started

### 1. Review Documentation
- **DESIGN_SYSTEM.md**: Complete design system guide
- **COMPONENT_EXAMPLES.md**: Real-world implementations
- **DESIGN_TOKENS.json**: Design tokens reference

### 2. Use Utility Classes
```html
<!-- Pre-built utility classes -->
<div class="card-brutal-hover">...</div>
<button class="btn-brutal">...</button>
<input class="input-brutal" />
<span class="badge-brutal">...</span>
```

### 3. Build Custom Components
```tsx
import { cn } from '@/lib/utils';

export function CustomCard({ children, className }) {
  return (
    <div className={cn(
      'border-3 border-black bg-white shadow-brutal p-6',
      'transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brutal-md',
      className
    )}>
      {children}
    </div>
  );
}
```

### 4. Apply Tailwind Classes
All design tokens are available as Tailwind classes:
- Colors: `bg-primary-500`, `text-black`, `border-black`
- Shadows: `shadow-brutal`, `shadow-brutal-md`, `shadow-brutal-lg`
- Borders: `border-3`, `border-4`, `border-black`
- Typography: `text-2xl`, `font-bold`, `uppercase`, `tracking-wide`

---

## Examples

### Activity Card
```tsx
<div className="
  border-3 border-black bg-white shadow-brutal
  transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brutal-md
  overflow-hidden
">
  <div className="h-48 bg-primary-100 border-b-3 border-black">
    {/* Image */}
  </div>
  <div className="p-6 space-y-4">
    <h3 className="text-2xl font-bold">Activity Title</h3>
    <p className="text-sm text-gray-700">Description</p>
    <button className="
      w-full h-11 px-6 py-3
      border-3 border-black bg-primary-500 text-black
      shadow-brutal font-bold uppercase text-sm
      hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-md
    ">
      View Details
    </button>
  </div>
</div>
```

### Hero Section
```tsx
<section className="bg-primary-100 border-b-6 border-black py-24">
  <div className="container-custom text-center">
    <h1 className="text-7xl font-extrabold mb-6">
      Find Your Purpose
    </h1>
    <p className="text-xl text-gray-800 mb-8">
      Discover volunteering opportunities
    </p>
    <button className="
      h-14 px-10
      border-3 border-black bg-primary-500 text-black
      shadow-brutal-lg font-bold uppercase
      hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brutal-xl
    ">
      Get Started
    </button>
  </div>
</section>
```

---

## Support & Resources

### Internal Documentation
- `/apps/web/DESIGN_SYSTEM.md` - Complete guide
- `/apps/web/COMPONENT_EXAMPLES.md` - Implementation examples
- `/apps/web/DESIGN_TOKENS.json` - Token reference

### External Resources
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Inter Font**: https://fonts.google.com/specimen/Inter
- **Space Grotesk**: https://fonts.google.com/specimen/Space+Grotesk
- **Neobrutalism Inspiration**: https://www.hoverstat.es/

### Design Tools
- **Figma**: Component library and mockups
- **Tailwind Play**: Rapid prototyping
- **ColorBox**: Color palette testing

---

## Version History

- **v1.0.0** (2026-01-12): Initial neobrutalism design system
  - Complete color palette (green/yellow/red)
  - Typography system (Inter + Space Grotesk)
  - Component patterns (buttons, cards, badges, inputs)
  - Brutal shadow system
  - Accessibility compliance (WCAG 2.1 AA)
  - Full Tailwind integration

---

## Contact

For design system questions, updates, or contributions:
- Review this documentation first
- Check component examples
- Consult design tokens JSON
- Reach out to the design team

**Last Updated**: January 12, 2026
**Version**: 1.0.0
**Status**: Production Ready ✅
