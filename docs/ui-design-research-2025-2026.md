# UI Design Research: Search Interfaces 2025-2026
## Visual Design Trends for Action Atlas

**Research Date**: 2026-01-07
**Focus**: Visual design, interaction patterns, and design systems for semantic search interfaces
**Target Application**: Action Atlas - AI-powered volunteering activity search

---

## Executive Summary

This research analyzes visual design trends for search interfaces in 2025-2026, with specific focus on AI-powered semantic search experiences. Key findings:

- **Minimalism with warmth**: Clean interfaces with human-centric color palettes
- **Spatial breathing room**: Generous whitespace for cognitive ease
- **Adaptive design**: Seamless light/dark mode with contextual switching
- **Motion as feedback**: Micro-interactions that communicate system state
- **Trust through transparency**: Visual cues that explain AI reasoning

For Action Atlas, this translates to a **community-focused, accessible, and trustworthy** visual identity that makes volunteering feel approachable and meaningful.

---

## 1. Visual Design Trends (2025-2026)

### 1.1 Color Schemes for Search Interfaces

#### Industry Trend: Semantic Color Systems

Modern search interfaces have moved away from brand-dominant color schemes toward **semantic color systems** where colors communicate meaning and state.

**2025-2026 Color Patterns:**

1. **AI-First Interfaces (Perplexity, Claude, ChatGPT)**
   - Primary: Deep purples, teals, or indigos (trust, intelligence)
   - Accent: Bright cyan, coral, or amber (energy, discovery)
   - Neutrals: True grays (not blue-grays) for readability
   - Backgrounds: Pure white (#FFFFFF) or deep charcoal (#1A1A1A)

2. **Productivity Tools (Linear, Notion)**
   - Primary: Muted purples or slate blues (focus, calm)
   - Accent: Vibrant singular colors (Linear's iconic purple)
   - Neutrals: Warm grays (#F5F5F5 to #1F1F1F)
   - Success states: Emerald greens, not bright greens

3. **Documentation Search (Stripe, Vercel)**
   - Primary: Blacks and grays (professional, technical)
   - Accent: Brand color sparingly (trust, familiarity)
   - Code blocks: Subtle syntax highlighting
   - Backgrounds: Soft off-whites (#FAFAFA) or near-blacks (#0A0A0A)

#### 2026 Color Psychology for Search:

| Color | Psychological Association | Use in Search UI |
|-------|---------------------------|------------------|
| **Purple/Indigo** | Intelligence, creativity, AI | Primary brand, AI indicators |
| **Teal/Cyan** | Trust, clarity, discovery | Active states, highlights |
| **Green** | Success, growth, community | Result matches, completed actions |
| **Amber/Orange** | Energy, volunteering, warmth | Call-to-action, important info |
| **Red** | Urgency, error, stop | Error states only (sparingly) |
| **Gray** | Neutrality, professionalism | Text, backgrounds, borders |

#### Action Atlas Color Palette Recommendation:

**Primary Palette: "Community Warmth"**

```css
/* Primary Colors - Trust & Community */
--primary-600: #6366F1;      /* Indigo - Primary brand (AI, trust) */
--primary-500: #818CF8;      /* Light indigo - Hover states */
--primary-700: #4F46E5;      /* Dark indigo - Active states */

/* Accent Colors - Volunteering & Action */
--accent-500: #F59E0B;       /* Amber - Call-to-action (volunteering energy) */
--accent-600: #D97706;       /* Dark amber - Hover CTAs */
--success-500: #10B981;      /* Emerald - Success, community growth */
--info-500: #06B6D4;         /* Cyan - Information, discovery */

/* Neutrals - Modern Warm Grays */
--gray-50: #FAFAF9;          /* Background light */
--gray-100: #F5F5F4;         /* Card backgrounds light */
--gray-200: #E7E5E4;         /* Borders light */
--gray-400: #A8A29E;         /* Placeholder text */
--gray-600: #57534E;         /* Secondary text */
--gray-700: #44403C;         /* Body text */
--gray-800: #292524;         /* Headings */
--gray-900: #1C1917;         /* Background dark */
--gray-950: #0C0A09;         /* Deep background dark */

/* Semantic Colors */
--error-500: #EF4444;        /* Error states */
--warning-500: #F59E0B;      /* Warnings */
```

**Rationale:**
- **Indigo primary**: Conveys trust, intelligence (AI search), professionalism
- **Amber accent**: Warm, energetic, associated with volunteering and action
- **Warm grays**: More human and approachable than cool grays
- **Emerald success**: Community growth, environmental causes (volunteering themes)
- **High contrast**: WCAG AAA compliance for accessibility

**Dark Mode Adjustments:**

```css
/* Dark Mode - Adjusted for readability */
--primary-400: #A5B4FC;      /* Lighter indigo for dark backgrounds */
--accent-400: #FBBF24;       /* Lighter amber for visibility */
--gray-900: #1C1917;         /* Background */
--gray-800: #292524;         /* Card backgrounds */
--gray-50: #FAFAF9;          /* Text */
```

---

### 1.2 Typography Trends (2025-2026)

#### Industry Shift: Variable Fonts & System Font Stacks

**2025-2026 Typography Patterns:**

1. **System Font Stacks (Performance-First)**
   - Inter, SF Pro, Segoe UI for body text
   - Faster load times, native OS feel
   - Perfect for search where speed matters

2. **Variable Fonts (Premium Feel)**
   - Single file, multiple weights
   - Inter Variable, Geist, Public Sans
   - Smooth weight transitions for micro-interactions

3. **Display Fonts (Sparingly)**
   - Reserved for hero sections only
   - Never used in search results (readability priority)

#### Typography Hierarchy Best Practices:

**Modern Search Interface Scale (2025-2026):**

| Element | Size | Weight | Line Height | Use Case |
|---------|------|--------|-------------|----------|
| **Hero H1** | 48-60px | 700-800 | 1.1 | Landing page only |
| **Page H1** | 32-40px | 700 | 1.2 | Page titles |
| **H2 Section** | 24-28px | 600-700 | 1.3 | Section headers |
| **H3 Card Title** | 18-20px | 600 | 1.4 | Result card titles |
| **Body Large** | 16-18px | 400 | 1.6 | Search input, descriptions |
| **Body** | 14-16px | 400 | 1.5 | Card details, metadata |
| **Small** | 12-14px | 400-500 | 1.4 | Timestamps, labels |
| **Tiny** | 10-12px | 500 | 1.3 | Badges, tags |

#### Action Atlas Typography Recommendation:

**Font Stack: Modern System with Fallback**

```css
/* Primary Font Stack - Body Text */
--font-sans:
  'Inter Variable',
  'Inter',
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  'Roboto',
  'Helvetica Neue',
  Arial,
  sans-serif,
  'Apple Color Emoji',
  'Segoe UI Emoji';

/* Monospace - For technical elements */
--font-mono:
  'Geist Mono Variable',
  'Fira Code',
  'Consolas',
  'Monaco',
  monospace;

/* Typography Scale (using Tailwind-style naming) */
--text-xs: 0.75rem;      /* 12px - Tags, badges */
--text-sm: 0.875rem;     /* 14px - Metadata, timestamps */
--text-base: 1rem;       /* 16px - Body text, search input */
--text-lg: 1.125rem;     /* 18px - Emphasized body text */
--text-xl: 1.25rem;      /* 20px - Card titles */
--text-2xl: 1.5rem;      /* 24px - Section headers */
--text-3xl: 1.875rem;    /* 30px - Page titles */
--text-4xl: 2.25rem;     /* 36px - Hero sections */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;   /* Headings */
--leading-snug: 1.375;   /* Subheadings */
--leading-normal: 1.5;   /* Body text */
--leading-relaxed: 1.625; /* Long-form content */
```

**Typography Application:**

```css
/* Search Input */
.search-input {
  font-size: var(--text-lg);      /* 18px - Comfortable for typing */
  font-weight: var(--font-normal); /* 400 */
  line-height: var(--leading-normal); /* 1.5 */
}

/* Activity Card Title */
.activity-title {
  font-size: var(--text-xl);      /* 20px - Scannable */
  font-weight: var(--font-semibold); /* 600 - Strong hierarchy */
  line-height: var(--leading-tight); /* 1.25 */
}

/* Activity Description */
.activity-description {
  font-size: var(--text-base);    /* 16px - Readable */
  font-weight: var(--font-normal); /* 400 */
  line-height: var(--leading-relaxed); /* 1.625 - Comfortable reading */
  color: var(--gray-600);         /* Secondary text color */
}

/* Metadata (Location, Date) */
.activity-metadata {
  font-size: var(--text-sm);      /* 14px - De-emphasized */
  font-weight: var(--font-medium); /* 500 - Readable at small size */
  line-height: var(--leading-snug); /* 1.375 */
  color: var(--gray-500);
}
```

**Rationale:**
- **Inter Variable**: Industry standard in 2025-2026, excellent readability
- **18px search input**: Comfortable for typing, prevents iOS zoom on focus
- **20px card titles**: Large enough to scan quickly, small enough for density
- **16px body**: Accessible default, recommended by WCAG
- **Generous line-height**: 1.5-1.625 for body text improves readability

---

### 1.3 Spacing and Layout Patterns (2025-2026)

#### Trend: Spacious Over Dense

**2025-2026 Layout Philosophy:**
- **More breathing room** than 2020s (reaction to cluttered interfaces)
- **Vertical rhythm** with consistent spacing scales
- **Content-first layouts** (no unnecessary chrome)
- **Adaptive density** (users can choose compact vs. comfortable)

#### Spacing Systems:

**Modern 8px Grid System (Industry Standard):**

```css
/* Spacing Scale (8px base) */
--space-0: 0;          /* 0px */
--space-1: 0.25rem;    /* 4px - Tight spacing */
--space-2: 0.5rem;     /* 8px - Element spacing */
--space-3: 0.75rem;    /* 12px - Small gaps */
--space-4: 1rem;       /* 16px - Standard spacing */
--space-5: 1.25rem;    /* 20px - Comfortable spacing */
--space-6: 1.5rem;     /* 24px - Section spacing */
--space-8: 2rem;       /* 32px - Large spacing */
--space-10: 2.5rem;    /* 40px - XL spacing */
--space-12: 3rem;      /* 48px - XXL spacing */
--space-16: 4rem;      /* 64px - Section breaks */
--space-20: 5rem;      /* 80px - Major sections */
```

#### Layout Patterns (2025-2026):

**1. Search Interface Layouts:**

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  [Search Input - Full Width, Centered]         │  ← Large, prominent
│                                                 │
│  ┌──────────────────────┐  ┌─────────────────┐ │
│  │   Filter Sidebar     │  │  Results Grid   │ │  ← Side-by-side
│  │   (Sticky)           │  │  (2-3 columns)  │ │
│  │                      │  │                 │ │
│  │  - Location          │  │  [Card] [Card]  │ │
│  │  - Category          │  │  [Card] [Card]  │ │
│  │  - Skills            │  │  [Card] [Card]  │ │
│  │  - Date              │  │                 │ │
│  └──────────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────┘
```

**2. Card Design Evolution (2025-2026):**

**Before (2020s - Dense):**
- Tight padding (12px)
- Small gaps between elements (8px)
- Lots of information crammed
- Hard borders

**Now (2025-2026 - Spacious):**
- Generous padding (20-24px)
- Comfortable gaps (16-20px)
- Curated information
- Soft shadows instead of borders

#### Action Atlas Layout Recommendations:

**Container Widths:**

```css
/* Max Width System */
--container-sm: 640px;   /* Forms, single column */
--container-md: 768px;   /* Content pages */
--container-lg: 1024px;  /* Search results (comfortable) */
--container-xl: 1280px;  /* Search results (spacious) */
--container-2xl: 1536px; /* Dashboard views */

/* Action Atlas Recommended */
.search-container {
  max-width: var(--container-lg); /* 1024px */
  margin: 0 auto;
  padding: 0 var(--space-6); /* 24px horizontal padding */
}
```

**Grid Systems:**

```css
/* Results Grid - Responsive */
.results-grid {
  display: grid;
  gap: var(--space-6); /* 24px gap */

  /* Mobile: 1 column */
  grid-template-columns: 1fr;

  /* Tablet: 2 columns */
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  /* Desktop: 3 columns (optional, based on card width) */
  @media (min-width: 1280px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Alternative: Auto-fit for flexible layouts */
.results-grid-auto {
  display: grid;
  gap: var(--space-6);
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}
```

**Card Spacing (2025-2026 Standard):**

```css
.activity-card {
  padding: var(--space-6); /* 24px - Generous */
  border-radius: var(--radius-lg); /* 12px */

  /* Spacing between internal elements */
  & > * + * {
    margin-top: var(--space-4); /* 16px vertical rhythm */
  }
}

/* Card Header (Title + Metadata) */
.card-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-2); /* 8px - Tight relationship */
}

/* Card Body (Description) */
.card-body {
  margin-top: var(--space-4); /* 16px */
}

/* Card Footer (Actions, Location) */
.card-footer {
  margin-top: var(--space-6); /* 24px - Clear separation */
  padding-top: var(--space-4); /* 16px */
  border-top: 1px solid var(--gray-200);
}
```

**Density Options (User Preference):**

```css
/* Comfortable (Default) */
.density-comfortable .activity-card {
  padding: var(--space-6); /* 24px */
  gap: var(--space-4); /* 16px */
}

/* Compact (Power users) */
.density-compact .activity-card {
  padding: var(--space-4); /* 16px */
  gap: var(--space-3); /* 12px */
  font-size: 0.9375rem; /* 15px - Slightly smaller */
}

/* Spacious (Accessibility) */
.density-spacious .activity-card {
  padding: var(--space-8); /* 32px */
  gap: var(--space-6); /* 24px */
  font-size: 1.0625rem; /* 17px - Slightly larger */
}
```

**Rationale:**
- **24px card padding**: Modern standard for comfortable reading
- **16px vertical rhythm**: Clear hierarchy without feeling cramped
- **1024px max width**: Comfortable for 2-3 column layouts
- **Density options**: Accessibility and power user preference

---

### 1.4 Card Design for Search Results (2025-2026)

#### Evolution: From Flat to Elevated

**2025-2026 Card Design Principles:**
1. **Subtle elevation** (not flat, not skeuomorphic)
2. **Hover states that feel physical** (lift on hover)
3. **Information hierarchy** through spacing, not borders
4. **Curated content** (show only essential info)
5. **Clear CTAs** (one primary action per card)

#### Modern Card Anatomy:

```
┌─────────────────────────────────────────────┐
│  [Organization Badge]          [Category]   │ ← Small, de-emphasized
│                                              │
│  Activity Title (Bold, 20px)                │ ← Primary focus
│  Short tagline or subtitle                  │ ← Secondary info
│                                              │
│  Brief description (2-3 lines max)...       │ ← Truncated body
│  with graceful truncation...                │
│                                              │
│  ┌──────┐  📍 Location • 🕐 Time           │ ← Icon + text metadata
│  │      │                                   │
│  │ Img  │  [Skills: Design, Teaching]       │ ← Visual + tags
│  │      │                                   │
│  └──────┘  ──────────────────────────       │
│             [Learn More →]   [Apply Now]    │ ← Clear CTAs
└─────────────────────────────────────────────┘
```

#### Action Atlas Card Design Specification:

**Visual Styles:**

```css
/* Base Card */
.activity-card {
  /* Structure */
  position: relative;
  display: flex;
  flex-direction: column;
  padding: var(--space-6); /* 24px */
  border-radius: var(--radius-lg); /* 12px */

  /* Elevation (2025-2026 style: subtle shadows) */
  background: white;
  border: 1px solid var(--gray-200);
  box-shadow:
    0 1px 3px 0 rgb(0 0 0 / 0.1),
    0 1px 2px -1px rgb(0 0 0 / 0.1);

  /* Transitions */
  transition:
    transform 200ms ease,
    box-shadow 200ms ease,
    border-color 200ms ease;

  /* Dark Mode */
  @media (prefers-color-scheme: dark) {
    background: var(--gray-800);
    border-color: var(--gray-700);
    box-shadow:
      0 1px 3px 0 rgb(0 0 0 / 0.3),
      0 1px 2px -1px rgb(0 0 0 / 0.3);
  }
}

/* Hover State (Physical Lift) */
.activity-card:hover {
  transform: translateY(-2px);
  border-color: var(--primary-200);
  box-shadow:
    0 10px 15px -3px rgb(0 0 0 / 0.1),
    0 4px 6px -4px rgb(0 0 0 / 0.1);

  @media (prefers-color-scheme: dark) {
    border-color: var(--primary-700);
    box-shadow:
      0 10px 15px -3px rgb(0 0 0 / 0.4),
      0 4px 6px -4px rgb(0 0 0 / 0.4);
  }
}

/* Active State */
.activity-card:active {
  transform: translateY(0);
  transition-duration: 50ms;
}

/* Focus State (Accessibility) */
.activity-card:focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}
```

**Card Component Structure:**

```tsx
// TypeScript + React Component
interface ActivityCardProps {
  title: string;
  organization: string;
  description: string;
  location: string;
  category: string;
  skills: string[];
  timeCommitment: string;
  imageUrl?: string;
  relevanceScore?: number;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  title,
  organization,
  description,
  location,
  category,
  skills,
  timeCommitment,
  imageUrl,
  relevanceScore,
}) => {
  return (
    <article className="activity-card">
      {/* Header: Organization + Category */}
      <div className="card-header">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">
            {organization}
          </span>
          <span className="badge badge-category">{category}</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="card-title">
        {title}
      </h3>

      {/* Description (Truncated) */}
      <p className="card-description line-clamp-2">
        {description}
      </p>

      {/* Metadata */}
      <div className="card-metadata">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPinIcon className="w-4 h-4" />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <ClockIcon className="w-4 h-4" />
          <span>{timeCommitment}</span>
        </div>
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.slice(0, 3).map((skill) => (
            <span key={skill} className="badge badge-skill">
              {skill}
            </span>
          ))}
          {skills.length > 3 && (
            <span className="text-sm text-gray-500">
              +{skills.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Footer: CTA */}
      <div className="card-footer">
        <Button variant="primary" size="md" className="w-full">
          Learn More
          <ArrowRightIcon className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Relevance Score (Optional - AI transparency) */}
      {relevanceScore && (
        <div className="card-relevance">
          <span className="text-xs text-gray-500">
            {Math.round(relevanceScore * 100)}% match
          </span>
        </div>
      )}
    </article>
  );
};
```

**Badge Styles:**

```css
/* Base Badge */
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3); /* 4px 12px */
  font-size: var(--text-xs); /* 12px */
  font-weight: var(--font-medium); /* 500 */
  border-radius: var(--radius-full); /* Full rounded */
  transition: background-color 150ms ease;
}

