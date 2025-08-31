
# CookBook Planner (PWA)

A sleek, modern React + Tailwind PWA to plan and store recipes with images, choose ingredients from a prefilled list (and add custom ones), and generate a combined purchase list from selected recipes. Data is stored locally in your browser (localStorage).

## Features
- Add recipes with title, description, ingredients, and an image (stored as data URL).
- Prefilled ingredient picker + custom ingredient field.
- Select recipes on the home page.
- Generate an aggregated purchase list and export as `.txt`.
- Installable PWA with offline caching via a simple service worker.

## Get started
```bash
npm install
npm run dev
```

## Build for production
```bash
npm run build
npm run preview
```

## Notes
- This project uses a lightweight custom service worker for caching. For advanced PWA needs, consider Vite PWA plugins or Workbox.
- All data is kept in localStorage; clear site data to reset.
