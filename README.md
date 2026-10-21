# HUGO BOSS Search Playground

Hugo Boss-inspired presentation of [tamimi-search](https://github.com/chris9689/tamimi-search), retaining its Dynamic Yield search, Visual Search, Shopping Muse, and benchmark functionality.

## Requirements

- Node.js

## Local Setup

1. Install dependencies:
   `npm install`
2. Create `.env.local` with:
   - `VISUALSEARCH_API_KEY=...`
   - `SHOPPINGMUSE_API_KEY=...`
3. Start dev server:
   `npm run dev`

## Build

- Production build:
  `npm run build`

## Notes

- Search settings are configurable from the in-app config panel.
- Men/Women are opt-in gender filters (`male`/`female`, matching the feed). Neither is active on load. Home removes the gender selection while retaining the query and other facets; switching gender resets pagination. These controls use Standard API `query.filters` or Extended API `searchFilters`, never boosting. See the [Search API filter schema](https://dy.dev/reference/search).
- The same environment variables must be available in deployment.
- Default connection: section `8795532`, feed `991257`, widget `553283`, with euro currency. API modes and persisted configuration/persona keys are retained. Previously saved browser settings override defaults; use Settings to update or reset them.
- Custom logo upload remains available. The default local logo is extracted from the official [full_logo SVG symbol](https://www.hugoboss.com/on/demandware.static/Sites-IE-Site/-/default/dw502e9fd4/svg/all_svgs.svg#full_logo); a text wordmark remains as the load-error fallback.
- Wishlist, shopping bag, and recommended-sort affordances retain the source's preview-only behavior; this redesign does not add checkout or sorting functionality.

## Design Reference

Inspected the live [HUGO BOSS Ireland homepage](https://www.hugoboss.com/ie/home) on 20 October 2026 using rendered computed styles and screenshots:

- Black `#000000`, white `#ffffff`, secondary text `#595959`, thin gray dividers, and pale product backgrounds.
- Compact navigation, bold uppercase headings, square controls, portrait product imagery, and left-aligned product details.
- The live site uses AvertaPE (regular and bold, with 14px navigation and 28px section headings). This app uses Google Fonts' Manrope as an openly licensed substitute, retaining Noto Sans Arabic coverage. Proprietary font files and campaign imagery were not copied.
- Shared theme tokens also apply to search settings, overlays, personas, and benchmarking. API handlers, search hooks, response adapters, and benchmark logic are unchanged.

## Git Remotes

- `origin`: `https://github.com/chris9689/hb-search.git`
- `upstream`: `https://github.com/chris9689/tamimi-search.git`

## Verification

- `npm run build` runs TypeScript validation and the production Vite build.
- Browser checks cover desktop/mobile layouts, live search results, filtering, pagination, settings, request/network inspectors, visual-search and Muse entry points, and the benchmark route.
- Visual Search and Shopping Muse require their respective environment keys for end-to-end API calls.
