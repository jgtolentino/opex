# Tasks — Design-to-Code Playground

## Core Engine
- [ ] Define intermediate representation for layout, typography, and components.
- [ ] Implement Figma node parser → intermediate representation.
- [ ] Implement DOM/CSS parser → intermediate representation.
- [ ] Implement mapping layer from IR → React (TSX) and HTML.

## Playground UI
- [ ] Scaffold Next.js or Vite app for the Playground.
- [ ] Implement tri-panel layout (Code, Preview, Reference).
- [ ] Add framework and UI library selection controls.
- [ ] Wire code editor to live preview.

## Figma Integration
- [ ] Build Figma plugin for "Send to Playground".
- [ ] Handle frame/component selection and link generation.
- [ ] Document Figma permissions and auth.

## URL Integration
- [ ] Build API/utility for fetching DOM + CSS.
- [ ] Normalize styles and inline them for mapping.
- [ ] Surface IP/legal notice in the UI before processing.

## UI Library Adapters
- [ ] Implement ShadCN + Tailwind adapter.
- [ ] Implement MUI adapter with theme generator.
- [ ] Implement AntD adapter with default theme.

## Tooling & DX
- [ ] Create VS Code extension with commands and Webview.
- [ ] Add Claude Code hook definitions for design-to-code flows.
- [ ] Set up linters, formatters, and CI for examples.

## Compliance & Quality

### Unit & Integration Tests
- [ ] Add unit/integration tests for parsers and generators.
- [ ] Create reference suite of Figma files and public URLs.

### Visual Regression Testing (ADR-002)

#### Infrastructure Setup
- [ ] Set up jest-puppeteer for screenshot capture
  - [ ] Install dependencies: `jest`, `puppeteer`, `jest-puppeteer`
  - [ ] Configure viewports: mobile (375px), tablet (768px), desktop (1440px)
  - [ ] Configure themes: light, dark
- [ ] Set up blazediff or pixelmatch for image comparison
  - [ ] Install and configure diff tolerance thresholds (1-2% for anti-aliasing)
  - [ ] Implement similarity percentage calculation
- [ ] Set up Supabase Storage for baseline storage
  - [ ] Create bucket: `design-to-code-baselines`
  - [ ] Implement baseline upload/download utilities
  - [ ] Organize by: `{benchmark}/{viewport}/{theme}/{framework}/{ui-library}.png`
- [ ] Set up GitHub Actions CI workflows
  - [ ] Create `.github/workflows/update-visual-baselines.yml` (runs on push to main)
  - [ ] Create `.github/workflows/visual-regression-pr.yml` (runs on PR)
  - [ ] Configure artifact uploads for diff images

#### Gradual.com Benchmark Implementation
- [ ] Capture baseline screenshots from original gradual.com
  - [ ] Hero section (mobile/tablet/desktop × light/dark = 6 baselines)
  - [ ] FeatureCard grid (6 baselines)
  - [ ] PricingTier tables (6 baselines)
  - [ ] Navigation header (6 baselines)
  - [ ] Footer (6 baselines)
  - [ ] Full page (6 baselines)
  - [ ] Total: 36 baseline screenshots
- [ ] Upload baselines to Supabase Storage
- [ ] Create test spec: `tests/visual-regression/benchmarks/gradual.spec.ts`
  - [ ] Implement test matrix loops (viewports × frameworks × UI libraries × themes)
  - [ ] Generate code from gradual.com URL
  - [ ] Capture screenshots of generated output
  - [ ] Compare with baselines using blazediff
  - [ ] Assert 90%+ overall similarity
  - [ ] Assert component-level thresholds: Hero ≥92%, FeatureCard ≥90%, PricingTier ≥88%, Navigation ≥90%, Footer ≥85%
- [ ] Create local testing script: `npm run test:visual:gradual`
  - [ ] Interactive prompts for viewport/UI library/theme selection
  - [ ] Generate terminal diff report with similarity percentages
  - [ ] Save diff images to `tests/visual-regression/diffs/`

#### CI Integration
- [ ] Update baseline workflow on main branch
  - [ ] Trigger on push to main or manual dispatch
  - [ ] Capture fresh screenshots from gradual.com
  - [ ] Upload to Supabase Storage
  - [ ] Commit metadata (hashes, timestamps) to repo
- [ ] PR validation workflow
  - [ ] Fetch current baselines from Supabase
  - [ ] Run visual regression tests across test matrix
  - [ ] Generate diff images and reports
  - [ ] Upload artifacts to PR
  - [ ] Comment on PR with fidelity breakdown:
    ```
    ✅ gradual.com Visual Regression Results

    Overall: 94% match (target: 90%+)

    Component Breakdown:
    ✅ Hero: 96% (target: ≥92%)
    ✅ FeatureCard: 93% (target: ≥90%)
    ✅ PricingTier: 91% (target: ≥88%)
    ✅ Navigation: 95% (target: ≥90%)
    ⚠️  Footer: 87% (target: ≥85%)

    View diff images: [artifacts]
    ```
  - [ ] Fail CI if thresholds not met

#### Helpers & Utilities
- [ ] Create `tests/visual-regression/helpers/screenshot.ts`
  - [ ] `captureScreenshot(generated, { viewport, theme })`
  - [ ] `captureComponentScreenshot(generated, { component, viewport, theme })`
- [ ] Create `tests/visual-regression/helpers/compare.ts`
  - [ ] `compareWithBaseline(screenshot, { benchmark, viewport, framework, uiLibrary, theme })`
  - [ ] `calculateComponentSimilarity(fullScreenshot, componentBounds)`
- [ ] Create `tests/visual-regression/helpers/storage.ts`
  - [ ] `fetchBaseline(path)` from Supabase Storage
  - [ ] `uploadBaseline(path, screenshot)` to Supabase Storage
- [ ] Create `tests/visual-regression/shared/config.ts`
  - [ ] Viewport definitions
  - [ ] Similarity thresholds
  - [ ] Component bounds for gradual.com
  - [ ] Storage bucket configuration

#### Documentation
- [ ] Document visual regression testing in project README
- [ ] Add troubleshooting guide for common diff issues
- [ ] Document baseline approval process for intentional design changes
