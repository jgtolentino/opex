# OpEx Landing Page - Implementation Guide

## Overview

This guide documents the production-grade landing page implementation for the OpEx Documentation Hub. The redesign transforms the default Docusaurus template into an enterprise-focused operational excellence platform.

## Architecture

### Component Structure

```
docs/src/
├── components/
│   ├── HomepageFeatures/     # Benefit pillars section
│   ├── QuickLinks/            # Quick access tile grid
│   └── AIAssistantPlaceholder/ # AI features preview
├── css/
│   └── custom.css             # Theme customization
└── pages/
    └── index.tsx              # Main landing page
```

---

## Components

### 1. Homepage Hero (`index.tsx`)

**Purpose:** Primary landing section with headline, value proposition, and CTAs

**Key Features:**
- Clear operational excellence messaging
- Dual CTA buttons (onboarding + search)
- Responsive layout with mobile optimization

**Customization Points:**
```tsx
// Update headline
<Heading as="h1">Your Headline Here</Heading>

// Update subtitle
<p className="hero__subtitle">Your value proposition</p>

// Modify CTAs
<Link to="/your-path">CTA Text</Link>
```

---

### 2. Benefit Pillars (`HomepageFeatures`)

**Purpose:** Highlight three core value propositions

**Current Pillars:**
1. 🧭 Standardized & Clear
2. ⚙️ Built for Scale
3. 🚀 Faster, Better Execution

**How to Modify:**

Edit `/docs/src/components/HomepageFeatures/index.tsx`:

```tsx
const FeatureList: FeatureItem[] = [
  {
    title: 'Your Pillar Title',
    icon: '🎯', // Any emoji
    description: (
      <>
        Your description here
      </>
    ),
  },
  // Add more pillars...
];
```

**Styling:**
- Icons: 4rem font-size (adjustable in `styles.module.css`)
- Layout: 3-column responsive grid (auto-stacks on mobile)
- Background: Uses `--ifm-background-surface-color`

---

### 3. Quick Links (`QuickLinks`)

**Purpose:** Navigational hub for key documentation sections

**Current Links:**
- 📄 SOP Library
- 🧩 Process Playbooks
- 🎓 Training & Certifications
- 🔧 Automation & AI Tools
- 💼 HR Forms & Policies
- 💰 Finance Processes & Approvals

**How to Add/Modify:**

Edit `/docs/src/components/QuickLinks/index.tsx`:

```tsx
const QuickLinkList: QuickLinkItem[] = [
  {
    title: 'Your Link Title',
    icon: '📋',
    to: '/docs/your-section',
  },
];
```

**Design Features:**
- Hover effect: Card lifts 4px with shadow
- Responsive: 3 columns desktop → 1 column mobile
- Links use Docusaurus `Link` component (client-side routing)

---

### 4. AI Assistant Placeholder (`AIAssistantPlaceholder`)

**Purpose:** Preview upcoming AI-powered search and assistant features

**Current State:** Feature preview with example questions

**How to Enable/Modify:**

**To hide completely:**
```tsx
// In /docs/src/pages/index.tsx, remove:
<AIAssistantPlaceholder />
```

**To update example questions:**

Edit `/docs/src/components/AIAssistantPlaceholder/index.tsx`:

```tsx
const exampleQuestions = [
  '"Your example question here"',
  '"Another example question"',
  '"One more example"',
];
```

**To activate live AI assistant:**
1. Replace component with actual search/chat interface
2. Connect to backend API
3. Update badge to "Live" or remove
4. Add feature flag toggle in config

---

## Theme Customization

### Brand Colors

The landing page uses a deep operational green color scheme.

**Primary Color:** `#0a7a3d`

**To Change:**

Edit `/docs/src/css/custom.css`:

```css
:root {
  --ifm-color-primary: #YOUR_COLOR;
  --ifm-color-primary-dark: /* darker variant */;
  --ifm-color-primary-darker: /* even darker */;
  /* etc. */
}
```

