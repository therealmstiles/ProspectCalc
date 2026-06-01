import React, { useState, useEffect, useMemo, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────
// Weekly Prospect Goal — Birchstone Residential
// Reverse-funnel pacing model. Logic preserved; styling per Birchstone DS.
// ─────────────────────────────────────────────────────────────────────────

const BENCHMARKS = {
  p2t: 40,
  t2a: 40,
  denial: 10,
  cancel: 10,
  renewal: 55,
};

const WEEKLY_LEADS_PER_AGENT = 35;

// Operational diagnostic library — what to review when a KPI underperforms.
// Hardcoded for consistency across the portfolio; per-property overrides come later.
const DIAGNOSTICS = {
  p2t: {
    label: "Prospect to Tour Conversion",
    items: [
      "Response time to inquiries",
      "Adequate office coverage",
      "Scheduling friction — can prospects easily book a tour online?",
      "Online reputation and review scores across major platforms",
      "Drive-up appeal and exterior condition — landscaping, seasonal flowers, trash areas, patios, overall first impression",
      "Wayfinding and arrival — adequate visitor parking and accurate property location on online maps",
      "Review recent Leasing Evaluation performance, Missed Call Reports, and prospect engagement rates",
    ],
  },
  t2a: {
    label: "Tour to Application Conversion",
    items: [
      "Community appearance and curb appeal",
      "Sales process consistency across all leasing agents",
      "Follow-up cadence within 24 hours after every tour",
      "Model unit condition and tour path quality",
      "Leasing agent training on closing and overcoming objections",
      "Pricing competitiveness vs. comparable communities in market",
      "Review recent Onsite Lease Evaluations",
    ],
  },
  denial: {
    label: "Denial Rate",
    items: [
      "Screening criteria alignment with market and unit class",
      "Source quality — which channels produce denial-prone applicants?",
      "Application completeness, clarity of instructions, and required documentation",
      "Pre-screening conversations at the tour stage to set qualification expectations",
    ],
  },
  cancel: {
    label: "Cancellation Rate",
    items: [
      "Timely processing of lease paperwork — applications shouldn't sit waiting between steps",
      "Deposit and admin fee structure — is the financial commitment appropriate?",
      "Time between application submission and move-in date",
      "Communication cadence and touch points during application processing",
      "Move-in readiness of the assigned unit",
      "Welcome and onboarding touch points before move-in day",
    ],
  },
  renewal: {
    label: "Renewal Retention",
    items: [
      "Pricing strategy vs. current market comps",
      "Resident communication at 90, 60, and 30 days before lease end",
      "Service request response times and resident satisfaction",
      "Community programming, events, and amenity activation",
      "Renewal incentive structure",
      "Timely processing of lease paperwork — renewal offers and signed documents shouldn't sit",
    ],
  },
  traffic: {
    label: "Weekly Prospect Generation",
    items: [
      "Lead source mix — which channels are producing tourable prospects?",
      "Internet Listing Services — listing quality",
      "Property website content — updated photos, published specials, preferred employer information available and accurate",
      "Online reputation and review scores driving organic discovery",
      "Pricing and specials reviewed for competitiveness",
      "Local marketing partnerships and outreach to corporate accounts and relocation services",
      "Drive-up appeal and exterior condition — landscaping, seasonal flowers, trash areas, patios, overall first impression",
      "Wayfinding and access — adequate visitor parking and accurate property location on online maps",
    ],
  },
};

const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');

.wpg * { box-sizing: border-box; margin: 0; padding: 0; }
.wpg {
  font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: linear-gradient(135deg, #0a1929 0%, #1a365d 50%, #0a1929 100%);
  color: #fff;
  min-height: 100%;
  padding: 2rem 1.5rem 3rem;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
.wpg .wrap { max-width: 1200px; margin: 0 auto; }

/* ── Header ── */
.wpg .kicker {
  font-size: 0.78rem; font-weight: 700; color: #2cb1cc;
  letter-spacing: 0.18em; text-transform: uppercase;
  margin: 0 0 0.6rem 0;
}
.wpg h1 {
  font-size: 2rem; font-weight: 800; color: #fff;
  margin: 0; letter-spacing: -0.01em; line-height: 1.15; max-width: 22ch;
}
.wpg h1 .accent { color: #2cb1cc; font-weight: 800; }
.wpg .title-block { flex: 1; min-width: 280px; }
.wpg .brand-row {
  display: flex; align-items: center; gap: 1rem;
}
.wpg .brandmark {
  flex: none;
  width: 52px; height: 52px;
  object-fit: contain;
  display: block;
}
.wpg .sub {
  color: rgba(255,255,255,0.75); font-size: 0.95rem; max-width: 65ch;
  margin: 0.85rem 0 1.75rem;
}

/* ── Grid layout ── */
.wpg .grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; align-items: start;
}

/* ── Cards / panels ── */
.wpg .panel {
  background: linear-gradient(135deg, rgba(4,65,96,0.75) 0%, rgba(12,41,60,0.85) 100%);
  border: 1px solid rgba(44,177,204,0.3);
  border-radius: 16px;
  padding: 1.75rem;
  margin-bottom: 1.5rem;
}
.wpg .ph {
  display: flex; align-items: center; justify-content: space-between;
  margin: -1.75rem -1.75rem 1.5rem;
  padding: 0.95rem 1.5rem;
  min-height: 56px;
  background: linear-gradient(135deg, #044160 0%, #0a2a44 100%);
  border-bottom: 1px solid rgba(44,177,204,0.3);
  border-radius: 16px 16px 0 0;
  gap: 0.75rem;
}
.wpg .ph h2 {
  font-size: 1.05rem; font-weight: 700; color: #fff; margin: 0;
  letter-spacing: 0.01em;
}
.wpg .ph .tag {
  font-size: 0.68rem; letter-spacing: 0.1em; text-transform: uppercase;
  color: #2cb1cc; font-weight: 700;
  background: rgba(44,177,204,0.15);
  padding: 0.28rem 0.65rem; border-radius: 12px;
}

/* ── Form fields ── */
.wpg .field { margin-bottom: 1rem; }
.wpg .field:last-child { margin-bottom: 0; }
.wpg label {
  display: block; font-size: 0.85rem; font-weight: 600;
  color: rgba(255,255,255,0.9); margin-bottom: 0.5rem;
}
.wpg .hint {
  color: rgba(255,255,255,0.5); font-weight: 400; font-size: 0.75rem;
}
.wpg input[type=number],
.wpg input[type=text],
.wpg input[type=date] {
  width: 100%;
  padding: 0.875rem 1rem;
  background: rgba(12,41,60,0.4);
  border: 1px solid rgba(44,177,204,0.3);
  border-radius: 8px;
  color: #fff;
  font-size: 0.95rem;
  outline: none;
  min-height: 48px;
  font-family: inherit;
  color-scheme: dark;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.wpg input:focus {
  border-color: #2cb1cc;
  box-shadow: 0 0 0 3px rgba(44,177,204,0.18);
}
.wpg .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.wpg .row3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }

/* ── Subhead dividers (Known / Estimated) ── */
.wpg .subhead {
  font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase;
  color: #2cb1cc; font-weight: 700;
  margin: 1.25rem 0 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(44,177,204,0.15);
}

/* ── Derived value rows ── */
.wpg .derived {
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  padding: 0.875rem 1rem;
  color: rgba(255,255,255,0.7);
  font-size: 0.85rem;
  display: flex; justify-content: space-between; align-items: center; gap: 0.75rem;
  margin-top: 1rem;
}
.wpg .derived b {
  color: #2cb1cc; font-weight: 800; font-size: 1rem; white-space: nowrap;
}

/* ── Goal slider ── */
.wpg .goalrow { display: flex; align-items: center; gap: 1rem; }
.wpg .goalbig {
  font-size: 2rem; font-weight: 800; color: #2cb1cc; min-width: 100px;
}
.wpg input[type=range] {
  -webkit-appearance: none; width: 100%; height: 6px;
  border-radius: 4px; background: rgba(255,255,255,0.1); margin-top: 0.25rem;
}
.wpg input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none; width: 22px; height: 22px; border-radius: 50%;
  background: #2cb1cc; cursor: pointer; border: 3px solid #1a365d;
  box-shadow: 0 2px 8px rgba(44,177,204,0.4);
}

/* ── Hero (Weekly Prospect Goal) ── */
.wpg .hero {
  background: rgba(44,177,204,0.12);
  border: 1px solid rgba(44,177,204,0.4);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 1.5rem;
}
.wpg .hero .lab {
  font-size: 0.75rem; font-weight: 700; color: #2cb1cc;
  letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.75rem;
}
.wpg .hero .big {
  font-size: 3rem; font-weight: 800; color: #fff;
  line-height: 1; letter-spacing: -0.02em;
}
.wpg .hero .big small {
  font-size: 1rem; font-weight: 500; color: rgba(255,255,255,0.6);
  margin-left: 0.75rem; letter-spacing: 0;
}
.wpg .hero .occ-strip {
  display: flex; align-items: baseline; gap: 0.5rem;
  margin-top: 0.9rem; padding: 0.55rem 0.85rem;
  background: rgba(0,0,0,0.18); border-radius: 6px;
  border-left: 3px solid rgba(255,255,255,0.55);
  width: fit-content; max-width: 100%; flex-wrap: wrap;
}
.wpg .hero .occ-strip .occ-now {
  font-size: 1.1rem; font-weight: 700; color: #fff;
  font-variant-numeric: tabular-nums;
}
.wpg .hero .occ-strip .occ-arrow {
  color: rgba(255,255,255,0.55); font-weight: 700; font-size: 1rem;
}
.wpg .hero .occ-strip .occ-goal {
  font-size: 1.1rem; font-weight: 800; color: #fff;
  font-variant-numeric: tabular-nums;
}
.wpg .hero .occ-strip .occ-cap {
  font-size: 0.66rem; font-weight: 700; letter-spacing: 0.08em;
  text-transform: uppercase; color: rgba(255,255,255,0.6);
  margin-left: 0.4rem;
}
.wpg .hero .per {
  color: rgba(255,255,255,0.85); font-size: 0.95rem; margin-top: 0.875rem;
}
.wpg .hero .per b { color: #fff; font-weight: 700; }
.wpg .hero .dates {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
  margin-top: 1.5rem; padding-top: 1.25rem;
  border-top: 1px solid rgba(44,177,204,0.25);
}
.wpg .hero .dt {
  font-size: 0.7rem; font-weight: 700; color: rgba(44,177,204,0.85);
  letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.3rem;
}
.wpg .hero .dv {
  font-size: 1.125rem; font-weight: 700; color: #fff;
}

/* ── Verdict states ── */
.wpg .verdict {
  margin-top: 1.25rem; border-radius: 8px; padding: 1rem 1.25rem;
  font-size: 0.9rem; display: flex; gap: 0.75rem;
  align-items: flex-start; line-height: 1.5;
}
.wpg .verdict.ok {
  background: rgba(44,177,204,0.15); border: 1px solid rgba(44,177,204,0.4);
  color: #fff;
}
.wpg .verdict.warn {
  background: rgba(251,191,36,0.15); border: 1px solid rgba(251,191,36,0.4);
  color: #fde68a;
}
.wpg .verdict.short {
  background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.4);
  color: #fca5a5;
}
.wpg .verdict .icon { flex: none; font-size: 1.05rem; line-height: 1.4; }
.wpg .verdict b { color: #fff; font-weight: 700; }
.wpg .verdict.warn b { color: #fde68a; }
.wpg .verdict.short b { color: #fca5a5; }
.wpg .vbody { flex: 1; }
.wpg .vbody p { margin: 0; }
.wpg .verdict-list {
  list-style: disc; margin: 0.55rem 0 0; padding-left: 1.25rem;
}
.wpg .verdict-list li { margin: 0.25rem 0; line-height: 1.45; }

/* ── Funnel breakdown ── */
.wpg .fcap {
  font-size: 0.7rem; font-weight: 700; color: #2cb1cc;
  letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 1.25rem;
}
.wpg .frow { margin-bottom: 1rem; }
.wpg .frow .ftop {
  display: flex; justify-content: space-between; align-items: baseline;
  margin-bottom: 0.4rem;
}
.wpg .frow .fname { font-size: 0.9rem; font-weight: 600; color: #fff; }
.wpg .frow .fname span {
  color: rgba(255,255,255,0.5); font-weight: 400; font-size: 0.8rem; margin-left: 0.25rem;
}
.wpg .frow .fval { font-size: 1.1rem; font-weight: 800; color: #2cb1cc; }
.wpg .bar {
  height: 8px; border-radius: 4px; background: rgba(255,255,255,0.1); overflow: hidden;
}
.wpg .bar > span {
  display: block; height: 100%; background: #2cb1cc; transition: width 0.3s ease;
}
.wpg .frow.lease .bar > span {
  background: linear-gradient(90deg, #2cb1cc 0%, #0891a0 100%);
}

/* ── Stats grid ── */
.wpg .stats {
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; margin-top: 1.5rem;
}
.wpg .stat {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(44,177,204,0.2);
  border-radius: 8px; padding: 1rem;
}
.wpg .stat .sl {
  font-size: 0.7rem; font-weight: 700; color: rgba(44,177,204,0.85);
  letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.4rem;
}
.wpg .stat .sv {
  font-size: 1.5rem; font-weight: 800; color: #fff;
}

/* ── Diagnostic panel ── */
.wpg .diag .dh {
  font-size: 1rem; font-weight: 700; color: #2cb1cc; margin-bottom: 0.4rem;
}
.wpg .diag .ds {
  font-size: 0.85rem; color: rgba(255,255,255,0.7);
  margin-bottom: 1rem; line-height: 1.5; max-width: 60ch;
}
.wpg .scen {
  display: grid; grid-template-columns: 1fr auto auto; gap: 1rem;
  padding: 0.875rem 0; font-size: 0.9rem; align-items: center;
  border-top: 1px solid rgba(44,177,204,0.15);
}
.wpg .scen:first-of-type { border-top: none; padding-top: 0.25rem; }
.wpg .scen .nm { color: #fff; font-weight: 600; }
.wpg .scen .nm em {
  font-style: normal; color: rgba(255,255,255,0.55); font-size: 0.78rem;
  display: block; margin-top: 0.2rem; font-weight: 400;
}
.wpg .scen .val {
  font-weight: 800; color: #fff; font-size: 1.1rem;
  text-align: right; min-width: 60px;
}
.wpg .scen .vs {
  font-size: 0.7rem; letter-spacing: 0.05em; text-transform: uppercase;
  font-weight: 700; padding: 0.4rem 0.75rem; border-radius: 6px;
  min-width: 90px; text-align: center;
}
.wpg .scen .vs.ok {
  background: rgba(44,177,204,0.15); border: 1px solid rgba(44,177,204,0.4); color: #2cb1cc;
}
.wpg .scen .vs.match {
  background: rgba(251,191,36,0.15); border: 1px solid rgba(251,191,36,0.4); color: #fbbf24;
}
.wpg .scen .vs.short {
  background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.4); color: #fca5a5;
}

.wpg .miss {
  margin-top: 1.25rem; padding-top: 1.25rem;
  border-top: 1px solid rgba(44,177,204,0.15);
}
.wpg .miss .lab {
  font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase;
  color: #2cb1cc; font-weight: 700; margin-bottom: 0.75rem;
}
.wpg .miss ul { list-style: none; padding: 0; margin: 0; }
.wpg .miss li {
  font-size: 0.875rem; color: rgba(255,255,255,0.9);
  padding: 0.35rem 0; display: flex; align-items: center; gap: 0.6rem;
}
.wpg .miss li .pip {
  width: 7px; height: 7px; border-radius: 50%; background: #ef4444; flex: none;
}
.wpg .miss li .meta {
  color: rgba(255,255,255,0.55); font-size: 0.8rem; margin-left: 0.25rem;
}
.wpg .miss .none { font-size: 0.875rem; color: #2cb1cc; font-style: italic; }

/* ── Occupancy Check (reconciliation) ── */
.wpg .reconcile {
  margin-top: 1rem; padding: 0.85rem 1rem;
  background: rgba(44,177,204,0.06);
  border: 1px solid rgba(44,177,204,0.25);
  border-radius: 8px;
}
.wpg .reconcile .rec-head {
  font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase;
  color: #2cb1cc; font-weight: 700; margin-bottom: 0.55rem;
}
.wpg .reconcile .rec-row {
  display: flex; justify-content: space-between; align-items: baseline;
  font-size: 0.82rem; color: rgba(255,255,255,0.78);
  padding: 0.22rem 0; gap: 0.75rem;
}
.wpg .reconcile .rec-row b {
  color: #fff; font-weight: 700; font-variant-numeric: tabular-nums;
  text-align: right;
}
.wpg .reconcile .rec-row.sub {
  padding-left: 1rem;
  color: rgba(255,255,255,0.65);
  font-size: 0.8rem;
}
.wpg .reconcile .rec-row.sub b { color: rgba(255,255,255,0.85); }
.wpg .reconcile .rec-divider {
  margin-top: 0.6rem; padding-top: 0.5rem;
  border-top: 1px solid rgba(44,177,204,0.15);
  font-size: 0.74rem; color: rgba(255,255,255,0.5);
  font-style: italic; margin-bottom: 0.15rem;
}
.wpg .reconcile .rec-status {
  margin-top: 0.6rem; padding-top: 0.6rem;
  border-top: 1px solid rgba(44,177,204,0.15);
  font-size: 0.78rem; line-height: 1.45;
}
.wpg .reconcile .rec-status.ok   { color: #2cb1cc; }
.wpg .reconcile .rec-status.info { color: #fcd34d; }
.wpg .reconcile .rec-status.warn { color: #fca5a5; }

/* ── Diagnostic header row (title + reset sliders button) ── */
.wpg .dh-row {
  display: flex; justify-content: space-between; align-items: center;
  gap: 0.75rem; margin-bottom: 0.4rem; flex-wrap: wrap;
}
.wpg .dh-row .dh { margin-bottom: 0; }
.wpg .btn-reset-sliders {
  background: transparent; color: rgba(255,255,255,0.7);
  border: 1px solid rgba(44,177,204,0.4); border-radius: 6px;
  padding: 0.4rem 0.75rem; font-size: 0.72rem; font-weight: 600;
  letter-spacing: 0.05em; text-transform: uppercase; cursor: pointer;
  font-family: inherit; transition: all 0.15s ease;
}
.wpg .btn-reset-sliders:hover {
  background: rgba(44,177,204,0.1); color: #2cb1cc;
  border-color: rgba(44,177,204,0.7);
}

/* ── Lever sliders (interactive scenario rows) ── */
.wpg .lever {
  padding: 0.9rem 0;
  border-top: 1px solid rgba(44,177,204,0.15);
}
.wpg .lever:first-of-type { border-top: none; padding-top: 0.5rem; }
.wpg .lever .ltop {
  display: flex; justify-content: space-between; align-items: baseline;
  margin-bottom: 0.5rem; gap: 0.75rem;
}
.wpg .lever .llab {
  color: #fff; font-weight: 600; font-size: 0.92rem;
}
.wpg .lever .lval {
  color: #2cb1cc; font-weight: 800; font-size: 1.15rem;
  font-variant-numeric: tabular-nums;
  background: rgba(44,177,204,0.12);
  padding: 0.15rem 0.65rem; border-radius: 6px;
  min-width: 70px; text-align: center;
}
.wpg .lever input[type="range"] {
  width: 100%; display: block;
}
.wpg .lever .lrefs {
  display: flex; justify-content: space-between;
  font-size: 0.74rem; color: rgba(255,255,255,0.55);
  margin-top: 0.45rem; font-variant-numeric: tabular-nums;
}

/* ── Methodology note ── Spans full width on both tabs. */
.wpg .note {
  margin-top: 2rem; padding: 1.5rem 1.75rem;
  background: linear-gradient(135deg, rgba(44,177,204,0.1), rgba(44,177,204,0.04));
  border: 1px solid rgba(44,177,204,0.3);
  border-left: 4px solid #2cb1cc;
  border-radius: 10px;
  font-size: 0.85rem; color: rgba(255,255,255,0.78); line-height: 1.7;
  width: 100%;
}
.wpg .note b { color: #2cb1cc; font-weight: 700; }
.wpg .note p { margin: 0 0 0.75rem 0; }
.wpg .note p:last-child { margin-bottom: 0; }
.wpg .note ul {
  margin: 0 0 0.85rem 0; padding-left: 1.25rem;
}
.wpg .note ul li { margin: 0.3rem 0; line-height: 1.6; }

/* ── In-hero diagnostic ── */
.wpg .hero-diag {
  margin-top: 1.5rem; padding-top: 1.5rem;
  border-top: 1px solid rgba(44,177,204,0.3);
}
.wpg .hero-diag .dh {
  font-size: 0.95rem; font-weight: 700; color: #fff;
  margin-bottom: 0.35rem;
}
.wpg .hero-diag .ds {
  font-size: 0.8rem; color: rgba(255,255,255,0.7);
  margin-bottom: 0.9rem; line-height: 1.5;
}
.wpg .hero-diag .ds p { margin: 0 0 0.6rem 0; }
.wpg .hero-diag .ds p:last-child { margin-bottom: 0; }
.wpg .hero-diag .miss { background: transparent; }
.wpg .hero-diag .miss .lab { color: rgba(255,255,255,0.85); }

/* ── Tab bar ── */
.wpg .tabs {
  display: flex; gap: 0.25rem; margin: 0 0 1.5rem 0;
  border-bottom: 1px solid rgba(44,177,204,0.25);
  flex-wrap: wrap;
}
.wpg .tab {
  background: transparent; color: rgba(255,255,255,0.55);
  border: none; border-bottom: 3px solid transparent;
  padding: 0.85rem 1.25rem; font-size: 0.92rem; font-weight: 700;
  letter-spacing: 0.02em; cursor: pointer; font-family: inherit;
  transition: all 0.15s ease; margin-bottom: -1px;
}
.wpg .tab:hover { color: rgba(255,255,255,0.85); }
.wpg .tab.active {
  color: #2cb1cc;
  border-bottom-color: #2cb1cc;
}

/* ── Action Plan view ── */
.wpg .plan {
  display: flex; flex-direction: column; gap: 1.5rem;
}
.wpg .plan-head {
  background: linear-gradient(135deg, rgba(44,177,204,0.12), rgba(44,177,204,0.04));
  border: 1px solid rgba(44,177,204,0.35);
  border-radius: 12px; padding: 1.5rem;
}
.wpg .plan-head .ph-meta {
  display: flex; justify-content: space-between; flex-wrap: wrap;
  gap: 0.5rem; margin-bottom: 1.25rem;
}
.wpg .plan-head .ph-prop {
  color: #fff; font-weight: 700; font-size: 1.05rem;
}
.wpg .plan-head .ph-dates {
  color: rgba(255,255,255,0.65); font-size: 0.85rem;
}
.wpg .plan-head .ph-numbers {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
}
.wpg .plan-head .ph-num {
  background: rgba(0,0,0,0.2); border-radius: 8px; padding: 1rem;
  border-left: 3px solid rgba(255,255,255,0.25);
}
.wpg .plan-head .ph-num.committed {
  border-left-color: #2cb1cc;
  background: rgba(44,177,204,0.1);
}
.wpg .plan-head .ph-num-lab {
  font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: rgba(44,177,204,0.9);
  margin-bottom: 0.4rem;
}
.wpg .plan-head .ph-num-val {
  font-size: 2.25rem; font-weight: 800; color: #fff; line-height: 1;
  font-variant-numeric: tabular-nums;
}
.wpg .plan-head .ph-num-val small {
  font-size: 0.95rem; font-weight: 500; color: rgba(255,255,255,0.6);
  margin-left: 0.4rem;
}
.wpg .plan-head .ph-num-hint {
  font-size: 0.74rem; color: rgba(255,255,255,0.55);
  margin-top: 0.35rem; font-style: italic;
}
.wpg .plan-head .ph-feas {
  margin-top: 1rem; padding-top: 1rem;
  border-top: 1px solid rgba(44,177,204,0.2);
  font-size: 0.88rem; line-height: 1.45;
}
.wpg .feas.ok { color: #2cb1cc; }
.wpg .feas.warn { color: #fbbf24; }
.wpg .feas.short { color: #fca5a5; }

/* ── Plan sections ── */
.wpg .plan-section {
  background: linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
  border: 1px solid rgba(44,177,204,0.2);
  border-radius: 12px; padding: 1.5rem;
}
.wpg .plan-section-head {
  display: flex; justify-content: space-between; align-items: baseline;
  margin-bottom: 0.4rem; gap: 0.75rem; flex-wrap: wrap;
}
.wpg .plan-section-head h2 {
  margin: 0; font-size: 1.15rem; font-weight: 700; color: #fff;
}
.wpg .plan-tag {
  font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em;
  text-transform: uppercase; color: rgba(44,177,204,0.85);
  background: rgba(44,177,204,0.12); padding: 0.25rem 0.6rem;
  border-radius: 12px;
}
.wpg .plan-section-sub {
  font-size: 0.83rem; color: rgba(255,255,255,0.65);
  margin-bottom: 1rem; line-height: 1.5;
}
.wpg .plan-empty {
  font-size: 0.88rem; color: rgba(255,255,255,0.7); line-height: 1.6;
  padding: 1rem; background: rgba(0,0,0,0.15); border-radius: 8px;
  border: 1px dashed rgba(44,177,204,0.3);
}
.wpg .plan-empty b { color: #2cb1cc; font-weight: 700; }

/* ── Improvement card (committed) ── */
.wpg .improve-card {
  background: rgba(0,0,0,0.2); border: 1px solid rgba(44,177,204,0.18);
  border-radius: 8px; padding: 1.1rem 1.25rem; margin-top: 1rem;
}
.wpg .improve-card.committed-card { border-left: 4px solid #2cb1cc; }
.wpg .ic-head {
  display: flex; justify-content: space-between; align-items: baseline;
  margin-bottom: 1rem; gap: 0.75rem; flex-wrap: wrap;
}
.wpg .ic-title { font-size: 1.02rem; font-weight: 700; color: #fff; }
.wpg .ic-verb {
  color: #2cb1cc; font-weight: 800; text-transform: uppercase;
  font-size: 0.78rem; letter-spacing: 0.08em;
}
.wpg .ic-change {
  display: flex; align-items: baseline; gap: 0.4rem;
  font-variant-numeric: tabular-nums;
}
.wpg .ic-from {
  color: rgba(255,255,255,0.6); font-size: 0.95rem; font-weight: 600;
}
.wpg .ic-arrow { color: rgba(255,255,255,0.4); font-weight: 700; }
.wpg .ic-to { color: #2cb1cc; font-size: 1.15rem; font-weight: 800; }
.wpg .ic-delta {
  font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em;
  text-transform: uppercase; color: #2cb1cc;
  background: rgba(44,177,204,0.15); padding: 0.18rem 0.5rem;
  border-radius: 10px; margin-left: 0.35rem;
}
.wpg .ic-section-lab {
  font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: rgba(44,177,204,0.85);
  margin: 0.85rem 0 0.5rem;
}
.wpg .ic-section-lab:first-of-type { margin-top: 0; }

/* Diagnostic checklist */
.wpg .diag-list {
  list-style: none; padding: 0; margin: 0 0 0.5rem;
}
.wpg .diag-list li { margin: 0.3rem 0; }
.wpg .diag-item {
  display: flex; align-items: flex-start; gap: 0.6rem;
  font-size: 0.86rem; color: rgba(255,255,255,0.85);
  line-height: 1.45; cursor: pointer; padding: 0.2rem 0;
}
.wpg .diag-item .diag-num {
  flex: none; min-width: 1.4rem;
  color: #2cb1cc; font-weight: 700;
  font-variant-numeric: tabular-nums;
  margin-top: 0.05rem;
}
.wpg .diag-item input[type="checkbox"] {
  width: 16px; height: 16px; margin: 0.15rem 0 0; flex: none;
  accent-color: #2cb1cc; cursor: pointer;
}
.wpg .diag-item input[type="checkbox"]:checked + span {
  color: rgba(255,255,255,0.55);
  text-decoration: line-through;
}

/* Action items textarea */
.wpg .action-input {
  width: 100%; background: rgba(0,0,0,0.25);
  border: 1px solid rgba(44,177,204,0.25);
  border-radius: 6px; padding: 0.65rem 0.85rem;
  color: #fff; font-family: inherit; font-size: 0.88rem;
  line-height: 1.5; resize: vertical; min-height: 90px;
  transition: border-color 0.15s ease;
}
.wpg .action-input::placeholder {
  color: rgba(255,255,255,0.4); font-style: italic;
}
.wpg .action-input:focus {
  outline: none; border-color: rgba(44,177,204,0.6);
  background: rgba(0,0,0,0.32);
}
.wpg .action-input.optional {
  border-style: dashed; min-height: 70px;
}

/* Screen: hide the print-only action text rendering. */
.wpg .action-print { display: none; }

/* Prepared-on timestamp on Action Plan */
.wpg .prepared-on {
  font-size: 0.74rem; color: rgba(255,255,255,0.55);
  letter-spacing: 0.06em; text-transform: uppercase; font-weight: 700;
}
.wpg .prepared-strip {
  display: flex; justify-content: space-between; align-items: center;
  gap: 1rem; margin-bottom: 0.85rem; flex-wrap: wrap;
}
.wpg .prepared-by {
  display: flex; align-items: center; gap: 0.5rem; flex: 1; max-width: 320px;
}
.wpg .prepared-by-lab {
  font-size: 0.74rem; color: rgba(255,255,255,0.55);
  letter-spacing: 0.06em; text-transform: uppercase; font-weight: 700;
  white-space: nowrap;
}
.wpg .prepared-by-input {
  flex: 1; min-height: 32px; background: rgba(0,0,0,0.18);
  border: 1px solid rgba(44,177,204,0.3);
  border-radius: 4px; padding: 0.3rem 0.6rem;
  color: #fff; font-family: inherit; font-size: 0.85rem;
}
.wpg .prepared-by-input:focus {
  outline: none; border-color: rgba(44,177,204,0.7);
}
.wpg .prepared-by-input::placeholder { color: rgba(255,255,255,0.35); }
.wpg .prepared-by-print { display: none; }

/* Signatures block — rendered always but only shown on print via media query */
.wpg .signatures { display: none; }

/* Unchanged KPI rows */
.wpg .improve-card.unchanged-card {
  padding: 0; border-left: 4px solid rgba(255,255,255,0.15);
  background: rgba(0,0,0,0.12);
}
.wpg .uc-row {
  width: 100%; display: flex; align-items: center; gap: 1rem;
  background: transparent; border: none; padding: 0.9rem 1.25rem;
  color: #fff; font-family: inherit; cursor: pointer;
  text-align: left; transition: background 0.15s ease;
}
.wpg .uc-row:hover { background: rgba(44,177,204,0.05); }
.wpg .uc-name {
  flex: 1; font-weight: 600; font-size: 0.95rem;
}
.wpg .uc-val {
  color: rgba(255,255,255,0.7); font-weight: 700;
  font-size: 0.95rem; font-variant-numeric: tabular-nums;
  min-width: 60px; text-align: right;
}
.wpg .uc-toggle {
  color: #2cb1cc; font-size: 1.3rem; font-weight: 700;
  width: 24px; height: 24px; display: flex; align-items: center;
  justify-content: center; border: 1px solid rgba(44,177,204,0.3);
  border-radius: 4px;
}
.wpg .uc-body {
  padding: 0.5rem 1.25rem 1.1rem;
  border-top: 1px solid rgba(44,177,204,0.15);
}

@media (max-width: 760px) {
  .wpg .plan-head .ph-numbers { grid-template-columns: 1fr; }
  .wpg .ic-head { flex-direction: column; align-items: flex-start; }
}

/* ── Header bar (actions) ── */
.wpg .head {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;
}
.wpg .head .title-block { flex: 1; min-width: 280px; }
.wpg .actions {
  display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;
}
.wpg .btn {
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  min-height: 44px;
  display: inline-flex; align-items: center; gap: 0.4rem;
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
  border: none;
}
.wpg .btn.primary {
  background: linear-gradient(135deg, #2cb1cc 0%, #0891a0 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(44,177,204,0.25);
}
.wpg .btn.primary:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(44,177,204,0.35); }
.wpg .btn.secondary {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(44,177,204,0.3);
  color: #fff;
}
.wpg .btn.secondary:hover { background: rgba(255,255,255,0.12); }
.wpg .save-pip {
  font-size: 0.75rem; color: rgba(255,255,255,0.55);
  display: inline-flex; align-items: center; gap: 0.4rem;
  font-weight: 500;
}
.wpg .save-pip.saving { color: rgba(251,191,36,0.9); }
.wpg .save-pip.saved { color: #2cb1cc; }
.wpg .save-pip .dot {
  width: 6px; height: 6px; border-radius: 50%; background: currentColor;
  opacity: 0.7;
}

/* ── Print / PDF output — investor-presentation ready ── */
@media print {
  /* Brand colors for print:
     #044160 — Birchstone navy (primary, for all key text and headings)
     #0a2a44 — Deep navy (high-contrast values)
     #1a4d70 — Medium navy (secondary text)
     #5b7a92 — Slate-navy (de-emphasized text)
     #b8c8d8 — Light navy (borders, dividers)
     #eef3f7 — Pale navy (subtle backgrounds) */

  .wpg {
    background: #fff !important;
    color: #044160 !important;
    padding: 0 !important;
  }
  .wpg .actions, .wpg .save-pip { display: none !important; }

  /* Brand colors on all headings and labels */
  .wpg h1, .wpg h2, .wpg .kicker, .wpg .ph h2, .wpg .fcap,
  .wpg .subhead, .wpg .stat .sl, .wpg .hero .lab, .wpg .hero .dt,
  .wpg .miss .lab, .wpg .note b {
    color: #044160 !important;
  }

  /* All panel and card backgrounds: white with navy border */
  .wpg .panel, .wpg .hero {
    background: #fff !important;
    border: 1px solid #b8c8d8 !important;
    box-shadow: none !important;
    page-break-inside: avoid;
  }
  /* Panel header band on print — navy fill, white text */
  .wpg .panel .ph {
    background: #044160 !important;
    border-bottom: none !important;
  }
  .wpg .panel .ph h2 { color: #fff !important; }
  .wpg .panel .ph .tag {
    color: #fff !important;
    background: rgba(255,255,255,0.15) !important;
  }

  /* Body text */
  .wpg .sub, .wpg label, .wpg .hint, .wpg .derived,
  .wpg .scen .nm, .wpg .scen .nm em, .wpg .ds, .wpg .miss li,
  .wpg .miss li .meta, .wpg .note, .wpg .hero .per, .wpg .verdict {
    color: #1a4d70 !important;
  }

  /* Big numbers and key values */
  .wpg .hero .big, .wpg .stat .sv, .wpg .frow .fval,
  .wpg .hero .dv, .wpg .goalbig, .wpg .scen .val, .wpg .derived b {
    color: #044160 !important;
  }

  .wpg input { background: #fff !important; border-color: #b8c8d8 !important; color: #044160 !important; }
  .wpg .bar { background: #eef3f7 !important; }
  .wpg .bar > span { background: #044160 !important; }
  /* Logo prints as-is — white tile with black B reads cleanly on white paper as just the B */
  /* H1 accent in print: keep brand teal */
  .wpg h1 .accent { color: #2cb1cc !important; }
  .wpg .tabs { display: none !important; }

  /* "How It Computes" methodology box — branded treatment */
  .wpg .note {
    background: #eef3f7 !important;
    border: 1px solid #b8c8d8 !important;
    border-left: 4px solid #044160 !important;
    color: #1a4d70 !important;
  }

  /* ── Action Plan tab on print ── */
  .wpg .plan-head {
    background: #eef3f7 !important;
    border-color: #b8c8d8 !important;
  }
  .wpg .plan-head .ph-num {
    background: #fff !important;
    border-left-color: #5b7a92 !important;
  }
  .wpg .plan-head .ph-num.committed { border-left-color: #044160 !important; }
  .wpg .plan-head .ph-num-val,
  .wpg .plan-head .ph-prop,
  .wpg .plan-section-head h2,
  .wpg .ic-title,
  .wpg .uc-name { color: #044160 !important; }
  .wpg .plan-head .ph-num-lab,
  .wpg .plan-tag,
  .wpg .ic-verb,
  .wpg .ic-section-lab { color: #044160 !important; }
  .wpg .plan-tag { background: rgba(4,65,96,0.08) !important; }
  .wpg .plan-head .ph-dates,
  .wpg .plan-head .ph-num-hint,
  .wpg .plan-section-sub,
  .wpg .diag-item,
  .wpg .uc-val { color: #1a4d70 !important; }
  .wpg .ic-to { color: #044160 !important; }
  .wpg .ic-delta { background: rgba(4,65,96,0.1) !important; color: #044160 !important; }
  .wpg .plan-section,
  .wpg .improve-card { background: #fff !important; border-color: #b8c8d8 !important; }
  .wpg .improve-card.committed-card { border-left-color: #044160 !important; }
  .wpg .improve-card.unchanged-card { border-left-color: #5b7a92 !important; }

  /* Swap textareas for static text rendering so long action items show in full */
  .wpg .action-input { display: none !important; }
  .wpg .action-print {
    display: block !important;
    background: #fff !important;
    border: 1px solid #b8c8d8 !important;
    border-radius: 4px;
    padding: 0.6rem 0.85rem !important;
    color: #044160 !important;
    font-size: 0.9rem !important;
    line-height: 1.55 !important;
    white-space: pre-wrap !important;
    word-wrap: break-word !important;
    min-height: 0.5in;
    page-break-inside: avoid;
  }
  .wpg .action-print i { color: #5b7a92 !important; }

  .wpg .uc-toggle { display: none !important; }
  .wpg .uc-row { padding: 0.6rem 0 !important; }
  /* Force-expand all unchanged-KPI bodies on print so the plan is complete */
  .wpg .improve-card.unchanged-card .uc-body { display: block !important; }

  /* Prepared-on, prepared-by, and signature line */
  .wpg .prepared-on { color: #044160 !important; }
  .wpg .prepared-by-print {
    display: inline !important;
    font-size: 0.78rem;
    color: #044160 !important;
    font-weight: 600;
    margin-left: 0.4rem;
  }
  .wpg .prepared-by-lab { color: #044160 !important; }
  .wpg .prepared-by-input { display: none !important; }

  /* Signatures section — appears on print only, at the end of the Action Plan */
  .wpg .signatures {
    display: block !important;
    margin-top: 1.5rem;
    padding: 1.25rem 1.5rem;
    border: 1px solid #b8c8d8;
    border-radius: 10px;
    background: #fff;
    page-break-inside: avoid;
  }
  .wpg .signatures-title {
    color: #044160 !important;
    font-size: 0.78rem; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase;
    margin-bottom: 1rem;
  }
  .wpg .sig-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-top: 1.5rem;
  }
  .wpg .sig-block {
    border-bottom: 1px solid #044160;
    padding-bottom: 0.25rem;
    margin-bottom: 0.4rem;
    min-height: 1.5rem;
  }
  .wpg .sig-label {
    font-size: 0.72rem; color: #1a4d70 !important;
    letter-spacing: 0.05em;
  }

  /* Page break controls */
  .wpg .improve-card, .wpg .plan-head { page-break-inside: avoid; }
  .wpg .plan-section-head, .wpg h2 { page-break-after: avoid; }

  /* Diagnostic checkboxes — branded ✓ in navy */
  .wpg .diag-item input[type="checkbox"] {
    -webkit-appearance: none !important;
    appearance: none !important;
    width: 12px !important; height: 12px !important;
    border: 1.5px solid #044160 !important;
    border-radius: 2px !important;
    background: #fff !important;
    position: relative;
  }
  .wpg .diag-item input[type="checkbox"]:checked {
    background: #044160 !important;
  }
  .wpg .diag-item input[type="checkbox"]:checked::after {
    content: "✓"; position: absolute;
    top: -3px; left: 1px;
    font-size: 11px; font-weight: 700;
    color: #fff !important;
  }
  .wpg .diag-item input[type="checkbox"]:checked + span {
    color: #1a4d70 !important;
    text-decoration: none !important;
  }
  /* Numbered prefixes print in navy for clean reference */
  .wpg .diag-item .diag-num { color: #044160 !important; }

  /* Page setup — letter, generous margins, page numbers */
  @page {
    margin: 0.6in 0.55in 0.85in 0.55in;
    size: letter;
    @bottom-right {
      content: "Page " counter(page);
      font-family: "Montserrat", sans-serif;
      font-size: 9pt;
      color: #5b7a92;
    }
    @bottom-left {
      content: "Birchstone Residential";
      font-family: "Montserrat", sans-serif;
      font-size: 9pt;
      color: #5b7a92;
    }
  }

  /* Hero occupancy strip on print */
  .wpg .hero .occ-strip {
    background: #eef3f7 !important;
    border-left-color: #044160 !important;
  }
  .wpg .hero .occ-strip .occ-now,
  .wpg .hero .occ-strip .occ-goal { color: #044160 !important; }
  .wpg .hero .occ-strip .occ-cap,
  .wpg .hero .occ-strip .occ-arrow { color: #1a4d70 !important; }

  /* On Calculator print: hide the "Where's the Gap" exploration section — it's working
     content, the Action Plan tab is the polished planning output */
  .wpg .hero-diag { display: none !important; }

  /* Promote Final Goal Funnel above hero card on Calculator print */
  .wpg .rcol { display: flex; flex-direction: column; }
  .wpg .funnel-card { order: -1; margin-bottom: 1rem; }

  /* Verdict boxes on print */
  .wpg .verdict.ok { background: #eef3f7 !important; border-color: #044160 !important; color: #044160 !important; }
  .wpg .verdict.warn { background: #fef3c7 !important; border-color: #b45309 !important; color: #78350f !important; }
  .wpg .verdict.short { background: #fee2e2 !important; border-color: #b91c1c !important; color: #7f1d1d !important; }
  .wpg .verdict b { color: inherit !important; }
  .wpg .verdict.ok b { color: #044160 !important; }
  .wpg .note { background: #f1f5f9 !important; border-left-color: #0c293c !important; }
  .wpg .grid { grid-template-columns: 1fr 1fr !important; gap: 1rem !important; }
  .wpg .miss li .pip { background: #b91c1c !important; }
  @page { margin: 0.5in; }
}

/* ── Mobile ── */
@media (max-width: 768px) {
  .wpg { padding: 1.25rem 1rem 2rem; }
  .wpg .grid { grid-template-columns: 1fr; gap: 1rem; }
  .wpg .row3 { grid-template-columns: 1fr 1fr; }
  .wpg .stats { grid-template-columns: 1fr 1fr; }
  .wpg h1 { font-size: 1.5rem; }
  .wpg .hero { padding: 1.5rem; }
  .wpg .hero .big { font-size: 2.5rem; }
  .wpg .panel { padding: 1.25rem; }
}
`;

const num = (v) => {
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};
const f0 = (v) => Math.round(num(v)).toLocaleString();
const ceil = (v) => Math.ceil(num(v) - 1e-9);
const fmtDate = (d) =>
  d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

function Field({ label, hint, value, set, step = 1, type = "number", min, max }) {
  return (
    <div className="field">
      <label>
        {label} {hint && <span className="hint">— {hint}</span>}
      </label>
      <input
        type={type}
        step={type === "number" ? step : undefined}
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          if (type !== "number") { set(v); return; }
          if (v === "") { set(""); return; }
          const n = parseFloat(v);
          if (!Number.isFinite(n)) { set(""); return; }
          let clamped = n;
          if (min !== undefined && clamped < min) clamped = min;
          if (max !== undefined && clamped > max) clamped = max;
          set(clamped);
        }}
      />
    </div>
  );
}

export default function WeeklyProspectGoalCalculator() {
  // Identity & goal
  const [propertyName, setPropertyName] = useState("");
  const [units, setUnits] = useState(300);
  const [staffCount, setStaffCount] = useState(3);
  const [goal, setGoal] = useState(95);
  const [horizon, setHorizon] = useState(90);
  const [leadToLease, setLeadToLease] = useState(30);
  const [today, setToday] = useState(() => new Date().toISOString().split("T")[0]);

  // Current vacancy
  const [vacant, setVacant] = useState(8);
  const [pastMoveIn, setPastMoveIn] = useState(1);

  // Move-Out Forecast — Known + Estimated
  const [notices, setNotices] = useState(15);
  const [eviction, setEviction] = useState(3);
  const [monthlySkips, setMonthlySkips] = useState(2);
  const [remainingExp, setRemainingExp] = useState(25);
  const [renewalRate, setRenewalRate] = useState(40);

  // Conversion funnel
  const [p2t, setP2t] = useState(35);
  const [t2a, setT2a] = useState(38);
  const [denial, setDenial] = useState(10);
  const [cancel, setCancel] = useState(10);

  // Current generation
  const [curWeekly, setCurWeekly] = useState(25);

  // Operator-reported current occupancy — used as a sanity check, not in core math.
  // The calculator computes "implied" occupancy from vacancy inputs and reconciles.
  const [currentOccupancy, setCurrentOccupancy] = useState(92.3);

  // Lever sliders — exploration overlay; drive results but never touch input fields.
  // Each slider has a "touched" flag: untouched sliders auto-track their input field,
  // touched sliders stay where the operator left them until Reset.
  const [p2tSlider, setP2tSlider]         = useState(35);
  const [t2aSlider, setT2aSlider]         = useState(38);
  const [denialSlider, setDenialSlider]   = useState(10);
  const [cancelSlider, setCancelSlider]   = useState(10);
  const [renewalSlider, setRenewalSlider] = useState(40);
  const [p2tTouched, setP2tTouched]         = useState(false);
  const [t2aTouched, setT2aTouched]         = useState(false);
  const [denialTouched, setDenialTouched]   = useState(false);
  const [cancelTouched, setCancelTouched]   = useState(false);
  const [renewalTouched, setRenewalTouched] = useState(false);

  // Action Plan tab state — persisted alongside everything else.
  // Action items are preserved across slider changes; if a KPI moves between
  // committed and unchanged, the team's writing stays.
  const [activeTab, setActiveTab] = useState("calculator");
  const [preparedBy, setPreparedBy] = useState("");
  const [actionItems, setActionItems] = useState({
    p2t: "", t2a: "", denial: "", cancel: "", renewal: "", traffic: "",
  });
  const [diagnosticChecks, setDiagnosticChecks] = useState({
    p2t: {}, t2a: {}, denial: {}, cancel: {}, renewal: {}, traffic: {},
  });
  const [expandedUnchanged, setExpandedUnchanged] = useState({});

  // Persistence
  const STORAGE_KEY = "wpg_calculator_state_v1";
  const [isLoaded, setIsLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved
  const saveTimer = useRef(null);

  const DEFAULTS = {
    propertyName: "", units: 300, staffCount: 3, goal: 95, horizon: 90, leadToLease: 30,
    today: new Date().toISOString().split("T")[0],
    vacant: 8, pastMoveIn: 1, notices: 15, eviction: 3, monthlySkips: 2,
    remainingExp: 25, renewalRate: 40,
    p2t: 35, t2a: 38, denial: 10, cancel: 10, curWeekly: 25,
    currentOccupancy: 92.3,
    p2tSlider: 35, t2aSlider: 38, denialSlider: 10, cancelSlider: 10, renewalSlider: 40,
    p2tTouched: false, t2aTouched: false, denialTouched: false, cancelTouched: false, renewalTouched: false,
    activeTab: "calculator",
    preparedBy: "",
    actionItems: { p2t: "", t2a: "", denial: "", cancel: "", renewal: "", traffic: "" },
    diagnosticChecks: { p2t: {}, t2a: {}, denial: {}, cancel: {}, renewal: {}, traffic: {} },
    expandedUnchanged: {},
  };

  const applyState = (s) => {
    if (s.propertyName !== undefined) setPropertyName(s.propertyName);
    if (s.units !== undefined) setUnits(s.units);
    if (s.staffCount !== undefined) setStaffCount(s.staffCount);
    if (s.goal !== undefined) setGoal(s.goal);
    if (s.horizon !== undefined) setHorizon(s.horizon);
    if (s.leadToLease !== undefined) setLeadToLease(s.leadToLease);
    if (s.today !== undefined) setToday(s.today);
    if (s.vacant !== undefined) setVacant(s.vacant);
    if (s.pastMoveIn !== undefined) setPastMoveIn(s.pastMoveIn);
    if (s.notices !== undefined) setNotices(s.notices);
    if (s.eviction !== undefined) setEviction(s.eviction);
    if (s.monthlySkips !== undefined) setMonthlySkips(s.monthlySkips);
    if (s.remainingExp !== undefined) setRemainingExp(s.remainingExp);
    if (s.renewalRate !== undefined) setRenewalRate(s.renewalRate);
    if (s.p2t !== undefined) setP2t(s.p2t);
    if (s.t2a !== undefined) setT2a(s.t2a);
    if (s.denial !== undefined) setDenial(s.denial);
    if (s.cancel !== undefined) setCancel(s.cancel);
    if (s.curWeekly !== undefined) setCurWeekly(s.curWeekly);
    if (s.currentOccupancy !== undefined) setCurrentOccupancy(s.currentOccupancy);
    if (s.p2tSlider !== undefined) setP2tSlider(s.p2tSlider);
    if (s.t2aSlider !== undefined) setT2aSlider(s.t2aSlider);
    if (s.denialSlider !== undefined) setDenialSlider(s.denialSlider);
    if (s.cancelSlider !== undefined) setCancelSlider(s.cancelSlider);
    if (s.renewalSlider !== undefined) setRenewalSlider(s.renewalSlider);
    if (s.p2tTouched !== undefined) setP2tTouched(s.p2tTouched);
    if (s.t2aTouched !== undefined) setT2aTouched(s.t2aTouched);
    if (s.denialTouched !== undefined) setDenialTouched(s.denialTouched);
    if (s.cancelTouched !== undefined) setCancelTouched(s.cancelTouched);
    if (s.renewalTouched !== undefined) setRenewalTouched(s.renewalTouched);
    if (s.activeTab !== undefined) setActiveTab(s.activeTab);
    if (s.preparedBy !== undefined) setPreparedBy(s.preparedBy);
    if (s.actionItems !== undefined) setActionItems(s.actionItems);
    if (s.diagnosticChecks !== undefined) setDiagnosticChecks(s.diagnosticChecks);
    if (s.expandedUnchanged !== undefined) setExpandedUnchanged(s.expandedUnchanged);
  };

  // Load on mount
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          applyState(saved);
        }
      }
    } catch (e) {
      // No saved state or parse error; continue with defaults
    } finally {
      setIsLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save (debounced) whenever any field changes
  useEffect(() => {
    if (!isLoaded) return;
    if (typeof window === "undefined" || !window.localStorage) return;

    setSaveStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
          propertyName, units, staffCount, goal, horizon, leadToLease, today,
          vacant, pastMoveIn, notices, eviction, monthlySkips, remainingExp, renewalRate,
          p2t, t2a, denial, cancel, curWeekly, currentOccupancy,
          p2tSlider, t2aSlider, denialSlider, cancelSlider, renewalSlider,
          p2tTouched, t2aTouched, denialTouched, cancelTouched, renewalTouched,
          activeTab, preparedBy, actionItems, diagnosticChecks, expandedUnchanged,
        }));
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 1800);
      } catch (e) {
        setSaveStatus("idle");
      }
    }, 500);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [propertyName, units, staffCount, goal, horizon, leadToLease, today,
      vacant, pastMoveIn, notices, eviction, monthlySkips, remainingExp, renewalRate,
      p2t, t2a, denial, cancel, curWeekly, currentOccupancy,
      p2tSlider, t2aSlider, denialSlider, cancelSlider, renewalSlider,
      p2tTouched, t2aTouched, denialTouched, cancelTouched, renewalTouched,
      activeTab, preparedBy, actionItems, diagnosticChecks, expandedUnchanged, isLoaded]);

  const handleReset = () => {
    applyState(DEFAULTS);
  };

  // Untouched sliders auto-track their input field — so first-time setup just works.
  // Once an operator moves a slider, it decouples until Reset Sliders clears the flag.
  useEffect(() => { if (!p2tTouched)     setP2tSlider(num(p2t)); },           [p2t, p2tTouched]);
  useEffect(() => { if (!t2aTouched)     setT2aSlider(num(t2a)); },           [t2a, t2aTouched]);
  useEffect(() => { if (!denialTouched)  setDenialSlider(num(denial)); },     [denial, denialTouched]);
  useEffect(() => { if (!cancelTouched)  setCancelSlider(num(cancel)); },     [cancel, cancelTouched]);
  useEffect(() => { if (!renewalTouched) setRenewalSlider(num(renewalRate)); }, [renewalRate, renewalTouched]);

  const resetSliders = () => {
    setP2tSlider(num(p2t));
    setT2aSlider(num(t2a));
    setDenialSlider(num(denial));
    setCancelSlider(num(cancel));
    setRenewalSlider(num(renewalRate));
    setP2tTouched(false);
    setT2aTouched(false);
    setDenialTouched(false);
    setCancelTouched(false);
    setRenewalTouched(false);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const r = useMemo(() => {
    const U = num(units), G = num(goal) / 100, H = num(horizon), L = num(leadToLease);
    const months = H / 30;

    const known = num(notices) + num(eviction);
    const skipsEst = num(monthlySkips) * months;
    const expirationLoss = num(remainingExp) * (1 - renewalSlider / 100);
    const estimated = skipsEst + Math.max(0, expirationLoss);
    const totalMoveOuts = known + estimated;

    const exposure = num(vacant) + num(pastMoveIn) + totalMoveOuts;
    const targetVacant = U * (1 - G);
    const leasesNeeded = Math.max(0, exposure - targetVacant);

    const appSurvival = (100 - denialSlider - cancelSlider) / 100;
    const t2aRate = t2aSlider / 100;
    const p2tRate = p2tSlider / 100;
    const validRates = appSurvival > 0 && t2aRate > 0 && p2tRate > 0;

    const appsNeeded     = validRates ? leasesNeeded / appSurvival : 0;
    const toursNeeded    = validRates ? appsNeeded / t2aRate       : 0;
    const prospectsNeeded = validRates ? toursNeeded / p2tRate     : 0;

    const effWindowDays = H - L;
    const reachable = effWindowDays > 0;
    const effWeeks = effWindowDays / 7;
    const weeklyGoal = (validRates && reachable) ? prospectsNeeded / effWeeks : 0;

    const baseDate = today ? new Date(today + "T00:00:00") : new Date();
    const goalDate = new Date(baseDate.getTime() + H * 86400000);
    const acqDeadline = new Date(goalDate.getTime() - L * 86400000);

    const netConv = prospectsNeeded > 0 ? (leasesNeeded / prospectsNeeded) * 100 : 0;

    // At-benchmark scenario — used by Sequence-3 verdict ("conversion alone clears it")
    const p2tB = Math.max(p2tSlider, BENCHMARKS.p2t);
    const t2aB = Math.max(t2aSlider, BENCHMARKS.t2a);
    const denialB = Math.min(denialSlider, BENCHMARKS.denial);
    const cancelB = Math.min(cancelSlider, BENCHMARKS.cancel);
    const survB = (100 - denialB - cancelB) / 100;
    const prospectsAtBench = (leasesNeeded / survB) / (t2aB / 100) / (p2tB / 100);
    const weeklyAtBench = reachable ? prospectsAtBench / effWeeks : 0;

    const misses = {
      p2t:    p2tSlider    < BENCHMARKS.p2t    - 0.01,
      t2a:    t2aSlider    < BENCHMARKS.t2a    - 0.01,
      denial: denialSlider > BENCHMARKS.denial + 0.01,
      cancel: cancelSlider > BENCHMARKS.cancel + 0.01,
    };
    const anyMiss = misses.p2t || misses.t2a || misses.denial || misses.cancel;

    // Staffing capacity ceiling
    const weeklyCapacity = Math.max(0, num(staffCount)) * WEEKLY_LEADS_PER_AGENT;
    const capacityExceeded = validRates && reachable && ceil(weeklyGoal) > weeklyCapacity;

    return {
      known, skipsEst, expirationLoss, estimated, totalMoveOuts,
      exposure, targetVacant, leasesNeeded,
      appsNeeded, toursNeeded, prospectsNeeded, weeklyGoal,
      reachable, validRates, goalDate, acqDeadline,
      netConv, prospectsAtBench, weeklyAtBench, misses, anyMiss,
      weeklyCapacity, capacityExceeded,
    };
  }, [units, staffCount, goal, horizon, leadToLease, today, vacant, pastMoveIn, notices, eviction,
      monthlySkips, remainingExp, curWeekly,
      p2tSlider, t2aSlider, denialSlider, cancelSlider, renewalSlider]);

  const maxFunnel = Math.max(r.prospectsNeeded, 1);
  const w = (v) => `${Math.min(100, (num(v) / maxFunnel) * 100)}%`;

  return (
    <div className="wpg">
      <style>{STYLE}</style>
      <div className="wrap">
        <div className="head">
          <div className="title-block">
            <div className="kicker">
              Birchstone Residential · {propertyName ? propertyName : "Leasing Operations"}
            </div>
            <div className="brand-row">
              <img className="brandmark" src="data:image/png;base64,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" alt="Birchstone" />
              <h1>Weekly Prospect Goal <span className="accent">Calculator</span></h1>
            </div>
            <p className="sub">
              Tells you how many new prospects you need each week to hit your occupancy
              goal — working backward through expected move-outs, your conversion rates, and
              the time it takes to turn a prospect into a move-in.
            </p>
          </div>
          <div className="actions">
            {saveStatus !== "idle" && (
              <span className={`save-pip ${saveStatus}`}>
                <span className="dot" />
                {saveStatus === "saving" ? "Saving…" : "Saved"}
              </span>
            )}
            <button className="btn secondary" onClick={handleReset}>↻ Reset</button>
            <button className="btn primary" onClick={handleDownloadPDF}>📄 Download PDF</button>
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div className="tabs" role="tablist">
          <button
            role="tab"
            className={`tab ${activeTab === "calculator" ? "active" : ""}`}
            onClick={() => setActiveTab("calculator")}
            aria-selected={activeTab === "calculator"}
          >
            Calculator
          </button>
          <button
            role="tab"
            className={`tab ${activeTab === "action-plan" ? "active" : ""}`}
            onClick={() => setActiveTab("action-plan")}
            aria-selected={activeTab === "action-plan"}
          >
            Summary &amp; Action Plan
          </button>
        </div>

        {activeTab === "calculator" && (
        <div className="grid">
          {/* ── INPUTS ── */}
          <div>
            <div className="panel">
              <div className="ph"><h2>Property &amp; Goal</h2><span className="tag">Target</span></div>
              <Field label="Property Name" value={propertyName} set={setPropertyName} type="text" />
              <div className="field">
                <label>Occupancy Goal</label>
                <div className="goalrow">
                  <span className="goalbig">{num(goal).toFixed(1)}%</span>
                  <input type="range" min="80" max="100" step="0.5" value={goal}
                    onChange={(e) => setGoal(parseFloat(e.target.value))} />
                </div>
              </div>
              <Field label="Current Occupancy %" value={currentOccupancy} set={setCurrentOccupancy} step={0.1} min={0} max={100} />
              <div className="row2">
                <Field label="Total Units" value={units} set={setUnits} min={1} />
                <Field label="Current # of Office Staff" value={staffCount} set={setStaffCount} min={0} />
              </div>
              <div className="row2">
                <Field label="Days to Goal" hint="how many days ahead are you planning?" value={horizon} set={setHorizon} min={1} />
                <Field label="Lead-to-Lease" hint="avg days from first contact to move-in" value={leadToLease} set={setLeadToLease} min={0} />
              </div>
              <Field label="Today's Date" value={today} set={setToday} type="date" />
            </div>

            <div className="panel">
              <div className="ph"><h2>Move-Out Forecast</h2><span className="tag">During the Window</span></div>
              <div className="subhead" style={{ marginTop: 0, paddingTop: 0, borderTop: 0 }}>Known</div>
              <div className="row2">
                <Field label="Notices to Vacate" hint="NTVs without a future lease signed" value={notices} set={setNotices} min={0} />
                <Field label="Under Eviction but not on NTV" hint="currently being processed" value={eviction} set={setEviction} min={0} />
              </div>
              <div className="subhead">Estimated</div>
              <Field label="Avg Skips + Evictions / Month" hint="monthly average of unplanned move-outs" value={monthlySkips} set={setMonthlySkips} step={0.1} min={0} />
              <div className="row2">
                <Field label="Remaining Expirations" hint="leases ending in this window without a renewal decision yet" value={remainingExp} set={setRemainingExp} min={0} />
                <Field label="Renewal %" hint="% of expiring leases that renew" value={renewalRate} set={setRenewalRate} step={0.1} min={0} max={100} />
              </div>
              <div className="derived">
                <span>Known {f0(r.known)} + potential skips/evictions {f0(r.skipsEst)} + potential renewals vacating {f0(r.expirationLoss)}</span>
                <b>{f0(r.totalMoveOuts)}</b>
              </div>
            </div>

            <div className="panel">
              <div className="ph"><h2>Current Availability</h2></div>
              <div className="row2">
                <Field label="Unrented Vacant Units" hint="Ready and Not Ready · no future lease signed" value={vacant} set={setVacant} min={0} />
                <Field label="Leased Past Move-In Date" hint="signed lease, resident hasn't moved in yet" value={pastMoveIn} set={setPastMoveIn} min={0} />
              </div>
              <div className="derived">
                <span>Functionally vacant · awaiting a lease or at risk</span>
                <b>{f0(num(vacant) + num(pastMoveIn))}</b>
              </div>
            </div>

            <div className="panel">
              <div className="ph"><h2>Conversion Funnel</h2><span className="tag">Pooled, Trailing Weeks</span></div>
              <div className="row2">
                <Field label="Prospect → Tour" hint="% of prospects who tour" value={p2t} set={setP2t} step={0.1} min={0} max={100} />
                <Field label="Tour → Completed App" hint="% of tours that submit an app" value={t2a} set={setT2a} step={0.1} min={0} max={100} />
              </div>
              <div className="row2">
                <Field label="Denial Rate" hint="% of completed apps denied" value={denial} set={setDenial} step={0.1} min={0} max={100} />
                <Field label="Cancellation Rate" hint="% of completed apps cancelled" value={cancel} set={setCancel} step={0.1} min={0} max={100} />
              </div>
              <Field label="Current Average New Prospects a Week" hint="avg traffic you generate now" value={curWeekly} set={setCurWeekly} min={0} />
            </div>
          </div>

          {/* ── RESULTS ── */}
          <div className="rcol">
            <div className="hero">
              <div className="lab">Weekly Prospect Goal (WPG)</div>
              <div className="big">
                {(r.reachable && r.validRates) ? ceil(r.weeklyGoal) : "—"}
                <small>per week</small>
              </div>

              <div className="occ-strip">
                <span className="occ-now">{num(currentOccupancy).toFixed(1)}%</span>
                <span className="occ-arrow">→</span>
                <span className="occ-goal">{num(goal).toFixed(1)}%</span>
                <span className="occ-cap">Current Occupancy → Goal</span>
              </div>
              {!r.reachable ? (
                <div className="per">
                  Your {f0(leadToLease)}-day lead-to-lease exceeds the {f0(horizon)}-day window —
                  new prospects can't mature into move-ins by the date.
                </div>
              ) : !r.validRates ? (
                <div className="per">
                  Conversion rates need attention before the goal can be computed.
                </div>
              ) : (
                <div className="per">
                  A total of <b>{f0(ceil(r.prospectsNeeded))}</b> new prospects between now and
                  the acquisition deadline to land at <b>{num(goal).toFixed(1)}%</b>.
                </div>
              )}

              <div className="dates">
                <div>
                  <div className="dt">📅 Goal date</div>
                  <div className="dv">{fmtDate(r.goalDate)}</div>
                </div>
                <div>
                  <div className="dt">📅 Last day to acquire</div>
                  <div className="dv">{r.reachable ? fmtDate(r.acqDeadline) : "—"}</div>
                </div>
              </div>

              {!r.reachable ? (
                <div className="verdict short">
                  <span className="icon">⚠️</span>
                  <span>
                    <b>The date isn't reachable through new traffic.</b> Anything you bring in
                    now moves in after the deadline — hitting it depends on applications already
                    in your pipeline, or moving the goal date later.
                  </span>
                </div>
              ) : !r.validRates ? (
                <div className="verdict warn">
                  <span className="icon">ℹ️</span>
                  <span>
                    <b>Set valid conversion rates to compute the goal.</b> Prospect→tour and
                    tour→app must be above 0%, and denial + cancellation must total less than
                    100%.
                  </span>
                </div>
              ) : (() => {
                const cur = ceil(r.weeklyGoal);
                const bench = ceil(r.weeklyAtBench);
                const cap = r.weeklyCapacity;
                const cw = num(curWeekly);

                // Build list of conversion KPIs below benchmark
                const missChips = [];
                if (r.misses.p2t)    missChips.push(`tour conversion (${p2tSlider.toFixed(0)}% → ${BENCHMARKS.p2t}%)`);
                if (r.misses.t2a)    missChips.push(`application conversion (${t2aSlider.toFixed(0)}% → ${BENCHMARKS.t2a}%)`);
                if (r.misses.denial) missChips.push(`denial rate (${denialSlider.toFixed(0)}% → ≤${BENCHMARKS.denial}%)`);
                if (r.misses.cancel) missChips.push(`cancellation rate (${cancelSlider.toFixed(0)}% → ≤${BENCHMARKS.cancel}%)`);
                const convList = missChips.length ? missChips.join(", ") : null;
                const retentionLever = `lift renewal % above ${renewalSlider.toFixed(0)}%`;
                const goalLever = "move the goal date later or lower the occupancy target";

                // State 1: at pace
                if (cw >= cur) {
                  return (
                    <div className="verdict ok">
                      <span className="icon">✓</span>
                      <span>
                        At <b>{f0(cw)} a week</b> you're generating enough new prospects. The
                        Weekly Prospect Goal is being set by exposure, not by a traffic shortfall.
                      </span>
                    </div>
                  );
                }

                // State 4: beyond capacity (most urgent — check before in-capacity states)
                if (r.capacityExceeded) {
                  return (
                    <div className="verdict short">
                      <span className="icon">⚠️</span>
                      <div className="vbody">
                        <p>
                          The new pace of <b>{cur} a week</b> may exceed the team's capacity to
                          process the volume effectively. Focus on one or more of the following
                          to reach your goals:
                        </p>
                        <ul className="verdict-list">
                          {r.misses.p2t    && <li>lift tour conversion above {p2tSlider.toFixed(0)}%</li>}
                          {r.misses.t2a    && <li>lift application conversion above {t2aSlider.toFixed(0)}%</li>}
                          {r.misses.denial && <li>lower denial rate below {denialSlider.toFixed(0)}%</li>}
                          {r.misses.cancel && <li>lower cancellation rate below {cancelSlider.toFixed(0)}%</li>}
                          <li>lift renewal % above {renewalSlider.toFixed(0)}%</li>
                          <li>move the goal date later</li>
                          <li>lower the occupancy target</li>
                        </ul>
                      </div>
                    </div>
                  );
                }

                // State 2: conversion alone clears it (within capacity)
                if (cw >= bench) {
                  return (
                    <div className="verdict warn">
                      <span className="icon">ℹ️</span>
                      <span>
                        <b>Traffic isn't the binding constraint.</b> Increasing{" "}
                        <b>{convList || "your conversion rates"}</b> to benchmark brings the goal
                        to <b>{bench} a week</b>, which is at or under your current {f0(cw)} average.
                      </span>
                    </div>
                  );
                }

                // State 3: within capacity but needs more than conversion
                return (
                  <div className="verdict short">
                    <span className="icon">⚠️</span>
                    <div className="vbody">
                      <p>
                        At benchmark conversion you'd still need <b>{bench} a week</b> vs your
                        current <b>{f0(cw)} average</b>. Focus on one or more of the following
                        to reach your goals:
                      </p>
                      <ul className="verdict-list">
                        {r.misses.p2t    && <li>lift tour conversion above {p2tSlider.toFixed(0)}%</li>}
                        {r.misses.t2a    && <li>lift application conversion above {t2aSlider.toFixed(0)}%</li>}
                        {r.misses.denial && <li>lower denial rate below {denialSlider.toFixed(0)}%</li>}
                        {r.misses.cancel && <li>lower cancellation rate below {cancelSlider.toFixed(0)}%</li>}
                        <li>lift renewal % above {renewalSlider.toFixed(0)}%</li>
                        <li>move the goal date later</li>
                        <li>lower the occupancy target</li>
                      </ul>
                    </div>
                  </div>
                );
              })()}

              {r.reachable && r.validRates && (
                <div className="hero-diag">
                  <div className="dh-row">
                    <div className="dh">📊 Where's the Gap, Really?</div>
                    <button className="btn-reset-sliders" onClick={resetSliders}>↻ Reset to Inputs</button>
                  </div>
                  <div className="ds">
                    <p>
                      Explore how targeted operational improvements could help the community
                      move closer to its occupancy goal. Performance gains in key areas may
                      reduce the need for additional traffic or budget.
                    </p>
                    <p>
                      Your original inputs reflect the community's current performance levels.
                      Adjust each lever below to set improvement goals and see how stronger
                      performance could help close the occupancy gap. Changing a lever does not
                      alter the current performance data originally entered. Select <b>Reset to
                      Inputs</b> to return the improvement goals to the community's current
                      performance levels.
                    </p>
                  </div>

                  <div className="lever">
                    <div className="ltop">
                      <span className="llab">Tour Conversion</span>
                      <span className="lval">{p2tSlider.toFixed(1)}%</span>
                    </div>
                    <input type="range" min="0" max="100" step="0.5" value={p2tSlider}
                      onChange={(e) => { setP2tSlider(parseFloat(e.target.value)); setP2tTouched(true); }} />
                    <div className="lrefs">
                      <span>your input: {num(p2t).toFixed(1)}%</span>
                      <span>benchmark: ≥{BENCHMARKS.p2t}%</span>
                    </div>
                  </div>

                  <div className="lever">
                    <div className="ltop">
                      <span className="llab">Application Conversion</span>
                      <span className="lval">{t2aSlider.toFixed(1)}%</span>
                    </div>
                    <input type="range" min="0" max="100" step="0.5" value={t2aSlider}
                      onChange={(e) => { setT2aSlider(parseFloat(e.target.value)); setT2aTouched(true); }} />
                    <div className="lrefs">
                      <span>your input: {num(t2a).toFixed(1)}%</span>
                      <span>benchmark: ≥{BENCHMARKS.t2a}%</span>
                    </div>
                  </div>

                  <div className="lever">
                    <div className="ltop">
                      <span className="llab">Denial Rate</span>
                      <span className="lval">{denialSlider.toFixed(1)}%</span>
                    </div>
                    <input type="range" min="0" max="100" step="0.5" value={denialSlider}
                      onChange={(e) => { setDenialSlider(parseFloat(e.target.value)); setDenialTouched(true); }} />
                    <div className="lrefs">
                      <span>your input: {num(denial).toFixed(1)}%</span>
                      <span>ceiling: ≤{BENCHMARKS.denial}%</span>
                    </div>
                  </div>

                  <div className="lever">
                    <div className="ltop">
                      <span className="llab">Cancellation Rate</span>
                      <span className="lval">{cancelSlider.toFixed(1)}%</span>
                    </div>
                    <input type="range" min="0" max="100" step="0.5" value={cancelSlider}
                      onChange={(e) => { setCancelSlider(parseFloat(e.target.value)); setCancelTouched(true); }} />
                    <div className="lrefs">
                      <span>your input: {num(cancel).toFixed(1)}%</span>
                      <span>ceiling: ≤{BENCHMARKS.cancel}%</span>
                    </div>
                  </div>

                  <div className="lever">
                    <div className="ltop">
                      <span className="llab">Renewal Retention</span>
                      <span className="lval">{renewalSlider.toFixed(1)}%</span>
                    </div>
                    <input type="range" min="0" max="100" step="0.5" value={renewalSlider}
                      onChange={(e) => { setRenewalSlider(parseFloat(e.target.value)); setRenewalTouched(true); }} />
                    <div className="lrefs">
                      <span>your input: {num(renewalRate).toFixed(1)}%</span>
                      <span>benchmark: ≥{BENCHMARKS.renewal}%</span>
                    </div>
                  </div>

                  <div className="miss">
                    <div className="lab">KPIs Below Target</div>
                    {(r.anyMiss || renewalSlider < BENCHMARKS.renewal - 0.01) ? (
                      <ul>
                        {r.misses.p2t    && <li><span className="pip" />Prospect → Tour <span className="meta">{p2tSlider.toFixed(1)}% vs {BENCHMARKS.p2t}%</span></li>}
                        {r.misses.t2a    && <li><span className="pip" />Tour → Completed App <span className="meta">{t2aSlider.toFixed(1)}% vs {BENCHMARKS.t2a}%</span></li>}
                        {r.misses.denial && <li><span className="pip" />Denial Rate <span className="meta">{denialSlider.toFixed(1)}% vs ≤{BENCHMARKS.denial}%</span></li>}
                        {r.misses.cancel && <li><span className="pip" />Cancellation Rate <span className="meta">{cancelSlider.toFixed(1)}% vs ≤{BENCHMARKS.cancel}%</span></li>}
                        {renewalSlider < BENCHMARKS.renewal - 0.01 && <li><span className="pip" />Renewal Retention <span className="meta">{renewalSlider.toFixed(1)}% vs ≥{BENCHMARKS.renewal}%</span></li>}
                      </ul>
                    ) : (
                      <div className="none">✓ All KPIs are at or above target.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="panel funnel-card">
              <div className="fcap">📊 Final Goal Funnel · Total Through {fmtDate(r.goalDate)}</div>

              <div className="frow">
                <div className="ftop"><span className="fname">New Prospects</span>
                  <span className="fval">{f0(ceil(r.prospectsNeeded))}</span></div>
                <div className="bar"><span style={{ width: w(r.prospectsNeeded) }} /></div>
              </div>
              <div className="frow">
                <div className="ftop"><span className="fname">Tours <span>· {p2tSlider.toFixed(1)}% of prospects</span></span>
                  <span className="fval">{f0(ceil(r.toursNeeded))}</span></div>
                <div className="bar"><span style={{ width: w(r.toursNeeded) }} /></div>
              </div>
              <div className="frow">
                <div className="ftop"><span className="fname">Completed Apps <span>· {t2aSlider.toFixed(1)}% of tours</span></span>
                  <span className="fval">{f0(ceil(r.appsNeeded))}</span></div>
                <div className="bar"><span style={{ width: w(r.appsNeeded) }} /></div>
              </div>
              <div className="frow lease">
                <div className="ftop"><span className="fname">Secured Leases <span>· after {denialSlider.toFixed(1)}% deny + {cancelSlider.toFixed(1)}% cancel</span></span>
                  <span className="fval">{f0(ceil(r.leasesNeeded))}</span></div>
                <div className="bar"><span style={{ width: w(r.leasesNeeded) }} /></div>
              </div>

              <div className="stats">
                <div className="stat"><div className="sl">Total Exposure</div><div className="sv">{f0(r.exposure)}</div></div>
                <div className="stat"><div className="sl">Leases Needed</div><div className="sv">{f0(ceil(r.leasesNeeded))}</div></div>
                <div className="stat"><div className="sl">Weekly Prospect Goal</div><div className="sv">{(r.reachable && r.validRates) ? ceil(r.weeklyGoal) : "—"}</div></div>
              </div>
            </div>
          </div>
        </div>
        )}

        {activeTab === "action-plan" && (() => {
          // Compute "WPG at current inputs" — what the goal would be if no
          // improvements were made. This uses input values, not slider values.
          const U = num(units), G = num(goal) / 100, H = num(horizon), L = num(leadToLease);
          const months = H / 30;
          const known = num(notices) + num(eviction);
          const skipsEst = num(monthlySkips) * months;
          const inputExpLoss = num(remainingExp) * (1 - num(renewalRate) / 100);
          const inputMoveOuts = known + skipsEst + Math.max(0, inputExpLoss);
          const inputExposure = num(vacant) + num(pastMoveIn) + inputMoveOuts;
          const inputLeases = Math.max(0, inputExposure - U * (1 - G));
          const inputSurv = (100 - num(denial) - num(cancel)) / 100;
          const inputT2A = num(t2a) / 100, inputP2T = num(p2t) / 100;
          const effWindow = (H - L) / 7;
          const inputValidRates = inputSurv > 0 && inputT2A > 0 && inputP2T > 0;
          const inputWeeklyGoal = (effWindow > 0 && inputValidRates)
            ? (inputLeases / inputSurv / inputT2A / inputP2T) / effWindow
            : 0;

          const committedWeeklyGoal = r.weeklyGoal;
          const cw = num(curWeekly);

          // Per-KPI improvement diff. Positive `diff` = team is committing to an improvement.
          // For P2T, T2A, renewal: improvement = slider > input.
          // For denial, cancel: improvement = slider < input.
          const buildDiff = (key, inputVal, sliderVal, direction) => {
            const delta = direction === "up" ? sliderVal - inputVal : inputVal - sliderVal;
            const committed = delta > 0.5;
            return {
              key,
              label: DIAGNOSTICS[key].label,
              inputVal, sliderVal,
              delta: Math.abs(sliderVal - inputVal),
              direction, committed,
            };
          };

          const diffs = [
            buildDiff("p2t",    num(p2t),         p2tSlider,     "up"),
            buildDiff("t2a",    num(t2a),         t2aSlider,     "up"),
            buildDiff("denial", num(denial),      denialSlider,  "down"),
            buildDiff("cancel", num(cancel),      cancelSlider,  "down"),
            buildDiff("renewal", num(renewalRate), renewalSlider, "up"),
          ];

          // Traffic is a special lever — not a slider, computed from target vs current.
          // Committed when the target requires more new prospects per week than the team
          // currently generates (a meaningful gap, more than 1).
          const trafficTarget = (r.reachable && r.validRates) ? ceil(committedWeeklyGoal) : null;
          if (trafficTarget != null) {
            const trafficDelta = Math.max(0, trafficTarget - cw);
            diffs.push({
              key: "traffic",
              label: DIAGNOSTICS.traffic.label,
              inputVal: cw,
              sliderVal: trafficTarget,
              delta: trafficDelta,
              direction: "up",
              committed: trafficDelta > 1,
              isTraffic: true,
            });
          }

          const committed = diffs.filter((d) => d.committed);
          const unchanged = diffs.filter((d) => !d.committed);

          const updateActionItem = (key, text) => {
            setActionItems({ ...actionItems, [key]: text });
          };
          const toggleCheck = (kpiKey, itemIndex) => {
            const next = { ...diagnosticChecks };
            next[kpiKey] = { ...next[kpiKey], [itemIndex]: !next[kpiKey][itemIndex] };
            setDiagnosticChecks(next);
          };
          const toggleExpand = (kpiKey) => {
            setExpandedUnchanged({ ...expandedUnchanged, [kpiKey]: !expandedUnchanged[kpiKey] });
          };

          // Feasibility one-liner against current weekly traffic
          const targetW = trafficTarget;
          let feasibility = null;
          if (targetW != null) {
            if (targetW <= cw) {
              feasibility = (
                <span className="feas ok">
                  ✓ Target of <b>{targetW} a week</b> is at or below your current <b>{cw} a week</b> average —
                  achievable without generating additional traffic. Surplus of {cw - targetW} a week.
                </span>
              );
            } else if (targetW <= r.weeklyCapacity) {
              feasibility = (
                <span className="feas warn">
                  Target of <b>{targetW} a week</b> is <b>{targetW - cw} a week above</b> your current <b>{cw} a week</b> average.
                  Your team will need to generate more new prospects each week to reach this goal.
                </span>
              );
            } else {
              feasibility = (
                <span className="feas short">
                  ⚠️ Target of <b>{targetW} a week</b> exceeds team capacity of <b>{f0(r.weeklyCapacity)} a week</b> —
                  set more aggressive improvement targets, extend the timeline, or adjust the occupancy goal.
                </span>
              );
            }
          }

          return (
            <div className="plan">
              {/* ── Plan Header ── */}
              <div className="plan-head">
                <div className="prepared-strip">
                  <div className="prepared-on">
                    Prepared {fmtDate(new Date(today + "T00:00:00"))}
                  </div>
                  <div className="prepared-by">
                    <label htmlFor="prepared-by-input" className="prepared-by-lab">Prepared by</label>
                    <input
                      id="prepared-by-input"
                      className="prepared-by-input"
                      type="text"
                      value={preparedBy}
                      onChange={(e) => setPreparedBy(e.target.value)}
                      placeholder="Your name"
                    />
                    <span className="prepared-by-print">{preparedBy || "—"}</span>
                  </div>
                </div>
                <div className="ph-meta">
                  <div className="ph-prop">
                    {propertyName || "Property"} · {num(currentOccupancy).toFixed(1)}% → {num(goal).toFixed(1)}%
                  </div>
                  <div className="ph-dates">
                    Period: {fmtDate(new Date(today + "T00:00:00"))} → {fmtDate(r.goalDate)}
                  </div>
                </div>
                <div className="ph-numbers">
                  <div className="ph-num">
                    <div className="ph-num-lab">WPG at Current Performance</div>
                    <div className="ph-num-val">{inputValidRates ? ceil(inputWeeklyGoal) : "—"}<small>per week</small></div>
                    <div className="ph-num-hint">if no operational changes</div>
                  </div>
                  <div className="ph-num committed">
                    <div className="ph-num-lab">WPG with Committed Improvements</div>
                    <div className="ph-num-val">{targetW != null ? targetW : "—"}<small>per week</small></div>
                    <div className="ph-num-hint">if improvement targets are hit</div>
                  </div>
                </div>
                {feasibility && <div className="ph-feas">{feasibility}</div>}
              </div>

              {/* ── Committed Improvements ── */}
              <div className="plan-section">
                <div className="plan-section-head">
                  <h2>Committed Improvements</h2>
                  <span className="plan-tag">{committed.length} {committed.length === 1 ? "lever" : "levers"} targeted</span>
                </div>

                {committed.length === 0 ? (
                  <div className="plan-empty">
                    Move the lever sliders on the <b>Calculator</b> tab to set improvement targets.
                    Each improvement will appear here with operational areas to review and a space
                    for your team's action items.
                  </div>
                ) : (
                  committed.map((d) => {
                    const verb = d.isTraffic ? "Increase" : (d.direction === "up" ? "Lift" : "Lower");
                    const arrow = d.direction === "up" ? "↑" : "↓";
                    const unit = d.isTraffic ? "" : "%";
                    const deltaUnit = d.isTraffic ? "a week" : "pts";
                    const decimals = d.isTraffic ? 0 : 1;
                    const placeholder = d.isTraffic
                      ? "What specifically will your team do to generate the additional prospects needed each week? List specific channels, owners, and timing."
                      : `What specifically will your team do to ${d.direction === "up" ? "lift" : "lower"} ${d.label.toLowerCase()}? List specific actions, owners, and timing.`;
                    return (
                      <div className="improve-card committed-card" key={d.key}>
                        <div className="ic-head">
                          <div className="ic-title">
                            <span className="ic-verb">{verb}</span> {d.label}
                          </div>
                          <div className="ic-change">
                            <span className="ic-from">{d.inputVal.toFixed(decimals)}{unit}</span>
                            <span className="ic-arrow">→</span>
                            <span className="ic-to">{d.sliderVal.toFixed(decimals)}{unit}</span>
                            <span className="ic-delta">{arrow} {d.delta.toFixed(decimals)} {deltaUnit}</span>
                          </div>
                        </div>

                        <div className="ic-section-lab">Operational areas to review</div>
                        <ul className="diag-list">
                          {DIAGNOSTICS[d.key].items.map((item, idx) => (
                            <li key={idx}>
                              <label className="diag-item">
                                <span className="diag-num">{idx + 1}.</span>
                                <input
                                  type="checkbox"
                                  checked={!!(diagnosticChecks[d.key] || {})[idx]}
                                  onChange={() => toggleCheck(d.key, idx)}
                                />
                                <span>{item}</span>
                              </label>
                            </li>
                          ))}
                        </ul>

                        <div className="ic-section-lab">Action items</div>
                        <textarea
                          className="action-input"
                          placeholder={placeholder}
                          value={actionItems[d.key]}
                          onChange={(e) => updateActionItem(d.key, e.target.value)}
                          rows={4}
                        />
                        <div className="action-print">
                          {actionItems[d.key]
                            ? actionItems[d.key]
                            : <i>No action items recorded.</i>}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* ── Unchanged KPIs ── */}
              {unchanged.length > 0 && (
                <div className="plan-section">
                  <div className="plan-section-head">
                    <h2>Unchanged KPIs</h2>
                    <span className="plan-tag">{unchanged.length} accepted at current performance</span>
                  </div>
                  <div className="plan-section-sub">
                    These KPIs weren't adjusted on the Calculator tab. Expand any row to review
                    the operational areas or add optional notes — useful for documenting practices
                    you want to maintain.
                  </div>

                  {unchanged.map((d) => {
                    const isOpen = !!expandedUnchanged[d.key];
                    return (
                      <div className={`improve-card unchanged-card ${isOpen ? "open" : ""}`} key={d.key}>
                        <button className="uc-row" onClick={() => toggleExpand(d.key)}>
                          <span className="uc-name">{d.label}</span>
                          <span className="uc-val">{d.inputVal.toFixed(d.isTraffic ? 0 : 1)}{d.isTraffic ? " a week" : "%"}</span>
                          <span className="uc-toggle">{isOpen ? "−" : "+"}</span>
                        </button>

                        <div className="uc-body" style={{ display: isOpen ? "block" : "none" }}>
                          <div className="ic-section-lab">Operational areas to review</div>
                          <ul className="diag-list">
                            {DIAGNOSTICS[d.key].items.map((item, idx) => (
                              <li key={idx}>
                                <label className="diag-item">
                                  <span className="diag-num">{idx + 1}.</span>
                                  <input
                                    type="checkbox"
                                    checked={!!(diagnosticChecks[d.key] || {})[idx]}
                                    onChange={() => toggleCheck(d.key, idx)}
                                  />
                                  <span>{item}</span>
                                </label>
                              </li>
                            ))}
                          </ul>

                          <div className="ic-section-lab">Optional notes</div>
                          <textarea
                            className="action-input optional"
                            placeholder="Optional — notes on what's working, practices to maintain, or items to monitor."
                            value={actionItems[d.key]}
                            onChange={(e) => updateActionItem(d.key, e.target.value)}
                            rows={3}
                          />
                          <div className="action-print">
                            {actionItems[d.key]
                              ? actionItems[d.key]
                              : <i>No notes recorded.</i>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* ── Signatures (print only) ── */}
              <div className="signatures">
                <div className="signatures-title">Acknowledgment &amp; Approval</div>
                <div className="sig-row">
                  <div>
                    <div className="sig-block"></div>
                    <div className="sig-label">Property Manager · Date</div>
                  </div>
                  <div>
                    <div className="sig-block"></div>
                    <div className="sig-label">Regional Manager · Date</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        <div className="note">
          <p>
            <b>ℹ️ How it computes.</b> The Move-Out Forecast adds up everyone leaving during
            the period:
          </p>
          <ul>
            <li><b>Known move-outs:</b> notices to vacate plus residents currently in eviction.</li>
            <li><b>Estimated unplanned move-outs:</b> your monthly skip and eviction average,
              multiplied by the number of months in the window.</li>
            <li><b>Estimated non-renewals:</b> the leases expiring in the window, multiplied by
              the share that historically don't renew. So with 25 expirations and a 40% renewal
              rate, 60% don't renew — that's 15 move-outs.</li>
          </ul>
          <p>
            Past early move-outs are intentionally excluded — those residents are already gone.
            <b> Total Exposure</b> = unrented vacant + leased past move-in + Move-Out Forecast.
            <b> Leases Needed</b> = Total Exposure minus the vacancy budget allowed at your
            occupancy goal. The funnel then grosses up backward through your pooled conversion
            rates to land on a weekly prospect target.
          </p>
          <p>
            The Weekly Prospect Goal also accounts for lead-to-lease time. Prospects who arrive
            after the <i>last day to acquire</i> can't mature into a move-in by the goal date,
            so the total prospect requirement is spread across the effective window (days to
            goal minus lead-to-lease days), not the full horizon.
          </p>
          <p>
            <b>Note on renewals:</b> the renewal percentage treats month-to-month residents as
            non-renewals, which is intentional — MTMs carry real move-out risk (unknown
            timeline, short notice in many states).
          </p>
          <p>
            <b>Team Capacity</b> is computed as office staff multiplied by {WEEKLY_LEADS_PER_AGENT} leads
            per agent per week — the rough ceiling for what one agent can responsibly handle
            alongside tours, follow-up, and application processing. When the Weekly Prospect
            Goal exceeds capacity, the calculator surfaces other levers (conversion, retention,
            goal date, occupancy target) because additional marketing spend won't translate
            into leases the team can't process.
          </p>
        </div>
      </div>
    </div>
  );
}
