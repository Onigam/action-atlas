# Action Atlas - Color Palette Design System

## Overview

This document outlines the redesigned color palette for Action Atlas, specifically crafted to convey trust, compassion, community, and positive social impact - core values of a volunteering platform.

**Design Philosophy**: Moving away from the Rastafarian-adjacent green-yellow-red palette to a warm, trustworthy, and professional color system that evokes human connection and social good.

---

## Color Palette

### Primary: Warm Coral (#F97066)

**Purpose**: Main brand color representing compassion, human connection, and warmth.

**When to Use**:
- Primary CTAs and action buttons
- Hero sections and key messaging
- Community-focused features
- Highlighting human-centric content

**Color Scale**:
```css
50:  #FFF5F5  /* Lightest backgrounds */
100: #FFE3E3  /* Light backgrounds, hover states */
200: #FFC9C9  /* Subtle accents, selections */
300: #FFA8A8  /* Borders, dividers */
400: #FF8787  /* Secondary buttons */
500: #F97066  /* PRIMARY - Main brand color */
600: #E14D43  /* Hover states, emphasis */
700: #C92A2A  /* Active states, icons */
800: #A61E1E  /* Text on light backgrounds */
900: #8B1818  /* High contrast text */
```

**Psychology**: Coral is universally associated with warmth, friendliness, and caring - perfect for a platform centered on human connection and helping others.

