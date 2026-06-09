# PropDev — Operations & Handover

Everything that's built, where it lives, and how to change/deploy it.

---

## 1. Live URLs & logins

| Environment | URL | Git branch |
|---|---|---|
| **Production** | https://170.64.225.210.nip.io | `main` |
| **Staging** | https://staging.170.64.225.210.nip.io | `staging` |

**Logins** (shared demo accounts — all currently full-access):

| Username | Password | Role |
|---|---|---|
| `revity` | `propdev26` | Executive |
| `dev` | `dev` | Development Manager |
| `john` | `john` | Site Supervisor |
| `asset` | `asset` | Asset Manager |
| `investor` | `investor` | Investor |

Server: DigitalOcean droplet, **`root@170.64.225.210`** (Ubuntu 24.04). SSH key access already configured.
Repo: **`github.com:GabrielRips/propdev.git`** (deploy key on the droplet allows read/pull).

---

## 2. What's built

A **Property Development Operating System** — a real web app with a backend, database and file storage.
Everything below is add/edit/delete and **persists server-side** (survives reloads, restarts, devices).

- **Projects** — create, edit phase progress, delete (with all their data).
- **Files & plans** — upload (drag/drop) building plans/PDFs/images, open/preview, delete.
- **Contacts**, **Financial** (invoices: add → approve → paid), **Sales** (lots: add → reserve → contract).
- **Construction Hub** — 12-stage VIC checklist (persisted ticks), defects with photo sign-off, RFIs, inspections, OH&S docs.
- **Permit**, **Utilities** (electricity/water/gas), **Consultants** (reports), **Legal** (documents by phase).
- **Feasibility** — editable model (GDV/cost/equity/debt/IRR + cost/revenue/cashflow/sensitivity rows); margins auto-computed.
- **Assets** — owned-property portfolio (value/loan/LVR/rent/yield), grouped by ownership entity.
- **Investor** — lender/investor/JV packs with scoped-section toggles + capital pipeline.
- **Planner** (kanban) and **Agentic** (concept) dashboards.
- **Auth** — JWT login, role-based portal access.

---

## 3. Tech stack

- **Frontend:** React 19 + TypeScript (Create React App), Tailwind CSS, React Router.
- **Backend:** Node.js + Express, **SQLite** (better-sqlite3), **multer** for file uploads, **JWT** auth.
- **Hosting:** single droplet — **nginx** (TLS termination + reverse proxy) → **Node** (internal port), kept alive by **pm2**. TLS via **Let's Encrypt** (auto-renew).

---

## 4. Architecture

```
Browser ──HTTPS──► nginx (:443, Let's Encrypt)
                     │  proxies to ↓
        prod  ──► Node/Express :8080 ──► SQLite + uploads  (/root/propdev-data)
        staging ► Node/Express :8081 ──► SQLite + uploads  (/root/propdev-staging-data)
```

- The Node server serves **both** the API (`/api/*`) **and** the built React app (everything else).
- The frontend talks to the API at the same origin (`/api/...`) with a JWT bearer token.

---

## 5. Where everything lives

### Repo (`gabe/`)
```
gabe/
  src/
    App.tsx                      # routes + login screen
    auth/AuthContext.tsx         # login/logout, stores JWT
    data/
      api.ts                     # API client (token, fetch helpers, file upload/download URLs)
      projectStore.ts            # projects (useProjects/addProject/updateProject/deleteProject) → API
      useCollection.ts           # generic per-project collections (contacts, invoices, lots, …) → API
      fileStore.ts               # file upload/list/open/delete → API
      roles.ts                   # frontend role/portal definitions
      *-data.ts                  # TypeScript types (data arrays are empty — real data is in the DB)
    components/                  # all screens (Dashboard, ProjectDetail, AdvancedView, the tabs, modals)
  server/
    index.js                     # the whole backend: auth, projects, collections, files, serves the SPA
    users.js                     # login accounts + roles (server-side source of truth)
    package.json                 # backend deps
  deploy.sh                      # deploy script (prod|staging)
  OPERATIONS.md                  # this file
  STAGING.md                     # staging/prod workflow (short version)
```

### Droplet (`/root/`)
```
/root/propdev/              # PROD checkout (branch main)
/root/propdev-staging/      # STAGING checkout (branch staging)
/root/propdev-data/         # PROD database (propdev.db) + uploads/
/root/propdev-staging-data/ # STAGING database + uploads/
/root/deploy.sh             # symlink → /root/propdev/gabe/deploy.sh
/etc/nginx/sites-available/propdev          # prod vhost (TLS)
/etc/nginx/sites-available/propdev-staging  # staging vhost (TLS)
```
pm2 processes: **`gabe`** (prod, :8080) and **`gabe-staging`** (staging, :8081).

---

## 6. How to make a change and ship it  ← the main workflow

**Golden rule: test on staging, then promote to prod.**

