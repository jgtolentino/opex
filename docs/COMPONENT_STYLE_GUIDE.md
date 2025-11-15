# OpEx Landing Page - Component Style Guide

## Design System Overview

This style guide documents the visual design system, component specifications, and usage guidelines for the OpEx Documentation Hub landing page.

---

## 🎨 Color Palette

### Primary Colors

| Color | Hex | Usage | Preview |
|-------|-----|-------|---------|
| Primary | `#0a7a3d` | CTAs, links, active states | ![#0a7a3d](https://via.placeholder.com/50x30/0a7a3d/0a7a3d) |
| Primary Dark | `#096d36` | Hover states | ![#096d36](https://via.placeholder.com/50x30/096d36/096d36) |
| Primary Darker | `#086733` | Active/pressed states | ![#086733](https://via.placeholder.com/50x30/086733/086733) |
| Primary Darkest | `#07542a` | Accents | ![#07542a](https://via.placeholder.com/50x30/07542a/07542a) |
| Primary Light | `#0b8744` | Light backgrounds | ![#0b8744](https://via.placeholder.com/50x30/0b8744/0b8744) |
| Primary Lighter | `#0c8d47` | Subtle highlights | ![#0c8d47](https://via.placeholder.com/50x30/0c8d47/0c8d47) |
| Primary Lightest | `#0ea350` | Minimal accents | ![#0ea350](https://via.placeholder.com/50x30/0ea350/0ea350) |

### Dark Mode Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Primary (Dark) | `#0ea350` | Adjusted for dark backgrounds |
| Primary Dark | `#0d9248` | Dark mode hover |
| Primary Darker | `#0c8a44` | Dark mode active |

### Neutral Colors

| Color | Variable | Light Mode | Dark Mode |
|-------|----------|------------|-----------|
| Background Surface | `--ifm-background-surface-color` | `#f8f9fa` | `#1b1b1d` |
| Card Background | `--ifm-card-background-color` | `#ffffff` | `#242526` |
| Text Emphasis | `--ifm-color-emphasis-700` | Dark gray | Light gray |

---

## 📐 Typography

### Font Stack
- **Body:** System font stack (via Infima default)
- **Monospace:** Code blocks use monospace stack

### Type Scale

| Element | Size | Weight | Line Height | Usage |
|---------|------|--------|-------------|-------|
| H1 (Hero Title) | 2.5rem | 700 | 1.2 | Main headline |
| H2 (Section Title) | 2rem | 600 | 1.3 | Section headers |
| H3 (Card Title) | 1.25rem | 600 | 1.4 | Feature/card titles |
| Body Large | 1.25rem | 400 | 1.6 | Hero subtitle |
| Body | 1rem (16px) | 400 | 1.6 | Body text |
| Small | 0.875rem | 400 | 1.5 | Labels, captions |

### CSS Variables

```css
--ifm-font-size-base: 16px;
--ifm-spacing-vertical: 1.25rem;
--ifm-code-font-size: 95%;
```

---

## 🧱 Component Specifications

### Hero Section

**Component:** `HomepageHeader` in `/docs/src/pages/index.tsx`

**Anatomy:**
```
┌─────────────────────────────────────────┐
│                                         │
│            [H1 Hero Title]              │
│          [Subtitle/Tagline]             │
│                                         │
│    [Primary CTA]  [Secondary CTA]       │
│                                         │
└─────────────────────────────────────────┘
```

**Specifications:**
- **Background:** Primary color (`hero--primary`)
- **Padding:** 4rem vertical (desktop), 2rem (mobile)
- **Text Alignment:** Center
- **Title Max Width:** Auto (full container)
- **Subtitle Max Width:** 700px

**Button Specs:**
- **Primary:** `button--primary button--lg`
- **Secondary:** `button--secondary button--lg`
- **Gap:** 1rem horizontal
- **Mobile:** Stack vertically, max-width 400px

**CSS Classes:**
```css
.heroBanner
.hero__title
.hero__subtitle
.buttons
```

---

### Benefit Pillars (Features)

**Component:** `HomepageFeatures` in `/docs/src/components/HomepageFeatures/`

**Anatomy:**
```
┌───────────┬───────────┬───────────┐
│   Icon    │   Icon    │   Icon    │
│   Title   │   Title   │   Title   │
│   Text    │   Text    │   Text    │
└───────────┴───────────┴───────────┘
```

**Specifications:**
- **Layout:** 3-column grid (col--4)
- **Icon Size:** 4rem
- **Icon Margin:** 1rem bottom
- **Padding Horizontal:** Medium (`padding-horiz--md`)
- **Text Alignment:** Center
- **Background:** `--ifm-background-surface-color`

**Icon Guidelines:**
- Use high-contrast emojis
- Consistent visual weight across set
- Avoid overly detailed emojis

**Recommended Icons:**
- Navigation/Process: 🧭 📍 🗺️
- Automation/Tech: ⚙️ 🔧 🤖 ⚡
- Performance: 🚀 📈 💡 ⏱️
- Organization: 🗂️ 📋 🏢 📊

---

### Quick Links Grid

**Component:** `QuickLinks` in `/docs/src/components/QuickLinks/`

**Anatomy:**
```
┌──────────────────────────────────────┐
│         [Section Title H2]           │
│          [Subtitle Text]             │
│                                      │
│  ┌─────┐  ┌─────┐  ┌─────┐          │
│  │ 📄  │  │ 🧩  │  │ 🎓  │          │
│  │Title│  │Title│  │Title│          │
│  └─────┘  └─────┘  └─────┘          │
│  ┌─────┐  ┌─────┐  ┌─────┐          │
│  │ 🔧  │  │ 💼  │  │ 💰  │          │
│  │Title│  │Title│  │Title│          │
│  └─────┘  └─────┘  └─────┘          │
└──────────────────────────────────────┘
```

**Card Specifications:**
- **Layout:** 3-column grid (col--4)
- **Padding:** 2rem vertical, 1rem horizontal
- **Border Radius:** 8px
- **Border:** 1px solid `--ifm-color-emphasis-300`
- **Background:** `--ifm-card-background-color`
- **Transition:** all 0.2s ease-in-out

**Hover State:**
- **Transform:** translateY(-4px)
- **Shadow:** 0 8px 16px rgba(0,0,0,0.1)
- **Border Color:** `--ifm-color-primary`

**Icon Specifications:**
- **Size:** 3rem
- **Margin:** 1rem bottom
- **Display:** Flex center

**Title Specifications:**
- **Font Weight:** 600
- **Font Size:** 1rem
- **Alignment:** Center

**Responsive Behavior:**
- **Desktop (997px+):** 3 columns
- **Tablet (768-996px):** 2 columns
- **Mobile (<768px):** 1 column

---

### AI Assistant Placeholder

**Component:** `AIAssistantPlaceholder` in `/docs/src/components/AIAssistantPlaceholder/`

**Anatomy:**
```
┌──────────────────────────────────────┐
│         [Coming Soon Badge]          │
│       [AI Assistant Title H2]        │
│     [Description Paragraph]          │
│                                      │
│  💬 "Example question 1"             │
│  💬 "Example question 2"             │
│  💬 "Example question 3"             │
└──────────────────────────────────────┘
```

**Specifications:**
- **Padding:** 3rem vertical
- **Background:** Linear gradient (primary-lightest → primary-lighter)
- **Max Width:** 800px (centered)
- **Text Alignment:** Center

**Badge Specifications:**
- **Display:** Inline-block
- **Padding:** 0.4rem 1rem
- **Background:** `--ifm-color-primary`
- **Color:** White
- **Border Radius:** 20px
- **Font Weight:** 600
- **Font Size:** 0.875rem
- **Text Transform:** Uppercase
- **Letter Spacing:** 0.5px

**Question Card Specifications:**
- **Display:** Flex (aligned left)
- **Gap:** 1rem
- **Padding:** 1rem 1.5rem
- **Background:** rgba(255,255,255,0.9)
- **Border Radius:** 8px
- **Shadow:** 0 2px 8px rgba(0,0,0,0.1)
- **Font Style:** Italic

**Question Icon:**
- **Size:** 1.5rem
- **Flex Shrink:** 0

---

## 📱 Responsive Guidelines

### Breakpoints

```css
/* Mobile */
@media screen and (max-width: 767px) {
  /* Single column layouts */
  /* Reduced padding/margins */
  /* Larger touch targets */
}

/* Tablet */
@media screen and (min-width: 768px) and (max-width: 996px) {
  /* 2-column layouts where applicable */
  /* Medium spacing */
}

/* Desktop */
@media screen and (min-width: 997px) {
  /* 3-column layouts */
  /* Full spacing */
}
```

### Mobile Optimizations

**Hero Section:**
- CTAs stack vertically
- Max width 400px per button
- Padding reduced to 2rem

**Feature Pillars:**
- Single column stack
- Maintain icon size
- Reduce horizontal padding

**Quick Links:**
- Single column
- Maintain card padding
- Full width cards

**AI Assistant:**
- Reduce container padding to 1rem
- Reduce question card padding
- Maintain readability

---

## 🎯 Spacing System

### Spacing Scale

| Name | Value | Usage |
|------|-------|-------|
| xs | 0.25rem | Tight spacing |
| sm | 0.5rem | Small gaps |
| md | 1rem | Default gaps |
| lg | 1.5rem | Section spacing |
| xl | 2rem | Large sections |
| 2xl | 3rem | Major sections |
| 3xl | 4rem | Hero sections |

### Section Padding

- **Hero:** 4rem vertical (desktop), 2rem (mobile)
- **Features:** 2rem vertical
- **Quick Links:** 3rem vertical
- **AI Assistant:** 3rem vertical (desktop), 2rem (mobile)

---

## 🖱️ Interactive States

### Button States

**Primary Button:**
- **Default:** Primary color background, white text
- **Hover:** Primary-dark background
- **Active:** Primary-darker background
- **Focus:** Outline ring

**Secondary Button:**
- **Default:** Transparent background, primary border
- **Hover:** Light primary background
- **Active:** Primary-light background
- **Focus:** Outline ring

### Card/Link States

**Quick Link Cards:**
- **Default:** White background, subtle border
- **Hover:** Lift 4px, shadow, primary border
- **Active:** Primary-lightest background
- **Focus:** Outline ring

---

## ♿ Accessibility

### Color Contrast

All text meets WCAG AA standards:
- **Normal Text:** Minimum 4.5:1 contrast ratio
- **Large Text:** Minimum 3:1 contrast ratio
- **Interactive Elements:** Minimum 3:1 against adjacent colors

### Focus Indicators

All interactive elements have visible focus states:
- Outline ring using `--ifm-color-primary`
- Minimum 2px outline width
- Sufficient offset from element

### Semantic HTML

- Proper heading hierarchy (H1 → H2 → H3)
- Semantic section elements
- ARIA labels where appropriate
- Alt text for decorative emojis (role="img")

### Keyboard Navigation

- All CTAs are keyboard accessible
- Tab order follows visual flow
- Enter/Space activates links and buttons

---

## 📦 Component Reusability

### Creating New Quick Links

```tsx
// Add to QuickLinkList array
{
  title: 'Your New Section',
  icon: '📌',
  to: '/docs/your-section',
}
```

### Creating New Feature Pillars

```tsx
// Add to FeatureList array
{
  title: 'Your Feature',
  icon: '⭐',
  description: (
    <>
      Your description here
    </>
  ),
}
```

### Modifying AI Questions

```tsx
// Update exampleQuestions array
const exampleQuestions = [
  '"Your new question here"',
  // ...more questions
];
```

---

## 🎨 Design Tokens Reference

### CSS Custom Properties

```css
/* Colors */
--ifm-color-primary: #0a7a3d;
--ifm-color-primary-dark: #096d36;
--ifm-color-primary-darker: #086733;
--ifm-color-primary-darkest: #07542a;

/* Typography */
--ifm-font-size-base: 16px;
--ifm-spacing-vertical: 1.25rem;
--ifm-code-font-size: 95%;

/* Surfaces */
--ifm-background-surface-color: #f8f9fa;
--ifm-card-background-color: #ffffff;

/* Effects */
--docusaurus-highlighted-code-line-bg: rgba(0, 0, 0, 0.1);
```

---

## 🚀 Performance Guidelines

### Image Optimization
- Use SVG for icons when possible
- Lazy load below-the-fold images
- Provide appropriate alt text

### Animation Performance
- Use `transform` and `opacity` for animations
- Avoid animating `width`, `height`, `top`, `left`
- Keep transitions under 300ms

### Code Splitting
- Components are automatically code-split by Docusaurus
- Lazy load heavy components if needed

---

## 📋 Quality Checklist

Before deploying new components:

- [ ] Meets color contrast requirements (WCAG AA)
- [ ] Responsive on all breakpoints (mobile, tablet, desktop)
- [ ] Keyboard accessible
- [ ] Focus indicators visible
- [ ] Dark mode support
- [ ] Hover states defined
- [ ] Loading states handled (if applicable)
- [ ] Error states handled (if applicable)
- [ ] Semantic HTML used
- [ ] Performance optimized (no layout shifts)

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-15 | Initial style guide for production landing page |

---

## 📞 Support

For design questions or component usage:
- **Documentation:** `/docs/LANDING_PAGE_GUIDE.md`
- **Slack:** #opex-documentation
- **Email:** opex-design@organization.com
