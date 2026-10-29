# Power BI Layout Studio

A premium, zero-login, browser-based layout builder created for **X Academy**.

## Live editor
Open the published GitHub Pages site (once Pages is enabled for this repository).

## Features
- Visual designer for KPI cards, bar and line charts, donut charts, tables, slicers, titles, labels, dividers and navigation.
- Drag to position, resize with handles, use precise X/Y/width/height properties.
- Snap-to-grid, optional grid overlay, keyboard nudging and zoom-to-fit.
- Three complete templates: Midnight Teal, Ocean Intelligence and Arctic Canvas.
- Three color-world presets, accent/background/card color pickers, corner radius and glow.
- Duplicate, delete, align, change layer ordering, undo and redo.
- HD, Full HD, 4K and custom Power BI canvas dimensions.
- Automatic local saves, editable project JSON export and import.
- Clean PNG background without demo data, optional full mockup PNG.
- Power BI theme JSON, exact visual-layout JSON and a standalone ZIP package.

No build, login, Firebase, server, external JavaScript libraries or account is required.

## How to use
1. Choose a visual template or begin with the default.
2. Click a visual in the left panel to insert it.
3. Drag and resize on canvas. Use Properties for precise placement.
4. Adjust colors under Appearance. Preview and exports reflect your color choices.
5. Click **Export design** and choose **Complete design package**.
6. In Power BI Desktop, set the report page to the same custom pixel dimensions.
7. Apply background.png using image fit **Fit**, load the theme from **View > Themes > Browse for themes**, and use visual-layout.json as the positioning guide for real report visuals.

**Important:** The background and exported coordinates do not create data-bound Power BI visuals or a PBIR/PBIP project. Values and chart data in the preview are illustrative and are omitted from the clean background. Automatic PBIR project manipulation is outside this version.

## Files
- index.html — app structure
- styles.css — responsive visual system
- app.js — editor, rendering, local storage, image/ZIP/JSON export
- .github/workflows/pages.yml — automatic GitHub Pages publishing from main
- .github/workflows/verify.yml — JavaScript syntax and packaging checks

## Privacy
Design projects are stored in the browser's localStorage. Import, ZIP assembly and PNG rendering run locally. No project data is uploaded.

## Development
Static app; open index.html in a recent browser. To use GitHub Pages, enable GitHub Pages under repository Settings > Pages and select GitHub Actions if not already configured.

## License
Copyright X Academy. All rights reserved.
