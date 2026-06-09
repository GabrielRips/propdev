# PropDev — Handover & Operations

Everything you need to run, update, and continue building **PropDev** (the Property
Development OS). Last updated 2026-06-09.

---

## 1. Live sites & logins

| Environment | URL | Git branch | Has its own data |
|-------------|-----|------------|------------------|
| **Production** | https://170.64.225.210.nip.io | `main` | yes |
| **Staging (test)** | https://staging.170.64.225.210.nip.io | `staging` | yes (separate from prod) |

Both are HTTPS (Let's Encrypt, auto-renewing). **Staging and prod do not share data** —
test freely on staging.

**Demo logins** (same on both; all currently have full access):

| Username | Password | Role |
|----------|----------|------|
| `revity` | `propdev26` | Executive |
| `dev` | `dev` | Development Manager |
| `john` | `john` | Site Supervisor |
| `asset` | `asset` | Asset Manager |
| `investor` | `investor` | Investor |

> The `.nip.io` hostnames just map to the server's IP so we could get a free TLS cert
> without buying a domain. When you get a real domain, point it at `170.64.225.210` and
> we reissue the cert for it (5 min).

---

## 2. How to push changes (test → prod)

Deploys are **manual and one command each** (you press the button when you mean it).
Repo: `git@github.com:GabrielRips/propdev.git`.

### Step 1 — ship to staging and test
```bash
# from your machine, in the repo
git checkout staging
git merge main                 # keep staging current (or just work on staging)
# ...make changes, then...
git add -A && git commit -m "describe change"
git push origin staging

# deploy + open staging
ssh root@170.64.225.210 '/root/deploy.sh staging'
# verify at https://staging.170.64.225.210.nip.io
```

### Step 2 — promote to production
```bash
git checkout main
git merge staging
git push origin main

ssh root@170.64.225.210 '/root/deploy.sh prod'
# verify at https://170.64.225.210.nip.io
```

`deploy.sh` (in `gabe/deploy.sh`, symlinked to `/root/deploy.sh`) pulls the right branch,
installs deps, builds the frontend, and restarts that environment's process. It prints a
health check at the end.

> Tip: if you just want a quick fix straight to prod, you *can* commit to `main` and run
> `deploy.sh prod` — but the point of staging is to look first.

---

## 3. What's done

**Platform**
- React + TypeScript frontend, Node/Express + **SQLite** backend, server-side file storage.
- **JWT login**; 5 demo roles; role-based portals and project access.
- Full **create / edit / delete**, all saved to the database and shared across devices.
- **Production + staging** environments on one droplet, both on HTTPS, pm2-managed,
  one-command deploys.

**Projects**
- Create a project, **edit phase progress** (sliders), **delete** a project (removes its data).
- Dashboard with portfolio summary (counts, GDV, dwellings, health).

**Per-project tabs** (Advanced view) — all backend-persisted, add/edit/delete:
- **Files & plans** — upload building plans / PDFs / images, categorise, open, delete.
- **Contacts**
- **Feasibility** — editable model (GDV, cost, equity, debt, IRR + cost/revenue/cashflow/
  sensitivity rows); margins & profit auto-computed; feasibility-vs-live variance.
- **Financial** — invoices: add, approve/reject, mark paid; live spend summary.
- **Construction Hub** — 12-stage VIC checklist (ticks persist), defects (with photo
  sign-off), RFIs, inspections, OH&S documents.
- **Sales** — lots/units register; reserve / convert to contract; pre-sales KPIs.
- **Permit** — applications with status, dates, fees.
- **Utilities** — electricity/water/gas/other connections.
- **Consultants** — reports, mark final, overdue tracking.
- **Legal** — documents grouped by Acquisition/Planning/Construction/Sales.

**Portfolio-level**
- **Assets** — owned/build-to-rent properties; value/loan/LVR/rent/yield; grouped by entity.
- **Investor** — lender/investor/JV packs with scoped-section toggles + capital-raise pipeline.

---

## 4. What's NOT done yet (and known limitations)

**Auth / security**
- Logins are **shared demo accounts with passwords in code** (`server/users.js`). Fine for a
  trusted prototype; not per-user, no password reset, no hardening.
- Plain JWT, no rate limiting. HTTPS is on, but treat the data as prototype data.

**Still simulated (UI-only mocks, not real)**
- AI "draft email", legal "Analyse", soft-phone / call, voice mode, voice "engage consultant",
  and the **Agentic** dashboard — all faked. No real AI, email, SMS, or phone.
- None of the original-vision **integrations** exist yet: Xero/MYOB, Gmail/Outlook ingestion,
  Google Drive/SharePoint, Twilio, realestate.com valuations.

**Inconsistencies / partial**
- **Per-phase to-dos & notes** (inside a phase card) and the **Planner** board still use
  **browser localStorage**, not the backend — so those are per-browser, unlike everything else.
  (Migrating them to the backend collections is a small, well-defined job.)
- File **preview** opens the file in a new tab; no in-app viewer/annotation.
- **Dead code** to clean up: `PlansTab.tsx` and `EngageConsultantModal.tsx` are no longer
  imported (replaced by `FilesPanel` and the new add-forms).

**Ops / engineering**
- Deploys **build on the production server** (small droplet → build spikes into swap). A
  "proper" CI/CD would build an artifact in GitHub Actions and ship it.
- **No automated deploys** (manual by choice). 9 tests only (auth + render smoke tests).
- **No automated backups** of the database/uploads yet (see §7 for the manual command).
- Using a `nip.io` hostname, not a custom domain.

---

## 5. Architecture & where things live

**Stack:** React 19 + TS (Create React App), Tailwind v3, React Router v6 · Node/Express,
better-sqlite3, multer (uploads), jsonwebtoken.

**Request flow:** browser → **nginx** (HTTPS, port 443) → **Node/Express** (internal port
8080 prod / 8081 staging) → serves the built React app *and* the `/api/*` routes → **SQLite**
+ files on disk.

### Repo map (`gabe/`)
```
src/
  App.tsx                  login screen + routes + portal access guards
  auth/AuthContext.tsx     login/logout, stores JWT
  components/              all UI (Dashboard, ProjectDetail, the tabs, portals, modals)
  data/
    api.ts                 backend API client (token auth, file upload/download URLs)
    projectStore.ts        projects (create/update/delete) — backend-backed
    useCollection.ts       GENERIC per-project collection hook (contacts, invoices, lots,
                           defects, rfis, checklist, permits, utilities, legal, …)
    fileStore.ts           file upload/list/delete via the API
    roles.ts               role → portals/access config (frontend)
    projects.ts            Project type + phase list
server/
  index.js                 the whole API: auth, projects, generic collections, files, SPA serving
  users.js                 the 5 demo logins/roles (backend source of truth for auth)
  package.json             backend deps
deploy.sh                  prod/staging deploy script
HANDOVER.md / STAGING.md   this doc + the short workflow doc
```

### Droplet map (`root@170.64.225.210`, Ubuntu 24.04, 458 MB RAM + 2 GB swap)
```
/root/propdev            prod checkout (branch main)     -> pm2 "gabe"          :8080
/root/propdev-staging    staging checkout (branch stg)   -> pm2 "gabe-staging"  :8081
/root/propdev-data           prod DB + uploads   (propdev.db, uploads/)
/root/propdev-staging-data   staging DB + uploads
/root/deploy.sh          -> symlink to /root/propdev/gabe/deploy.sh
/etc/nginx/sites-available/propdev , propdev-staging     nginx vhosts (TLS)
```
Data dirs live **outside** the repo so `git pull` / rebuilds never touch them.

---

## 6. Local development

The frontend calls `/api` on the same origin, so you need the backend running too.

**Option A — hot reload (two terminals):**
```bash
# terminal 1: backend on :4000
cd gabe/server && npm install && PORT=4000 DATA_DIR=./data node index.js
# terminal 2: React dev server on :3000 (proxies /api to :4000 — set in package.json)
cd gabe && npm install && npm start
```

**Option B — production-like (one process):**
```bash
cd gabe && npm install && npm run build
cd server && npm install && PORT=4000 DATA_DIR=./data node index.js
# open http://localhost:4000
```

Run tests: `cd gabe && CI=true npm test -- --watchAll=false`

---

## 7. Operations cookbook

```bash
# --- status / logs / restart (on the droplet) ---
ssh root@170.64.225.210 'pm2 list'
ssh root@170.64.225.210 'pm2 logs gabe --lines 50'           # prod logs
ssh root@170.64.225.210 'pm2 logs gabe-staging --lines 50'   # staging logs
ssh root@170.64.225.210 'pm2 restart gabe'                   # restart prod

# --- backup the database + uploaded files (prod) ---
ssh root@170.64.225.210 'tar czf /root/backup-$(date +%F).tgz -C /root propdev-data'
#   then copy it off the server:
scp root@170.64.225.210:/root/backup-*.tgz .

# --- inspect the database ---
ssh root@170.64.225.210 'apt-get install -y sqlite3; sqlite3 /root/propdev-data/propdev.db ".tables"'

# --- copy PROD data into STAGING (to test against a real snapshot) ---
ssh root@170.64.225.210 'pm2 stop gabe-staging; \
  rm -rf /root/propdev-staging-data/* ; \
  cp -r /root/propdev-data/* /root/propdev-staging-data/ ; \
  pm2 start gabe-staging'

# --- TLS certs renew automatically; to check / force ---
ssh root@170.64.225.210 'certbot certificates'
ssh root@170.64.225.210 'certbot renew --dry-run'
```

**Add or change a login:** edit `server/users.js` (and `src/data/roles.ts` if changing which
portals a role sees), commit, deploy. **Use a real custom domain:** point its DNS A-record to
`170.64.225.210`, then `certbot --nginx -d yourdomain.com` and update the nginx `server_name`.

---

## 8. How to add a new "fillable" thing (the pattern)

Adding add/edit/delete for a new record type is a few lines, because the backend is generic:

```ts
import { useCollection } from '../data/useCollection';

// key format: propdev:<projectId>:<name>   (use '__portfolio__' for org-level data)
const items = useCollection<MyType>(`propdev:${projectId}:mything`);

items.items                 // current records (auto-fetched, live-updating)
items.add({ ...fields })    // create  (id auto-assigned)
items.update(id, { ...patch })
items.remove(id)
```
The server stores it automatically — **no backend changes needed** for a new collection.
For uploaded files use `useFiles(projectId)` from `data/fileStore.ts`.

---

## 9. Suggested next steps (priority order)

1. **Per-user accounts** (replace shared demo logins) — biggest gap for real use.
2. **Migrate phase to-dos/notes + Planner to the backend** so nothing is browser-only.
3. **Auto-deploy staging** on push + an `npm test` gate in `deploy.sh`.
4. **Automated nightly backup** of `propdev-data` (cron + offsite copy).
5. Clean up dead code (`PlansTab`, `EngageConsultantModal`).
6. First real integration (e.g. Gmail ingestion or Xero) — the original product vision.
7. A custom domain + (optionally) a separate staging droplet.
```
