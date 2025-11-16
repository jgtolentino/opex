# Visual Design Guidelines for Skills.md Files

**Version**: 1.0
**Date**: November 16, 2025
**Purpose**: Guidelines for writing skills.md files that incorporate visual and design components with proper Figma integration

---

## Table of Contents

1. [Introduction](#introduction)
2. [When to Include Visual/Design Components](#when-to-include-visualdesign-components)
3. [Figma Integration Best Practices](#figma-integration-best-practices)
4. [Skills.md Structure for Visual Components](#skillsmd-structure-for-visual-components)
5. [Design Token Specifications](#design-token-specifications)
6. [Component Documentation Patterns](#component-documentation-patterns)
7. [Example Skills with Visual Components](#example-skills-with-visual-components)
8. [Figma File Organization](#figma-file-organization)
9. [Handoff to Developers](#handoff-to-developers)
10. [Quality Checklist](#quality-checklist)

---

## 1. Introduction

This guide provides comprehensive instructions for creating `skills.md` files that incorporate visual and design components, ensuring seamless integration between design (Figma) and development (code implementation).

### Purpose

When BPM agent skills need to:
- Generate or modify user interfaces
- Create dashboard layouts
- Design forms or data entry screens
- Build data visualization components
- Produce branded marketing materials

...they must reference proper design systems, Figma specifications, and design tokens.

### Key Principles

1. **Design System First**: Always reference established design systems (SAP Fiori, Material, custom)
2. **Figma as Source of Truth**: Figma designs should be authoritative for visual specifications
3. **Token-Based Theming**: Use design tokens for colors, spacing, typography
4. **Accessibility by Default**: WCAG 2.2 compliance is non-negotiable
5. **Developer-Friendly**: Provide clear handoff documentation

---

## 2. When to Include Visual/Design Components

### Include Visual Components When:

✅ **UI Generation Tasks**
- Creating dashboard interfaces
- Building form layouts
- Designing data tables
- Producing charts and visualizations

✅ **Brand/Marketing Tasks**
- Generating marketing collateral
- Creating presentation templates
- Designing email templates
- Building landing pages

✅ **Document Templates**
- Invoice layouts
- Report templates
- Certificate designs
- Branded documents

✅ **Design System Work**
- Creating component libraries
- Building style guides
- Documenting patterns

### Skip Visual Components When:

❌ **Pure Data/Logic Tasks**
- Backend API development
- Database queries
- Process automation (no UI)
- Data analysis (text output only)

❌ **Text-Only Outputs**
- Writing documentation
- Generating code comments
- Creating text reports

---

## 3. Figma Integration Best Practices

### 3.1 Figma File Structure

Every visual skill should reference a Figma file with this structure:

```
📁 [Skill Name] - Design System
├── 📄 Cover (Overview + Instructions)
├── 🎨 Design Tokens
│   ├── Colors
│   ├── Typography
│   ├── Spacing
│   ├── Shadows
│   └── Border Radius
├── 🧩 Components
│   ├── Buttons
│   ├── Inputs
│   ├── Cards
│   ├── Tables
│   └── [Other Components]
├── 📐 Layouts
│   ├── Dashboard Layout
│   ├── Form Layout
│   ├── List Layout
│   └── Detail Layout
├── 📱 Templates
│   ├── Example 1
│   ├── Example 2
│   └── Example 3
└── 📋 Developer Handoff
    ├── Spacing Specs
    ├── Component States
    └── Responsive Breakpoints
```

### 3.2 Linking to Figma

**In skills.md, always provide**:

```markdown
## Visual Design Resources

### Figma File
- **URL**: [Link to Figma file]
- **Access**: View-only (request edit access from Design Lead)
- **Last Updated**: YYYY-MM-DD
- **Version**: X.Y.Z

### Design System Reference
- **Base System**: SAP Fiori for Web / Material Design / Custom
- **UI Kit Version**: X.Y.Z
- **Documentation**: [Link to design system docs]
```

### 3.3 Figma Component Naming Convention

Follow this naming pattern for consistency:

```
[Category]/[Component]/[Variant]/[State]

Examples:
- Button/Primary/Default
- Button/Primary/Hover
- Button/Primary/Disabled
- Input/Text/Default
- Input/Text/Focused
- Input/Text/Error
- Card/Dashboard/KPI
- Card/Dashboard/Chart
```

### 3.4 Using Figma Inspect Mode

**Always document these in skills.md**:

```markdown
## Component Specifications (from Figma Inspect)

### Primary Button
- **Dimensions**: 120px × 40px (min-width: 88px)
- **Background**: `--color-primary-500` (#0854A0)
- **Text Color**: `--color-neutral-white` (#FFFFFF)
- **Font**: Inter SemiBold, 14px, Line height 20px
- **Border Radius**: `--radius-md` (6px)
- **Padding**: 10px 24px
- **Spacing**: Gap 8px (icon + text)

**States**:
- Hover: Background `--color-primary-600` (#064A8C)
- Active: Background `--color-primary-700` (#053F73)
- Disabled: Background `--color-neutral-300`, Opacity 0.4
- Focus: 2px outline `--color-focus-ring` (#0854A0), offset 2px
```

---

## 4. Design Token Specifications

### 4.1 Why Design Tokens?

Design tokens enable:
- **Consistency**: Same values across design and code
- **Theming**: Easy theme switching (light/dark, brand variants)
- **Maintainability**: Change once, update everywhere
- **Handoff**: Clear communication between designers and developers

### 4.2 Token Categories

#### Color Tokens

```markdown
## Color Tokens

### Brand Colors
- `--color-primary-500`: #0854A0 (Main brand color)
- `--color-primary-600`: #064A8C (Hover state)
- `--color-primary-700`: #053F73 (Active state)
- `--color-primary-100`: #E3F2FD (Background tint)

### Semantic Colors
- `--color-success`: #2E7D32 (Success states, confirmations)
- `--color-error`: #C62828 (Errors, destructive actions)
- `--color-warning`: #F57C00 (Warnings, caution)
- `--color-info`: #0277BD (Informational messages)

### Neutral Colors
- `--color-neutral-900`: #212121 (Primary text)
- `--color-neutral-700`: #616161 (Secondary text)
- `--color-neutral-500`: #9E9E9E (Disabled text)
- `--color-neutral-300`: #E0E0E0 (Borders)
- `--color-neutral-100`: #F5F5F5 (Backgrounds)
- `--color-neutral-white`: #FFFFFF

### Background Colors
- `--color-bg-primary`: var(--color-neutral-white)
- `--color-bg-secondary`: var(--color-neutral-100)
- `--color-bg-elevated`: var(--color-neutral-white) + shadow

### Text Colors
- `--color-text-primary`: var(--color-neutral-900)
- `--color-text-secondary`: var(--color-neutral-700)
- `--color-text-disabled`: var(--color-neutral-500)
- `--color-text-inverse`: var(--color-neutral-white)
```

#### Typography Tokens

```markdown
## Typography Tokens

### Font Families
- `--font-family-base`: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
- `--font-family-heading`: 'Inter', sans-serif
- `--font-family-mono`: 'Roboto Mono', 'Courier New', monospace

### Font Sizes
- `--font-size-xs`: 12px (0.75rem)
- `--font-size-sm`: 14px (0.875rem)
- `--font-size-base`: 16px (1rem) — Body text default
- `--font-size-lg`: 18px (1.125rem)
- `--font-size-xl`: 20px (1.25rem)
- `--font-size-2xl`: 24px (1.5rem)
- `--font-size-3xl`: 30px (1.875rem)
- `--font-size-4xl`: 36px (2.25rem)

### Font Weights
- `--font-weight-normal`: 400
- `--font-weight-medium`: 500
- `--font-weight-semibold`: 600
- `--font-weight-bold`: 700

### Line Heights
- `--line-height-tight`: 1.25
- `--line-height-normal`: 1.5
- `--line-height-relaxed`: 1.75

### Text Styles (Combined Tokens)
- **Heading 1**: `--font-size-4xl` / `--font-weight-bold` / `--line-height-tight`
- **Heading 2**: `--font-size-3xl` / `--font-weight-bold` / `--line-height-tight`
- **Heading 3**: `--font-size-2xl` / `--font-weight-semibold` / `--line-height-normal`
- **Body**: `--font-size-base` / `--font-weight-normal` / `--line-height-normal`
- **Caption**: `--font-size-sm` / `--font-weight-normal` / `--line-height-normal`
- **Label**: `--font-size-sm` / `--font-weight-medium` / `--line-height-tight`
```

#### Spacing Tokens

```markdown
## Spacing Tokens

### Spacing Scale (rem-based for accessibility)
- `--spacing-0`: 0
- `--spacing-1`: 0.25rem (4px)
- `--spacing-2`: 0.5rem (8px)
- `--spacing-3`: 0.75rem (12px)
- `--spacing-4`: 1rem (16px) — Base unit
- `--spacing-5`: 1.25rem (20px)
- `--spacing-6`: 1.5rem (24px)
- `--spacing-8`: 2rem (32px)
- `--spacing-10`: 2.5rem (40px)
- `--spacing-12`: 3rem (48px)
- `--spacing-16`: 4rem (64px)

### Semantic Spacing
- `--spacing-component-padding`: var(--spacing-4)
- `--spacing-section-gap`: var(--spacing-8)
- `--spacing-page-margin`: var(--spacing-6)
- `--spacing-input-padding-x`: var(--spacing-3)
- `--spacing-input-padding-y`: var(--spacing-2)
```

#### Shadow Tokens

```markdown
## Shadow Tokens

### Elevation Levels
- `--shadow-none`: none
- `--shadow-sm`: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
- `--shadow-md`: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
- `--shadow-lg`: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)
- `--shadow-xl`: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)

### Semantic Shadows
- `--shadow-card`: var(--shadow-md)
- `--shadow-dropdown`: var(--shadow-lg)
- `--shadow-modal`: var(--shadow-xl)
- `--shadow-focus-ring`: 0 0 0 3px rgba(8, 84, 160, 0.2)
```

#### Border Radius Tokens

```markdown
## Border Radius Tokens

- `--radius-none`: 0
- `--radius-sm`: 4px
- `--radius-md`: 6px — Standard for buttons, inputs
- `--radius-lg`: 8px — Cards, containers
- `--radius-xl`: 12px — Large cards
- `--radius-full`: 9999px — Pills, circular avatars
```

### 4.3 Figma to Code Token Mapping

**In Figma** (using Figma Variables):
- Create variable collections for Colors, Typography, Spacing
- Name variables exactly as token names (e.g., `color/primary/500`)
- Use semantic naming for component properties

**In Code** (CSS Custom Properties):
```css
:root {
  /* Map Figma variables 1:1 */
  --color-primary-500: #0854A0;
  --spacing-4: 1rem;
  --font-size-base: 16px;
}
```

**In skills.md**:
```markdown
## Design Token Implementation

All design tokens are defined in:
- **Figma**: [Link to token library]
- **Code**: `/styles/tokens.css` or `/styles/design-tokens.json`

**Sync Process**:
1. Designer updates tokens in Figma
2. Export tokens as JSON using [Figma Tokens plugin]
3. Import to codebase: `npm run sync-tokens`
4. Rebuild CSS: `npm run build:tokens`
```

---

## 5. Component Documentation Patterns

### 5.1 Component Specification Template

Use this template for every visual component in skills.md:

```markdown
## [Component Name]

### Overview
Brief description of component purpose and usage.

### Figma Reference
- **Component**: [Link to Figma component]
- **Variants**: [List of variants]
- **States**: Default, Hover, Active, Focus, Disabled, Error (as applicable)

### Visual Specifications

#### Default State
- **Dimensions**: [Width] × [Height] (min/max if applicable)
- **Background**: `[token-name]` ([hex value])
- **Text Color**: `[token-name]` ([hex value])
- **Typography**:
  - Font: `[token-name]` ([font family, weight])
  - Size: `[token-name]` ([px/rem value])
  - Line Height: `[token-name]` ([value])
- **Spacing**:
  - Padding: `[token-name]` ([value])
  - Margin: `[token-name]` ([value])
  - Gap (if applicable): `[token-name]` ([value])
- **Border**:
  - Width: [value]
  - Color: `[token-name]` ([hex])
  - Radius: `[token-name]` ([value])
- **Shadow**: `[token-name]` ([value])

#### Interactive States

**Hover**:
- Background: `[token-name]` ([hex])
- Cursor: pointer
- Transition: all 200ms ease

**Active/Pressed**:
- Background: `[token-name]` ([hex])
- Transform: scale(0.98) (optional)

**Focus** (keyboard navigation):
- Outline: 2px solid `[token-name]`
- Outline Offset: 2px
- Box Shadow: `--shadow-focus-ring`

**Disabled**:
- Background: `[token-name]`
- Opacity: 0.4
- Cursor: not-allowed

**Error** (if applicable):
- Border Color: `--color-error`
- Text Color: `--color-error`
- Icon: Error icon in `--color-error`

### Accessibility

- **ARIA Role**: [role]
- **ARIA Labels**: [required labels]
- **Keyboard Navigation**:
  - Tab: Focus
  - Enter/Space: Activate
  - [Other interactions]
- **Screen Reader**: "[Spoken text example]"
- **Color Contrast**: [ratio] (WCAG [level])
- **Touch Target**: Minimum 44×44px (WCAG 2.2)

### Usage Guidelines

**When to use**:
- [Scenario 1]
- [Scenario 2]

**When NOT to use**:
- [Anti-pattern 1]
- [Anti-pattern 2]

### Code Example

```tsx
// React/TypeScript example
import { Button } from '@/components/ui/button'

<Button
  variant="primary"
  size="medium"
  disabled={false}
  onClick={handleClick}
  aria-label="Submit form"
>
  Submit
</Button>
```

```html
<!-- HTML example -->
<button
  class="btn btn-primary btn-md"
  type="button"
  aria-label="Submit form"
>
  Submit
</button>
```

```css
/* CSS implementation */
.btn-primary {
  background-color: var(--color-primary-500);
  color: var(--color-neutral-white);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  padding: var(--spacing-2) var(--spacing-6);
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: background-color 200ms ease;
}

.btn-primary:hover {
  background-color: var(--color-primary-600);
}

.btn-primary:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
  box-shadow: var(--shadow-focus-ring);
}

.btn-primary:disabled {
  background-color: var(--color-neutral-300);
  cursor: not-allowed;
  opacity: 0.4;
}
```

### Responsive Behavior

- **Desktop** (≥1024px): [Specifications]
- **Tablet** (768px - 1023px): [Specifications]
- **Mobile** (<768px): [Specifications]

### Design Notes

- [Important design considerations]
- [Brand alignment notes]
- [Implementation gotchas]
```

### 5.2 Layout Documentation Template

```markdown
## [Layout Name] Layout

### Overview
Description of layout purpose and typical use cases.

### Figma Reference
- **Template**: [Link to Figma frame]
- **Auto-layout**: Yes/No
- **Responsive**: Yes/No

### Layout Structure

```
┌─────────────────────────────────────┐
│           Header (64px)             │
├─────────────────────────────────────┤
│  Sidebar │      Main Content        │
│  (240px) │                          │
│          │                          │
│          │                          │
├─────────────────────────────────────┤
│           Footer (80px)             │
└─────────────────────────────────────┘
```

### Grid System
- **Columns**: 12-column grid
- **Gutter**: `--spacing-6` (24px)
- **Margin**: `--spacing-8` (32px on desktop, `--spacing-4` on mobile)
- **Max Width**: 1280px (centered)

### Component Hierarchy
1. **Header**
   - Height: 64px
   - Background: `--color-bg-primary`
   - Shadow: `--shadow-sm`
   - Content: Logo, Navigation, User Menu

2. **Sidebar** (optional, collapsible)
   - Width: 240px (desktop), collapsed to 64px or hidden on mobile
   - Background: `--color-bg-secondary`
   - Navigation items with icons and labels

3. **Main Content**
   - Padding: `--spacing-6`
   - Background: `--color-bg-primary`
   - Min-height: calc(100vh - 144px) [viewport minus header/footer]

4. **Footer**
   - Height: 80px
   - Background: `--color-neutral-900`
   - Color: `--color-neutral-white`

### Responsive Breakpoints

```css
/* Mobile First */
/* Mobile: default (320px - 767px) */
/* Tablet: 768px */
@media (min-width: 768px) { /* Tablet styles */ }

/* Desktop: 1024px */
@media (min-width: 1024px) { /* Desktop styles */ }

/* Large Desktop: 1280px */
@media (min-width: 1280px) { /* Large desktop styles */ }
```

### Spacing Rules
- **Between sections**: `--spacing-8` (32px)
- **Between components**: `--spacing-6` (24px)
- **Between related items**: `--spacing-4` (16px)
- **Between labels and inputs**: `--spacing-2` (8px)

### Code Example

```tsx
<div className="layout-dashboard">
  <Header />
  <div className="layout-content">
    <Sidebar />
    <main className="main-content">
      {children}
    </main>
  </div>
  <Footer />
</div>
```
```

---

## 6. Skills.md Structure for Visual Components

### 6.1 Complete Template

```markdown
# [Skill Name] - Agent Skill

## Role
[Agent role description]

## Visual Design Capabilities
This agent can generate/modify/design visual components following [Design System Name] guidelines.

---

## Design Resources

### Figma Files
- **Main Design System**: [URL]
  - Last Updated: YYYY-MM-DD
  - Version: X.Y.Z
  - Access: View-only

- **Component Library**: [URL]
- **Templates**: [URL]

### Design System Reference
- **Base System**: SAP Fiori for Web / Material Design / Custom
- **Documentation**: [URL]
- **UI Kit Version**: X.Y.Z

### Design Tokens
- **File Location**: `/styles/tokens.css` or `/styles/design-tokens.json`
- **Figma Variables**: [Link to variable collection]
- **Sync Method**: [Tool/process name]

---

## Core Responsibilities

### Visual Design Tasks
1. [Task 1 - e.g., "Design dashboard layouts"]
2. [Task 2 - e.g., "Create form interfaces"]
3. [Task 3 - e.g., "Generate data visualizations"]

### Design Deliverables
- Component specifications with design tokens
- Responsive layout guidelines
- Accessibility annotations
- Developer handoff documentation
- Code examples (HTML/CSS/React)

---

## Design System Standards

### Design Principles
1. **[Principle 1]**: [Description]
2. **[Principle 2]**: [Description]
3. **[Principle 3]**: [Description]

### Visual Language
- **Typography**: [System font stack, scales]
- **Color Palette**: [Primary, secondary, semantic colors]
- **Spacing System**: [Spacing scale, grid system]
- **Elevation**: [Shadow system]
- **Motion**: [Animation principles, durations]

---

## Design Tokens

[Include all token categories from section 4.2]

---

## Components

[Include component specifications from section 5.1 for each component]

---

## Layouts

[Include layout documentation from section 5.2 for each layout]

---

## Accessibility Standards

### Compliance Level
- **Target**: WCAG 2.2 Level AA (minimum)
- **Testing**: [Tool/method]
- **Validation**: [Process]

### Requirements
- **Color Contrast**: Minimum 4.5:1 for text, 3:1 for large text
- **Focus Indicators**: Visible 2px outline on all interactive elements
- **Keyboard Navigation**: Full keyboard accessibility (Tab, Enter, Space, Arrows)
- **Screen Reader**: Proper ARIA labels, roles, and live regions
- **Touch Targets**: Minimum 44×44px for all interactive elements
- **Text Scaling**: Support up to 200% zoom without loss of functionality

### Testing Checklist
- [ ] Color contrast verified (use WebAIM Contrast Checker)
- [ ] Keyboard navigation tested
- [ ] Screen reader tested (NVDA/JAWS on Windows, VoiceOver on macOS/iOS)
- [ ] Mobile touch targets verified (minimum 44×44px)
- [ ] Focus indicators visible
- [ ] Form validation accessible
- [ ] Error messages screen-reader friendly

---

## Responsive Design

### Breakpoints
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px - 1279px
- **Large Desktop**: 1280px+

### Design Approach
- **Strategy**: Mobile-first
- **Density Modes**:
  - Compact (desktop, mouse/keyboard)
  - Cozy (touch devices, larger targets)

### Responsive Patterns
1. **Stacking**: Components stack vertically on mobile
2. **Collapsible Navigation**: Hamburger menu on mobile
3. **Flexible Grids**: 12-column grid adapts to screen size
4. **Scalable Typography**: Fluid type scale using clamp()
5. **Adaptive Images**: Responsive images with srcset

---

## Developer Handoff

### Design-to-Code Process
1. **Design Review**: Designer presents Figma file
2. **Token Extraction**: Export design tokens to JSON
3. **Component Build**: Developer implements using tokens
4. **Review**: Designer validates implementation
5. **QA**: Accessibility and responsive testing

### Deliverables
- [ ] Figma file with developer mode enabled
- [ ] Design tokens exported (JSON/CSS)
- [ ] Component specifications documented
- [ ] Responsive behavior defined
- [ ] Accessibility annotations included
- [ ] Interactive state definitions
- [ ] Code examples provided

### Tools
- **Design**: Figma
- **Tokens**: Figma Tokens plugin / Style Dictionary
- **Handoff**: Figma Inspect / Zeplin (optional)
- **Testing**: Chromatic (visual regression) / Storybook

---

## Usage Examples

### Example 1: [Use Case Name]

**Context**: [Describe scenario]

**Visual Requirements**:
- [Requirement 1]
- [Requirement 2]

**Figma Reference**: [Link]

**Implementation**:
```tsx
[Code example]
```

**Result**: [Description of outcome]

---

### Example 2: [Use Case Name]

[Repeat structure]

---

## Quality Standards

### Design Quality
- [ ] Follows design system guidelines
- [ ] Uses design tokens (no hard-coded values)
- [ ] Accessible (WCAG 2.2 AA)
- [ ] Responsive across breakpoints
- [ ] Consistent with brand guidelines

### Code Quality
- [ ] Semantic HTML
- [ ] BEM/CSS Modules for styling
- [ ] Proper ARIA attributes
- [ ] TypeScript types (if applicable)
- [ ] Unit tests for components
- [ ] Visual regression tests

---

## Maintenance

### Version Control
- **Design**: Figma version history
- **Code**: Git branches + semantic versioning
- **Tokens**: Automated sync on design updates

### Update Process
1. Designer updates Figma components
2. Export new tokens
3. Run sync script: `npm run sync-tokens`
4. Review changes in PR
5. Update documentation
6. Deploy new version

---

## References

- [Design System Name] Documentation: [URL]
- Figma Community File: [URL]
- GitHub Repository: [URL]
- Accessibility Guidelines: [URL]

---

## Support

- **Design Lead**: [Name, contact]
- **Development Lead**: [Name, contact]
- **Slack Channel**: #design-system
- **Issue Tracker**: [URL]
```

---

## 7. Example Skills with Visual Components

### 7.1 Example: BPM Dashboard Designer

```markdown
# BPM Dashboard Designer - Agent Skill

## Role
Design and generate executive dashboards for Finance SSC operations, following SAP Fiori design principles.

---

## Design Resources

### Figma Files
- **Main Design System**: https://figma.com/file/xxx/finance-ssc-design-system
  - Last Updated: 2025-11-15
  - Version: 2.1.0
  - Access: View-only (request edit from jake@agency.gov.ph)

- **Dashboard Templates**: https://figma.com/file/yyy/dashboard-templates

### Design System Reference
- **Base System**: SAP Fiori for Web
- **Documentation**: https://experience.sap.com/fiori-design-web/
- **UI Kit Version**: 6.0

### Design Tokens
- **File Location**: `/styles/fiori-tokens.css`
- **Figma Variables**: SAP Fiori Design Tokens collection
- **Sync Method**: Figma Tokens plugin → Style Dictionary

---

## Core Responsibilities

### Visual Design Tasks
1. Design KPI dashboard layouts
2. Create data visualization components (charts, tables)
3. Generate responsive card-based interfaces
4. Build analytical list pages
5. Design drill-down detail views

### Design Deliverables
- Dashboard wireframes with annotations
- Component specifications using SAP Fiori tokens
- Responsive behavior definitions
- Accessibility compliance documentation
- React component code (using UI5 Web Components)

---

## Design System Standards

### Design Principles (SAP Fiori)
1. **Role-Based**: Show only relevant KPIs per user role
2. **Adaptive**: Responsive across desktop, tablet, mobile
3. **Simple**: Focus on essential metrics, avoid clutter
4. **Coherent**: Consistent patterns across all dashboards
5. **Delightful**: Smooth interactions, meaningful animations

### Visual Language
- **Typography**:
  - Font Family: `--sapFontFamily` (72 font, fallback to system sans-serif)
  - Heading 1: 36px / Bold / 1.2 line-height
  - Heading 2: 24px / SemiBold / 1.3 line-height
  - Body: 16px / Regular / 1.5 line-height

- **Color Palette**:
  - Primary: `--sapBrand_HighlightColor` (#0854A0)
  - Success: `--sapPositiveColor` (#2E7D32)
  - Warning: `--sapCriticalColor` (#F57C00)
  - Error: `--sapNegativeColor` (#C62828)

- **Spacing**: SAP Fiori spacing scale (0.5rem base unit)
- **Elevation**: `--sapContent_Shadow0` through `--sapContent_Shadow3`

---

## Components

### KPI Card

#### Overview
Displays a single key performance indicator with trend indicator and comparison value.

#### Figma Reference
- **Component**: https://figma.com/file/xxx#kpi-card-component
- **Variants**: Default, Positive Trend, Negative Trend, Neutral
- **States**: Default, Hover, Selected

#### Visual Specifications

**Default State**:
- **Dimensions**: 280px × 160px (min-width: 240px, flexible height)
- **Background**: `--sapTile_Background` (#FFFFFF)
- **Border**: 1px solid `--sapTile_BorderColor` (#E0E0E0)
- **Border Radius**: `--sapElement_BorderCornerRadius` (6px)
- **Shadow**: `--sapContent_Shadow1`
- **Padding**: `--sapContent_Padding` (16px)

**Typography**:
- KPI Label: 14px / Medium / `--sapTile_TitleTextColor` / 20px line-height
- KPI Value: 36px / Bold / `--sapTile_TextColor` / 40px line-height
- Trend: 14px / SemiBold / varies by trend / 20px line-height
- Comparison: 12px / Regular / `--sapContent_LabelColor` / 16px line-height

**Spacing**:
- Label to Value: 8px
- Value to Trend: 12px
- Trend to Comparison: 4px

**Interactive States**:
- **Hover**:
  - Background: `--sapTile_Hover_Background`
  - Shadow: `--sapContent_Shadow2`
  - Cursor: pointer

- **Selected**:
  - Border: 2px solid `--sapTile_Active_BorderColor`
  - Background: `--sapTile_Active_Background`

#### Accessibility
- **ARIA Role**: `region`
- **ARIA Label**: "[KPI Label]: [Value] [Trend]"
- **Keyboard**: Tab to focus, Enter to select/expand
- **Screen Reader**: "Revenue KPI. Value: 2.5 million pesos. Up 12 percent from last month."
- **Color Contrast**: 4.8:1 (AA compliant)
- **Touch Target**: Full card is tappable (280×160px > 44×44px ✓)

#### Usage Guidelines

**When to use**:
- Display critical business metrics
- Show trend information
- Enable quick comparison to targets/previous periods

**When NOT to use**:
- For detailed data tables (use Table component)
- For complex multi-dimensional analysis (use Chart component)

#### Code Example

```tsx
import { Card } from '@ui5/webcomponents-react'

<Card
  className="kpi-card"
  onClick={handleKPIClick}
  aria-label={`${label}: ${value} ${trend > 0 ? 'up' : 'down'} ${Math.abs(trend)}%`}
>
  <div className="kpi-label">{label}</div>
  <div className="kpi-value">{formatNumber(value)}</div>
  <div className={`kpi-trend ${trend > 0 ? 'positive' : 'negative'}`}>
    <Icon name={trend > 0 ? 'arrow-up' : 'arrow-down'} />
    {Math.abs(trend)}%
  </div>
  <div className="kpi-comparison">vs. {comparisonLabel}</div>
</Card>
```

```css
.kpi-card {
  background: var(--sapTile_Background);
  border: 1px solid var(--sapTile_BorderColor);
  border-radius: var(--sapElement_BorderCornerRadius);
  box-shadow: var(--sapContent_Shadow1);
  padding: var(--sapContent_Padding);
  cursor: pointer;
  transition: all 200ms ease;
}

.kpi-card:hover {
  background: var(--sapTile_Hover_Background);
  box-shadow: var(--sapContent_Shadow2);
}

.kpi-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--sapTile_TitleTextColor);
  margin-bottom: 8px;
}

.kpi-value {
  font-size: 36px;
  font-weight: 700;
  color: var(--sapTile_TextColor);
  margin-bottom: 12px;
}

.kpi-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.kpi-trend.positive {
  color: var(--sapPositiveColor);
}

.kpi-trend.negative {
  color: var(--sapNegativeColor);
}

.kpi-comparison {
  font-size: 12px;
  color: var(--sapContent_LabelColor);
}
```

---

### Dashboard Layout

#### Overview
Executive dashboard layout with header, KPI grid, and chart section.

#### Figma Reference
- **Template**: https://figma.com/file/xxx#executive-dashboard

#### Layout Structure

```
┌─────────────────────────────────────────────────────┐
│  Header: Dashboard Title + Date Range Filter       │  64px
├─────────────────────────────────────────────────────┤
│  KPI Grid (4 columns × 2 rows)                     │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐      │
│  │  KPI 1 │ │  KPI 2 │ │  KPI 3 │ │  KPI 4 │      │
│  └────────┘ └────────┘ └────────┘ └────────┘      │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐      │
│  │  KPI 5 │ │  KPI 6 │ │  KPI 7 │ │  KPI 8 │      │
│  └────────┘ └────────┘ └────────┘ └────────┘      │
├─────────────────────────────────────────────────────┤
│  Charts Section                                     │
│  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │  Revenue Trend      │  │  Expense Breakdown  │  │
│  │  (Line Chart)       │  │  (Donut Chart)      │  │
│  └─────────────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

#### Grid System
- **Container**: Max-width 1280px, centered
- **KPI Grid**: 4 columns on desktop, 2 on tablet, 1 on mobile
- **Gap**: 24px (--spacing-6)
- **Padding**: 32px (--spacing-8) on desktop, 16px on mobile

#### Responsive Breakpoints

- **Desktop (≥1024px)**: 4-column KPI grid, 2-column charts
- **Tablet (768px - 1023px)**: 2-column KPI grid, 1-column charts
- **Mobile (<768px)**: 1-column KPI grid, 1-column charts, stacked layout

---

## Usage Examples

### Example 1: Monthly Finance Dashboard

**Context**: COO requests monthly executive dashboard showing agency performance

**Visual Requirements**:
- 8 KPI cards (Revenue, Expenses, Budget Variance, BIR Compliance, etc.)
- Revenue trend chart (last 6 months)
- Expense breakdown by category (donut chart)
- Responsive layout
- Accessible to screen readers

**Figma Reference**: https://figma.com/file/xxx#monthly-finance-dashboard

**Implementation**:
```tsx
import { Dashboard, KPICard, LineChart, DonutChart } from '@/components/dashboards'

export function MonthlyFinanceDashboard() {
  return (
    <Dashboard title="Monthly Finance Overview" dateRange="November 2025">
      <KPIGrid>
        <KPICard
          label="Total Revenue"
          value={2500000}
          trend={12}
          comparison="vs. October"
        />
        <KPICard
          label="Total Expenses"
          value={1800000}
          trend={-5}
          comparison="vs. October"
        />
        {/* ... 6 more KPI cards */}
      </KPIGrid>

      <ChartsSection>
        <LineChart
          title="Revenue Trend"
          data={revenueData}
          xAxis="month"
          yAxis="revenue"
        />
        <DonutChart
          title="Expense Breakdown"
          data={expenseData}
          labelKey="category"
          valueKey="amount"
        />
      </ChartsSection>
    </Dashboard>
  )
}
```

**Result**: Fully accessible, responsive dashboard following SAP Fiori guidelines.

---

## Quality Standards

### Design Quality
- [x] Follows SAP Fiori design principles
- [x] Uses SAP design tokens (no hard-coded values)
- [x] WCAG 2.2 AA compliant
- [x] Responsive across all breakpoints
- [x] Consistent with agency brand

### Code Quality
- [x] Uses UI5 Web Components
- [x] Proper ARIA attributes
- [x] TypeScript with strict types
- [x] Unit tests with Jest
- [x] Visual regression tests with Chromatic

---

## Support

- **Design Lead**: Jake Tolentino (jake@agency.gov.ph)
- **Slack Channel**: #design-system
- **Issue Tracker**: https://github.com/agency/opex/issues
```

---

## 8. Figma File Organization

### 8.1 File Structure Best Practices

**Naming Convention**:
```
[Project] - [Purpose] - [Version]

Examples:
- Finance SSC - Design System - v2.1
- BPM Dashboard - Templates - v1.3
- BIR Forms - Components - v1.0
```

**Page Organization**:
1. **📘 Cover** - Overview, team, changelog
2. **🎨 Design Tokens** - Colors, typography, spacing, etc.
3. **🧩 Components** - All reusable components
4. **📐 Layouts** - Page templates and layouts
5. **📱 Screens** - Full screen designs
6. **📋 Specs** - Developer handoff annotations
7. **🗂️ Archive** - Old versions

### 8.2 Component Organization

**Component Structure**:
```
Components Page
├── Buttons
│   ├── Primary
│   │   ├── Default
│   │   ├── Hover
│   │   ├── Active
│   │   ├── Focus
│   │   └── Disabled
│   ├── Secondary
│   └── Tertiary
├── Inputs
│   ├── Text Input
│   ├── Number Input
│   ├── Date Picker
│   └── Dropdown
└── Cards
    ├── KPI Card
    ├── Info Card
    └── Action Card
```

### 8.3 Using Figma Features Effectively

**Auto Layout** (Flexbox-like):
- ✅ Use for responsive components
- ✅ Set proper padding and gaps
- ✅ Configure grow/shrink behaviors

**Variants**:
- ✅ Create variants for states (hover, focus, disabled)
- ✅ Use properties for sizes (small, medium, large)
- ✅ Combine variant properties wisely

**Variables (Design Tokens)**:
- ✅ Create variable collections for themes
- ✅ Use semantic naming (e.g., `color/primary/500`)
- ✅ Reference variables in component properties

**Styles**:
- ✅ Create text styles for typography
- ✅ Create color styles for palette
- ✅ Create effect styles for shadows

**Component Properties**:
- ✅ Expose key properties (text, icon, state)
- ✅ Use boolean properties for show/hide
- ✅ Use instance swap for icon variations

### 8.4 Developer Handoff Checklist

In Figma, before handoff:
- [ ] Enable Dev Mode
- [ ] Add spacing annotations
- [ ] Document responsive behavior
- [ ] Specify breakpoints
- [ ] Add ARIA labels in descriptions
- [ ] Export assets (icons, illustrations)
- [ ] Document interactive states
- [ ] Link to design token files
- [ ] Add code snippets in comments

---

## 9. Handoff to Developers

### 9.1 Documentation Requirements

**In skills.md, include**:

```markdown
## Developer Handoff Documentation

### Figma Access
- **File**: [URL with ?node-id=xxx to specific frame]
- **Dev Mode**: Enabled ✓
- **Permissions**: View-only (request edit access if needed)

### Assets
- **Icons**: Exported as SVG to `/public/icons/`
- **Illustrations**: Exported as SVG to `/public/illustrations/`
- **Images**: Optimized WebP/AVIF in `/public/images/`

### Design Tokens
- **Source**: Figma Variables → JSON export
- **Location**: `/styles/design-tokens.json`
- **CSS Output**: `/styles/tokens.css` (generated via Style Dictionary)
- **Sync Command**: `npm run sync-tokens`

### Component Implementation Priority
1. **Phase 1** (Week 1-2): Buttons, Inputs, Cards
2. **Phase 2** (Week 3-4): Tables, Forms, Modals
3. **Phase 3** (Week 5-6): Charts, Dashboards, Complex Layouts

### Implementation Notes

#### Button Component
- Use `<button>` element (not `<div>` with click handler)
- Include disabled state styling
- Add focus-visible styles for keyboard nav
- Ensure minimum 44×44px touch target on mobile

#### KPI Card Component
- Use semantic HTML (`<article>` or `<section>`)
- Add ARIA label with full context
- Make entire card clickable (not just icon)
- Include loading state for async data

### Code Examples Provided
- React/TypeScript: ✓
- Vue: ○ (on request)
- HTML/CSS: ✓
- Tailwind CSS: ○ (on request)

### Testing Requirements
- [ ] Unit tests for all components
- [ ] Visual regression tests (Chromatic)
- [ ] Accessibility tests (axe-core, Lighthouse)
- [ ] Responsive tests (Cypress viewport testing)
- [ ] Keyboard navigation tests
- [ ] Screen reader tests (manual)

### Review Process
1. Developer implements component
2. Designer reviews in Storybook
3. Accessibility audit (automated + manual)
4. Responsive testing across devices
5. Approval and merge to main
```

### 9.2 Design QA Checklist

After implementation, designer should verify:

**Visual Accuracy**:
- [ ] Colors match design tokens exactly
- [ ] Typography matches specifications
- [ ] Spacing matches design (use browser inspector)
- [ ] Borders, shadows, radius match
- [ ] Hover states work correctly
- [ ] Interactive states (focus, active, disabled) match design

**Responsive Behavior**:
- [ ] Breakpoints match specifications
- [ ] Components adapt correctly at each breakpoint
- [ ] No horizontal scrolling on mobile
- [ ] Touch targets meet 44×44px minimum on mobile
- [ ] Text remains readable at all sizes

**Accessibility**:
- [ ] Color contrast meets WCAG 2.2 AA
- [ ] Focus indicators visible on all interactive elements
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] ARIA attributes present and correct
- [ ] Form errors are accessible

**Performance**:
- [ ] No layout shift (CLS score good)
- [ ] Images optimized and lazy-loaded
- [ ] Animations smooth (60fps)
- [ ] No unnecessary re-renders

---

## 10. Quality Checklist

### 10.1 Design Quality Checklist

Before marking a visual skill as complete:

**Figma File**:
- [ ] File properly named and organized
- [ ] Pages structured logically (Cover, Tokens, Components, etc.)
- [ ] Components use auto-layout
- [ ] Variants created for all states
- [ ] Variables (design tokens) defined
- [ ] Text and color styles created
- [ ] Dev Mode enabled
- [ ] Spacing annotations added
- [ ] Responsive behavior documented

**Design Tokens**:
- [ ] All tokens defined in Figma Variables
- [ ] Semantic naming used (not arbitrary names)
- [ ] Exported to JSON
- [ ] Synced to codebase
- [ ] CSS generated successfully

**Components**:
- [ ] All states documented (default, hover, focus, active, disabled, error)
- [ ] Dimensions specified
- [ ] Spacing specified using tokens
- [ ] Typography specified using tokens
- [ ] Colors specified using tokens
- [ ] Shadows/elevation specified using tokens
- [ ] Interactive behavior documented
- [ ] Accessibility attributes specified

**Accessibility**:
- [ ] Color contrast checked (WCAG 2.2 AA: 4.5:1 for text, 3:1 for large text)
- [ ] Touch targets minimum 44×44px on mobile
- [ ] Focus indicators visible (2px outline, offset 2px)
- [ ] ARIA roles specified
- [ ] ARIA labels documented
- [ ] Keyboard navigation defined
- [ ] Screen reader behavior documented

**Responsive Design**:
- [ ] Breakpoints defined and documented
- [ ] Mobile layout designed
- [ ] Tablet layout designed
- [ ] Desktop layout designed
- [ ] Responsive behavior annotated
- [ ] Mobile-first approach used

### 10.2 Documentation Quality Checklist

**skills.md File**:
- [ ] Role and responsibilities clearly defined
- [ ] Figma links included and accessible
- [ ] Design system reference specified
- [ ] Design tokens fully documented
- [ ] All components documented with template
- [ ] Layouts documented with diagrams
- [ ] Accessibility standards specified
- [ ] Responsive breakpoints defined
- [ ] Code examples provided
- [ ] Usage guidelines included
- [ ] Developer handoff section complete
- [ ] Quality standards checklist included

**Code Examples**:
- [ ] React/TypeScript example provided
- [ ] HTML/CSS example provided
- [ ] Examples use design tokens (not hard-coded values)
- [ ] Examples include accessibility attributes
- [ ] Examples are copy-paste ready
- [ ] Examples follow best practices

### 10.3 Implementation Quality Checklist

**Code**:
- [ ] Semantic HTML used
- [ ] Accessibility attributes included (ARIA)
- [ ] Design tokens used (no hard-coded values)
- [ ] Responsive styles implemented
- [ ] All interactive states implemented
- [ ] TypeScript types defined
- [ ] Component props documented
- [ ] Unit tests written
- [ ] Visual regression tests added

**Testing**:
- [ ] Manual testing in Chrome, Firefox, Safari
- [ ] Mobile testing on iOS and Android
- [ ] Keyboard navigation tested
- [ ] Screen reader tested (VoiceOver, NVDA, JAWS)
- [ ] Automated accessibility tests pass (axe)
- [ ] Lighthouse accessibility score 100
- [ ] Visual regression tests pass

---

## Conclusion

Following these guidelines ensures that:

1. **Designers** create consistent, accessible, well-documented visual components in Figma
2. **AI Agents** (skills.md) have clear specifications to generate or modify UI components
3. **Developers** receive complete, unambiguous handoff documentation
4. **End Users** experience accessible, responsive, high-quality interfaces

### Key Takeaways

✅ **Always use design tokens** - Never hard-code values
✅ **Figma is source of truth** - Keep it up to date
✅ **Accessibility is non-negotiable** - WCAG 2.2 AA minimum
✅ **Document everything** - Your future self will thank you
✅ **Test thoroughly** - Design QA is as important as code QA
✅ **Iterate and improve** - Design systems evolve over time

### Resources

- **SAP Fiori Design Guidelines**: https://experience.sap.com/fiori-design-web/
- **WCAG 2.2 Guidelines**: https://www.w3.org/WAI/WCAG22/quickref/
- **Figma Best Practices**: https://www.figma.com/best-practices/
- **Style Dictionary**: https://amzn.github.io/style-dictionary/
- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/

---

**Document Version**: 1.0
**Last Updated**: November 16, 2025
**Maintainer**: OpEx Design Team
**Questions**: #design-system on Slack
