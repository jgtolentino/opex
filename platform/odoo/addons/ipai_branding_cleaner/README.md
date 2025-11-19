# InsightPulse Branding Cleaner

**Version**: 1.0.0
**Odoo Compatibility**: 16.0, 17.0, 18.0 CE
**License**: AGPL-3
**Author**: InsightPulseAI

## Overview

The InsightPulse Branding Cleaner is an Odoo module that removes all `odoo.com` branding from your Odoo instance and replaces it with InsightPulseAI branding. Perfect for white-label deployments, self-hosted SaaS offerings, and enterprises that want to maintain independence from odoo.com services.

## Features

✅ **Link Rewriting**: Automatically rewrites all `odoo.com` links to `insightpulseai.net`
✅ **Branding Removal**: Removes "Powered by Odoo" text and branding elements
✅ **IAP/Enterprise Cleanup**: Hides IAP and Enterprise upsell banners
✅ **Help Link Replacement**: Replaces help/documentation links with your own
✅ **Dynamic Monitoring**: Uses MutationObserver to catch dynamically loaded content
✅ **Fail-Safe**: Never breaks Odoo UI, even if errors occur

## Why Use This Module?

### For Self-Hosted SaaS Providers
- **White-label experience**: Present Odoo as your own product
- **No odoo.com dependence**: All links point to your infrastructure
- **Professional appearance**: No third-party branding visible to users

### For Enterprise Deployments
- **Internal consistency**: Match your corporate branding
- **Reduce confusion**: Users don't see external vendor links
- **Security posture**: No unexpected external connections

### For Odoo CE/OCA Users
- **Clean interface**: Remove Enterprise upsells you can't use
- **Better UX**: No broken "Buy Credits" or IAP buttons
- **Community-focused**: Emphasize the open-source nature

## Installation

### 1. Copy Module to Addons Path

```bash
# Copy the module to your Odoo addons directory
cp -r ipai_branding_cleaner /path/to/odoo/addons/

# Or via Docker/Doodba
docker cp ipai_branding_cleaner odoo:/mnt/extra-addons/
```

### 2. Update Apps List

In Odoo:
1. Activate **Developer Mode**: Settings → Activate Developer Mode
2. Go to **Apps**
3. Click **Update Apps List**
4. Search for **"InsightPulse Branding Cleaner"**

### 3. Install the Module

1. Find **InsightPulse Branding Cleaner** in the Apps list
2. Click **Install**
3. Wait for installation to complete
4. Log out and log back in to see changes

## Configuration

### Basic Setup

No configuration needed! The module works automatically once installed.

### Advanced Customization

To customize the replacement URL or behavior:

1. Edit `static/src/js/branding_cleaner.js`
2. Modify these constants:

```javascript
const REPLACEMENT_URL = "https://insightpulseai.net";  // Your URL
const REPLACEMENT_TEXT = "InsightPulseAI";            // Your brand name
```

3. Update Odoo assets:

```bash
odoo-bin -u ipai_branding_cleaner -d your_database --stop-after-init
```

### Help Link Customization

To point help links to your own documentation:

In `branding_cleaner.js`, update the `replaceHelpLinks()` function:

```javascript
function replaceHelpLinks() {
    const helpLinks = document.querySelectorAll('a[href*="odoo.com/documentation"]');
    helpLinks.forEach(function(a) {
        // Replace with your docs URL
        a.setAttribute("href", "https://insightpulseai.net/docs/odoo");
    });
}
```

## Technical Details

### How It Works

1. **Asset Injection**: Module injects JavaScript and SCSS into `web.assets_backend`
2. **DOM Manipulation**: JavaScript runs on page load and modifies DOM elements
3. **Dynamic Monitoring**: MutationObserver watches for new content
4. **CSS Enforcement**: SCSS provides belt-and-suspenders hiding

### Files Structure

```
ipai_branding_cleaner/
├── __init__.py                          # Python init (empty for this module)
├── __manifest__.py                      # Odoo module manifest
├── README.md                            # This file
├── views/
│   └── assets_backend.xml              # Asset bundle injection
└── static/
    └── src/
        ├── js/
        │   └── branding_cleaner.js     # Main JavaScript logic
        └── scss/
            └── branding_cleaner.scss    # CSS hiding rules
```

### Performance Impact

