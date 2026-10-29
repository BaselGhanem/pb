# Power BI Layout Studio — X Academy

A premium, no-login, browser-based Power BI layout editor.

## Live editor
https://baselghanem.github.io/pb/

## Start in three clicks
1. Click Browse 120 layouts.
2. Filter/search by Executive, Sales, Finance, HR, Operations, Marketing, Healthcare, Retail, Customers, or Projects.
3. Choose a preview to apply it directly to your editable canvas.

The library contains **120 presets** composed from **12 genuinely different dashboard structures** across **10 business categories**, with matching preview thumbnails, search, categories, locally saved favorites and Surprise me.

The 12 structures: Classic Overview, Sidebar Command, KPI Scorecard, Hero Spotlight, Analytics Deep Dive, Insight Matrix, Performance Ribbon, Three-Column Studio, Comparison Board, Signal Monitor, Control Room and Editorial Focus.

## Quick Builder
Alternatively, select Quick Builder, choose the category, number of KPI cards (2, 3, 4 or 6), number of charts (1, 2 or 3), and top or side navigation. One click automatically builds an aligned layout. It preserves the current canvas dimensions and colors.

## Editing and exports
Drag/resize, exact coordinates, layers, undo/redo, themes, zoom, snap-to-grid, HD/Full HD/4K/custom sizes, automatic local storage and reusable project JSON. Export a PNG background without mock data, an optional design mockup PNG, Power BI theme JSON, exact visual coordinates and an entire ZIP package.

Use the PNG as a Power BI page background, import the report theme, then place actual Power BI visuals using the exported coordinates. **The app does not automatically generate data-bound report visuals or PBIR/PBIP files.** Chart values in the preview are demonstration data only.

## Implementation
- index.html: Editor and gallery interfaces
- styles.css and gallery.css: premium responsive styling
- layouts.js: 120 layout catalog and composition/preview engine
- app.js: interactive editor, storage, exports
- tests/layouts.test.js: geometry/overlap/quantity testing
- GitHub Actions: Pages deployment and validation

Static website, no registration, Firebase, backend, or JavaScript runtime libraries required.

Copyright X Academy. All rights reserved.
