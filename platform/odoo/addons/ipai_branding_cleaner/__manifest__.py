# -*- coding: utf-8 -*-
{
    "name": "InsightPulse Branding Cleaner",
    "summary": "Remove/replace odoo.com branding and links with InsightPulseAI",
    "description": """
        InsightPulse Branding Cleaner
        ==============================

        This module strips all odoo.com branding from the Odoo interface and replaces
        it with InsightPulseAI branding for a white-label experience.

        Features:
        ---------
        * Rewrites all odoo.com links to insightpulseai.net
        * Removes "Powered by Odoo" text and branding
        * Hides IAP/Enterprise upsell banners
        * Replaces help links with your own documentation

        Perfect for:
        -----------
        * Self-hosted Odoo CE/OCA deployments
        * White-label SaaS offerings
        * Internal enterprise deployments
        * Maintaining independence from odoo.com services

        Technical Details:
        -----------------
        * Pure JavaScript + SCSS implementation (no QWeb template overrides needed)
        * Runs on every backend page load
        * No impact on Odoo core functionality
        * Compatible with Odoo 16, 17, and 18 CE
    """,
    "version": "18.0.1.0.0",
    "category": "Tools",
    "author": "InsightPulseAI",
    "website": "https://insightpulseai.net",
    "license": "AGPL-3",
    "depends": ["web"],
    "data": [
        "views/assets_backend.xml",
    ],
    "assets": {},
    "installable": True,
    "application": False,
    "auto_install": False,
}
