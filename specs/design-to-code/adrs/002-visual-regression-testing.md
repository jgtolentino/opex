# ADR-002 — Visual Regression Testing for Design-to-Code Fidelity

## Status
Accepted

## Context

The Design-to-Code Playground must validate that:
1. Generated code achieves 90%+ visual fidelity to source designs (Figma/URLs)
2. Component extraction preserves visual consistency across variants
3. Responsive breakpoints render correctly (mobile/tablet/desktop)
4. Different UI library outputs (ShadCN, MUI, AntD) maintain visual parity
5. Code changes don't introduce visual regressions

Manual visual validation doesn't scale and is subjective. We need automated visual regression testing that can:
- Capture baseline screenshots from source designs
- Compare generated output against baselines
- Detect and report visual differences
- Run in CI/CD on every PR
- Support local developer testing

## Decision

Adopt a **self-hosted visual regression testing approach** based on Ant Design's proven pattern:

### Core Components

1. **Screenshot Capture: jest-puppeteer**
   - Capture screenshots of generated components and pages
   - Test across multiple viewports (mobile: 375px, tablet: 768px, desktop: 1440px)
   - Test across themes if applicable (light/dark mode)
   - Store screenshots in predictable locations (`imageSnapshots/`)

2. **Diff Engine: blazediff or pixelmatch**
   - Compare current screenshots with baseline screenshots
   - Generate visual diff images highlighting changes
   - Calculate similarity percentage (target: 90%+)
   - Tolerate anti-aliasing and minor rendering differences

3. **Baseline Storage: Self-hosted (Supabase Storage or GitHub)**
   - Store baseline screenshots for reference test suite (gradual.com, etc.)
   - Update baselines automatically when main branch changes
   - Version baselines by framework (React/TSX) and UI library (ShadCN/MUI/AntD)
   - Organize by: `{benchmark}/{framework}/{ui-library}/{viewport}/{theme}.png`

4. **CI Integration: GitHub Actions**
   - Trigger visual regression tests on every PR
   - Compare PR screenshots against current baselines
   - Upload diff images and reports to artifact storage
   - Comment on PR with visual diff summary and links
   - Fail CI if visual fidelity < 90% threshold

5. **Local Testing**
   ```bash
   npm run test:visual-regression:local
   # Prompts for:
   # - Which benchmark to test (gradual.com, etc.)
   # - Which framework (React/TSX, HTML)
   # - Which UI library (ShadCN, MUI, AntD, none)
   # - Which viewport (mobile, tablet, desktop, all)
   ```

### Baseline Update Workflow

```yaml
# .github/workflows/update-visual-baselines.yml
# Runs on push to main branch
- Capture screenshots of all reference benchmarks
- Upload to baseline storage
- Commit baseline metadata (hashes, URLs) to repo
```

### PR Validation Workflow

```yaml
# .github/workflows/visual-regression-pr.yml
# Runs on PR creation/update
- Fetch current baselines from storage
- Generate code from reference benchmarks
- Capture screenshots of generated output
- Run diff comparison (blazediff)
- Upload diff images to artifacts
- Comment PR with results:
  ✅ gradual.com: 94% match (hero: 96%, feature-cards: 93%, ...)
  ❌ other-site.com: 82% match (below 90% threshold)
```

## Test Structure

```
tests/
├── visual-regression/
│   ├── baselines/              # Git-ignored, fetched from storage
│   ├── current/                # Git-ignored, current test run
│   ├── diffs/                  # Git-ignored, diff images
│   ├── benchmarks/
│   │   ├── gradual.spec.ts     # gradual.com test suite
│   │   └── ...
│   ├── helpers/
│   │   ├── screenshot.ts       # Screenshot capture utilities
│   │   ├── compare.ts          # Diff comparison logic
│   │   └── storage.ts          # Baseline fetch/upload
│   └── shared/
│       └── config.ts           # Viewport sizes, thresholds, etc.
```

## Example Test