/* Category Badge */
.badge-category {
  background: var(--primary-100);
  color: var(--primary-700);

  @media (prefers-color-scheme: dark) {
    background: var(--primary-900);
    color: var(--primary-300);
  }
}

/* Skill Badge */
.badge-skill {
  background: var(--gray-100);
  color: var(--gray-700);

  @media (prefers-color-scheme: dark) {
    background: var(--gray-800);
    color: var(--gray-300);
  }
}
```

**Rationale:**
- **Subtle shadows**: Modern, not overdone (following 2025-2026 trends)
- **Hover lift**: Physical feedback, clear interactivity
- **Line clamp**: Keeps cards uniform height
- **Primary CTA only**: Reduces cognitive load
- **Relevance score**: Transparency in AI search results

---

### 1.5 Iconography and Visual Elements

#### 2025-2026 Icon Trends:

**1. Icon Systems:**
- **Lucide Icons** (most popular in 2025-2026)
- **Heroicons** (Tailwind ecosystem)
- **Phosphor Icons** (flexible weights)
- **Custom SVGs** (unique brand elements)

**2. Icon Styles:**
- **Outline style** for UI elements (lighter, modern)
- **Solid style** for emphasis and CTAs
- **Dual-tone** for illustrations (not icons)

**3. Icon Sizing:**

```css
/* Icon Size System */
--icon-xs: 12px;  /* Inline with small text */
--icon-sm: 16px;  /* Inline with body text */
--icon-md: 20px;  /* Standalone, buttons */
--icon-lg: 24px;  /* Headers, emphasis */
--icon-xl: 32px;  /* Features, empty states */
--icon-2xl: 48px; /* Hero sections */
```

#### Action Atlas Iconography:

**Icon Library:** Lucide React (recommended for Action Atlas)

```bash
npm install lucide-react
```

**Icon Usage Guidelines:**

```tsx
import {
  Search,
  MapPin,
  Clock,
  Users,
  Heart,
  Calendar,
  Filter,
  ArrowRight,
  ChevronDown,
  X,
} from 'lucide-react';

