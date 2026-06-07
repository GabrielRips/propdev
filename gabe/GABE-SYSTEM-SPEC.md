# GABE — Full System Specification & Vision

> Derived from the strategy/vision/requirements documents in [`ours/`](ours/), cross-referenced against the existing **PropDev** React prototype in [`propdev/`](propdev/).
> Prepared 2026-06-06.

---

## 1. What all of this is (the purpose)

**PropDev** (the working React prototype) is the *seed*. **GABE** is the *real product* PropDev is meant to grow into.

- **PropDev** = a frontend-only prototype currently live at `propdev.revity.com.au` (login `revity` / `propdev26`). It proves the UI/UX concept with mocked data.
- **GABE** = the productised vision: a **Property Development Operating System (PDOS)** — pitched as *"the Bloomberg Terminal of Property Development."* The explicit instruction in the requirements doc is: *"Take the main script from PropDev and refine it to make it a more functioning page."*

**Core thesis:** property developers run their business across fragmented tools — emails, spreadsheets, accounting software, construction apps, consultants, cloud folders. GABE collapses the entire development lifecycle (find land → feasibility → presales → finance → acquire → build → manage/sell completed assets) into **one connected platform** that is the single source of truth.

**Tagline:** *Every project. Every document. Every asset. Every dollar. One platform.*

**The automation goal (from the meeting notes):** make it **zero-effort for the developer** — GABE reads emails/attachments and categorises them into the system automatically. *Working assumption for now: everything happens over email.*

**Customer / GTM:** primary market is Australian developers doing **5–30 townhouse / medium-density projects**; first real customer is "Michael's company," with a real pilot job nominated — **Mooroolbark**. Secondary markets: apartment, childcare, industrial, commercial, build-to-rent, land subdivision, builders, investment syndicates. Recurring SaaS revenue.

---

## 2. Source documents analysed (`ours/`)

| File | Type | What it is |
|------|------|-----------|
| `GABE-high-level-introduction.pdf` | 3-pg brochure | Elevator pitch: problem, vision, "Bloomberg Terminal" ambition |
| `GABE_Vision_and_Product_Strategy_v2.pdf` | 3-pg blueprint | The full product strategy: 5 pillars, portals, AI, integrations, roadmap |
| `Gabe 2.0 prototype.docx` | Requirements | Client's hands-on feature requests building **on top of** PropDev (the most concrete spec) |
| `Notes for 30_5 Meeting with Evguini.docx` | Meeting notes | Technical/engineering direction, integrations, infra decisions |
| `supervisor checklist.pdf` | 4-pg form | A real VIC construction compliance checklist — sample content for the Construction Hub |
| `property manage example.xlsx` | Spreadsheet | The data model for the owned-asset / property-management portal |

---

## 3. GABE system specification

### 3.1 Strategic pillars (the five "Intelligence" modules)

