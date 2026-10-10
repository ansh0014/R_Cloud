# Robots.txt Specification & File Content
# For domain: https://rcloud.dev
# Generated: October 10, 2026

## Overview
This document specifies search engine crawler directives (`robots.txt`) for the R_Cloud frontend. It permits indexing of landing, documentation, and pricing pages while protecting private dashboards, execution proxies, and internal webhooks.

---

### Production `robots.txt` File Content
Save the text block below to `Frontend/public/robots.txt`:

```text
# ==========================================================
# R_Cloud Robots Directive File
# Domain: https://rcloud.dev
# ==========================================================

User-agent: *

# Allow Public & Marketing Pages
Allow: /
Allow: /features
Allow: /pricing
Allow: /docs
Allow: /docs/*
Allow: /faq
Allow: /privacy
Allow: /terms

# Disallow Private User & Admin Dashboard Routes
Disallow: /dashboard/
Disallow: /dashboard/*
Disallow: /admin/
Disallow: /admin/*
Disallow: /settings/
Disallow: /settings/*

# Disallow Internal APIs and Execution Proxies
Disallow: /api/
Disallow: /api/*
Disallow: /ws
Disallow: /oauth/

# Sitemap location
Sitemap: https://rcloud.dev/sitemap.xml
Sitemap: https://rcloud.dev/sitemap.txt
```

---

## Explanation of Rules for Frontend Team

1. **`User-agent: *`**
   - Applies to all standard search engine crawlers (Googlebot, Bingbot, DuckDuckBot, Baiduspider).

2. **Allowed (`Allow: /docs/*`, `/faq`, etc.)**
   - Ensures developers searching for documentation, `ragent.yaml` configurations, or pricing can discover R_Cloud via search engines.

3. **Disallowed (`Disallow: /dashboard/*`, `/api/*`)**
   - Protects confidential user workspaces, deployment IDs, live trace graphs, and execution API endpoints from being crawled or exposed in search index caches.

4. **Sitemaps**
   - Directs web crawlers to both XML and TXT sitemap files for faster URL indexing.
