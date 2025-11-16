# WebToDesign - Quick Start Guide

Get up and running with WebToDesign in 5 minutes!

## 🚀 Installation (Development Mode)

### Prerequisites

- Node.js 18+ installed
- Figma desktop app or browser version
- Terminal/command line access

### Steps

1. **Navigate to plugin directory**:
   ```bash
   cd webtodesign-plugin
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the plugin**:
   ```bash
   npm run build
   ```

4. **Load in Figma**:
   - Open Figma (desktop or browser)
   - Click **Plugins** → **Development** → **Import plugin from manifest**
   - Navigate to the `webtodesign-plugin` folder
   - Select `manifest.json`
   - Click **Open**

✅ Plugin is now installed!

---

## 🎯 First Import

1. **Open a Figma file** (create new or use existing)

2. **Run the plugin**:
   - Right-click on canvas → **Plugins** → **WebToDesign**
   - Or: **Plugins** menu → **Development** → **WebToDesign**

3. **Import a website**:
   - URL is pre-filled with `https://example.com` for demo
   - Select viewport size (Desktop 1440px recommended)
   - Click **Import to Figma**

4. **Wait for conversion** (~5-10 seconds for demo)

5. **Edit your design!**
   - All layers are fully editable
   - Check the Layers panel to see structure
   - Color and text styles are created automatically

---

## 🔧 Development Workflow

### Watch Mode

Auto-rebuild on file changes:

```bash
npm run watch
```

Keep this running while developing. Reload plugin in Figma after changes:
- **Figma Desktop**: Right-click plugin → **Reload**
- **Figma Browser**: Close and reopen plugin

### Project Structure

```
src/
├── code.ts        # Main plugin logic (edit for backend integration)
├── ui.html        # Plugin UI (edit for UI changes)
├── converter.ts   # Conversion engine (edit for mapping rules)
├── utils.ts       # Utilities (color parsing, fonts, etc.)
└── types.ts       # TypeScript types
```

### Making Changes

1. Edit files in `src/`
2. Build: `npm run build` (or use watch mode)
3. Reload plugin in Figma
4. Test changes

---

## 🌐 Next Steps: Backend Integration

The current version generates **demo layouts**. To import real websites:

### Option A: Use Backend API (Recommended)

1. Deploy a backend API (Express + Puppeteer):
   ```typescript
   // Example: api/index.ts
   app.get('/convert', async (req, res) => {
     const url = req.query.url
     const browser = await puppeteer.launch()
     const page = await browser.newPage()
     await page.goto(url)
     const snapshot = await page.evaluate(() => {
       // Extract DOM + styles
       return captureDOM()
     })
     res.json(snapshot)
   })
   ```

2. Update `src/code.ts`:
   ```typescript
   async function fetchPageSnapshot(url: string, options: ImportOptions) {
     // Replace demo with real API call
     const response = await fetch(`https://your-api.com/convert?url=${encodeURIComponent(url)}`)
     return await response.json()
   }
   ```

3. Rebuild and test!

### Option B: Use Browser Extension

1. Build a Chromium extension that captures DOM locally
2. Export as `.w2d` JSON file
3. Import via "Snapshot Upload" method

---

## 📖 Common Tasks

### Add New Viewport Preset

Edit `src/types.ts`:

```typescript
export const VIEWPORT_PRESETS: ViewportSize[] = [
  { name: 'Desktop (1440px)', width: 1440, height: 900 },
  { name: 'Your Custom Size', width: 1920, height: 1080 },  // Add here
  // ...
]
```

Update `src/ui.html` dropdown:

```html
<select id="viewport-select">
  <option value="0">Desktop (1440px)</option>
  <option value="1">Your Custom Size</option>  <!-- Add here -->
</select>
```

### Improve CSS → Figma Mapping

Edit `src/converter.ts`:

```typescript
private async createBoxNode(parent, element) {
  // Add new CSS property handling
  if (styles.boxShadow) {
    frame.effects = [/* convert box-shadow */]
  }
}
```

### Add Progress Tracking

In `src/code.ts`:

```typescript
sendToUI({
  type: 'status',
  payload: {
    message: 'Converting elements...',
    progress: 50  // 0-100
  }
})
```

---

## 🐛 Troubleshooting

### Plugin doesn't appear in Figma

- Make sure you ran `npm run build`
- Check that `dist/code.js` and `dist/ui.html` exist
- Try re-importing the manifest

### TypeScript errors

```bash
npm install --save-dev @figma/plugin-typings
```

### Build fails

```bash
npm run clean
npm install
npm run build
```

### Plugin UI is blank

- Check browser console (Figma Desktop → Developer → Open Console)
- Look for JavaScript errors in `ui.html`

---

## 📚 Resources

- **Figma Plugin API**: https://www.figma.com/plugin-docs/
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Puppeteer**: https://pptr.dev/
- **Example Plugins**: https://github.com/figma/plugin-samples

---

## 🎉 You're Ready!

You now have a working Figma plugin that can convert websites to designs. Next steps:

1. ✅ Test the demo import
2. 🔌 Connect to a backend API or build browser extension
3. 🎨 Customize conversion rules and UI
4. 🚀 Publish to Figma Community

Happy coding! 🚀
