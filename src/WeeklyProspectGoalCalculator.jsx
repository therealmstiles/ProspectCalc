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
  font-size: 0.75rem; font-weight: 700; color: #2cb1cc;
  letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.5rem;
}
.wpg h1 {
  font-size: 2rem; font-weight: 800; color: #fff;
  margin: 0 0 0.5rem 0; letter-spacing: -0.01em; line-height: 1.15; max-width: 22ch;
}
.wpg .brand-row {
  display: flex; align-items: flex-start; gap: 1.25rem; flex: 1; min-width: 280px;
}
.wpg .brandmark {
  flex: none; width: 56px; height: 56px; margin-top: 0.25rem;
  display: flex; align-items: center; justify-content: center;
}
.wpg .brandmark img {
  width: 100%; height: 100%; object-fit: contain;
  filter: brightness(0) invert(1);
}
.wpg .sub {
  color: rgba(255,255,255,0.75); font-size: 0.95rem; max-width: 65ch;
  margin-top: 0.5rem; margin-bottom: 2rem;
}

/* ── Grid layout ── */
.wpg .grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; align-items: start;
}

/* ── Cards / panels ── */
.wpg .panel {
  background: linear-gradient(135deg, rgba(0,63,95,0.7) 0%, rgba(12,41,60,0.8) 100%);
  border: 1px solid rgba(44,177,204,0.3);
  border-radius: 16px;
  padding: 1.75rem;
  margin-bottom: 1.5rem;
}
.wpg .ph {
  display: flex; align-items: baseline; justify-content: space-between;
  margin-bottom: 1.25rem; gap: 0.75rem;
}
.wpg .ph h2 {
  font-size: 1.25rem; font-weight: 700; color: #2cb1cc; margin: 0;
}
.wpg .ph .tag {
  font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase;
  color: rgba(44,177,204,0.7); font-weight: 700;
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

/* ── Methodology note ── */
.wpg .note {
  margin-top: 2rem; padding: 1.25rem 1.5rem;
  background: rgba(44,177,204,0.08);
  border-left: 3px solid #2cb1cc;
  border-radius: 8px;
  font-size: 0.825rem; color: rgba(255,255,255,0.7); line-height: 1.65;
  max-width: 80ch;
}
.wpg .note b { color: #2cb1cc; font-weight: 700; }

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

/* ── Header bar (actions) ── */
.wpg .head {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;
}
.wpg .head .title-wrap { flex: 1; min-width: 240px; }
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

/* ── Print / PDF output ── */
@media print {
  .wpg {
    background: #fff !important;
    color: #1a365d !important;
    padding: 0.5in !important;
  }
  .wpg .actions, .wpg .save-pip { display: none !important; }
  .wpg h1, .wpg h2, .wpg .kicker, .wpg .ph h2, .wpg .fcap,
  .wpg .subhead, .wpg .stat .sl, .wpg .hero .lab, .wpg .hero .dt,
  .wpg .miss .lab, .wpg .note b {
    color: #0c293c !important;
  }
  .wpg .panel, .wpg .hero {
    background: #fff !important;
    border: 1px solid #0c293c !important;
    box-shadow: none !important;
    page-break-inside: avoid;
  }
  .wpg .sub, .wpg label, .wpg .hint, .wpg .derived,
  .wpg .scen .nm, .wpg .scen .nm em, .wpg .ds, .wpg .miss li,
  .wpg .miss li .meta, .wpg .note, .wpg .hero .per, .wpg .verdict {
    color: #1a365d !important;
  }
  .wpg .hero .big, .wpg .stat .sv, .wpg .frow .fval,
  .wpg .hero .dv, .wpg .goalbig, .wpg .scen .val, .wpg .derived b {
    color: #0c293c !important;
  }
  .wpg input { background: #fff !important; border-color: #0c293c !important; color: #0c293c !important; }
  .wpg .bar { background: #e2e8f0 !important; }
  .wpg .bar > span { background: #0c293c !important; }
  .wpg .brandmark img { filter: none !important; }
  .wpg .hero .occ-strip {
    background: #f1f5f9 !important;
    border-left-color: #0c293c !important;
  }
  .wpg .hero .occ-strip .occ-now,
  .wpg .hero .occ-strip .occ-goal { color: #0c293c !important; }
  .wpg .hero .occ-strip .occ-cap,
  .wpg .hero .occ-strip .occ-arrow { color: #475569 !important; }
  .wpg .lever .llab, .wpg .lever .lrefs { color: #1a365d !important; }
  .wpg .lever .lval { background: transparent !important; color: #0c293c !important; padding: 0 !important; }
  .wpg .lever input[type="range"] { display: none !important; }
  .wpg .btn-reset-sliders { display: none !important; }
  /* Promote the Final Goal Funnel above the hero card on print —
     it's the operational plan teams will track over the period. */
  .wpg .rcol { display: flex; flex-direction: column; }
  .wpg .funnel-card { order: -1; margin-bottom: 1rem; }
  .wpg .verdict.ok { background: #d9ecf2 !important; border-color: #0c293c !important; }
  .wpg .verdict.warn { background: #fef3c7 !important; border-color: #b45309 !important; color: #78350f !important; }
  .wpg .verdict.short { background: #fee2e2 !important; border-color: #b91c1c !important; color: #7f1d1d !important; }
  .wpg .verdict b { color: inherit !important; }
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
  d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

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
      p2tTouched, t2aTouched, denialTouched, cancelTouched, renewalTouched, isLoaded]);

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
          <div className="brand-row">
            <div className="brandmark">
              <img src="data:image/png;base64,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" alt="Birchstone" />
            </div>
            <div className="title-wrap">
              <div className="kicker">
                Birchstone Residential · {propertyName ? propertyName : "Leasing Operations"}
              </div>
              <h1>Weekly Prospect Goal Calculator</h1>
              <p className="sub">
                Tells you how many new prospects you need each week to hit your occupancy
                goal — working backward through expected move-outs, your conversion rates, and
                the time it takes to turn a prospect into a move-in.
              </p>
            </div>
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
              <div className="lab">Weekly Prospect Goal</div>
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

        <div className="note">
          <b>ℹ️ How it computes.</b> Move-Out Forecast = Known (notices to vacate + currently in
          eviction) + Estimated (monthly skip/eviction average × months) + Non-renewals
          (remaining expirations × (1 − renewal %)). Past early move-outs are intentionally
          excluded — those residents are already gone. Total exposure = unrented vacant +
          leased-past-move-in + move-out forecast. Leases needed = exposure − vacancy budget
          at goal. The funnel grosses up backward through your pooled conversion rates. The
          Weekly Prospect Goal accounts for lead-to-lease time: prospects arriving after the
          <i> last day to acquire</i> can't mature into a move-in by the goal date, so total
          prospects are spread across the effective window (days to goal − lead-to-lease).
          Note: renewal % treats month-to-month residents as non-renewals, which is intentional —
          MTMs are real move-out risk (unknown timeline, short notice in many states). <b>Team capacity</b> is computed as office
          staff × {WEEKLY_LEADS_PER_AGENT} leads per agent per week — the rough ceiling for what
          one agent can responsibly handle alongside tours, follow-up, and application processing.
          When the Weekly Prospect Goal exceeds capacity, the calculator surfaces other levers
          (conversion, retention, goal/date) because additional marketing spend won't translate
          into leases the team can't process.
        </div>
      </div>
    </div>
  );
}