```typescript
// tests/visual-regression/benchmarks/gradual.spec.ts
import { generateFromURL } from '@/lib/url-importer';
import { captureScreenshot } from '../helpers/screenshot';
import { compareWithBaseline } from '../helpers/compare';

describe('gradual.com visual regression', () => {
  const benchmarkUrl = 'https://www.gradual.com';
  const viewports = ['mobile', 'tablet', 'desktop'];
  const frameworks = ['react-tsx'];
  const uiLibraries = ['shadcn', 'mui', 'antd'];

  for (const viewport of viewports) {
    for (const framework of frameworks) {
      for (const uiLibrary of uiLibraries) {
        test(`${viewport}/${framework}/${uiLibrary}`, async () => {
          // Generate code from URL
          const generated = await generateFromURL(benchmarkUrl, {
            framework,
            uiLibrary,
          });

          // Render and capture screenshot
          const screenshot = await captureScreenshot(generated, { viewport });

          // Compare with baseline
          const result = await compareWithBaseline(screenshot, {
            benchmark: 'gradual',
            viewport,
            framework,
            uiLibrary,
          });

          // Assert visual fidelity threshold
          expect(result.similarityPercentage).toBeGreaterThanOrEqual(90);

          // Generate component-level breakdown
          for (const component of result.components) {
            expect(component.similarity).toBeGreaterThanOrEqual(85);
          }
        });
      }
    }
  }
});
```

## Consequences

### Pros
- **Objective fidelity measurement**: 90%+ target becomes measurable, not subjective
- **Automated PR validation**: Catch visual regressions before merge
- **Self-hosted cost control**: Avoid Argos/Percy pricing issues (Ant Design lesson)
- **Local developer testing**: Fast feedback during development
- **Framework parity validation**: Ensure ShadCN/MUI/AntD outputs are visually equivalent
- **Continuous baseline updates**: Baselines stay current with design changes

### Cons
- **Setup complexity**: Requires CI, storage, and diffing infrastructure
- **Baseline maintenance**: Need process for updating baselines when intentional changes occur
- **Flakiness potential**: Screenshot rendering can vary slightly by environment (fonts, anti-aliasing)
- **Storage costs**: Screenshot storage grows over time (mitigate with retention policies)

### Mitigations
- Use Docker containers for consistent rendering environments
- Set diff tolerance thresholds (e.g., allow 1-2% variance for anti-aliasing)
- Implement baseline cleanup: delete baselines for removed benchmarks
- Add baseline approval workflow: require manual approval for baseline updates >5% diff
- Cache baselines in CI to reduce storage fetches

## Alternatives Considered

1. **Argos / Percy (SaaS)**
   - Rejected: Cost prohibitive at scale (Ant Design experience)
   - 6,000+ screenshots per PR × frequent PRs = unsustainable

2. **Manual review only**
   - Rejected: Doesn't scale, subjective, error-prone

3. **Chromatic**
   - Considered: Storybook-based, good DX
   - Rejected: Requires Storybook setup, cost concerns at scale

4. **Self-hosted (Selected)**
   - Proven by Ant Design at massive scale
   - Full control over costs and infrastructure
   - Open source tools (jest, puppeteer, blazediff)

## References

- [Ant Design Visual Regression Docs](https://ant.design/docs/react/visual-regression-testing)
- [Ant Design PR Example](https://github.com/ant-design/ant-design/pull/52210#issuecomment-2567659292)
- [Ant Design CI Workflows](https://github.com/ant-design/ant-design/tree/master/.github/workflows)
- [blazediff](https://github.com/blaze33/blazediff) - Image diff tool
- [pixelmatch](https://github.com/mapbox/pixelmatch) - Alternative diff library
- [jest-puppeteer](https://github.com/smooth-code/jest-puppeteer)

## Implementation Timeline

- **Phase 1 (M2)**: Basic screenshot capture for Figma imports
- **Phase 2 (M3)**: Full visual regression suite for gradual.com benchmark
- **Phase 3 (M4)**: CI integration with PR comments and baseline updates
- **Phase 4 (M5)**: Multi-framework and multi-UI-library comparison
- **Phase 5 (M6)**: Component-level diff breakdown and fidelity heatmaps
