# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**GABE** is a frontend-only React prototype of a **Property Development Operating System (PDOS)** —
"the Bloomberg Terminal of Property Development." It is the productised evolution of the earlier
**PropDev** prototype (this repo started as a copy of it). It unifies the full development lifecycle —
site/feasibility, finance, pre-sales, acquisition, design, planning, construction, sales, and the
management of completed/owned assets — into one platform, plus lender/investor reporting.

**Frontend-only, all data mocked.** AI/email/phone/integrations are simulated (setTimeout + templates).
Only persistence is `localStorage` (per-phase todos/notes).

## Commands

- `npm start` — dev server on localhost:3000
- `npm test -- --watchAll=false` — run all tests once (CI mode)
- `npm run build` — production build to `build/`

## Roles & Portals (role-based access)

Auth is in `src/auth/AuthContext.tsx`; users/roles/permissions in `src/data/roles.ts`.
Project-scoped access: a supervisor only sees their assigned projects (`canAccessProject`).
Portal access is gated by `canAccessPortal` + `RequirePortal` in `App.tsx`.

Demo logins (username / password → role):
- `revity` / `propdev26` — Executive (all portals, all projects)
- `dev` / `dev` — Development Manager
- `john` / `john` — Site Supervisor (only proj-001 & proj-003; construction-focused)
- `asset` / `asset` — Asset Manager (asset + investor portals)
- `investor` / `investor` — Investor (investor portal; 2 projects)

Portals (top nav, filtered by role): Dashboard, Feasibility, Construction, Assets, Investor, Planner, Agentic.

## Architecture

- `src/components/AppShell.tsx` — shared top-nav shell (role-filtered portal links); every page wraps in it.
- Routes (`App.tsx`): `/`, `/project/:projectId`, `/feasibility`, `/construction`, `/assets`,
  `/investor`, `/planner`, `/agentic`.
- `src/data/` — mock data + TypeScript types.

### Per-project tabs (in `ProjectDetail` → `AdvancedView`)
WIP, Contacts, **Feasibility**, Financial, Plans, Permit, Consultants, Utilities, **Construction**,
**Sales**, Legal. (Bold = added in GABE.)

### New GABE modules (data → component)
- `construction-data.ts` → `ConstructionTab` / `ConstructionPortal` — 12-stage VIC supervisor checklist,
  inspections & certificates, OH&S docs (SWMS/MSDS/WorkCover/inductions/white cards), defect list with
  one-click photo sign-off, RFIs, progress photos.
- `sales-data.ts` → `SalesTab` — lot/unit sales register, KPIs, pre-sales %, deposits, lot detail + reserve/contract.
- `feasibility-data.ts` → `FeasibilityTab` / `FeasibilityPortal` — GDV/margin/IRR, **feasibility vs live**
  cost comparison, revenue progress, cashflow, sensitivity.
- `variations-data.ts` → `FinancialTab` (Financial Control Centre) — email-captured invoices with one-click
  approve-to-budget, variations/extras register.
- `assets-data.ts` → `AssetPortal` — owned/build-to-rent portfolio (value/loan/LVR/rent/yield), grouped by
  ownership entity, realestate.com auto-valuation (mock), one-click lender/JV pack extraction.
- `investor-data.ts` → `InvestorPortal` — lender/investor/JV packs with scoped visibility toggles + capital pipeline.

### Inherited PropDev data
`projects.ts`, `phase-details.ts`, `project-insights.ts`, `contacts-data.ts`, `project-files.ts`,
`financial-data.ts`, `consultants-data.ts`, `authorities-data.ts`, `legal-data.ts`, `automated-activities.ts`.

## Domain Context

Australian property development — AUD currency, Australian permits/authorities (planning permits, VCAT,
council DAs, NCC/BCA). 5 mock projects span townhouse, residential tower, and subdivision types.