1. **Development Intelligence** — identify/analyse/assess opportunities: site analysis, zoning review, overlay identification, yield estimation, feasibility modelling, risk scoring, acquisition workflows.
2. **Construction Intelligence** — the *Construction Hub* (Procore-equivalent): drawings, permits, RFIs, defects, inspections, QA, SWMS, compliance, progress photos. Full visibility from office **and** site.
3. **Financial Intelligence** — the *Financial Control Centre*: compares original **feasibility assumptions vs live performance**; automated invoice capture, budget tracking, forecast profit, variation management, cashflow forecasting → real-time project health.
4. **Asset Intelligence** — portfolio-wide management of **completed/owned** assets: valuations, debt, equity, rent, yields, ownership structures, performance. Tracks long-term wealth beyond project completion.
5. **Investor Intelligence** — one-click generation of **lender packs, investor packs, JV reports**, with controlled visibility (share only what's relevant to each funding partner).

### 3.2 Feasibility Engine
A dedicated financial-modelling engine (rivalling specialist feasibility software). Supports townhouses, apartments, childcare, industrial, commercial, mixed-use, subdivisions, build-to-rent. Outputs: **GRV, margin, IRR, cashflow, sensitivity analysis.**

### 3.3 User portals (role-based, lockable)
The requirements doc asks for **3 lockable interfaces**; the strategy doc expands this to **5 portals**:

| Portal | Audience | Purpose |
|--------|----------|---------|
| Executive | Owner / principal | Portfolio oversight, strategic reporting |
| Development | Dev managers | Acquisition, planning, feasibility |
| Construction | Supervisors / builders | Delivery & compliance (Construction Hub) |
| Asset | Owner / trusted staff | Owned-portfolio & rental management |
| Investor | Lenders / JV partners | Stakeholder reporting & capital raising |

### 3.4 Security & permissions (project-scoped RBAC)
Role-based access so users see **only authorised projects**. The concrete requirement:
> *"John the supervisor has 2 projects — he gets full access to Contacts, Plans, Permits, Sales and Construction for **only those 2 projects**."*

Authorised managers assign which projects each supervisor can see. The owned-asset portal needs an especially **strong lock** (highly confidential financials).

### 3.5 AI strategy — action-oriented agents
Vision is AI that **does work**, not just answers questions. Named future agents:
**Development Manager · Cost Controller · Contract Administrator · Asset Manager · Capital Raising Assistant.**

### 3.6 Integrations roadmap
- **Accounting:** Xero (priority), MYOB, QuickBooks
- **Email:** Outlook, Gmail (email ingestion is the backbone of the automation)
- **Storage:** Google Drive, SharePoint, OneDrive
- **Telephony:** Twilio for call recording/transcription; SIP trunking / phone porting (flagged as open questions)
- **Property data:** realestate.com price guide (auto-valuation), valuation services, planning databases
- **Credentials:** built-in password manager ("click-to-view" for external portals)

### 3.7 Mobile ecosystem
Native mobile apps: supervisors manage defects/inspections/photos onsite; executives monitor performance; investors receive updates.

### 3.8 Three-year roadmap
1. **Phase 1** — Feasibility, documents, construction management
2. **Phase 2** — Portfolio management & investor reporting
3. **Phase 3** — AI automation & predictive analytics
4. **Phase 4** — Capital raising & marketplace

---

## 4. GAP ANALYSIS — what's in the GABE docs but **NOT** in the PropDev prototype

This is the core of the request. PropDev today has: login, dashboard, project detail with phase cards, advanced tabs (WIP, Contacts, Financial, Plans, Permit, Utilities, Consultants, Legal), a Kanban Planner, and an Agentic dashboard — all with **mocked data and simulated AI/comms**. The documents add the following **net-new capabilities**:

### 4.1 Major modules entirely absent from PropDev
| GABE feature | Status in PropDev | Notes |
|---|---|---|
| **Construction Hub** (full) | ❌ "Construction" tab is a *"Coming soon"* stub | Biggest single ask — see §5 |
| **Sales module** | ❌ "Sales" tab is a *"Coming soon"* stub | Listed as incomplete in the requirements doc |
| **Asset / Property-Management portal** | ❌ Does not exist | Owned-portfolio tracking — see §6 |
| **Feasibility Engine** (GRV/margin/IRR/cashflow/sensitivity) | ❌ Only a static "Feasibility %" phase bar | A real modelling engine |
| **Investor Intelligence** (lender/investor/JV packs) | ❌ Does not exist | One-click report generation with scoped visibility |

### 4.2 Capabilities that extend existing PropDev tabs
| GABE feature | PropDev today | Gap |
|---|---|---|
| **Feasibility-vs-live budget comparison** | Financial tab shows static spend vs forecast | No real-time *feasibility → live cost* tracking |
| **Invoice-in-via-email → auto-add to budget** | Manual approve/reject of mock invoices | No email capture, no payment-due logging, no "one-click approve for construction works" |
| **Payments / due-date ledger in Planner** | Planner is read-only Kanban | Add a payments section logging when invoices fall due |
| **Variation / "extras" management** | None | Called out as *"one of the biggest blowouts in construction"* — needs close tracking |
| **Project-scoped supervisor permissions** | Single hardcoded login only | No RBAC, no per-project visibility control |

### 4.3 Platform / infrastructure gaps
| GABE feature | PropDev today |
|---|---|
| Real backend + database | ❌ Frontend-only, all data mocked |
| Real email/Gmail/Outlook ingestion & auto-categorisation | ❌ "Email scanning" is faked |
| Real telephony (Twilio transcription, SIP) | ❌ Soft-phone is a UI simulation |
| Accounting integration (Xero/MYOB/QuickBooks) | ❌ None |
| Cloud-storage integration (Drive/SharePoint/OneDrive) | ❌ Mock file lists |
| realestate.com auto-valuation feed | ❌ None |
| Password manager / click-to-view credentials | ❌ None |
| Action-oriented AI agents (5 named roles) | ⚠️ Agentic dashboard exists but is a *frozen, pre-recorded* sim with different agent names |
| Native mobile apps | ❌ Responsive web only |
| Role-based portals (3–5) | ❌ One unsegmented interface |

---

## 5. Construction Hub — detailed spec (the largest new requirement)

Requested as a Procore-equivalent section. Must store and manage:

1. **Supervisor checklists** — digitise the attached VIC compliance checklist (see §5.1).
2. **Documents** — all plans, sketches, drawings, **and recorded conversations** about any change/final discussion with contractors (material, colour, or any deviation from plans).
3. **Inspections & certificates** — from surveyors, pest, builders, trades, and supervisor self-inspections; proof of compliance at every stage.
4. **OH&S / safety documents** — SWMS, MSDS, WorkCover certificates, induction forms, white cards (*"safety is the biggest concern onsite"*).
5. **Defect list** — log a defect → generate an easy-to-send defect list per contractor → **one-click, one-photo sign-off** so each defect is accounted for.
6. **RFI** — email a request for quotes/info → **auto-saved into the system** with date, contractor name, phone number; CAs follow up on all quotes/details.
7. **Progress photos** — a database where each construction stage has an allocated slot; supervisor/builder drops photos confirming the stage, so the office knows exactly where things are and that they're done correctly.

### 5.1 Supervisor Compliance Checklist (VIC) — the 12 stages

The sample `supervisor checklist.pdf` is a structured per-stage compliance form (header: Project / Address / Supervisor / Builder Reg No / Date; footer: NCC/BCA sign-off). Stages and check items:

1. **Pre-Construction / Site Establishment** — approved planning permit, building permit, stamped drawings on site, engineering drawings, soil report, Dial Before You Dig, safety signage, SWMS, site amenities, temp fencing, erosion controls, emergency access
2. **Set-Out** — survey set-out certificate, boundaries confirmed, setbacks compliant, FFLs verified, easements identified, machinery access, neighbour protection
3. **Bored Piers / Footings** — engineering approval, permit conditions met, correct diameter/depth, reinforcement, base cleaned, inspection completed
4. **Sewer & Drainage** — council approval, plumbing permit, licensed plumber, invert levels, inspection, backfill compacted
5. **Slab / Substructure** — formwork, vapour barrier, termite barrier, reinforcement tied, setdowns, slab square & level, pre-pour inspection
6. **Framing** — layout matches plans, correct timber grade, bracing, tie-down, openings, frame plumb, inspection passed
7. **Roofing** — trusses, bracing, fall protection, sarking, roof covering storage, insulation
8. **Cladding / External Envelope** — wall wrap, window flashings, battens, fixings compliant, weather seals
9. **Internal Works & Fit-Out** — rough-in approved, insulation compliant, plaster, doors, cabinetry, hardware
10. **Waterproofing, Tiling & Kitchen** — waterproofing certificate, falls achieved, tile layout approved, kitchen layout, benchtops
11. **Painting** — surfaces prepared, masking, correct paint system, ventilation
12. **Final Works & Completion** — stormwater approved, gas compliance cert, driveway, landscaping, fixtures operational, smoke alarms tested, defects rectified, **occupancy permit ready**

> Implementation implication: this maps cleanly onto the existing PropDev "phase + tasks + status" model — each stage = a checklist with completable items, attachments, inspection sign-off, and photos.

---

## 6. Asset / Property-Management portal — detailed spec

A **separate, heavily-locked** portal for **currently owned** property (e.g. a build-to-rent portfolio). Purpose: a developer who owns 20+ properties from prior developments can monitor each property and its equity in one place — and produce the asset/debt/rent summaries that **banks, private lenders, and JV partners** constantly ask for.

**Key complication:** properties are held across **different structures** — company, personal name, or trust — so the system must categorise by ownership entity.

### 6.1 Data model (from `property manage example.xlsx`)

Columns: `property address · property value · loan amount · LVR · property manager · contact number · date owned · owned under (entity)`

| Address | Value | Loan | LVR | Manager | Owned under |
|---|---|---|---|---|---|
| 24 Smith St | $1,000,000 | $500,000 | 0.50 | Elite Property | Lachlan Henderson (personal) |
| 40 Frank St | $500,000 | $200,000 | 0.40 | Ray White | LH Cladding (company) |
| 52 Billie Ct | $3,000,000 | $1,200,000 | 0.40 | Barry Plant | LH and Co Family Trust |

### 6.2 Required behaviours
- **Auto-valuation:** tap into the realestate.com price guide to keep `property value` current automatically.
- **Manual loan entry:** `loan amount` entered/updated by hand (users won't grant bank access), refreshed over time → LVR recalculated.
- **Leverage / file extraction:** *"I want to leverage off Frank St"* → one action pulls all files attached to that property (incl. up-to-date rental statements) and produces lender/investor-ready info packs.
- **Scoped JV sharing:** for JV deals, extract **only** the information necessary to secure the deal (controlled visibility) — ties into Investor Intelligence (§3.5).

---

## 7. Engineering / infrastructure direction (meeting notes)

- **Hosting:** Vercel (frontend); **DigitalOcean** for more fundamental backend pieces.
- **Process:** full **CI/CD** — *"don't do click-ops, do everything with code / command line."*
- **PM tooling:** Linear.
- **Data:** design a proper **database structure** as the file store; **integrate email + summaries**, then **import historical data** from existing projects and migrate from the current platform.
- **Telephony:** Twilio for call transcription (AI calling is hard unless pre-scripted; **recording + transcription is acceptable**); SIP trunking / phone porting flagged as unknowns to research.
- **Accounting:** connect Xero.
- **Open product question raised in the demo:** *is GABE a central system or just a tracking tool — can you actually action emails from inside it?* (i.e. the ambition is the former.)

---

## 8. Summary — PropDev → GABE

PropDev demonstrates the **dashboard, per-phase tracking, document/legal/permit/consultant/financial tabs, and simulated AI comms**. To become GABE it must gain, in roughly roadmap order:

1. A **real backend** (DB, auth, email ingestion, file store) replacing all mocks.
2. **Project-scoped role-based portals** (Executive / Development / Construction / Asset / Investor).
3. The **Construction Hub** (checklists, inspections, OH&S, defects w/ photo sign-off, RFIs, progress photos) and the **Sales** module — completing PropDev's two stubbed tabs.
4. A genuine **Feasibility Engine** and a **Financial Control Centre** that tracks feasibility-vs-live budgets, email-captured invoices, and variations/extras.
5. The **Asset Intelligence** portfolio portal with realestate.com valuations and entity-based ownership.
6. **Investor Intelligence** one-click lender/investor/JV packs with scoped visibility.
7. **Integrations** (Xero/MYOB/QuickBooks, Gmail/Outlook, Drive/SharePoint/OneDrive, Twilio, realestate.com) and **action-oriented AI agents**.
8. **Native mobile apps** for onsite supervisors.

The north star: **the operating layer above every existing development workflow — the Bloomberg Terminal of Property Development.**