```bash
# ── 1. develop on the staging branch ───────────────────────────────
git checkout staging
git merge main                 # keep staging up to date with prod first
# ...edit code, commit...
git commit -am "describe the change"
git push origin staging

# ── 2. deploy + test staging ───────────────────────────────────────
ssh root@170.64.225.210 '/root/deploy.sh staging'
#   → open https://staging.170.64.225.210.nip.io and verify

# ── 3. promote to production ───────────────────────────────────────
git checkout main
git merge staging
git push origin main
ssh root@170.64.225.210 '/root/deploy.sh prod'
#   → open https://170.64.225.210.nip.io
```

`deploy.sh <env>` pulls the right branch, runs `npm install`, builds the frontend, and restarts that
environment's pm2 process. It prints a health check at the end.

---

## 7. Local development

You need the backend running for the app to work (it serves `/api`).

**Option A — hot reload (recommended for coding):**
```bash
# terminal 1 — backend on :4000
cd gabe/server && npm install && PORT=4000 DATA_DIR=./data node index.js
# terminal 2 — React dev server on :3000 (proxies /api → :4000 via package.json "proxy")
cd gabe && npm install && npm start
# open http://localhost:3000
```

**Option B — production-like (one process):**
```bash
cd gabe && npm install && npm run build
cd server && npm install && PORT=4000 DATA_DIR=./data node index.js
# open http://localhost:4000
```

Run tests: `cd gabe && CI=true npm test -- --watchAll=false`

> Local data lives in `gabe/server/data/` (gitignored). Delete it to reset.

---

## 8. Operations cookbook

All commands run on the droplet (`ssh root@170.64.225.210`).

**Status / logs / restart**
```bash
pm2 list                       # both processes + status
pm2 logs gabe --lines 100      # prod logs  (gabe-staging for staging)
pm2 restart gabe               # restart prod
```
pm2 already resurrects both on reboot (`pm2 save` + startup configured).

**Back up the data** (database + uploaded files)
```bash
tar czf /root/backup-$(date +%F).tgz /root/propdev-data
# restore: stop gabe, extract over /root/propdev-data, start gabe
```

**Inspect / edit the database**
```bash
apt-get install -y sqlite3      # once
sqlite3 /root/propdev-data/propdev.db '.tables'
sqlite3 /root/propdev-data/propdev.db 'SELECT json_extract(data,"$.name") FROM projects;'
```

**Copy prod data into staging** (test against real data)
```bash
pm2 stop gabe-staging
cp -r /root/propdev-data/* /root/propdev-staging-data/
pm2 start gabe-staging
```

**Add or change logins / roles**
- Edit `gabe/server/users.js` (the server source of truth for accounts) — add an entry or change a password.
- If you change which portals a role sees, also update `gabe/src/data/roles.ts`.
- Commit, then deploy (staging → prod). *Passwords are plain text — fine for a prototype, not for public production.*

**TLS certificates** — auto-renew via the certbot systemd timer. Manual check/renew:
```bash
certbot certificates
certbot renew --dry-run
```

**Point a real domain at it** (instead of the nip.io host)
1. In your DNS, create an A record for `yourdomain.com` → `170.64.225.210`.
2. On the droplet, edit `server_name` in `/etc/nginx/sites-available/propdev` to your domain, then:
   ```bash
   nginx -t && systemctl reload nginx
   certbot --nginx -d yourdomain.com --redirect
   ```
(Same for a staging subdomain.)

**Add a new fillable module / data type** (the pattern used everywhere)
```tsx
import { useCollection } from '../data/useCollection';
// one line gives you backend-persisted CRUD, keyed per project:
const things = useCollection<Thing>(`propdev:${projectId}:things`);
things.items;                 // current records
things.add({ ...fields });    // create (auto id, POSTs to API)
things.update(id, { ... });   // edit
things.remove(id);            // delete
```
No backend changes needed — the generic collections API stores any `name` per project. (For
portfolio-wide data not tied to a project, use the key `propdev:__portfolio__:things`.)

---

## 9. Important notes / gotchas

- **Data is NOT in git.** It lives in `/root/propdev-data` (prod) and `/root/propdev-staging-data` (staging).
  `git pull` / redeploys never touch it. Don't delete those dirs. Back them up (§8).
- **Staging and prod are fully isolated** — separate databases, files and JWT secrets.
- **Small droplet** (458 MB RAM + 2 GB swap). Two idle Node servers are fine; a frontend build briefly
  spikes memory into swap (slow but OK). If it gets tight, move staging to its own droplet — only the
  nginx vhost and `deploy.sh` target change.
- **Auth is shared demo accounts over the JWT** — good enough for trusted users, not hardened for the
  public internet (plain-text passwords, no per-user accounts, no rate limiting).
- **The `*-data.ts` files** in `src/data/` only export TypeScript *types* now; their data arrays are empty
  because real data lives in the database.
- **JWT secrets** are set in `deploy.sh` (one per env). Changing a secret logs everyone out of that env.
```
