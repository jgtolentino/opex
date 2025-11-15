# Cross-Site Navigation Integration

## Overview

This guide shows how to link your Next.js/Notion landing page with the Docusaurus documentation hub.

## Architecture

```
Landing Page (Vercel)                    Documentation Hub (GitHub Pages)
├─ https://nextjs-notion-starter-kit    ├─ https://jgtolentino.github.io/opex/
│  -eight-iota.vercel.app               │
│                                        │
├─ Link: "Documentation" →              ├─ Link: "← Home" →
│  Points to docs                        │  Points to landing page
│                                        │
└─ Main content, blog, portfolio         └─ Knowledge Base, HR, Finance, etc.
```

## Step 1: Add Documentation Link to Next.js Site

### Option A: Quick Link in Navigation (Recommended)

Edit your Next.js navigation component to add a documentation link:

**File**: `components/NotionPageHeader.tsx` (or your navbar component)

```tsx
// Add this to your navigation items
<a
  href="https://jgtolentino.github.io/opex/"
  className="breadcrumb"
  target="_blank"
  rel="noopener noreferrer"
>
  📚 Documentation
</a>
```

### Option B: Add to site.config.ts

If your starter kit uses `site.config.ts` for navigation:

**File**: `site.config.ts`

```typescript
export default {
  // ... existing config

  navigationLinks: [
    {
      title: 'Documentation',
      pageId: 'https://jgtolentino.github.io/opex/',
      external: true
    }
  ]
}
```

### Option C: Custom Footer Link

Add a documentation section in your footer:

**File**: `components/Footer.tsx`

```tsx
<footer>
  {/* ... existing footer content */}

  <div className="footer-links">
    <a
      href="https://jgtolentino.github.io/opex/"
      target="_blank"
      rel="noopener noreferrer"
    >
      📚 Documentation Hub
    </a>
  </div>
</footer>
```

## Step 2: Docusaurus Configuration (Already Done ✅)

The Docusaurus site now has a "← Home" link in the navbar that points back to your Vercel site.

**Configuration**: `/docs/docusaurus.config.ts`

```typescript
navbar: {
  items: [
    {
      href: 'https://nextjs-notion-starter-kit-eight-iota.vercel.app',
      label: '← Home',
      position: 'left',
    },
    // ... other nav items
  ]
}
```

## Step 3: Update Environment Variables (Optional)

If you want to make the URLs configurable:

### Vercel (Next.js site)

Add environment variable in Vercel dashboard:
```
NEXT_PUBLIC_DOCS_URL=https://jgtolentino.github.io/opex/
```

Then use in your code:
```tsx
<a href={process.env.NEXT_PUBLIC_DOCS_URL}>Documentation</a>
```

### GitHub (Docusaurus site)

The Vercel URL is hardcoded in `docusaurus.config.ts` but can be changed anytime.

## Step 4: Update README Links

Update your main README to mention both sites:

**File**: `/readme.md`

```markdown
## Live Sites

- **Landing Page**: https://nextjs-notion-starter-kit-eight-iota.vercel.app
- **Documentation Hub**: https://jgtolentino.github.io/opex/

## Navigation

- From landing page → Click "Documentation" in navbar
- From documentation → Click "← Home" in navbar
```

## Testing the Integration

### Local Testing

1. **Start Next.js dev server**:
   ```bash
   pnpm dev
   # Visit: http://localhost:3000
   ```

2. **Start Docusaurus dev server** (in separate terminal):
   ```bash
   pnpm dev:docs
   # Visit: http://localhost:3000/opex/
   ```

3. Test navigation:
   - Add documentation link to Next.js localhost site pointing to `http://localhost:3000/opex/`
   - Verify Docusaurus "← Home" link points to `http://localhost:3000`

### Production Testing

After deployment:
1. Visit https://nextjs-notion-starter-kit-eight-iota.vercel.app
2. Click "Documentation" link
3. Verify it opens https://jgtolentino.github.io/opex/
4. Click "← Home" link
5. Verify it returns to Vercel site

## Deployment Checklist

- [ ] Add documentation link to Next.js navbar
- [ ] Test link in local development
- [ ] Deploy Next.js changes to Vercel
- [ ] Deploy Docusaurus to GitHub Pages
- [ ] Test cross-site navigation in production
- [ ] Update README with both site URLs
- [ ] (Optional) Add analytics to track navigation between sites

## Recommended: Add to Both Sites

### Call-to-Action in Next.js Site

Add a prominent link to documentation in your homepage:

```tsx
<section className="cta-section">
  <h2>Need Help?</h2>
  <p>Check out our comprehensive documentation hub</p>
  <a
    href="https://jgtolentino.github.io/opex/"
    className="cta-button"
  >
    View Documentation →
  </a>
</section>
```

### Breadcrumb in Docusaurus

Already configured! The "← Home" link serves as a breadcrumb.

## Advanced: OpenGraph Meta Tags

To improve social sharing, add OpenGraph tags to both sites:

### Next.js (site.config.ts)

```typescript
export default {
  // ... existing config

  description: 'OpEx Platform - Your operational excellence hub',
  socialImageTitle: 'OpEx Platform',
  socialImageSubtitle: 'Landing page and documentation',
}
```

### Docusaurus (docusaurus.config.ts)

Already configured with OpenGraph support via Docusaurus presets.

## Support

If you have issues with cross-site navigation:

1. Verify URLs are correct in both configurations
2. Check browser console for CORS errors
3. Ensure both sites are deployed and accessible
4. Test in incognito mode to rule out caching issues

---

**Next Steps**: Implement Option A above to add the documentation link to your Next.js site navbar!