// Icon Component with consistent sizing
const Icon: React.FC<{
  icon: LucideIcon;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ icon: IconComponent, size = 'md', className }) => {
  const sizeClasses = {
    xs: 'w-3 h-3',  // 12px
    sm: 'w-4 h-4',  // 16px
    md: 'w-5 h-5',  // 20px
    lg: 'w-6 h-6',  // 24px
  };

  return <IconComponent className={`${sizeClasses[size]} ${className}`} />;
};
```

**Icon + Text Patterns:**

```css
/* Icon with text (horizontal) */
.icon-text {
  display: flex;
  align-items: center;
  gap: var(--space-2); /* 8px */
}

/* Icon with text (vertical, for features) */
.icon-text-vertical {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3); /* 12px */
  text-align: center;
}

/* Icon button (clickable icons) */
.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--space-10); /* 40px */
  height: var(--space-10); /* 40px */
  border-radius: var(--radius-md); /* 8px */
  transition: background-color 150ms ease;
}

.icon-button:hover {
  background: var(--gray-100);
}
```

**Visual Elements: Illustrations & Empty States**

**2025-2026 Illustration Trends:**
- **Simplified, abstract shapes** (not detailed illustrations)
- **Duotone color schemes** (primary + accent)
- **Geometric patterns** (modern, clean)
- **Subtle animations** (Lottie for empty states)

**Action Atlas Visual Elements:**

1. **Empty State (No Results):**
   - Large icon (48px) in muted color
   - Helpful message (not "No results")
   - Actionable suggestions

```tsx
const EmptyState: React.FC = () => (
  <div className="empty-state">
    <div className="empty-state-icon">
      <Search size={48} strokeWidth={1.5} />
    </div>
    <h3 className="empty-state-title">
      No activities found
    </h3>
    <p className="empty-state-description">
      Try adjusting your filters or search for something else
    </p>
    <Button variant="secondary" onClick={handleClearFilters}>
      Clear all filters
    </Button>
  </div>
);
```

2. **Loading States:**
   - Skeleton screens (not spinners)
   - Shimmer effect for cards
   - Pulsing animation

```css
/* Skeleton Card */
.skeleton-card {
  background: linear-gradient(
    90deg,
    var(--gray-200) 0%,
    var(--gray-100) 50%,
    var(--gray-200) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-lg);
}

