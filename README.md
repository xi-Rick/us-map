# 🗺️ Next.js US Map

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-purple?style=for-the-badge)

**An interactive, data-driven US map component built for React and Next.js.**

*Load your own data, drop it on the map, and watch it come alive.*

</div>

---

## 🌟 What Is This?

A production-ready, interactive US map component for React/Next.js applications. Click any state to explore data, load your own CSV/TSV/JSON/Excel files to visualize custom datasets, or connect to an API for real-time dashboards. Dark mode, smooth animations, and zero configuration required.

---

### ✨ Key Features

- 🗺️ **Interactive US Map** — all 50 states + DC with accurate boundaries, hover effects, and click-to-explore
- 📂 **Flexible Data Loading** — upload CSV, TSV, JSON, or Excel files; or fetch from any API endpoint
- 🔤 **Smart State Matching** — accepts 2-letter abbreviations (CA, TX), FIPS codes (06, 48), or full names (California, Texas)
- 🎨 **Dynamic Color Mapping** — automatic color scales based on your data values
- 🌙 **Dark Mode** — built-in theme toggle with smooth transitions
- ⚡ **Zero Config** — works out of the box with sensible defaults
- 📊 **Rich Data Panels** — tooltips and info panels that adapt to your dataset structure
- 🧩 **Nested Data Support** — auto-flattens nested objects (e.g., `metrics.gdp.total` → `metrics_gdp_total`)
- 📦 **Lightweight** — trimmed to 11 runtime dependencies

---

## 🚀 Quick Start

### Requirements

- Node.js 18+
- pnpm (recommended), npm, or yarn

### Install & Run

```bash
# Clone the repo
git clone https://github.com/xi-Rick/nextjs-us-map.git
cd nextjs-us-map

# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Serve production build |
| `pnpm lint` | Run ESLint |

---

## 📂 Supported Data Formats

The data loader accepts these formats via file upload or API:

| Format | Extension | Notes |
|--------|-----------|-------|
| CSV | `.csv` | Comma-separated, auto-detected headers |
| TSV | `.tsv` | Tab-separated |
| JSON | `.json` | Array, `{ states: [...] }`, or `{ data: [...] }` |
| Excel | `.xlsx` | First sheet is used |
| API | — | Any URL returning JSON |

### Data Structure

Your data just needs a state identifier column and at least one numeric field:

```json
[
  { "state": "CA", "value": 95, "growth_rate": 8.5 },
  { "state": "Texas", "value": 88, "growth_rate": 9.2 },
  { "state": "06", "value": 82, "growth_rate": 7.1 }
]
```

The loader automatically detects the state identifier from columns named `state`, `abbreviation`, `id`, `code`, `State`, or `Abbreviation`.

---

## 🔤 State ID Formats

All of these work interchangeably:

| Format | Example | Notes |
|--------|---------|-------|
| 2-letter abbreviation | `CA`, `TX`, `NY` | Most common |
| FIPS code | `06`, `48`, `36` | US Census Bureau codes |
| Full state name | `California`, `Texas` | Case-insensitive |

---

## 🧩 Project Structure

```
├── app/
│   ├── globals.css          # Theme variables, map overrides
│   ├── layout.tsx           # Root layout, ThemeProvider
│   └── page.tsx             # Single-page app
├── components/
│   ├── accurate-us-map.tsx  # Core map component
│   ├── data-loader.tsx      # CSV/TSV/JSON/XLSX parser
│   ├── feature-section.tsx  # Feature cards
│   ├── footer.tsx           # Site footer
│   ├── hero-section.tsx     # Hero banner
│   ├── navbar.tsx           # Navigation bar
│   └── theme-toggle.tsx     # Dark/light mode toggle
├── data/
│   └── states-data.ts       # Default state data & StateData type
├── lib/
│   └── utils.ts             # cn() utility
└── public/
    ├── sample-data.json     # Sample dataset (50 states)
    ├── us-map-icon.svg      # Project logo
    └── test-data.*          # Test datasets (CSV, TSV, XLSX)
```

---

## 🛡️ Tech Stack

| Library | Purpose |
|---------|---------|
| [Next.js 15](https://nextjs.org) | React framework |
| [React 19](https://react.dev) | UI library |
| [Tailwind CSS 4](https://tailwindcss.com) | Utility-first CSS |
| [@mirawision/usa-map-react](https://github.com/mirawision/usa-map-react) | US map SVG component |
| [next-themes](https://github.com/pacocoursey/next-themes) | Dark/light mode |
| [Framer Motion](https://www.framer.com/motion/) | Animations |
| [xlsx](https://github.com/SheetJS/sheetjs) | Excel file parsing |
| [lucide-react](https://lucide.dev) | Icons |

---

## 🤝 Contributing

Ideas, issues, and pull requests welcome!

```bash
git clone https://github.com/xi-Rick/nextjs-us-map.git
cd nextjs-us-map
pnpm install
pnpm dev
```

---

<div align="center">

**🗺️ Build stunning data visualizations with ease!**

*Made with 🩷 — by [Dana](https://github.com/xi-Rick)*

</div>