**Color Generator Tool:**
Use [Docusaurus Color Generator](https://docusaurus.io/docs/styling-layout#styling-your-site-with-infima) to generate full palette.

### Typography

Current settings:
- Base font size: `16px`
- Vertical spacing: `1.25rem`
- Hero title: Bold (700 weight)
- Hero subtitle: `1.25rem`

**To Modify:**

```css
:root {
  --ifm-font-size-base: 16px;
  --ifm-spacing-vertical: 1.25rem;
}

.hero__subtitle {
  font-size: 1.25rem;
  max-width: 700px;
}
```

---

## Footer Navigation

Updated footer structure matches enterprise OpEx needs:

**Sections:**
1. **Documentation:** SOP Library, HR Workflows, Finance Toolkit, Playbooks, Templates
2. **Resources:** Glossary, FAQ, Onboarding, Submission Request Form
3. **Systems:** Notion Workspace, AI Assistant, RPA Hub, Governance Console

**To Modify:**

Edit `/docs/docusaurus.config.ts`:

```ts
footer: {
  links: [
    {
      title: 'Your Section',
      items: [
        { label: 'Link Name', to: '/path' },
        { label: 'External', href: 'https://...' },
      ],
    },
  ],
}
```

---

## Responsive Design

All components are fully responsive:

### Breakpoints
- **Desktop:** 997px and up (3-column layouts)
- **Tablet:** 768px - 996px (2-column or stacked)
- **Mobile:** 767px and below (single column)

### Mobile Optimizations
- Hero CTAs stack vertically
- Quick Links reduce to 1-2 columns
- Font sizes adjust down
- Padding/margins compress

**Test Responsiveness:**
```bash
cd docs
npm start
# Open browser DevTools, toggle device toolbar
```

---

## Build & Deployment

### Local Development

```bash
cd docs
npm install
npm start
```

Site runs at `http://localhost:3000`

### Production Build

```bash
cd docs
npm run build
npm run serve
```

### Deploy to Vercel

1. Connect GitHub repo to Vercel
2. Set build settings:
   - **Framework:** Docusaurus
   - **Root Directory:** `docs`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
3. Deploy

---

## Maintenance Checklist

### Monthly
- [ ] Review analytics for popular quick links
- [ ] Check for broken links
- [ ] Update example AI questions based on common queries
- [ ] Review user feedback

### Quarterly
- [ ] Audit benefit pillars messaging
- [ ] Update CTAs based on onboarding data
- [ ] Review theme colors against brand guidelines
- [ ] Test all interactive elements

### Annually
- [ ] Comprehensive UX review
- [ ] A/B test CTA variations
- [ ] Survey users on clarity and usefulness
- [ ] Major visual refresh if needed

---

## Component API Reference

### QuickLinks

```tsx
type QuickLinkItem = {
  title: string;    // Display name
  icon: string;     // Emoji or icon
  to: string;       // Internal route (use Link)
  href?: string;    // External URL (use anchor)
}
```

### HomepageFeatures

```tsx
type FeatureItem = {
  title: string;        // Feature heading
  icon: string;         // Emoji icon
  description: ReactNode; // JSX content
}
```

### AIAssistantPlaceholder

No props. Fully self-contained component.

---

## Governance Integration

See `/docs/docs/knowledge-base/governance.md` for:
- Content update workflow
- Version control standards
- Roles and responsibilities
- Quality standards

---

## Troubleshooting

### Issue: CTAs not routing correctly

**Solution:** Ensure paths match `sidebars.ts` structure. Use `/docs/section/page` format.

### Issue: Colors not updating

**Solution:**
1. Clear browser cache
2. Restart dev server (`npm start`)
3. Check both `:root` and `[data-theme='dark']` in CSS

### Issue: Components not rendering

**Solution:**
1. Check import paths use `@site/src/...` alias
2. Verify component exports are default exports
3. Check browser console for errors

---

## Future Enhancements

Planned features:
- [ ] Live AI-powered search integration
- [ ] Personalized quick links based on role
- [ ] Interactive onboarding wizard
- [ ] Usage analytics dashboard
- [ ] Dark mode toggle (currently auto)

---

## Support

For technical questions:
- **GitHub Issues:** [Link to repo issues]
- **Slack:** #opex-documentation
- **Email:** opex-tech@organization.com

For content updates:
- See [Governance Guide](/docs/knowledge-base/governance)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-15 | Initial production-grade landing page |

---

**Status:** ✅ Ready for build