@keyframes shimmer {
  0% { background-position: -100% 0; }
  100% { background-position: 100% 0; }
}
```

---

### 1.6 Dark Mode Considerations (2025-2026)

#### Industry Standard: True Dark, Not Gray

**2025-2026 Dark Mode Principles:**

1. **True blacks** (#000000 or near-black #0A0A0A) for OLED optimization
2. **Reduced, not inverted** colors (softer primaries)
3. **Increased contrast** for text (AAA compliance)
4. **Darker shadows** (use opacity, not color)
5. **Desaturated accents** (vibrant colors hurt in dark mode)

#### Action Atlas Dark Mode Palette:

```css
/* Dark Mode Color System */
:root[data-theme="dark"] {
  /* Backgrounds */
  --bg-primary: #0A0A0A;         /* Main background (near-black) */
  --bg-secondary: #171717;       /* Card backgrounds */
  --bg-tertiary: #262626;        /* Hover states */

  /* Text */
  --text-primary: #FAFAFA;       /* Body text (high contrast) */
  --text-secondary: #A3A3A3;     /* Secondary text */
  --text-tertiary: #737373;      /* Disabled, placeholder */

  /* Primary Colors (Desaturated) */
  --primary-400: #A5B4FC;        /* Lighter indigo */
  --primary-500: #818CF8;        /* Standard indigo */
  --primary-600: #6366F1;        /* Hover state */

  /* Accent (Adjusted) */
  --accent-400: #FBBF24;         /* Lighter amber */
  --accent-500: #F59E0B;         /* Standard amber */

  /* Borders */
  --border-primary: #262626;     /* Subtle borders */
  --border-secondary: #404040;   /* Emphasized borders */

  /* Shadows (Dark mode shadows use pure black with opacity) */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.5);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.5);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.5);
}
```

**Dark Mode Best Practices:**

```css
/* Card in Dark Mode */
.activity-card {
  background: var(--bg-secondary);
  border-color: var(--border-primary);
  color: var(--text-primary);
}

/* Ensure text contrast (WCAG AAA) */
.activity-description {
  color: var(--text-secondary); /* #A3A3A3 on #171717 = 9.8:1 contrast */
}

/* Avoid pure white text (too harsh) */
/* DO: Use #FAFAFA or #F5F5F5 */
/* DON'T: Use #FFFFFF */

/* Images and media */
.activity-image {
  /* Slightly dim images in dark mode */
  @media (prefers-color-scheme: dark) {
    opacity: 0.9;
  }
}

/* Syntax highlighting for code (if needed) */
.code-block {
  /* Use dedicated dark theme (e.g., Nord, Dracula) */
  @media (prefers-color-scheme: dark) {
    background: #1E1E1E;
    color: #D4D4D4;
  }
}
```

**System Preference Detection:**

```tsx
// React Hook for Dark Mode
import { useEffect, useState } from 'react';

