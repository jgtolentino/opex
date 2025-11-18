/**
 * InsightPulse Branding Cleaner
 *
 * Removes all odoo.com branding and replaces it with InsightPulseAI branding.
 *
 * Features:
 * - Rewrites odoo.com links to insightpulseai.net
 * - Removes "Powered by Odoo" text
 * - Cleans up IAP/Enterprise upsell elements
 * - Runs automatically on every page load
 *
 * @module ipai_branding_cleaner
 */

odoo.define("ipai_branding_cleaner.branding_cleaner", function (require) {
    "use strict";

    const REPLACEMENT_URL = "https://insightpulseai.net";
    const REPLACEMENT_TEXT = "InsightPulseAI";

    /**
     * Main branding cleanup function
     * Runs on page load and removes/replaces Odoo branding
     */
    function cleanBranding() {
        try {
            // 1) Rewrite all odoo.com links to insightpulseai.net
            rewriteOdooLinks();

            // 2) Remove or neutralize "Powered by Odoo" phrases
            removePoweredByOdoo();

            // 3) Clean up IAP/Enterprise banners
            removeIAPBanners();

            // 4) Replace help/documentation links
            replaceHelpLinks();

            console.log("[InsightPulse] Branding cleanup complete");
        } catch (e) {
            // Fail-safe: never break the UI
            console.warn("[InsightPulse] Branding cleaner error:", e);
        }
    }

    /**
     * Rewrite all links pointing to odoo.com
     */
    function rewriteOdooLinks() {
        const links = document.querySelectorAll('a[href*="odoo.com"]');
        links.forEach(function (a) {
            a.setAttribute("href", REPLACEMENT_URL);

            // Optional: adjust link text if it mentions Odoo
            if (a.textContent && /odoo/i.test(a.textContent)) {
                a.textContent = REPLACEMENT_TEXT;
            }
        });

        if (links.length > 0) {
            console.log(`[InsightPulse] Rewrote ${links.length} odoo.com links`);
        }
    }

    /**
     * Remove "Powered by Odoo" text and elements
     */
    function removePoweredByOdoo() {
        // Method 1: Remove elements containing the phrase
        const allNodes = document.querySelectorAll("body *");
        let removed = 0;

        allNodes.forEach(function (el) {
            if (!el || !el.textContent) {
                return;
            }

            // Check for "Powered by Odoo" (case insensitive)
            if (/powered by odoo/i.test(el.textContent)) {
                // Option A: Remove element completely
                if (el.parentNode) {
                    el.parentNode.removeChild(el);
                    removed++;
                }
                // Option B (alternative): Replace text
                // el.textContent = el.textContent.replace(/powered by odoo/gi, "Powered by InsightPulseAI");
            }
        });

        if (removed > 0) {
            console.log(`[InsightPulse] Removed ${removed} "Powered by Odoo" elements`);
        }

        // Method 2: Target specific known classes/IDs (add more as discovered)
        const specificSelectors = [
            '.o_footer_copyright',
            '.o_website_footer',
            '[data-name="powered_by"]'
        ];

        specificSelectors.forEach(function(selector) {
            const elements = document.querySelectorAll(selector);
            elements.forEach(function(el) {
                if (el && /odoo/i.test(el.textContent)) {
                    el.style.display = 'none';
                }
            });
        });
    }

    /**
     * Remove IAP and Enterprise upsell banners
     */
    function removeIAPBanners() {
        const bannersToRemove = [
            '.o_onboarding_container',  // Onboarding upsells
            '.o_enterprise_banner',     // Enterprise promotion
            '[data-name="iap_banner"]', // IAP banners
            '.o_nocontent_help a[href*="odoo.com"]', // "Get started" odoo.com links
        ];

        let removed = 0;
        bannersToRemove.forEach(function(selector) {
            const elements = document.querySelectorAll(selector);
            elements.forEach(function(el) {
                if (el && el.parentNode) {
                    el.parentNode.removeChild(el);
                    removed++;
                }
            });
        });

        if (removed > 0) {
            console.log(`[InsightPulse] Removed ${removed} IAP/Enterprise banners`);
        }
    }

    /**
     * Replace help and documentation links
     */
    function replaceHelpLinks() {
        // Replace common help links
        const helpLinks = document.querySelectorAll('a[href*="odoo.com/documentation"], a[href*="odoo.com/help"]');

        helpLinks.forEach(function(a) {
            // Replace with your own documentation URL
            a.setAttribute("href", `${REPLACEMENT_URL}/docs`);
            if (a.textContent && /help|documentation/i.test(a.textContent)) {
                a.textContent = "Documentation";
            }
        });

        if (helpLinks.length > 0) {
            console.log(`[InsightPulse] Replaced ${helpLinks.length} help links`);
        }
    }

    /**
     * Initialize the branding cleaner
     */
    function init() {
        // Run immediately if DOM is ready
        if (document.readyState !== "loading") {
            cleanBranding();
        } else {
            document.addEventListener("DOMContentLoaded", cleanBranding);
        }

        // Re-run on dynamic content changes (for SPA-like behavior)
        // Use MutationObserver to catch dynamically added content
        if (typeof MutationObserver !== 'undefined') {
            const observer = new MutationObserver(function(mutations) {
                // Debounce: only run if significant DOM changes
                let shouldClean = false;
                mutations.forEach(function(mutation) {
                    if (mutation.addedNodes.length > 0) {
                        shouldClean = true;
                    }
                });

                if (shouldClean) {
                    cleanBranding();
                }
            });

            // Start observing
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    // Auto-initialize
    init();

    // Export for potential manual calls
    return {
        cleanBranding: cleanBranding,
        init: init
    };
});