- **Minimal**: JavaScript runs once on page load + on dynamic updates
- **Non-blocking**: Uses `requestIdleCallback` when available
- **Debounced**: MutationObserver is debounced to avoid excessive re-runs
- **No server calls**: All processing happens client-side

### Security Considerations

- **No data collection**: Module doesn't send any data anywhere
- **No external dependencies**: Pure JavaScript, no third-party libraries
- **Fail-safe**: Wrapped in try/catch to never break Odoo
- **Read-only**: Only reads and modifies DOM, no backend changes

## Compatibility

| Odoo Version | Status | Notes |
|--------------|--------|-------|
| 16.0 CE      | ✅ Tested | Fully compatible |
| 17.0 CE      | ✅ Tested | Fully compatible |
| 18.0 CE      | ✅ Tested | Fully compatible |
| Enterprise   | ⚠️ Partial | Some Enterprise-specific elements may remain |

## Usage with n8n Odoo Phone-Home Guard

For complete odoo.com independence, pair this module with the **n8n Odoo Phone-Home Guard** workflow:

1. **Branding Cleaner** (this module): Removes visible odoo.com presence
2. **Phone-Home Guard** (n8n workflow): Monitors for IAP/Enterprise modules

See: `workflows/n8n/odoo-phone-home-guard.json`

## Troubleshooting

### Some odoo.com Links Still Visible

**Cause**: Dynamic content loaded after initial cleanup
**Solution**: The MutationObserver should catch this, but if not:
1. Check browser console for errors
2. Try disabling browser extensions
3. Report the specific element (F12 → Inspect)

### Module Won't Install

**Cause**: Odoo can't find the module
**Solution**:
1. Verify module is in addons path: `odoo-bin --addons-path=/path/to/addons`
2. Check file permissions: `chmod -R 755 ipai_branding_cleaner/`
3. Restart Odoo service

### JavaScript Errors in Console

**Cause**: Conflict with other custom modules
**Solution**:
1. Check if other modules also modify `web.assets_backend`
2. Try installing in a clean database first
3. Report issue with error message

## Testing

### Manual Testing Checklist

After installation:

- [ ] Log out and log back in
- [ ] Check main dashboard for odoo.com links
- [ ] Check footer for "Powered by Odoo"
- [ ] Check Settings → About Odoo
- [ ] Try opening a form view (e.g., Contacts)
- [ ] Check Help menu links
- [ ] Open browser console (F12) for errors

### Automated Testing

Use browser automation to verify:

```javascript
// Check for odoo.com links
const odooLinks = document.querySelectorAll('a[href*="odoo.com"]');
console.assert(odooLinks.length === 0, 'Found odoo.com links!');

// Check for "Powered by Odoo" text
const bodyText = document.body.textContent;
console.assert(!bodyText.includes('Powered by Odoo'), 'Found Odoo branding!');
```

## Uninstallation

To remove the module:

1. Go to **Apps**
2. Remove **"InsightPulse Branding Cleaner"** filter
3. Find **InsightPulse Branding Cleaner**
4. Click **Uninstall**
5. Refresh browser (Ctrl+F5)

All odoo.com links and branding will return to normal.

## Support & Contribution

### Getting Help

- **Documentation**: https://insightpulseai.net/docs/odoo
- **Mattermost**: #opex-odoo channel
- **GitHub Issues**: https://github.com/jgtolentino/opex/issues

### Contributing

We welcome contributions! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-improvement`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Reporting Bugs

When reporting bugs, include:
- Odoo version (e.g., 17.0 CE)
- Browser (e.g., Chrome 120)
- Steps to reproduce
- Screenshot if applicable
- Browser console errors (F12)

## License

This module is licensed under **AGPL-3** (GNU Affero General Public License v3.0).

Key points:
- ✅ Free to use, modify, and distribute
- ✅ Must share modifications under same license
- ✅ Must include copyright and license notices
- ✅ No warranty provided

See: https://www.gnu.org/licenses/agpl-3.0.html

## Credits

**Developed by**: InsightPulseAI
**Maintainer**: Jake Tolentino (@jgtolentino)
**Contributors**: OpEx Platform Team

Part of the **OpEx Platform** - Operational Excellence for Finance SSCs.

---

**Version**: 1.0.0
**Last Updated**: 2025-01-18
**Status**: Production Ready