const useDarkMode = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setTheme(mediaQuery.matches ? 'dark' : 'light');

    // Listen for changes
    const handler = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return { theme, setTheme };
};
```

**Dark Mode Toggle UI:**

```tsx
const DarkModeToggle: React.FC = () => {
  const { theme, setTheme } = useDarkMode();

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="icon-button"
      aria-label="Toggle dark mode"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  );
};
```

---

## 2. Inspiring Search Products (Design Analysis)

### 2.1 Perplexity AI: Clean, Minimal, AI-First Design

**Key Design Elements:**

1. **Search-First Layout**
   - Centered search input (prominent)
   - Minimal chrome (no header clutter)
   - Results appear inline (conversational)

2. **Color Palette**
   - Primary: Deep purple (#6B48FF)
   - Background: Pure white / True black
   - Accent: Teal for citations

3. **Typography**
   - Large search input (20px)
   - Generous line-height (1.6-1.8)
   - Clear hierarchy with weight, not size

4. **Unique Features**
   - Citation cards (inline references)
   - Smooth result streaming
   - Persistent search context

**Lessons for Action Atlas:**
- ✅ Prominent search input with minimal distractions
- ✅ Inline result cards (not separate page)
- ✅ Clear visual hierarchy through spacing
- ❌ Don't copy conversational UI (not suitable for activity search)

---

### 2.2 Linear: Command Palette Design

**Key Design Elements:**

1. **Command Palette (⌘K)**
   - Overlay modal (centered, 600px wide)
   - Instant keyboard navigation
   - Recent searches + suggestions

2. **Color Palette**
   - Primary: Purple (#5E6AD2)
   - Background: Soft gray (#F7F8F8)
   - Accent: Purple for active states

3. **Typography**
   - Inter font throughout
   - 16px search input
   - 14px results (compact, scannable)

4. **Interaction Design**
   - Keyboard-first (arrows, enter, escape)
   - Instant search (no submit button)
   - Visual feedback on hover/selection

**Lessons for Action Atlas:**
- ✅ Command palette for power users (⌘K to open search)
- ✅ Keyboard navigation (accessibility)
- ✅ Recent searches (user convenience)
- ✅ Instant search (no submit button)

**Implementation Example:**

```tsx
// Command Palette (⌘K) for Action Atlas
const CommandPalette: React.FC = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="command-palette">
        <SearchInput autoFocus />
        <SearchResults />
      </DialogContent>
    </Dialog>
  );
};
```

---

### 2.3 Notion: Quick Find and Search UI

**Key Design Elements:**

1. **Quick Find (⌘P)**
   - Fast, fuzzy search
   - Categorized results (Pages, Databases, etc.)
   - Icons for visual scanning

2. **Color Palette**
   - Neutral grays (minimal color)
   - Black text for readability
   - Subtle blue for selection

3. **Typography**
   - 14px default (compact but readable)
   - Icons + text (visual + semantic)

4. **Search Results**
   - Grouped by type (sections)
   - Breadcrumbs (context)
   - Keyboard navigation

**Lessons for Action Atlas:**
- ✅ Grouped results (by category, location, etc.)
- ✅ Visual icons for quick scanning
- ✅ Breadcrumbs (organization → activity)
- ❌ Don't overcomplicate with too many categories

---

### 2.4 Stripe Documentation Search: Technical but Beautiful

**Key Design Elements:**

1. **Search Bar**
   - Always visible (sticky header)
   - Autocomplete dropdown
   - Keyboard shortcuts visible (⌘K)

2. **Color Palette**
   - Primary: Stripe blue (#635BFF)
   - Background: Off-white (#F6F9FC)
   - Code: Syntax highlighted

3. **Typography**
   - 16px body text (readable)
   - Monospace for code
   - Clear hierarchy (H1 → H4)

4. **Results Design**
   - Code snippets in results
   - Section headers for context
   - Direct links to relevant docs

**Lessons for Action Atlas:**
- ✅ Sticky search bar (always accessible)
- ✅ Autocomplete for common queries
- ✅ Context snippets (activity description previews)
- ❌ Skip code-specific features

---

### 2.5 Dribbble Search: Creative and Visual

**Key Design Elements:**

1. **Image-First Results**
   - Large thumbnails (primary focus)
   - Hover overlays (metadata)
   - Grid layout (2-4 columns)

2. **Color Palette**
   - Minimal UI (images are the focus)
   - Pink accent (#EA4C89)
   - White space for breathing room

3. **Filtering**
   - Visual filters (color picker)
   - Tag-based filtering
   - Sort options (trending, recent)

**Lessons for Action Atlas:**
- ✅ Image thumbnails for activities (if available)
- ✅ Visual filtering (icons for categories)
- ✅ Grid layout for scannability
- ❌ Don't prioritize images over text (accessibility)

---

### 2.6 Behance Search: Portfolio Discovery

**Key Design Elements:**

1. **Hero Search**
   - Large, prominent on homepage
   - Suggested searches (trending)
   - Category pills below search

2. **Results Layout**
   - Masonry grid (varied heights)
   - Large project covers
   - Creator info on hover

3. **Filtering**
   - Left sidebar (collapsible)
   - Multiple filters (tools, color, etc.)
   - Active filter badges

**Lessons for Action Atlas:**
- ✅ Hero search on homepage
- ✅ Suggested searches (popular activities)
- ✅ Filter sidebar (collapsible on mobile)
- ❌ Masonry grid (uniform cards are better for activities)

---

### 2.7 Figma Search: In-App Search Patterns

**Key Design Elements:**

1. **Search Everywhere**
   - Quick search (⌘P)
   - Contextual search (within files)
   - Search and replace

2. **Results Grouping**
   - By file, layer, component
   - Thumbnails for visual context
   - Keyboard navigation

3. **Performance**
   - Instant results (<50ms)
   - Fuzzy matching
   - Cached recent searches

**Lessons for Action Atlas:**
- ✅ Instant search (<200ms target)
- ✅ Fuzzy matching (semantic search helps here)
- ✅ Recent searches (user convenience)
- ✅ Keyboard shortcuts (power users)

---

## 3. Design Systems for Search

### 3.1 Material Design 3 Search Patterns

**Key Components:**

1. **Search Bar**
   - 56dp height (larger touch target)
   - Rounded corners (28dp radius)
   - Leading icon (search)
   - Trailing icon (clear)

2. **Search Suggestions**
   - Below search bar (overlay)
   - Recent searches first
   - Autocomplete suggestions

3. **Tokens:**
   ```
   Primary: Purple (#6750A4)
   Surface: White (#FFFFFF) / Dark (#1C1B1F)
   Border radius: 28dp (fully rounded)
   Elevation: Level 3 (8dp shadow)
   ```

**Action Atlas Adaptation:**

```css
/* Material Design 3 Inspired */
.search-bar-md3 {
  height: 56px;
  border-radius: 28px; /* Fully rounded */
  padding: 0 24px;
  background: var(--surface);
  box-shadow: var(--elevation-3);
}
```

**Pros for Action Atlas:**
- ✅ Accessible (large touch targets)
- ✅ Modern (rounded corners)
- ✅ Well-documented

**Cons:**
- ❌ Very rounded (may feel toy-like for serious volunteering)
- ❌ Elevation system complex

---

### 3.2 Apple Human Interface Guidelines for Search

**Key Principles:**

1. **Search Bar (iOS/macOS)**
   - Integrated in navigation bar
   - Cancellable (cancel button appears on focus)
   - Scope buttons (filter categories)

2. **Typography:**
   - SF Pro (system font)
   - 17px body (iOS)
   - 13px body (macOS)

3. **Colors:**
   - System Blue (#007AFF)
   - Semantic colors (success, error)

4. **Interaction:**
   - Search on typing (no submit)
   - Clear button (X) always visible when text present
   - Keyboard accessory (suggestions bar)

**Action Atlas Adaptation:**

```tsx
// Apple-Inspired Search Bar
const SearchBarApple: React.FC = () => (
  <div className="search-bar-apple">
    <Search className="search-icon" />
    <input
      type="search"
      placeholder="Search activities"
      className="search-input"
    />
    <button className="search-cancel" aria-label="Clear search">
      <X className="w-4 h-4" />
    </button>
  </div>
);
```

```css
.search-bar-apple {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--gray-100); /* Light gray background */
  border-radius: 10px; /* iOS-style rounded */
  transition: background-color 150ms;
}

.search-bar-apple:focus-within {
  background: white;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1);
}
```

**Pros for Action Atlas:**
- ✅ Clean, minimal design
- ✅ Familiar to iOS/macOS users
- ✅ Excellent accessibility

**Cons:**
- ❌ iOS-specific conventions (may confuse Android users)

---

### 3.3 Vercel Design System

**Key Characteristics:**

1. **Minimalism**
   - Monochrome (black, white, grays)
   - Geometric shapes
   - Subtle animations

2. **Typography:**
   - Geist font (custom)
   - 14px default body
   - Tight line-height (1.4)

3. **Components:**
   - Ghost buttons (transparent)
   - Subtle borders (1px gray)
   - No shadows (flat design)

4. **Search Pattern:**
   - Inline search (no modal)
   - Instant results
   - Minimal styling

**Action Atlas Adaptation:**

```css
/* Vercel-Inspired Minimal Search */
.search-bar-vercel {
  border: 1px solid var(--gray-300);
  border-radius: 6px;
  padding: 12px 16px;
  font-size: 14px;
  background: transparent;
  transition: border-color 150ms;
}

