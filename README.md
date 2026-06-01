# Weekly Prospect Goal Calculator

A reverse-funnel leasing planner for Birchstone Residential. The calculator tells leasing teams how many new prospects they need to generate each week to hit an occupancy goal, working backward through known move-outs, estimated skips/evictions/expirations, and the conversion funnel.

Built with React and Vite. Deploys to Vercel.

---

## What this is — Phase 1 scope

- **Reverse-funnel math.** Inputs include unit count, occupancy goal, move-out forecast (known + estimated), current availability, and conversion funnel KPIs. The calculator outputs the Weekly Prospect Goal and a full funnel breakdown (prospects → tours → completed apps → secured leases) for the period.
- **Goal-setting via sliders.** A "Where's the Gap, Really?" section lets operators drag five lever sliders (tour conversion, application conversion, denial rate, cancellation rate, renewal retention) to explore how operational improvements would change the goal. Sliders are an exploration overlay and never modify the property's input data.
- **Six verdict states** that respond to current performance: at pace, beyond capacity, conversion clears it, multiple levers needed, date unreachable, and invalid rates.
- **Auto-save.** Property data and slider state persist across sessions via `localStorage`.
- **Print-friendly export.** "Download PDF" opens the system print dialog with a light-themed layout. The Final Goal Funnel card is promoted to the top of the printed page so teams can track operational goals at a glance.

---

## Local development

```bash
# Install
npm install

# Run dev server (opens http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview the production build locally
npm run preview
```

Node 18 or later is required.

---

## Deploying to Vercel

### Option 1 — Connect the GitHub repo (recommended)

1. Push this repo to GitHub.
2. In Vercel, click **Add New… → Project** and import the GitHub repo.
3. Vercel auto-detects Vite. Defaults work:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. Click **Deploy**. Future pushes to `main` deploy automatically; PRs get preview URLs.

### Option 2 — Vercel CLI

```bash
npm install -g vercel
vercel        # first run: prompts to link/create a project
vercel --prod # deploy to production
```

---

## Project structure

```
.
├── index.html                       # Vite entry, loads Montserrat font, contains global CSS
├── package.json                     # Dependencies and npm scripts
├── vite.config.js                   # Vite + React plugin config
├── public/                          # Static assets (currently empty)
├── src/
│   ├── main.jsx                     # React mount point
│   └── WeeklyProspectGoalCalculator.jsx  # The full calculator
└── .gitignore
```

Everything component-related — state, math engine, all the visual styles via a single `<style>` block — lives inside `WeeklyProspectGoalCalculator.jsx`. The file is intentionally self-contained: it imports React only. No CSS frameworks, no UI libraries. Global styles (body, font, range-input theming) live inline in `index.html`.

---

## Storage and privacy

- All input data persists in the browser via `localStorage`. **Nothing is sent to a server.**
- The storage key is `wpg_calculator_state_v1`. Clear it from the browser's devtools to reset entirely (or click the **Reset** button in the header).
- If the data shape changes in a future release, bump the version suffix in `STORAGE_KEY` to invalidate old saved state and start clean.

---

## Customization points

A few values are constants in `WeeklyProspectGoalCalculator.jsx` and may need adjusting per-portfolio:

- `WEEKLY_LEADS_PER_AGENT = 35` — used to compute team capacity (office staff × 35 leads/week).
- `BENCHMARKS = { p2t: 40, t2a: 40, denial: 10, cancel: 10, renewal: 55 }` — the conversion targets the verdict logic compares against.
- `DEFAULTS = { ... }` — the values pre-loaded on a fresh session (Birchstone Waterleigh-style sample data).

---

## Roadmap — Phase 2 candidates

- Per-lever "what to check" expanders (e.g., for low tour-to-application conversion: review community appearance, sales process, follow-up cadence). Turns the calculator into a self-coaching tool.
- Per-property templates so stable values persist per community.
- Multi-property comparison view.
- Configurable per-portfolio benchmarks and capacity-per-agent value.
- Optional reconciliation block re-introduced in a different format (was removed in Phase 1 once math confidence was established).

---

## License

Internal use — Birchstone Residential.
