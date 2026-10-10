# Sitemap Specification & File Content
# For domain: https://rcloud.dev
# Generated: October 10, 2026

## Overview
This document contains both the plain-text URLs (`sitemap.txt`) format and standard XML format (`sitemap.xml`) for R_Cloud public and authenticated documentation pages.

---

### Plain Text Sitemap (`sitemap.txt`)
Save the text below to `Frontend/public/sitemap.txt`:

```text
https://rcloud.dev/
https://rcloud.dev/features
https://rcloud.dev/pricing
https://rcloud.dev/docs
https://rcloud.dev/docs/getting-started
https://rcloud.dev/docs/ragent-spec
https://rcloud.dev/docs/api-reference
https://rcloud.dev/faq
https://rcloud.dev/privacy
https://rcloud.dev/terms
https://rcloud.dev/status
https://rcloud.dev/login
```

---

### Standard XML Sitemap (`sitemap.xml`)
Save the XML below to `Frontend/public/sitemap.xml` for search engines (Google, Bing):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>https://rcloud.dev/</loc>
    <lastmod>2026-10-10</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Features & Architecture -->
  <url>
    <loc>https://rcloud.dev/features</loc>
    <lastmod>2026-10-10</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Pricing -->
  <url>
    <loc>https://rcloud.dev/pricing</loc>
    <lastmod>2026-10-10</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Documentation Root -->
  <url>
    <loc>https://rcloud.dev/docs</loc>
    <lastmod>2026-10-10</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Getting Started Guide -->
  <url>
    <loc>https://rcloud.dev/docs/getting-started</loc>
    <lastmod>2026-10-10</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- ragent.yaml Specification -->
  <url>
    <loc>https://rcloud.dev/docs/ragent-spec</loc>
    <lastmod>2026-10-10</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- FAQ -->
  <url>
    <loc>https://rcloud.dev/faq</loc>
    <lastmod>2026-10-10</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Privacy Policy -->
  <url>
    <loc>https://rcloud.dev/privacy</loc>
    <lastmod>2026-10-10</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <!-- Terms of Service -->
  <url>
    <loc>https://rcloud.dev/terms</loc>
    <lastmod>2026-10-10</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>
```
