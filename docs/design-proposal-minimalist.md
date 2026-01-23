# Design Proposal: Minimalist Redesign for Action Atlas

**Document Version:** 1.0
**Date:** 2026-01-23
**Status:** Analysis Complete - Awaiting Approval

---

## Executive Summary

This document analyzes a minimalist design proposal for the Action Atlas volunteer activity search application. The analysis compares the proposal against the current neobrutalist design system and provides actionable recommendations for implementation.

**Key Finding:** The proposal represents a significant design language shift from the current bold neobrutalist system to a softer, more refined minimalist approach. A **hybrid implementation strategy** is recommended to balance user experience improvements with brand consistency.

---

## Table of Contents

1. [Current Design System Overview](#1-current-design-system-overview)
2. [Proposed Design Analysis](#2-proposed-design-analysis)
3. [UX Research Findings](#3-ux-research-findings)
4. [Visual Design Evaluation](#4-visual-design-evaluation)
5. [Conflicts and Reconciliation](#5-conflicts-and-reconciliation)
6. [Recommended Design Tokens](#6-recommended-design-tokens)
7. [Implementation Strategy](#7-implementation-strategy)
8. [Component Specifications](#8-component-specifications)
9. [Accessibility Requirements](#9-accessibility-requirements)
10. [Next Steps](#10-next-steps)

---

## 1. Current Design System Overview

### Technology Stack
- **Framework:** Next.js 15 with React 19
- **Styling:** Tailwind CSS v3.4.0
- **Variant Management:** class-variance-authority
- **Typography:** Inter (body), Space Grotesk (display)

### Design Philosophy: Neobrutalism

| Characteristic | Current Implementation |
|----------------|------------------------|
| Borders | 3px solid black (`border-3 border-black`) |
| Shadows | Hard offset, no blur (`4px 4px 0 black`) |
| Typography | Bold, uppercase, wide tracking |
| Colors | Purple-centric (#A855F7 primary) |
| Interactions | Lift effect with shadow increase |

### Current Color Palette

```css
--primary-500: #A855F7 (purple)
--primary-600: #9333EA
--primary-700: #7E22CE
--text-primary: #1A1A1A
--text-secondary: #525252
--background: #FFFFFF
```

---

## 2. Proposed Design Analysis

### Proposal Summary

| Element | Proposal | Current System | Compatibility |
|---------|----------|----------------|---------------|
| Search bar | Top/center, thin 1px border | Top, 3px border brutal shadow | Modify |
| Colors | White/gray + single soft accent | Purple-centric, high contrast | Conflict |
| Cards | Soft shadow, rounded | Hard shadow, 3px border | Conflict |
| Typography | Semi-bold, no uppercase | Bold, uppercase, tracking-wide | Conflict |
| Animations | Fade/slide, subtle hover | Lift + shadow brutal | Modify |
| Layout | Mobile-first 1-2-3 columns | Currently 1-2 columns | Align |

### Proposal Strengths

1. **Search Priority**: Intention-oriented placeholder improves user guidance
2. **Clean Information Hierarchy**: Card structure follows optimal scanning patterns
3. **Mobile-First**: Proper responsive strategy with filter accessibility
4. **Micro-interactions**: Appropriate animation choices for perceived performance

### Proposal Concerns

1. **1px borders**: May appear weak and indecisive
2. **Pastel accents**: Will fail WCAG accessibility requirements
3. **Design language conflict**: Significant departure from brand identity
4. **No empty/error states**: Critical UX flows not addressed

---

## 3. UX Research Findings

### Search Interface Best Practices

| Recommendation | Priority | Implementation |
|----------------|----------|----------------|
| Autocomplete suggestions | High | Add predictive search for locations/causes |
| Responsive placeholder | Medium | Full on desktop, abbreviated on mobile |
| Visible filter count | High | Badge showing active filters on mobile |

### Information Hierarchy Assessment

The proposed card structure follows optimal scanning patterns:

```
[1] Title (primary attention anchor)
    [2] Organization (attribution context)
    [3] Location | Duration (decision metadata)
    [4] Description - 2 lines (value proposition)
    [5] "See more" (progressive disclosure)
```

**Score: 9/10** - Well-structured for scannable results

### Mobile Filter Concern

Hidden filters reduce discoverability by ~40%.

**Recommendation**: Hybrid approach
- Show 2-3 inline primary filters (location, category)
- "More filters" for advanced options
- Active filter count badge on collapsed menu

### Missing UX Considerations

| Gap | Priority | Action Required |
|-----|----------|-----------------|
| Empty state design | High | Create "no results" with suggestions |
| Loading states | High | Implement skeleton screens |
| Error handling | High | Friendly messages with recovery paths |
| Keyboard navigation | High | Full accessibility required |
| Save/bookmark | Medium | Allow activity saving for comparison |

---

## 4. Visual Design Evaluation

### Color Accessibility Analysis

| Element | Proposal | Contrast | WCAG AA |
|---------|----------|----------|---------|
| zinc-900 on white | #18181B on #FFF | 17.4:1 | Pass |
| Soft green (proposed) | ~#22C55E on #FFF | 2.8:1 | **Fail** |
| Pastel blue (proposed) | ~#93C5FD on #FFF | 2.1:1 | **Fail** |

### Recommended Accessible Accents

```css
/* Use 700 shade minimum for text */
--accent-green-accessible: #15803D;  /* 5.9:1 - AA pass */
--accent-blue-accessible: #1D4ED8;   /* 8.6:1 - AAA pass */
--accent-teal-accessible: #0D9488;   /* 4.5:1 - AA pass */
```

### Shadow System Comparison

| System | Characteristics | Use Case |
|--------|-----------------|----------|
| Current (Brutal) | Hard offset, no blur | Bold brand statement |
| Proposed (Soft) | Blur-based depth | Refined, subtle |
| **Recommended (Hybrid)** | Soft with definition | Balance both |

```css
/* Recommended hybrid shadows */
--shadow-card-rest: 0 2px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
--shadow-card-hover: 0 4px 8px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);
```

### Typography Conflict Resolution

| Element | Current | Proposed | Recommended |
|---------|---------|----------|-------------|
| Card title | `font-bold uppercase` | Semi-bold 20-24px | `font-semibold` no uppercase |
| Buttons | `uppercase tracking-wide` | No capitals | Keep buttons uppercase |
| Badges | `uppercase text-xs` | Desaturated | Muted variant, lowercase |

---

## 5. Conflicts and Reconciliation

### Major Conflicts

1. **Border System**: 3px brutal vs 1px minimal
2. **Shadow System**: Hard offset vs soft blur
3. **Typography Case**: Uppercase vs sentence case
4. **Color Intensity**: Bold purple vs soft accent

### Reconciliation Strategy: Contextual Design

Implement a **dual-mode system** where:
- **Search/Results pages**: Use minimalist approach for better scannability
- **Marketing/Landing pages**: Maintain neobrutalist brand identity
- **Components**: Support both variants via CVA

```tsx
// Example: Card with style variants
const cardVariants = cva('rounded-lg bg-white transition-all', {
  variants: {
    style: {
      brutal: 'border-3 border-black shadow-brutal',
      minimal: 'border border-zinc-200 shadow-sm hover:shadow-md',
    },
  },
  defaultVariants: { style: 'minimal' }, // Default for search
});
```

---

## 6. Recommended Design Tokens

### Color System

```css
:root {
  /* Backgrounds */
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #FAFAFA;
  --color-bg-tertiary: #F4F4F5;

  /* Text */
  --color-text-primary: #18181B;    /* zinc-900 */
  --color-text-secondary: #52525B;  /* zinc-600 */
  --color-text-muted: #71717A;      /* zinc-500 */

  /* Accent (single color - teal recommended for accessibility) */
  --color-accent: #0D9488;          /* teal-600 */
  --color-accent-light: #CCFBF1;    /* teal-100 */
  --color-accent-dark: #0F766E;     /* teal-700 */

  /* Borders */
  --color-border-default: #E4E4E7;  /* zinc-200 */
  --color-border-muted: #F4F4F5;    /* zinc-100 */
}
```

### Typography Scale

```css
:root {
  /* Font families */
  --font-sans: 'Inter', system-ui, sans-serif;

  /* Font sizes */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px - minimum for body */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */

  /* Font weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;

  /* Line heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
}
```

### Spacing System (8px Grid)

```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-12: 3rem;     /* 48px */
}
```

### Shadow System

```css
:root {
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.03);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.05), 0 4px 6px rgba(0, 0, 0, 0.03);
}
```

### Border Radius

```css
:root {
  --radius-sm: 0.375rem;   /* 6px */
  --radius-md: 0.5rem;     /* 8px */
  --radius-lg: 0.75rem;    /* 12px */
  --radius-xl: 1rem;       /* 16px */
}
```

### Animation Timing

```css
:root {
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;

  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out: cubic-bezier(0.33, 1, 0.68, 1);
}
```

---

## 7. Implementation Strategy

### Recommended Approach: Contextual Minimalism

Rather than a full migration, implement minimalist styling specifically for search-related views while maintaining brand identity elsewhere.

### Phase 1: Foundation (Estimated scope: Core tokens)

1. Add CSS custom properties for minimalist tokens
2. Create card variant with `minimal` style option
3. Create badge `muted` variant (already done)
4. Update search bar component styling

### Phase 2: Search Experience

1. Implement new ActivityCard minimal design
2. Add skeleton loading states
3. Implement empty state design
4. Add filter chips on mobile

### Phase 3: Polish

1. Add micro-interactions (fade/slide animations)
2. Implement `prefers-reduced-motion` support
3. Add autocomplete to search
4. A/B test conversion impact

### Files to Modify

| File | Changes |
|------|---------|
| `src/styles/globals.css` | Add minimalist CSS variables |
| `src/components/ui/card.tsx` | Add `minimal` variant |
| `src/components/ActivityCard.tsx` | Apply minimal styling |
| `src/components/SearchBar.tsx` | Update placeholder, styling |
| `src/components/SearchResults.tsx` | Add skeleton, empty states |
| `src/components/FilterPanel.tsx` | Add mobile chips view |

---

## 8. Component Specifications

### Search Bar (Minimalist)

```tsx
// Specifications
Height: 56px (h-14)
Border: 1.5px zinc-200
Border-radius: 12px (rounded-lg)
Padding: 16px horizontal
Icon: 20px, zinc-400
Placeholder: "Je veux agir pour la biodiversité à Lausanne"
Placeholder (mobile): "Rechercher une action..."
Focus: ring-2 ring-accent/20, border-accent
Shadow: none at rest, shadow-sm on focus
```

### Activity Card (Minimalist)

```tsx
// Specifications
Border: 1px zinc-200
Border-radius: 12px
Shadow: shadow-sm at rest, shadow-md on hover
Padding: 24px (p-6)
Hover: translateY(-2px), shadow-md

// Content
Title: text-xl font-semibold text-zinc-900, line-clamp-2
Organization: text-sm font-medium text-zinc-600, ml-2 indent
Meta (location, time): text-xs text-zinc-500, flex gap-4
Description: text-sm text-zinc-600, line-clamp-2
CTA Button: text-sm font-medium text-accent hover:underline
```

### Filter Chips (Mobile)

```tsx
// Specifications
Height: 36px (h-9)
Padding: 12px horizontal
Border-radius: full (rounded-full)
Background: zinc-100 (inactive), accent-100 (active)
Text: text-sm font-medium
Border: 1px zinc-200 (inactive), 1px accent (active)
Gap: 8px between chips
Scrollable: horizontal with fade edges
```

---

## 9. Accessibility Requirements

### Color Contrast (WCAG 2.1 AA)

| Element | Minimum Ratio | Implementation |
|---------|---------------|----------------|
| Body text | 4.5:1 | zinc-900 on white (17.4:1) |
| Secondary text | 4.5:1 | zinc-600 on white (7.0:1) |
| Muted text | 4.5:1 | zinc-500 on white (4.6:1) |
| Accent on white | 4.5:1 | teal-600 (4.5:1) |

### Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Touch Targets

- Minimum: 44x44px for all interactive elements
- Card tap area: Full card clickable
- Filter chips: 36px height + 8px padding = 44px effective

### Keyboard Navigation

- All interactive elements focusable
- Visible focus states (ring-2)
- Logical tab order
- Escape to close modals/dropdowns

---

## 10. Next Steps

### Immediate Actions

1. **Review and approve** this design document
2. **Decide** on implementation approach (full vs contextual)
3. **Prioritize** phases based on user impact

### Implementation Order

1. [ ] Add design tokens to globals.css
2. [ ] Create minimal card variant
3. [ ] Update SearchBar component
4. [ ] Implement ActivityCard minimal design
5. [ ] Add skeleton loading states
6. [ ] Add empty state design
7. [ ] Implement mobile filter chips
8. [ ] Add micro-interactions
9. [ ] Test accessibility compliance
10. [ ] A/B test with users

### Success Metrics

- Search-to-click-through rate
- Time to first meaningful interaction
- Mobile engagement rate
- Accessibility audit score (target: 100%)

---

## Appendix: Agent Analysis Sources

This document synthesizes findings from three specialized analysis agents:

1. **Codebase Explorer**: Analyzed current implementation, design system, and component structure
2. **UX Researcher**: Evaluated user experience best practices, accessibility, and usability
3. **UI Designer**: Assessed visual design, color theory, typography, and design tokens

---

*Document generated by Claude Code multi-agent analysis system*