.search-bar-vercel:focus {
  outline: none;
  border-color: black;
}
```

**Pros for Action Atlas:**
- ✅ Extremely clean
- ✅ Fast performance (minimal styles)
- ✅ Developer-friendly

**Cons:**
- ❌ Too minimal for Action Atlas (volunteering needs warmth)
- ❌ Lacks color (important for categories)

---

### 3.4 Tailwind UI Search Components

**Key Components:**

1. **Search Input with Icon**
   ```tsx
   <div className="relative">
     <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
     <input
       type="search"
       className="pl-10 pr-4 py-2 w-full border rounded-lg"
       placeholder="Search..."
     />
   </div>
   ```

2. **Command Palette**
   - Modal overlay
   - Grouped results
   - Keyboard navigation

3. **Search with Dropdown**
   - Autocomplete suggestions
   - Highlight matching text
   - Arrow key navigation

**Action Atlas Recommendation:** ✅ Use Tailwind UI patterns (well-tested, accessible)

---

### 3.5 shadcn/ui Search Implementations

**Key Components (Action Atlas should use):**

1. **Command Component** (`cmdk`)
   ```tsx
   import {
     Command,
     CommandInput,
     CommandList,
     CommandEmpty,
     CommandGroup,
     CommandItem,
   } from '@/components/ui/command';

   <Command>
     <CommandInput placeholder="Search activities..." />
     <CommandList>
       <CommandEmpty>No results found.</CommandEmpty>
       <CommandGroup heading="Suggestions">
         <CommandItem>Environmental cleanup</CommandItem>
         <CommandItem>Teaching kids</CommandItem>
       </CommandGroup>
     </CommandList>
   </Command>
   ```

2. **Input Component** (Base search input)
   ```tsx
   import { Input } from '@/components/ui/input';

   <Input
     type="search"
     placeholder="Search activities..."
     className="search-input"
   />
   ```

3. **Popover** (For autocomplete dropdown)
   ```tsx
   import {
     Popover,
     PopoverContent,
     PopoverTrigger,
   } from '@/components/ui/popover';

   <Popover>
     <PopoverTrigger asChild>
       <Input type="search" />
     </PopoverTrigger>
     <PopoverContent>
       <SearchSuggestions />
     </PopoverContent>
   </Popover>
   ```

**Recommendation:** ✅ shadcn/ui is perfect for Action Atlas (already in tech stack)

---

## 4. Micro-interactions (2025-2026)

### 4.1 Search Bar Focus States and Animations

**Focus State Best Practices:**

```css
/* Default State */
.search-input {
  border: 1px solid var(--gray-300);
  background: white;
  transition: all 200ms ease;
}

/* Focus State (2025-2026 style) */
.search-input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow:
    0 0 0 4px rgba(99, 102, 241, 0.1), /* Ring */
    0 1px 2px 0 rgb(0 0 0 / 0.05); /* Subtle shadow */
}

/* Focus-visible (keyboard only) */
.search-input:focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}
```

**Expand on Focus Animation:**

```css
/* Search bar expands on focus */
.search-bar-expand {
  width: 300px;
  transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.search-bar-expand:focus-within {
  width: 500px;
}
```

**Placeholder Animation:**

```tsx
// Rotating placeholder text
const placeholders = [
  "Search for volunteering activities...",
  "Try: teach kids programming",
  "Try: environmental cleanup near me",
  "Try: help seniors with technology",
];

const RotatingPlaceholder: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <input
      type="search"
      placeholder={placeholders[index]}
      className="search-input"
    />
  );
};
```

---

### 4.2 Result Hover Effects

**Card Hover Animation (2025-2026):**

```css
/* Smooth lift on hover */
.activity-card {
  transition:
    transform 200ms cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.activity-card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 20px 25px -5px rgb(0 0 0 / 0.1),
    0 8px 10px -6px rgb(0 0 0 / 0.1);
}

/* Reveal action buttons on hover */
.activity-card .card-actions {
  opacity: 0;
  transform: translateY(8px);
  transition:
    opacity 200ms ease,
    transform 200ms ease;
}

.activity-card:hover .card-actions {
  opacity: 1;
  transform: translateY(0);
}
```

**Image Scale on Hover:**

```css
.activity-image-wrapper {
  overflow: hidden;
  border-radius: 8px;
}

.activity-image {
  transition: transform 300ms ease;
}

.activity-card:hover .activity-image {
  transform: scale(1.05);
}
```

---

### 4.3 Loading Animations

**2025-2026 Loading Patterns:**

1. **Skeleton Screens** (Preferred)
   - Show structure while loading
   - More informative than spinners
   - Reduces perceived wait time

```tsx
const ActivityCardSkeleton: React.FC = () => (
  <div className="activity-card skeleton">
    <div className="skeleton-line h-4 w-3/4" />
    <div className="skeleton-line h-3 w-1/2" />
    <div className="skeleton-line h-20 w-full" />
    <div className="skeleton-line h-8 w-full" />
  </div>
);
```

```css
.skeleton-line {
  background: linear-gradient(
    90deg,
    var(--gray-200) 0%,
    var(--gray-100) 50%,
    var(--gray-200) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% { background-position: -100% 0; }
  100% { background-position: 100% 0; }
}
```

2. **Progress Indicators** (For longer operations)

```tsx
// Linear progress bar
const SearchProgress: React.FC<{ progress: number }> = ({ progress }) => (
  <div className="progress-bar">
    <div
      className="progress-fill"
      style={{ width: `${progress}%` }}
    />
  </div>
);
```

```css
.progress-bar {
  height: 2px;
  background: var(--gray-200);
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
}

.progress-fill {
  height: 100%;
  background: var(--primary-500);
  transition: width 200ms ease;
}
```

3. **Spinners** (Only for inline actions)

```tsx
// Minimal spinner for buttons
const Spinner: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'md' }) => (
  <svg
    className={`spinner ${size}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="spinner-track"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="spinner-fill"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);
```

```css
.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

---

### 4.4 Smooth Transitions Between States

**State Transitions:**

1. **Search → Results**

```css
/* Results fade in */
.search-results {
  animation: fadeIn 300ms ease;
}

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
```

2. **Filter Changes**

```tsx
// React Spring for smooth transitions
import { useTransition, animated } from '@react-spring/web';

const SearchResults: React.FC<{ activities: Activity[] }> = ({ activities }) => {
  const transitions = useTransition(activities, {
    keys: (activity) => activity.id,
    from: { opacity: 0, transform: 'scale(0.95)' },
    enter: { opacity: 1, transform: 'scale(1)' },
    leave: { opacity: 0, transform: 'scale(0.95)' },
    trail: 50, // Stagger animation
  });

  return (
    <div className="results-grid">
      {transitions((style, activity) => (
        <animated.div style={style}>
          <ActivityCard {...activity} />
        </animated.div>
      ))}
    </div>
  );
};
```

3. **Page Transitions** (Next.js App Router)

```tsx
// app/layout.tsx
import { AnimatePresence, motion } from 'framer-motion';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </body>
    </html>
  );
}
```

---

### 4.5 Success/Error Feedback

**Toast Notifications (2025-2026 Style):**

```tsx
// Using sonner (recommended toast library)
import { toast } from 'sonner';

