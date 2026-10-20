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
- The same environment variables must be available in deployment.
- The original catalog identifiers, query, currency, API modes, and persisted configuration/persona keys are deliberately retained. The default results are not a HUGO BOSS catalog. Configure an authorized fashion feed and its currency in Settings to change the data source.
- Custom logo upload remains available. The default wordmark is rendered as text.
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
