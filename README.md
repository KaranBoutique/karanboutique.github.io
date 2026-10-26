# Karan Boutique website

A small, fast, mobile-first website for Karan Boutique, a ladies' tailoring boutique. Built with [Eleventy](https://www.11ty.dev/), so it outputs plain HTML that can be hosted free (Netlify, Cloudflare Pages or GitHub Pages).

## Run it

```sh
npm install
npm start          # local preview at http://localhost:8080
npm run build      # writes the site to _site/
npm run preview    # writes a single self-contained page to _preview/ (used for the claude.ai preview)
```

## Change the content

Almost everything lives in `src/_data/`. Edit the file, rebuild, and every page updates.

| File | What it holds |
| --- | --- |
| `business.json` | Address, phone, WhatsApp number, hours, Google Maps and review links, Instagram |
| `services.json` | Rate card: each service, its starting price (`price`) and days to make (`days`) |
| `gallery.json` | Photos of finished work, by type |
| `reviews.json` | Best Google reviews: `{ "name": "Priya", "stars": 5, "text": "..." }` |
| `shop.json` | Ready-made shop, off until `"enabled": true` |
| `site.json` | The site's web address once the domain is bought |

Placeholders are written in square brackets, like `"[City]"`, or left as `null` / `""`. They show on the page with a yellow highlight, and a banner at the top counts how many are left. JSON-LD (Google's business details) skips any placeholder automatically.

- **WhatsApp number**: digits with country code and no `+`, for example `919876543210`.
- **Phone**: `+919876543210` in `phone`, and the way you want it shown in `phoneDisplay`.
- **Hours for Google**: once known, fill `schemaHours`, for example `["Mo-Sa 10:00-20:00"]`.
- **Map**: paste the Google Maps share link into `mapsUrl`, and the "Embed a map" link into `mapEmbedUrl`.

## Add photos

Put photos in `src/photos/` and point to them from `gallery.json`, for example `"src": "/photos/red-bridal-lehenga.jpg"`. Photos straight from a phone are fine: the build resizes them and makes small AVIF and WebP copies so the page stays fast on mobile data.

## Turn on the shop later

1. Add products to `src/_data/shop.json` (name, price, sizes, photo, detail, inStock).
2. Set `"enabled": true`.

This publishes `/shop/` with an "Order on WhatsApp" button per product and adds Shop to the menu. Online payments (for example Razorpay) and delivery can be added on top when the shop grows.

## Publishing

The site is hosted free on GitHub Pages at https://karanboutique.github.io, from the `KaranBoutique/karanboutique.github.io` repository. Every push to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes it. In the repository's Settings → Pages, Source must be set to "GitHub Actions".

If a custom domain is ever bought: add it under Settings → Pages → Custom domain, add a `src/static/CNAME` file containing the domain, change `url` in `src/_data/site.json`, and point the domain's DNS at GitHub Pages.