// Success
toast.success('Activity saved!', {
  description: 'You can find it in your saved activities.',
  icon: <Check className="w-5 h-5" />,
});

// Error
toast.error('Something went wrong', {
  description: 'Please try again later.',
  icon: <AlertCircle className="w-5 h-5" />,
});

// Loading
const promise = saveActivity();
toast.promise(promise, {
  loading: 'Saving...',
  success: 'Activity saved!',
  error: 'Failed to save activity',
});
```

**Inline Validation:**

```tsx
// Real-time input validation with feedback
const SearchInput: React.FC = () => {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length > 200) {
      setError('Search query is too long (max 200 characters)');
    } else {
      setError('');
    }
  };

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={handleChange}
        className={error ? 'input-error' : 'input'}
      />
      {error && (
        <p className="error-message">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
};
```

```css
/* Error State */
.input-error {
  border-color: var(--error-500);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  color: var(--error-500);
  font-size: 14px;
}

/* Success State */
.input-success {
  border-color: var(--success-500);
}
```

---

## 5. Action Atlas Visual Identity

### 5.1 Color Palette (Final Recommendation)

**Primary Palette:**

```css
/* Brand Colors */
--brand-primary: #6366F1;    /* Indigo - Trust, intelligence, AI */
--brand-secondary: #F59E0B;  /* Amber - Energy, volunteering, warmth */
--brand-success: #10B981;    /* Emerald - Community, growth, impact */

/* Grays (Warm) */
--gray-50: #FAFAF9;
--gray-100: #F5F5F4;
--gray-200: #E7E5E4;
--gray-300: #D6D3D1;
--gray-400: #A8A29E;
--gray-500: #78716C;
--gray-600: #57534E;
--gray-700: #44403C;
--gray-800: #292524;
--gray-900: #1C1917;

/* Semantic Colors */
--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;
--info: #06B6D4;
```

**Color Application:**

| Element | Color | Rationale |
|---------|-------|-----------|
| Primary CTA | Amber | High energy, action-oriented |
| Links | Indigo | Trust, clickable |
| Active states | Indigo | Consistency |
| Success messages | Emerald | Growth, positive impact |
| Badges (category) | Indigo bg | Brand consistency |
| Badges (skills) | Gray bg | De-emphasized |

---

### 5.2 Typography (Final Recommendation)

**Font Stack:**

```css
/* Primary Font: Inter Variable */
@import '@fontsource-variable/inter';

:root {
  --font-sans: 'Inter Variable', 'Inter', sans-serif;
}

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

**Application:**

- **Hero headline**: 36px, 700 weight
- **Page titles**: 30px, 700 weight
- **Section headers**: 24px, 600 weight
- **Card titles**: 20px, 600 weight
- **Body text**: 16px, 400 weight
- **Metadata**: 14px, 500 weight
- **Labels**: 12px, 500 weight

---

### 5.3 Card Design for Activity Results

**Final Card Specification:**

```tsx
interface ActivityCardProps {
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
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  title,
  organization,
  description,
  location,
  category,
  skills,
  timeCommitment,
  imageUrl,
  relevanceScore,
}) => {
  return (
    <article className="activity-card group">
      {/* Image (Optional) */}
      {imageUrl && (
        <div className="card-image">
          <img src={imageUrl} alt={title} />
        </div>
      )}

      {/* Header */}
      <div className="card-header">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">
            {organization}
          </span>
          <span className="badge badge-category">{category}</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="card-title group-hover:text-primary-600 transition-colors">
        {title}
      </h3>

      {/* Description */}
      <p className="card-description line-clamp-2">
        {description}
      </p>

      {/* Metadata */}
      <div className="card-metadata">
        <div className="metadata-item">
          <MapPin className="w-4 h-4" />
          <span>
            {location.city}
            {location.distance && ` • ${location.distance}km away`}
          </span>
        </div>
        <div className="metadata-item">
          <Clock className="w-4 h-4" />
          <span>{timeCommitment}</span>
        </div>
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="card-skills">
          {skills.slice(0, 3).map((skill) => (
            <span key={skill} className="badge badge-skill">
              {skill}
            </span>
          ))}
          {skills.length > 3 && (
            <span className="text-sm text-gray-500">
              +{skills.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="card-footer">
        <Button variant="primary" size="md" className="w-full">
          View Details
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Relevance Score (AI Transparency) */}
      {relevanceScore && (
        <div className="card-relevance">
          <span className="text-xs text-gray-500">
            {Math.round(relevanceScore * 100)}% match
          </span>
        </div>
      )}
    </article>
  );
};
```

**CSS:**

```css
.activity-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  box-shadow:
    0 1px 3px 0 rgb(0 0 0 / 0.1),
    0 1px 2px -1px rgb(0 0 0 / 0.1);
  transition:
    transform 200ms ease,
    box-shadow 200ms ease,
    border-color 200ms ease;
}

.activity-card:hover {
  transform: translateY(-2px);
  border-color: var(--primary-200);
  box-shadow:
    0 10px 15px -3px rgb(0 0 0 / 0.1),
    0 4px 6px -4px rgb(0 0 0 / 0.1);
}

.card-image {
  aspect-ratio: 16/9;
  overflow: hidden;
  border-radius: 8px;
  margin: -24px -24px 0; /* Bleed to edges */
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 300ms ease;
}

.activity-card:hover .card-image img {
  transform: scale(1.05);
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.25;
  color: var(--gray-800);
}

.card-description {
  font-size: 16px;
  line-height: 1.625;
  color: var(--gray-600);
}

.card-metadata {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metadata-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--gray-600);
}

.card-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 9999px;
}

.badge-category {
  background: var(--primary-100);
  color: var(--primary-700);
}

.badge-skill {
  background: var(--gray-100);
  color: var(--gray-700);
}

.card-footer {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid var(--gray-200);
}

.card-relevance {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border-radius: 6px;
  font-size: 12px;
  color: var(--gray-600);
}
```

---

### 5.4 Visual Hierarchy for Importance

**Search Result Ranking Indicators:**

1. **Relevance Score**
   - Display as percentage (e.g., "95% match")
   - Subtle, top-right corner
   - Optional (can be hidden)

2. **Visual Prominence**
   - Higher relevance = Larger card (subtle scale)
   - Gradient background for top 3 results

```css
/* Top 3 results - Subtle gradient */
.activity-card[data-rank="1"],
.activity-card[data-rank="2"],
.activity-card[data-rank="3"] {
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.03) 0%,
    transparent 100%
  );
  border-color: var(--primary-200);
}

/* Top result - Slightly larger */
.activity-card[data-rank="1"] {
  grid-column: span 2; /* Takes 2 columns on desktop */
}
```

3. **Metadata Hierarchy**

| Priority | Information | Size | Weight | Color |
|----------|-------------|------|--------|-------|
| 1 | Title | 20px | 600 | Gray-800 |
| 2 | Organization | 14px | 500 | Gray-600 |
| 3 | Location | 14px | 400 | Gray-600 |
| 4 | Time commitment | 14px | 400 | Gray-500 |
| 5 | Skills | 12px | 500 | Gray-600 |
| 6 | Category | 12px | 500 | Primary |

4. **Distance Indicator**
   - Prominent for location-based searches
   - "2km away" in green if very close (<5km)
   - Regular gray for further distances

```tsx
const DistanceIndicator: React.FC<{ distance: number }> = ({ distance }) => {
  const isClose = distance < 5;

  return (
    <span className={`metadata-item ${isClose ? 'text-success-600' : ''}`}>
      <MapPin className="w-4 h-4" />
      {distance}km away
    </span>
  );
};
```

---

### 5.5 Inspirational Mood Boards & Design References

**Reference Stack for Action Atlas:**

1. **Perplexity AI** (perplexity.ai)
   - Clean search interface
   - Minimal distractions
   - AI-first design

2. **Linear** (linear.app)
   - Command palette (⌘K)
   - Keyboard shortcuts
   - Fast, responsive

3. **Stripe Docs** (stripe.com/docs)
   - Sticky search bar
   - Clear hierarchy
   - Professional aesthetic

4. **Notion** (notion.so)
   - Quick find interface
   - Grouped results
   - Icon usage

5. **shadcn/ui** (ui.shadcn.com)
   - Component examples
   - Modern styling
   - Accessibility focus

**Color Inspiration:**

- **Primary (Indigo)**: Linear, Stripe, Tailwind UI
- **Accent (Amber)**: Notion (yellow), Product Hunt (orange)
- **Grays**: Vercel (warm), shadcn/ui (modern)

**Layout Inspiration:**

- **Grid**: Dribbble, Behance (visual-first)
- **List**: Linear, Notion (density)
- **Hybrid**: Action Atlas should use grid with list option

**Typography Inspiration:**

- **Inter**: Linear, Stripe, Tailwind UI (industry standard)
- **Sizing**: Notion (compact but readable)
- **Hierarchy**: Stripe Docs (clear levels)

---

## 6. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

**Deliverables:**
- ✅ Color palette CSS variables
- ✅ Typography system
- ✅ Spacing scale
- ✅ Border radius tokens
- ✅ Shadow system

**Files to Create:**
```
/styles/
  ├── tokens.css         # Design tokens
  ├── base.css           # Base styles
  └── utilities.css      # Utility classes
```

---

### Phase 2: Components (Week 3-4)

**Deliverables:**
- ✅ Search input component
- ✅ Activity card component
- ✅ Badge component
- ✅ Button component
- ✅ Icon component

**Files to Create:**
```
/components/ui/
  ├── search-input.tsx
  ├── activity-card.tsx
  ├── badge.tsx
  ├── button.tsx
  └── icon.tsx
```

---

### Phase 3: Interactions (Week 5-6)

**Deliverables:**
- ✅ Hover animations
- ✅ Loading states (skeleton screens)
- ✅ Focus states
- ✅ Toast notifications
- ✅ Smooth transitions

**Libraries to Install:**
```bash
pnpm add sonner              # Toast notifications
pnpm add @react-spring/web   # Animations
pnpm add framer-motion       # Page transitions
```

---

### Phase 4: Dark Mode (Week 7)

**Deliverables:**
- ✅ Dark mode color palette
- ✅ Theme toggle component
- ✅ System preference detection
- ✅ Persistent theme storage

---

### Phase 5: Polish (Week 8-9)

**Deliverables:**
- ✅ Accessibility audit (WCAG AA)
- ✅ Performance optimization
- ✅ Responsive design testing
- ✅ Design documentation

---

## 7. Key Takeaways for Action Atlas

### Design Principles:

1. **Community-First**
   - Warm, approachable colors (amber accent)
   - Human-centric spacing (not too dense)
   - Clear, friendly typography

2. **Trust & Transparency**
   - AI relevance scores visible
   - Clear data hierarchy
   - Professional aesthetic (indigo primary)

3. **Accessibility**
   - WCAG AA minimum, AAA target
   - Keyboard navigation
   - Screen reader friendly

4. **Performance**
   - Minimal animations (200ms max)
   - Skeleton screens, not spinners
   - Instant search feedback

### Design Don'ts:

- ❌ Don't use bright, garish colors (unprofessional)
- ❌ Don't overcrowd cards (respect white space)
- ❌ Don't use more than 2 CTAs per card
- ❌ Don't hide important info in hover states (mobile)
- ❌ Don't use complex animations (performance)

### Must-Haves:

- ✅ Prominent search bar (hero on homepage)
- ✅ Command palette (⌘K for power users)
- ✅ Keyboard navigation (accessibility)
- ✅ Dark mode (user preference)
- ✅ Skeleton loading (perceived performance)
- ✅ Clear CTAs (single primary action)
- ✅ Relevance scores (AI transparency)

---

## Appendix: Code Examples

### Complete Search Interface Example

```tsx
// /app/page.tsx - Homepage with Hero Search
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">
            Discover Meaningful Volunteering Activities
          </h1>
          <p className="hero-subtitle">
            AI-powered semantic search to find opportunities that match your interests, skills, and location
          </p>

          {/* Search Bar */}
          <SearchBar />

          {/* Popular Searches */}
          <div className="popular-searches">
            <span className="text-sm text-gray-600">Popular searches:</span>
            <div className="flex flex-wrap gap-2">
              <PopularSearchTag query="teach kids programming" />
              <PopularSearchTag query="environmental cleanup" />
              <PopularSearchTag query="help seniors with technology" />
            </div>
          </div>
        </div>
      </section>

      {/* Results (rendered after search) */}
      <section className="results">
        <div className="container">
          <SearchResults />
        </div>
      </section>
    </div>
  );
}
```

---

**Document Status**: Research Complete
**Last Updated**: 2026-01-07
**Version**: 1.0
**Next Steps**: Implement design system in `/styles/` and `/components/ui/`