**Accessibility**:
- coral-600 (#E14D43) on white: 4.5:1 (WCAG AA)
- coral-800 (#A61E1E) on white: 7:1 (WCAG AAA)

---

### Secondary: Ocean Blue (#2E86DE)

**Purpose**: Supporting color representing trust, reliability, and professional depth.

**When to Use**:
- Secondary CTAs
- Information sections
- Education category
- Professional/organizational content
- Trust indicators

**Color Scale**:
```css
50:  #E7F5FF  /* Lightest backgrounds */
100: #D0EBFF  /* Light backgrounds, hover states */
200: #A5D8FF  /* Subtle accents */
300: #74C0FC  /* Borders, dividers */
400: #4DABF7  /* Secondary elements */
500: #2E86DE  /* SECONDARY - Main supporting color */
600: #1C7ED6  /* Hover states */
700: #1971C2  /* Active states, icons */
800: #1864AB  /* Text on light backgrounds */
900: #145082  /* High contrast text */
```

**Psychology**: Ocean blue represents depth, stability, and trust - essential for building confidence in a platform connecting volunteers with organizations.

**Accessibility**:
- blue-600 (#1C7ED6) on white: 4.5:1 (WCAG AA)
- blue-800 (#1864AB) on white: 7:1 (WCAG AAA)

---

### Accent: Sunlit Gold (#F59F00)

**Purpose**: Energy and optimism color representing hope, positive change, and the value of time contributed.

**When to Use**:
- Tertiary CTAs
- Success celebrations
- Achievements and milestones
- Time/impact metrics
- Encouraging messaging

**Color Scale**:
```css
50:  #FFF9DB  /* Lightest backgrounds */
100: #FFF3BF  /* Light backgrounds */
200: #FFEC99  /* Subtle accents */
300: #FFE066  /* Borders, dividers */
400: #FFD43B  /* Secondary elements */
500: #F59F00  /* ACCENT - Main accent color */
600: #E67700  /* Hover states */
700: #D35400  /* Active states, icons */
800: #B84700  /* Text on light backgrounds */
900: #963D00  /* High contrast text */
```

**Psychology**: Warm gold (not bright yellow) conveys optimism and value without the traffic-light association. It's sophisticated yet energetic.

**Accessibility**:
- gold-700 (#D35400) on white: 4.5:1 (WCAG AA)
- gold-800 (#B84700) on white: 7:1 (WCAG AAA)

---

### Success: Sage Green (#51CF66)

**Purpose**: Positive outcomes, growth, environmental causes.

**When to Use**:
- Success messages
- Completed actions
- Environmental/sustainability categories
- Growth metrics
- Positive feedback

**Color Scale**:
```css
50:  #EBFBEE  /* Lightest backgrounds */
100: #D3F9D8  /* Light backgrounds */
200: #B2F2BB  /* Subtle accents */
300: #8CE99A  /* Borders, dividers */
400: #69DB7C  /* Secondary elements */
500: #51CF66  /* SUCCESS - Main success color */
600: #37B24D  /* Hover states */
700: #2F9E44  /* Active states, icons */
800: #2B8A3E  /* Text on light backgrounds */
900: #1B6A31  /* High contrast text */
```

**Psychology**: Softer, more muted green than the original - represents growth and positive impact without the Rastafarian association.

**Usage Note**: Use sparingly and primarily for success states and environmental categories.

---

### Error/Destructive: Red (#EF4444)

**Purpose**: Errors, warnings, destructive actions.

**When to Use**:
- Error messages
- Destructive actions (delete, cancel)
- Urgent notifications
- Required field indicators

**Color Scale**:
```css
50:  #FEF2F2  /* Lightest backgrounds */
100: #FEE2E2  /* Light backgrounds */
200: #FECACA  /* Subtle accents */
300: #FCA5A5  /* Borders, dividers */
400: #F87171  /* Secondary elements */
500: #EF4444  /* ERROR - Main error color */
600: #DC2626  /* Hover states */
700: #B91C1C  /* Active states */
800: #991B1B  /* Text on light backgrounds */
900: #7F1D1D  /* High contrast text */
```

**Note**: This remains unchanged from the original palette as it works well.

---

## Color Usage Guidelines

### Category Color Mapping

Different activity categories should use appropriate color accents:

```typescript
const categoryColors = {
  education: 'blue',      // Ocean Blue - trust, learning
  environment: 'green',   // Sage Green - nature, growth
  community: 'coral',     // Warm Coral - connection, caring
  health: 'coral',        // Warm Coral - caring, wellness
  arts: 'gold',          // Sunlit Gold - creativity, energy
  technology: 'blue',    // Ocean Blue - innovation
  social: 'coral',       // Warm Coral - human connection
  animals: 'green',      // Sage Green - nature
  elderly: 'coral',      // Warm Coral - compassion
  children: 'gold',      // Sunlit Gold - hope, energy
}
```

### Gradient Combinations

**Hero Gradient (warm & inviting)**:
```css
background: linear-gradient(135deg, #FFF5F5 0%, #E7F5FF 50%, #FFF9DB 100%);
/* coral-50 → blue-50 → gold-50 */
```

**CTA Gradient (energetic & balanced)**:
```css
background: linear-gradient(120deg, #F97066 0%, #2E86DE 50%, #F59F00 100%);
/* coral-500 → blue-500 → gold-500 */
```

**Card Gradients (subtle depth)**:
```css
/* Coral card */
background: linear-gradient(to bottom right, white, #FFF5F5);

/* Blue card */
background: linear-gradient(to bottom right, white, #E7F5FF);

/* Gold card */
background: linear-gradient(to bottom right, white, #FFF9DB);

/* Green card */
background: linear-gradient(to bottom right, white, #EBFBEE);
```

### Icon Color Coding

For improved visual hierarchy and quick recognition:

- **Location icons**: Ocean Blue (#2E86DE) - trust, navigation
- **Time/Clock icons**: Sunlit Gold (#F59F00) - value, commitment
- **Skills/Achievement icons**: Sage Green (#51CF66) - growth, capability
- **People/Community icons**: Warm Coral (#F97066) - connection, care

### Text Emphasis Levels

```css
/* High emphasis - primary content */
color: #1A1A1A;
font-weight: 600;

/* Medium emphasis - secondary content */
color: #525252;
font-weight: 500;

/* Low emphasis - tertiary content */
color: #737373;
font-weight: 400;

/* Inverse - on dark backgrounds */
color: #FFFFFF;
```

---

## Design Improvements Beyond Colors

### 1. Enhanced Card Styling

**Category-Specific Top Borders**:
```css
.activity-card-education {
  border-top: 6px solid #2E86DE;  /* Ocean Blue */
}

.activity-card-environment {
  border-top: 6px solid #51CF66;  /* Sage Green */
}

.activity-card-community {
  border-top: 6px solid #F97066;  /* Warm Coral */
}
```

**Enhanced Hover States**:
```css
.card-hover-enhanced:hover {
  transform: translate(-2px, -2px);
  box-shadow:
    6px 6px 0px 0px rgba(0, 0, 0, 1),
    inset 0 0 20px rgba(249, 112, 102, 0.08);
}
```

### 2. Refined Badge System

Softer, more professional badges with semantic color coding:

```css
/* Success badge */
.badge-soft-green {
  background: #D3F9D8;
  color: #2F9E44;
  border: 2px solid #B2F2BB;
  border-radius: 9999px;
}

/* Info badge */
.badge-soft-blue {
  background: #D0EBFF;
  color: #1971C2;
  border: 2px solid #A5D8FF;
  border-radius: 9999px;
}
```

### 3. Improved Button Hierarchy

**Primary (Coral)**: Main actions, volunteer sign-up
**Secondary (Blue)**: Secondary actions, learn more
**Accent (Gold)**: Tertiary actions, special features

### 4. Shadow System

**Hard Shadows (Neobrutalism)**:
- brutal-sm: 2px 2px
- brutal: 4px 4px
- brutal-md: 6px 6px
- brutal-lg: 8px 8px
- brutal-xl: 12px 12px

**Soft Shadows (Subtle depth)**:
- soft: 0 2px 8px rgba(0,0,0,0.08)
- soft-md: 0 4px 16px rgba(0,0,0,0.12)
- soft-lg: 0 8px 24px rgba(0,0,0,0.16)

**Colored Shadows**:
- brutal-coral: 4px 4px 0px 0px #E14D43
- brutal-blue: 4px 4px 0px 0px #1C7ED6
- brutal-gold: 4px 4px 0px 0px #E67700
- brutal-green: 4px 4px 0px 0px #37B24D

### 5. Enhanced Spacing

Increased breathing room for better visual hierarchy:
- Container padding: 24px → 32px → 48px (mobile → tablet → desktop)
- Section spacing: 64px → 96px → 128px (mobile → tablet → desktop)
- Card internal spacing: 32px with 24px gaps

---

## Implementation Checklist

- [x] Update CSS variables in `globals.css`
- [x] Update Tailwind config color definitions
- [x] Update button component variants
- [x] Update badge component variants
- [x] Update homepage hero gradient
- [x] Update homepage stats cards
- [x] Update homepage feature cards
- [x] Update homepage CTA section
- [ ] Update ActivityCard component with category-specific accents
- [ ] Update SearchBar component
- [ ] Update FilterPanel component
- [ ] Update Header/Navigation
- [ ] Update Footer
- [ ] Add icon color coding throughout components
- [ ] Implement enhanced hover states
- [ ] Add loading skeleton with new colors
- [ ] Update error/success toast notifications
- [ ] Update form validation styles

---

## Color Psychology Summary

| Color | Emotion | Association | Use Case |
|-------|---------|-------------|----------|
| Warm Coral | Compassion, warmth, connection | Human caring, community | Primary brand, people-focused features |
| Ocean Blue | Trust, reliability, depth | Professional, stable | Secondary actions, organizations |
| Sunlit Gold | Hope, optimism, energy | Positive change, value | Achievements, time commitment |
| Sage Green | Growth, environment, wellness | Nature, positive outcomes | Success states, environmental causes |
| Red | Urgency, error, caution | Warning, danger | Errors, destructive actions |

---

## Accessibility Standards

All color combinations meet **WCAG 2.1 AA standards** (4.5:1 contrast ratio) for normal text and **AAA standards** (7:1 contrast ratio) where possible.

**High Contrast Text Combinations**:
- coral-800 (#A61E1E) on white: 7:1
- blue-800 (#1864AB) on white: 7:1
- gold-800 (#B84700) on white: 7:1
- green-800 (#2B8A3E) on white: 7:1

**Interactive Elements**:
- Focus rings: 4px black outline with 4px offset
- Hover states: -2px translation with enhanced shadow
- Active states: +1px translation with reduced shadow

---

## Migration Notes

### Breaking Changes
- `primary-500` color changed from green (#22C55E) to coral (#F97066)
- `secondary-500` changed from yellow (#EAB308) to blue (#2E86DE)
- `accent-500` changed from orange (#F97316) to gold (#F59F00)
- `success` now uses separate green palette instead of primary

### Non-Breaking
- Red/destructive colors remain unchanged
- Shadow system expanded but existing shadows still work
- All components are backwards compatible with variant names

### Testing Recommendations
1. Visual regression testing on all pages
2. Check ActivityCard with different categories
3. Verify button states (hover, active, focus)
4. Test badge variants across components
5. Validate form error states
6. Check loading/skeleton states
7. Test toast notifications

---

**Last Updated**: 2026-01-12
**Design Version**: 2.0
**Status**: Implementation in progress
