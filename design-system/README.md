# Design System

Unified design language for all InsightPulse Platform frontends.

## Structure

```
design-system/
├── tokens/             # JSON token files (color, typography, spacing)
├── web/                # Web-specific themes and components
│   ├── mui-theme.ts
│   ├── echarts-theme.ts
│   ├── charts/
│   └── components/
├── figma/              # Figma token exports and mappings
└── stories/            # Storybook (optional)
```

## Design Tokens

**Status:** Planned (Phase 2)

Design tokens are the single source of truth for visual design properties.

### Token Files (`tokens/`)

**`color.tokens.json`**
- Material 3-aligned color palettes
- Primary, secondary, tertiary colors
- Neutral and semantic colors (success, error, warning, info)
- Light and dark mode variants

**`typography.tokens.json`**
- Font families
- Type scales (display, headline, title, body, label)
- Font weights and line heights

**`spacing.tokens.json`**
- Spacing scale (4px base grid)
- Border radius values
- Elevation (shadow) definitions

### Token Format

```json
{
  "color": {
    "primary": {
      "50": "#e3f2fd",
      "100": "#bbdefb",
      ...
      "900": "#0d47a1"
    }
  }
}
```

## Web Themes

**Status:** Planned (Phase 2)

### MUI Theme (`web/mui-theme.ts`)

Material UI theme that consumes tokens:

```typescript
import tokens from '../tokens/color.tokens.json';

export const theme = createTheme({
  palette: {
    primary: {
      main: tokens.color.primary[500],
    },
  },
});
```

### ECharts Theme (`web/echarts-theme.ts`)

ECharts theme using same tokens for consistent visualizations:

```typescript
import tokens from '../tokens/color.tokens.json';

export const echartsTheme = {
  color: [
    tokens.color.primary[500],
    tokens.color.secondary[500],
    ...
  ],
};
```

## Components

**Status:** Planned (Phase 2)

Shared React components in `web/components/`:

### Planned Components

**`KpiCard.tsx`**
- Display key performance indicators
- Trend indicators (up/down)
- Time period context

**`TimeSeriesChart.tsx`**
- Line/bar charts for time series data
- ECharts-based
- Responsive and themed

**`RatingDistributionChart.tsx`**
- Bar chart for rating distributions
- Used in Data Lab dashboards

**Layout Components**
- Buttons (primary, secondary, text)
- Layout primitives (grid, stack, container)

## Figma Integration

**Status:** Planned (Phase 2)

### `figma/tokens-export.json`
Exported tokens from Figma via plugin.

### `figma/mapping.md`
Documentation mapping Figma styles to token names.

### Workflow
1. Design in Figma using defined styles
2. Export tokens via Figma plugin → `figma/tokens-export.json`
3. Validate token parity with `tokens/*.tokens.json`
4. Sync changes to design tokens
5. Re-generate themes

## Storybook (Optional)

**Status:** Planned (Phase 2+)

Interactive component library in `stories/storybook/`:

```bash
cd design-system/stories/storybook
pnpm storybook
```

View all components with:
- Props documentation
- Usage examples
- Visual regression testing

## Development

### Using the Design System in Apps

```typescript
// In your Next.js app
import { theme } from '@insightpulse/design-system/web/mui-theme';
import { ThemeProvider } from '@mui/material/styles';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <YourApp />
    </ThemeProvider>
  );
}
```

### Adding New Tokens

1. Update `tokens/*.tokens.json`
2. Regenerate themes in `web/`
3. Update Figma if needed
4. Test in Storybook
5. Document breaking changes in `CHANGELOG.md`

## Design Principles

1. **Consistency** - One visual language across all apps
2. **Accessibility** - WCAG AA compliant colors, touch targets
3. **Material-Inspired** - Based on Material Design 3
4. **Themeable** - Light/dark mode support
5. **Component-First** - Build with shared components, not hard-coded styles

## References

- **Material Design 3:** https://m3.material.io/
- **MUI Documentation:** https://mui.com/
- **ECharts Documentation:** https://echarts.apache.org/
- **Specs:** `.specify/specs/**`
