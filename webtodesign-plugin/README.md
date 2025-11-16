# WebToDesign - Figma Plugin

> Convert any website to editable Figma designs with auto-layout, design tokens, and structured layers.

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/jgtolentino/webtodesign)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-beta-yellow.svg)](https://github.com/jgtolentino/webtodesign)

---

## Overview

**WebToDesign** is a Figma plugin that converts websites into fully editable Figma designs. Import any public website by URL, or capture private/logged-in pages using the browser extension.

### Features

- ✅ **URL Import** - Paste any website URL and convert to Figma
- ✅ **Auto-Layout Detection** - Automatically converts flexbox layouts to Figma auto-layout
- ✅ **Design Token Extraction** - Creates local color and text styles from site palette
- ✅ **Multi-Viewport Support** - Import desktop, tablet, and mobile views
- ✅ **Editable Layers** - All text, shapes, and frames are fully editable
- 🚧 **Browser Extension** - Capture private pages (coming soon)
- 🚧 **Batch Import** - Import multiple URLs at once (coming soon)

### Demo

This is a **Beta/MVP version** that generates demo layouts to demonstrate the conversion pipeline. Backend API integration and browser extension are in development.

---

## Installation

### From Figma Community (Recommended)

1. Open Figma
2. Go to **Plugins** → **Browse plugins in Community**
3. Search for "WebToDesign"
4. Click **Install**

### Manual Installation (Development)

1. Clone this repository:
   ```bash
   git clone https://github.com/jgtolentino/webtodesign.git
   cd webtodesign-plugin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the plugin:
   ```bash
   npm run build
   ```

4. Load in Figma:
   - Open Figma
   - Go to **Plugins** → **Development** → **Import plugin from manifest**
   - Select `manifest.json` from the `webtodesign-plugin` directory

---

## Usage

### Basic Import

1. Open a Figma file
2. Run **Plugins** → **WebToDesign**
3. Enter a website URL (e.g., `https://example.com`)
4. Select viewport size (Desktop, Tablet, Mobile)
5. Click **Import to Figma**
6. Wait for conversion (typically 10-60 seconds)
7. Edit the resulting Figma frame!

### Options

- **Viewport Size** - Choose from 5 presets or custom size
- **Include Images** - Import images as placeholders (full support coming soon)
- **Full Page** - Capture entire page vs. above-the-fold only
- **Theme** - Auto-detect light/dark mode (coming soon)

### Advanced: Snapshot Import

For private/logged-in pages:

1. Install the WebToDesign browser extension (coming soon)
2. Navigate to the page you want to capture
3. Click the extension icon → **Capture Page**
4. Download the `.w2d` snapshot file
5. In Figma plugin, switch to **Snapshot Upload** method
6. Upload the `.w2d` file
7. Click **Import to Figma**

---

## How It Works

### Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Figma     │      │   Backend    │      │   Browser   │
│   Plugin    │◄────►│   API        │◄────►│  Extension  │
│   (UI)      │      │  (Headless)  │      │  (Capture)  │
└─────────────┘      └──────────────┘      └─────────────┘
       │                    │                      │
       │                    │                      │
       ▼                    ▼                      ▼
  Convert to          Fetch & Parse          Capture DOM
  Figma nodes         HTML/CSS/JS            + Styles
```

### Conversion Pipeline

1. **Fetch** - Backend fetches URL with headless browser (Puppeteer/Playwright)
2. **Parse** - Extract DOM tree, computed styles, and assets
3. **Transform** - Convert HTML structure to Figma scene graph
4. **Create** - Plugin creates Figma frames, text, shapes using API
5. **Style** - Apply colors, typography, layout (auto-layout where possible)
6. **Extract** - Create local styles from design tokens

### Mapping Rules

| HTML/CSS | Figma |
|----------|-------|
| `<div>` with children | Frame |
| Text content | Text node |
| `<img>` | Rectangle with image fill |
| `display: flex` | Auto-layout frame |
| `flex-direction: row` | Horizontal auto-layout |
| `flex-direction: column` | Vertical auto-layout |
| `gap` | Item spacing |
| `padding` | Frame padding |
| `background-color` | Fill |
| `color` | Text fill |
| `font-family, font-size, font-weight` | Text style |
| `border-radius` | Corner radius |

---

## Development

### Setup

```bash
# Install dependencies
npm install

# Build plugin
npm run build

# Watch mode (auto-rebuild on changes)
npm run watch

# Clean build artifacts
npm run clean
```

### Project Structure

```
webtodesign-plugin/
├── manifest.json          # Figma plugin manifest
├── package.json           # NPM dependencies
├── tsconfig.json          # TypeScript config
├── src/
│   ├── code.ts           # Main plugin logic (sandbox)
│   ├── ui.html           # Plugin UI (iframe)
│   ├── types.ts          # TypeScript type definitions
│   ├── utils.ts          # Utility functions
│   └── converter.ts      # HTML → Figma conversion logic
└── dist/                 # Build output
    ├── code.js
    └── ui.html
```

### Key Files

- **code.ts** - Runs in Figma plugin sandbox, handles conversion
- **ui.html** - Plugin UI (HTML + inline CSS + JS)
- **converter.ts** - Core conversion logic (HTML elements → Figma nodes)
- **utils.ts** - Color parsing, font mapping, layout detection
- **types.ts** - TypeScript interfaces for page snapshots

### Technologies

- **TypeScript** - Type-safe development
- **Figma Plugin API** - Node creation, styling, local styles
- **CSS Parser** - Convert CSS properties to Figma equivalents
- **Async/Await** - Handle font loading, API calls

---

## API Reference

### Plugin Messages

Messages sent from UI to plugin code:

```typescript
// Import from URL
{
  type: 'import-url',
  payload: {
    url: string
    viewport: { name: string, width: number, height: number }
    theme: 'light' | 'dark' | 'auto'
    includeImages: boolean
    fullPage: boolean
  }
}

// Import from snapshot
{
  type: 'import-snapshot',
  payload: PageSnapshot
}

// Cancel import
{
  type: 'cancel'
}
```

Messages sent from plugin code to UI:

```typescript
// Status update
{
  type: 'status',
  payload: {
    message: string
    progress: number // 0-100
  }
}

// Import complete
{
  type: 'complete',
  payload: {
    message: string
    result: ConversionResult
  }
}

// Error
{
  type: 'error',
  payload: {
    message: string
  }
}
```

### Page Snapshot Schema

```typescript
interface PageSnapshot {
  url: string
  title: string
  viewport: { name: string, width: number, height: number }
  elements: CapturedElement[]
  colors: string[]  // Hex colors found on page
  fonts: Array<{ family: string, weights: string[] }>
  metadata?: {
    capturedAt: string
    userAgent: string
  }
}

interface CapturedElement {
  tag: string
  type: 'text' | 'box' | 'image' | 'container'
  text?: string
  src?: string  // For images
  rect: { x: number, y: number, width: number, height: number }
  styles: {
    color?: string
    backgroundColor?: string
    fontSize?: number
    fontFamily?: string
    fontWeight?: string | number
    lineHeight?: number
    borderRadius?: number
    display?: string
    flexDirection?: string
    justifyContent?: string
    alignItems?: string
    gap?: number
    padding?: { top, right, bottom, left }
    margin?: { top, right, bottom, left }
  }
  children?: CapturedElement[]
}
```

---

## Roadmap

### ✅ MVP (Current)

- [x] Basic Figma plugin UI
- [x] URL input and validation
- [x] Demo layout generation
- [x] HTML → Figma conversion engine
- [x] Auto-layout detection (flexbox)
- [x] Color and text style extraction
- [x] Multi-viewport support
- [x] Font loading with fallbacks

### 🚧 Phase 1 (In Progress)

- [ ] Backend API integration (headless browser)
- [ ] Real website fetching and parsing
- [ ] Image downloading and embedding
- [ ] Browser extension (Chrome)
- [ ] Snapshot upload/import
- [ ] Error handling and retries

### 📅 Phase 2 (Planned)

- [ ] Batch import (multiple URLs)
- [ ] Component detection and creation
- [ ] CSS Grid → auto-layout mapping
- [ ] Advanced text styling (line-height, letter-spacing)
- [ ] Theme detection (light/dark mode)
- [ ] Above-the-fold vs. full page toggle

### 🔮 Phase 3 (Future)

- [ ] AI-assisted layout optimization
- [ ] Design system extraction
- [ ] Responsive variant generation
- [ ] Animation/interaction hints
- [ ] Team workspaces and quotas
- [ ] PRO tier with higher limits

---

## Limitations

### Current Beta Limitations

- **Demo mode only** - Generates placeholder layouts, not real websites yet
- **No image fetching** - Images shown as gray placeholders
- **Public URLs only** - Browser extension needed for private pages
- **Basic flexbox only** - CSS Grid not fully supported
- **Font substitution** - Uses Inter/Roboto when fonts unavailable

### Known Issues

- Very large pages (>10,000 elements) may timeout
- Some CSS properties not mapped to Figma equivalents
- Bot-protected sites (Cloudflare) not accessible via backend
- Complex animations/canvas elements fallback to static snapshots

---

## FAQ

**Q: Does this work with any website?**
A: In demo mode, it generates a placeholder layout. Once backend is connected, it will work with most public websites. Private/logged-in sites require the browser extension.

**Q: Will my designs stay editable?**
A: Yes! All layers (text, shapes, frames) are native Figma nodes, fully editable.

**Q: What about images and fonts?**
A: Images will be embedded in the full version. Fonts are matched when available in Figma, or substituted with Inter/Roboto.

**Q: Can I import responsive designs (mobile + desktop)?**
A: Yes, import the same URL multiple times with different viewport sizes.

**Q: Does this require a backend server?**
A: For public URLs, yes (headless browser). For private pages, the browser extension captures DOM locally.

**Q: Is there a usage limit?**
A: Beta version has no limits. Production will have free tier (10-12 imports/month) and PRO tier.

---

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Use TypeScript for type safety
- Follow existing code style (2-space indent, semicolons)
- Add comments for complex logic
- Test in Figma before submitting PR
- Update README if adding new features

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Support

- **Issues**: [GitHub Issues](https://github.com/jgtolentino/webtodesign/issues)
- **Discussions**: [GitHub Discussions](https://github.com/jgtolentino/webtodesign/discussions)
- **Email**: jake@insightpulseai.com
- **Twitter**: [@jgtolentino](https://twitter.com/jgtolentino)

---

## Acknowledgments

- Inspired by [html.to.design](https://html.to.design)
- Built with [Figma Plugin API](https://www.figma.com/plugin-docs/)
- Uses [Inter](https://rsms.me/inter/) font by Rasmus Andersson
- Powered by [Puppeteer](https://pptr.dev/) for headless browsing

---

**Made with ❤️ by [Jake Tolentino](https://github.com/jgtolentino)**

*Convert websites to Figma designs in minutes, not hours.*
