# Action Atlas Design Mood Board & Visual References

**Version**: 1.0
**Date**: 2026-01-07
**Purpose**: Visual inspiration and design direction for Action Atlas

---

## Table of Contents

1. [Brand Personality](#brand-personality)
2. [Color Inspiration](#color-inspiration)
3. [Typography Examples](#typography-examples)
4. [Component Inspiration](#component-inspiration)
5. [Layout References](#layout-references)
6. [Interaction Patterns](#interaction-patterns)
7. [Dark Mode Examples](#dark-mode-examples)
8. [Competing Products Analysis](#competing-products-analysis)

---

## 1. Brand Personality

### Action Atlas Brand Attributes

**Primary Attributes:**
- **Trustworthy**: Professional, reliable, secure (AI search needs trust)
- **Approachable**: Warm, friendly, human-centric (volunteering is personal)
- **Empowering**: Energetic, action-oriented, impactful (making a difference)
- **Intelligent**: Modern, AI-powered, efficient (semantic search)

**Visual Translation:**

| Attribute | Visual Expression | Examples |
|-----------|-------------------|----------|
| **Trustworthy** | Deep indigo, clean layouts, professional typography | Stripe, Linear |
| **Approachable** | Warm grays, generous spacing, rounded corners | Notion, Airbnb |
| **Empowering** | Amber accents, strong CTAs, bold headlines | Product Hunt, Kickstarter |
| **Intelligent** | Minimalist UI, smart interactions, subtle animations | Perplexity, Claude |

### Brand Voice in Design

**Do:**
- Use warm, inviting colors (amber accent)
- Show real people and impact (when using images)
- Keep UI clean and distraction-free
- Emphasize community and connection
- Make CTAs action-oriented ("Find Your Impact", not "Search")

**Don't:**
- Use cold, corporate aesthetics
- Overcomplicate with unnecessary features
- Hide important information in hover states
- Use aggressive, salesy language
- Make AI feel robotic or impersonal

---

## 2. Color Inspiration

### Primary Color: Indigo (#6366F1)

**Inspiration Sources:**

1. **Linear** (Product Management Tool)
   - Color: #5E6AD2 (similar indigo)
   - Usage: Primary brand, active states, CTAs
   - Why it works: Conveys intelligence and professionalism
   - Reference: https://linear.app

2. **Stripe** (Payment Platform)
   - Color: #635BFF (vibrant purple-indigo)
   - Usage: Links, buttons, interactive elements
   - Why it works: Trust and reliability for financial services
   - Reference: https://stripe.com

3. **Tailwind UI**
   - Color: #6366F1 (exact match to our primary)
   - Usage: Primary palette in documentation
   - Why it works: Modern, widely adopted, accessible
   - Reference: https://tailwindui.com

**Action Atlas Application:**
```
- Primary brand color
- Links and navigation
- Active filter states
- AI-related indicators
- Success confirmations (with emerald)
```

### Accent Color: Amber (#F59E0B)

**Inspiration Sources:**

1. **Product Hunt**
   - Color: #FF6154 (coral-orange)
   - Usage: Upvote buttons, featured badges
   - Why it works: Energy, action, community engagement
   - Reference: https://producthunt.com

2. **Notion** (Calendar Views)
   - Color: #FFA344 (warm orange)
   - Usage: Event highlights, reminders
   - Why it works: Warmth and approachability
   - Reference: https://notion.so

3. **Charity: Water**
   - Color: #FFD23F (bright yellow)
   - Usage: Donation CTAs, impact metrics
   - Why it works: Optimism, hope, action
   - Reference: https://charitywater.org

**Action Atlas Application:**
```
- Primary CTAs ("Apply Now", "View Details")
- Important badges (Featured, Urgent Need)
- Highlighted search results
- Call-to-action sections
```

### Success Color: Emerald (#10B981)

**Inspiration Sources:**

1. **Ecosia** (Search Engine)
   - Color: #52B848 (eco-green)
   - Usage: Tree planting counters, impact metrics
   - Why it works: Environmental impact, growth
   - Reference: https://ecosia.org

2. **Duolingo**
   - Color: #58CC02 (bright green)
   - Usage: Success states, completed lessons
   - Why it works: Achievement, progress, motivation
   - Reference: https://duolingo.com

**Action Atlas Application:**
```
- Successful application submissions
- "Close to you" distance indicators
- Community growth metrics
- Environmental activity categories
```

### Color Palette: Real-World Examples

**Example 1: Perplexity AI**
```
Background: Pure white (#FFFFFF)
Text: True black (#000000) with 90% opacity
Primary: Deep purple (#8E55EA)
Accent: Teal (#06B6D4) for citations
Why: Clean, AI-first, intelligent
```

**Example 2: Linear**
```
Background: Soft gray (#F7F8F8)
Text: Dark gray (#15171A)
Primary: Purple (#5E6AD2)
Accent: Gray-blue for secondary actions
Why: Professional, modern, fast
```

**Example 3: Charity: Water**
```
Background: Off-white (#F9F9F9)
Text: Dark gray (#333333)
Primary: Blue (#00ADEF)
Accent: Yellow (#FFD23F)
Why: Hopeful, impactful, warm
```

**Action Atlas (Our Approach):**
```
Background: Pure white (#FFFFFF) / Near-black (#0A0A0A)
Text: Warm gray-900 (#1C1917) / Gray-50 (#FAFAF9)
Primary: Indigo (#6366F1) - Trust + Intelligence
Accent: Amber (#F59E0B) - Energy + Action
Success: Emerald (#10B981) - Growth + Impact
```

---

## 3. Typography Examples

### Font Choice: Inter

**Why Inter?**

1. **Industry Adoption (2025-2026)**
   - Used by: Linear, Stripe, Notion, Vercel, Tailwind UI
   - Status: De facto standard for modern web apps
   - Benefits: Excellent readability, complete character set, variable font support

2. **Comparison to Alternatives**

| Font | Pros | Cons | Used By |
|------|------|------|---------|
| **Inter** | Readable, modern, free, variable | Very common (less unique) | Linear, Stripe, Notion |
| **Geist** | Modern, clean, optimized | Relatively new, less tested | Vercel, Supabase |
| **Public Sans** | Government-grade accessible | Less personality | Government sites, nonprofits |
| **System Fonts** | Fast, native | Inconsistent across platforms | Apple (SF Pro), Microsoft |

**Decision: Inter** (best balance of readability, adoption, and performance)

### Typography in Action

**Example 1: Linear's Type Scale**
```
Hero (48px, 700): "Move fast, ship quality"
Page Title (32px, 600): "Issues"
Section (20px, 600): "In Progress"
Body (14px, 400): Activity descriptions
Small (12px, 500): Metadata, timestamps
```
Why: Compact yet readable, clear hierarchy

**Example 2: Stripe Docs Type Scale**
```
Hero (60px, 700): "Documentation"
Page Title (40px, 600): "API Reference"
Section (24px, 600): "Authentication"
Body (16px, 400): Technical content
Code (14px, 400, mono): Code examples
```
Why: Generous sizing for technical readability

**Example 3: Notion's Type Scale**
```
Hero (40px, 700): Page titles
Section (24px, 600): Headings
Body (16px, 400): Content blocks
Small (14px, 400): Metadata
Tiny (12px, 500): Labels, tags
```
Why: Flexible, adaptable to content density

**Action Atlas Type Scale (Balanced Approach):**
```
Hero (36-48px, 700): Homepage hero, landing pages
Page Title (30px, 700): Search page, activity detail
Section (24px, 600): Category headers, filters
Card Title (20px, 600): Activity cards (scannable)
Body (16px, 400): Descriptions, content (readable)
Metadata (14px, 500): Location, time, skills
Labels (12px, 500): Badges, tags, small text
```

### Type Pairing Examples

**Perplexity AI:**
- Headings: Inter (bold)
- Body: Inter (regular)
- Code: Fira Code
- Why: Monolithic, consistent, simple

**Stripe:**
- Headings: Camphor (custom)
- Body: Inter
- Code: Source Code Pro
- Why: Unique brand, technical readability

**Action Atlas:**
- Everything: Inter Variable
- Code (if needed): Geist Mono Variable
- Why: Single variable font = performance + consistency

---

## 4. Component Inspiration

### 4.1 Search Bars

**Best Examples (2025-2026):**

1. **Perplexity AI**
   ```
   Style: Rounded rectangle, full-width
   Size: 56px height, 18px font
   Features: Auto-expanding textarea, suggestion dropdown
   Feel: Prominent, inviting, modern
   ```

2. **Linear Command Palette (⌘K)**
   ```
   Style: Modal overlay, centered
   Size: 600px wide, compact results
   Features: Keyboard navigation, grouped results, fuzzy search
   Feel: Fast, efficient, power-user friendly
   ```

3. **Notion Quick Find**
   ```
   Style: Modal with sections
   Size: 500px wide, icon + text results
   Features: Recent searches, categorized results, breadcrumbs
   Feel: Organized, visual, contextual
   ```

4. **Algolia DocSearch**
   ```
   Style: Dropdown below input
   Size: Matches input width
   Features: Syntax highlighting, keyboard shortcuts
   Feel: Technical, precise, fast
   ```

**Action Atlas Search Bar Design:**
```
Style: Prominent rounded input (homepage) + sticky bar (results)
Size: 48px height, 18px font (no iOS zoom)
Features:
  - Instant search (no submit button)
  - Clear button (X) when text present
  - Command palette (⌘K) for power users
  - Autocomplete suggestions
  - Recent searches
  - Loading indicator inside input
Feel: Approachable yet powerful, fast, intelligent
```

### 4.2 Result Cards

**Best Examples:**

1. **Dribbble Shots**
   ```
   Layout: Image-first, large thumbnail
   Spacing: Generous padding (24px)
   Hover: Lift + shadow increase
   Info: Creator, likes, views
   CTA: View button on hover
   ```

2. **Product Hunt Posts**
   ```
   Layout: Icon + text, horizontal
   Spacing: Compact (16px padding)
   Hover: Background change
   Info: Upvotes, comments, maker
   CTA: Upvote button always visible
   ```

3. **Airbnb Listings**
   ```
   Layout: Image carousel, metadata below
   Spacing: Comfortable (20px padding)
   Hover: Image scale
   Info: Location, price, rating
   CTA: Favorite icon (heart)
   ```

4. **Linear Issues**
   ```
   Layout: Text-only, minimal
   Spacing: Tight (12px padding)
   Hover: Background highlight
   Info: Status, assignee, priority
   CTA: Click anywhere to open
   ```

**Action Atlas Card Design (Hybrid Approach):**
```
Layout: Image (optional) + text, vertical
Spacing: Generous (24px padding)
Hover: Lift 2px + shadow + border color change
Info: Organization, location, time, skills, relevance score
CTA: "View Details" button (always visible)
Special: Top results get subtle gradient background
```

### 4.3 Filter Sidebars

**Best Examples:**

1. **Airbnb Filters**
   ```
   Style: Sticky sidebar, collapsible sections
   Controls: Checkboxes, range sliders, toggles
   Feedback: Live result count updates
   Mobile: Modal sheet from bottom
   ```

2. **Amazon Search Filters**
   ```
   Style: Left sidebar, expandable sections
   Controls: Checkboxes with counts, star ratings
   Feedback: Applied filters shown at top
   Mobile: Hidden, accessible via "Filters" button
   ```

3. **Notion Database Filters**
   ```
   Style: Inline, minimal
   Controls: Dropdowns, tag selection
   Feedback: Pills showing active filters
   Mobile: Same as desktop (responsive)
   ```

**Action Atlas Filters:**
```
Style: Sticky left sidebar (desktop), bottom sheet (mobile)
Controls:
  - Location: Autocomplete input + radius slider
  - Category: Checkboxes with icons
  - Skills: Multi-select tags
  - Time: Dropdown (Weekday/Weekend/Flexible)
  - Date: Calendar picker
Feedback:
  - Live result count
  - Active filters as pills (removable)
  - "Clear all" button
Mobile: Slide-up sheet with "Apply" button
```

---

## 5. Layout References

### 5.1 Homepage Layouts

**Example 1: Perplexity AI**
```
┌────────────────────────────────────┐
│       [Logo]     [Sign In]         │
├────────────────────────────────────┤
│                                    │
│     Discover anything              │  <- Large hero text
│                                    │
│  [  Search input (full-width)  ]   │  <- Prominent search
│                                    │
│  Recent • Trending • Popular       │  <- Quick links
│                                    │
└────────────────────────────────────┘
```
Why: Search is THE hero, minimal distractions

**Example 2: Airbnb**
```
┌────────────────────────────────────┐
│  [Logo]  [Nav]      [Profile]      │
├────────────────────────────────────┤
│                                    │
│  [Tabs: Stays | Experiences]       │
│  [Search bar with 3 fields]        │  <- Structured search
│                                    │
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │ Cat1 │ │ Cat2 │ │ Cat3 │       │  <- Category cards
│  └──────┘ └──────┘ └──────┘       │
│                                    │
│  Featured Listings (Grid)          │
└────────────────────────────────────┘
```
Why: Structured, organized, encourages exploration

**Example 3: Linear**
```
┌────────────────────────────────────┐
│  [Logo]  [Docs]  [Download]        │
├────────────────────────────────────┤
│                                    │
│  The issue tracking tool            │  <- Bold statement
│  you'll enjoy using                │
│                                    │
│  [Start Building]  [View Demo]     │  <- Strong CTAs
│                                    │
│  [Hero Image/Animation]            │
│                                    │
│  Features • Testimonials • Pricing │
└────────────────────────────────────┘
```
Why: Product-focused, conversion-oriented

**Action Atlas Homepage:**
```
┌─────────────────────────────────────────┐
│  [Logo]  [About]  [⌘K Search]  [Login] │
├─────────────────────────────────────────┤
│                                         │
│   Discover Meaningful Volunteering      │  <- Hero
│   Activities Near You                   │
│                                         │
│   AI-powered semantic search...         │  <- Subtext
│                                         │
│  [     Large Search Input            ]  │  <- Prominent
│                                         │
│  Popular: Teaching • Cleanup • Tech     │  <- Quick links
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  Featured Activities (Grid, 3 cols)     │  <- Showcase
│                                         │
│  ┌────────┐ ┌────────┐ ┌────────┐     │
│  │ Card 1 │ │ Card 2 │ │ Card 3 │     │
│  └────────┘ └────────┘ └────────┘     │
│                                         │
├─────────────────────────────────────────┤
│  How it Works • Impact Stats • Orgs    │  <- Trust building
└─────────────────────────────────────────┘
```

### 5.2 Search Results Layouts

**Example 1: Google Search**
```
┌─────────────────────────────────────┐
│  [Search] [Tools] [Settings]        │
├─────────────────────────────────────┤
│  Filters: All • Images • News       │
│                                     │
│  Result 1                           │
│  Result 2                           │
│  Result 3                           │  <- List view
│  ...                                │
│                                     │
│  [Pagination]                       │
└─────────────────────────────────────┘
```

**Example 2: Dribbble**
```
┌─────────────────────────────────────┐
│  [Search]  [Upload]  [Profile]      │
├─────────────────────────────────────┤
│  Filters: [All] [Animation] [UI]    │
│  Sort: [Popular] [Recent]           │
│                                     │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐          │
│  │ 1 │ │ 2 │ │ 3 │ │ 4 │          │  <- Grid view
│  └───┘ └───┘ └───┘ └───┘          │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐          │
│  │ 5 │ │ 6 │ │ 7 │ │ 8 │          │
│  └───┘ └───┘ └───┘ └───┘          │
│                                     │
│  [Load More]                        │
└─────────────────────────────────────┘
```

**Example 3: Airbnb**
```
┌─────────────────────────────────────┐
│  [Search bar - sticky]              │
├───────────┬─────────────────────────┤
│ Filters   │  ┌────┐ ┌────┐ ┌────┐  │
│           │  │  1 │ │  2 │ │  3 │  │  <- Sidebar + Grid
│ - Price   │  └────┘ └────┘ └────┘  │
│ - Beds    │  ┌────┐ ┌────┐ ┌────┐  │
│ - Type    │  │  4 │ │  5 │ │  6 │  │
│           │  └────┘ └────┘ └────┘  │
│ [Map]     │                         │
│           │  [Show more]            │
└───────────┴─────────────────────────┘
```

**Action Atlas Search Results:**
```
┌──────────────────────────────────────────┐
│  [Search bar - sticky]  [⌘K]  [Account] │
├───────────┬──────────────────────────────┤
│ Filters   │  Found 42 activities         │
│ (Sticky)  │  Sort: [Relevance ▼]         │
│           │                              │
│ Location  │  ┌────────┐ ┌────────┐       │
│ ◉ 10km    │  │ Act 1  │ │ Act 2  │       │
│ ○ 25km    │  │95% ✓   │ │89% ✓   │       │  <- Grid
│           │  └────────┘ └────────┘       │
│ Category  │  ┌────────┐ ┌────────┐       │
│ ☑ Teaching│  │ Act 3  │ │ Act 4  │       │
│ ☐ Cleanup │  └────────┘ └────────┘       │
│           │                              │
│ Skills    │  [Load more]                 │
│ [Design+] │                              │
│           │                              │
│ [Clear]   │                              │
└───────────┴──────────────────────────────┘
```

---

## 6. Interaction Patterns

### 6.1 Search Interactions

**Pattern 1: Instant Search (Perplexity, Algolia)**
```
User types → Debounce 300ms → API call → Results update
Benefits: Fast, no submit button, modern
Drawbacks: More API calls, requires good backend
Action Atlas: ✅ Use (backend optimized for speed)
```

**Pattern 2: Submit Button (Google, traditional)**
```
User types → User clicks Search → Results page loads
Benefits: Fewer API calls, clear user action
Drawbacks: Extra step, slower perceived performance
Action Atlas: ❌ Don't use (old pattern)
```

**Pattern 3: Autocomplete (Google, Amazon)**
```
User types → Dropdown appears → Select suggestion → Search
Benefits: Query refinement, fewer typos
Drawbacks: Can be distracting
Action Atlas: ✅ Use (helpful for discovery)
```

### 6.2 Filter Interactions

**Pattern 1: Live Filtering (Airbnb)**
```
User changes filter → Results update immediately
Benefits: Fast feedback, exploratory
Drawbacks: Many API calls
Action Atlas: ✅ Use (with debouncing)
```

**Pattern 2: Apply Button (Amazon mobile)**
```
User changes filters → Clicks Apply → Results update
Benefits: Fewer API calls, deliberate action
Drawbacks: Extra step, slower
Action Atlas: ✅ Use on mobile only
```

### 6.3 Card Interactions

**Pattern 1: Click Anywhere (Linear)**
```
Card is fully clickable → Opens detail view
Benefits: Fast, no specific target needed
Drawbacks: Harder to add multiple actions
Action Atlas: ✅ Use (with button for explicit CTA)
```

**Pattern 2: Hover Actions (Dribbble)**
```
Hover card → Actions appear → Click action
Benefits: Clean default state, progressive disclosure
Drawbacks: No hover on mobile
Action Atlas: ❌ Don't use (mobile-first)
```

### 6.4 Loading States

**Pattern 1: Skeleton Screens (LinkedIn, Facebook)**
```
Show structure while loading → Content replaces skeletons
Benefits: Perceived performance, structure visible
Drawbacks: More complex to implement
Action Atlas: ✅ Use (better UX)
```

**Pattern 2: Spinners (Traditional)**
```
Show spinner → Content appears
Benefits: Simple to implement
Drawbacks: Feels slower, no context
Action Atlas: ❌ Avoid (use for inline actions only)
```

---

## 7. Dark Mode Examples

### 7.1 Excellent Dark Modes

**Example 1: Linear**
```
Background: #0D0F12 (very dark gray, not black)
Surface: #17181C (cards, panels)
Text: #E5E6EB (off-white, not pure white)
Primary: #5E6AD2 (same indigo, works in dark)
Borders: #252729 (subtle)
Why: Balanced, professional, not harsh
```

**Example 2: GitHub**
```
Background: #0D1117 (dark blue-gray)
Surface: #161B22 (slightly lighter)
Text: #C9D1D9 (light gray)
Primary: #58A6FF (bright blue)
Code: Syntax highlighted (custom theme)
Why: Technical, readable, familiar
```

**Example 3: Notion**
```
Background: #191919 (true dark gray)
Surface: #2F2F2F (medium gray)
Text: #E3E2E0 (warm off-white)
Primary: #EB5757 (desaturated red)
Why: Warm, comfortable, less harsh
```

**Action Atlas Dark Mode:**
```
Background: #0A0A0A (near-black for OLED)
Surface: #171717 (cards)
Surface Hover: #262626
Text Primary: #FAFAFA (off-white)
Text Secondary: #A3A3A3 (medium gray)
Primary: #A5B4FC (lighter indigo)
Accent: #FBBF24 (lighter amber)
Borders: #262626 (very subtle)
Shadows: Darker, more opaque
```

### 7.2 Dark Mode Best Practices

**Do:**
- Use near-black (#0A0A0A), not pure black (unless OLED optimization)
- Reduce primary color saturation by 10-20%
- Increase text contrast (WCAG AAA)
- Make shadows darker and more opaque
- Dim images slightly (opacity: 0.9)

**Don't:**
- Invert colors directly (looks bad)
- Use pure white text (#FFFFFF too harsh)
- Keep same color saturation
- Use light mode shadows (too subtle)
- Ignore images (can be too bright)

---

## 8. Competing Products Analysis

### 8.1 VolunteerMatch (Main Competitor)

**Visual Analysis:**
```
Colors: Blue (#0066FF), Orange (#FF6600)
Typography: Arial (dated)
Layout: Sidebar + list (traditional)
Cards: Small images, dense information
Spacing: Tight (16px padding)
Overall: Dated, cluttered, functional but not modern
```

**Opportunities for Action Atlas:**
- Modern, spacious design
- Better search prominence
- Cleaner card designs
- Stronger visual hierarchy

### 8.2 Idealist.org

**Visual Analysis:**
```
Colors: Blue (#0077CC), Teal accents
Typography: Helvetica (safe but boring)
Layout: Three-column (busy)
Cards: Text-heavy, small thumbnails
Spacing: Moderate (20px)
Overall: Functional but uninspiring
```

**Opportunities:**
- Simplified layout (2-column max)
- Larger, more engaging cards
- Better use of imagery
- Modern color palette

### 8.3 Catchafire (Skills-Based Volunteering)

**Visual Analysis:**
```
Colors: Orange (#FF6F3D), Dark gray
Typography: Modern sans-serif
Layout: Clean, grid-based
Cards: Nice images, good spacing
Spacing: Good (24px)
Overall: Modern but generic SaaS aesthetic
```

**Opportunities:**
- Unique brand identity (not generic)
- Warmer, more human feel
- Better community emphasis
- Stronger AI/semantic search messaging

### 8.4 Action Atlas Differentiation

**Our Unique Visual Identity:**
```
1. AI-First Design
   - Prominent search everywhere
   - Relevance scores visible
   - Smart, not cluttered

2. Community-Warmth
   - Amber accents (energy, action)
   - Warm grays (approachable)
   - Human-centric spacing

3. Modern Sophistication
   - Indigo primary (trust, intelligence)
   - Clean, spacious layouts
   - Subtle, purposeful animations

4. Impact-Focused
   - Emerald success states
   - Clear visual hierarchy
   - Emphasis on results
```

---

## 9. Implementation Priority

### Phase 1: Core Identity (Week 1-2)
- [ ] Finalize color palette
- [ ] Set up design tokens
- [ ] Create typography scale
- [ ] Define spacing system

### Phase 2: Key Components (Week 3-4)
- [ ] Search input
- [ ] Activity card
- [ ] Button variants
- [ ] Badge styles

### Phase 3: Layouts (Week 5-6)
- [ ] Homepage hero
- [ ] Search results grid
- [ ] Filter sidebar
- [ ] Activity detail page

### Phase 4: Interactions (Week 7-8)
- [ ] Hover states
- [ ] Loading animations
- [ ] Transitions
- [ ] Focus indicators

### Phase 5: Polish (Week 9)
- [ ] Dark mode
- [ ] Accessibility audit
- [ ] Responsive refinements
- [ ] Performance optimization

---

## 10. Design Principles Recap

1. **Search-First**
   - Prominent search bar on all pages
   - Instant feedback
   - Smart autocomplete

2. **Community-Centric**
   - Warm colors
   - Human imagery
   - Impact focus

3. **Trust & Transparency**
   - Professional aesthetic
   - Clear information hierarchy
   - Visible relevance scores

4. **Accessible by Default**
   - WCAG AA minimum
   - Keyboard navigation
   - Screen reader support

5. **Performance-Conscious**
   - Fast interactions (<200ms)
   - Skeleton loading states
   - Optimized animations

---

## Resources & Tools

**Design Tools:**
- Figma: https://figma.com (design files)
- Coolors: https://coolors.co (color palette generation)
- Type Scale: https://typescale.com (typography calculator)
- Contrast Checker: https://webaim.org/resources/contrastchecker/

**Inspiration Sites:**
- Linear: https://linear.app
- Perplexity: https://perplexity.ai
- Stripe: https://stripe.com
- Notion: https://notion.so
- shadcn/ui: https://ui.shadcn.com

**Component Libraries:**
- Radix UI: https://radix-ui.com
- Headless UI: https://headlessui.com
- React Aria: https://react-spectrum.adobe.com/react-aria/

---

**Document Status**: Complete
**Last Updated**: 2026-01-07
**Version**: 1.0
**Next Review**: After initial implementation
