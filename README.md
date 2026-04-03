# fintrack — Finance Dashboard (Tailwind CSS + JSON)

A single-file React finance dashboard styled entirely with **Tailwind CSS**, with data loaded from an embedded **JSON object** (simulating `fetch('/data.json')`). No axios, no backend, no extra libraries beyond Recharts.

---

## Quick Start

```bash
npm create vite@latest fintrack -- --template react
cd fintrack
npm install recharts
```

Then replace `src/App.jsx` with the contents of `FinanceDashboard.jsx`, and update `src/main.jsx`:

```jsx
// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import FinanceDashboard from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <FinanceDashboard />
  </React.StrictMode>
)
```

Add Tailwind to `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Install and configure Tailwind:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

`tailwind.config.js`:

```js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

```bash
npm run dev
```

---

## How JSON Data Works

The app ships a `DB_JSON` constant at the top of the file — this is the equivalent of a `data.json` file. On mount, `useEffect` fires a simulated async load (700ms delay to mimic a real fetch), then reads from `localStorage` if previous edits exist, or falls back to the original JSON:

```js
// Simulates: fetch('/data.json').then(r => r.json())
useEffect(() => {
  setTimeout(() => {
    setDb(loadFromJson())   // reads localStorage or DB_JSON
    setLoading(false)
  }, 700)
}, [])
```

Every mutation (add/edit/delete) writes back to `localStorage` via `saveToJson(db)`, so data persists across page refreshes. To reset, clear `localStorage`.

**To use a real JSON file**, replace `DB_JSON` with an actual fetch:

```js
useEffect(() => {
  fetch('/data.json')
    .then(r => r.json())
    .then(data => { setDb(data); setLoading(false) })
}, [])
```

---

## Features

| Feature | Details |
|---|---|
| **Overview tab** | 3 stat cards, balance area chart, spending donut, income vs expense bars, recent 6 transactions |
| **Transactions tab** | Search, type filter (all/income/expense), category dropdown, sort by date or amount, CSV/JSON export |
| **Insights tab** | Top category, savings rate, avg monthly income/spend, category progress bars, monthly comparison chart |
| **Role-based UI** | Admin: add, edit, delete, export — Viewer: read-only |
| **Dark / Light mode** | Full theme toggle |
| **Data persistence** | All changes saved to localStorage |
| **Loading skeleton** | Pulse skeleton shown while JSON "loads" |
| **Empty state** | Graceful empty state in transactions table |
| **Responsive** | Sidebar collapses on mobile with overlay |

---

## Styling Approach

- **Tailwind CSS** for all layout, spacing, color, hover, and responsive styles
- **Custom fonts** (Syne + JetBrains Mono) injected via Google Fonts at runtime — only what Tailwind can't do
- **Keyframe animations** (`fadeUp`) added via a `<style>` tag — Tailwind CDN doesn't compile custom keyframes
- **Color palette**: zinc dark backgrounds, gold (`#e8c547`) as primary accent, emerald for income, red for expense
- All inline `style={}` props are limited to dynamic values (category colors from JSON data, hover state overrides)
