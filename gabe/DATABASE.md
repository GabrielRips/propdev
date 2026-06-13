# PropDev — Database Handover

How data is stored, where it lives, how to inspect/back it up, and how to change it.
Last updated 2026-06-09.

---

## 1. At a glance

- **Engine:** SQLite 3.45 (`better-sqlite3`), running in-process with the Node API. **WAL mode.**
- **Why SQLite:** zero-config, file-based, perfect for a single small droplet. No separate DB server.
- **Where:**

  | Env | Database file | Uploaded files |
  |-----|---------------|----------------|
  | Prod | `/root/propdev-data/propdev.db` | `/root/propdev-data/uploads/` |
  | Staging | `/root/propdev-staging-data/propdev.db` | `/root/propdev-staging-data/uploads/` |

  (You'll also see `propdev.db-wal` and `propdev.db-shm` next to the db — normal WAL sidecar files.)
- **Schema is created automatically** on server start (`CREATE TABLE IF NOT EXISTS` in
  `server/index.js`). There is **no migration tool** — see §7.
- Only **3 tables**: `projects`, `items`, `files`. Most of the app is stored generically in `items`.

---

## 2. Physical schema (exactly as deployed)

```sql
CREATE TABLE projects (
  id         TEXT PRIMARY KEY,   -- e.g. 'proj-mq4q5cya-4bd891'
  data       TEXT NOT NULL,      -- the full project object as JSON (see §4)
  created_at INTEGER NOT NULL    -- epoch ms
);

-- Generic store: ONE row per record for EVERY module (contacts, invoices, lots,
-- defects, rfis, checklist, permits, utilities, consultants, legal, feasibility,
-- assets, packs, capital...). The `data` column holds the record as JSON.
CREATE TABLE items (
  project_id TEXT NOT NULL,      -- which project (or '__portfolio__' for org-level data)
  collection TEXT NOT NULL,      -- which module, e.g. 'contacts', 'invoices', 'sales-lots'
  id         TEXT NOT NULL,      -- record id
  data       TEXT NOT NULL,      -- the record object as JSON (includes its own id)
  created_at INTEGER NOT NULL,
  PRIMARY KEY (project_id, collection, id)
);

CREATE TABLE files (
  id          TEXT PRIMARY KEY,  -- e.g. 'f-mq4q28ld-f5213d'
  project_id  TEXT NOT NULL,
  category    TEXT NOT NULL,     -- 'Architectural' | 'Working Drawings' | 'Consultant Reports' | 'Permits' | 'Other'
  name        TEXT NOT NULL,     -- original filename
  type        TEXT NOT NULL,     -- MIME type
  size        INTEGER NOT NULL,  -- bytes
  storage     TEXT NOT NULL,     -- filename on disk under uploads/ (the bytes live there, NOT in the db)
  uploaded_at INTEGER NOT NULL,
  uploaded_by TEXT NOT NULL      -- user's display name
);

CREATE INDEX items_pc ON items (project_id, collection);
CREATE INDEX files_p  ON files (project_id);
```

**Design note:** this is a deliberately simple "document store on SQLite." Each record is a
JSON blob; the typed shape is enforced by the **frontend/TypeScript**, not the database. That's
why adding a new module needs **no schema change** (just a new `collection` name).

---

## 3. How the API maps to the tables

All routes live in `server/index.js` and require a JWT (`Authorization: Bearer …`).

| HTTP | Table / effect |
|------|----------------|
| `POST /api/login` | validates against `server/users.js`, returns a JWT (no DB) |
| `GET/POST /api/projects`, `PUT/DELETE /api/projects/:id` | `projects` (delete also purges that project's `items` + `files`) |
| `GET/POST /api/projects/:pid/collections/:name` | read/insert rows in `items` |
| `PUT/DELETE /api/projects/:pid/collections/:name/:id` | update/delete a row in `items` |
| `GET/POST /api/projects/:pid/files`, `GET/DELETE /api/files/:id` | `files` table + bytes under `uploads/` |

Frontend ↔ collection key mapping: the hook `useCollection('propdev:<projectId>:<name>')`
(in `src/data/useCollection.ts`) talks to `/projects/<projectId>/collections/<name>`.

---

## 4. What's in each collection (the JSON shapes)

### `projects.data` — the Project object
```
{ id, name, address, suburb, state, type, phases: {<Phase>: 0-100}, totalUnits,
  estimatedValue, startDate, estimatedCompletion, recentEmails, description }
```

### Per-project collections (`items.project_id` = a real project id)
| `collection` | Record shape (JSON in `items.data`) |
|--------------|-------------------------------------|
| `contacts` | `{ id, name, organisation, role?, phone, email }` |
| `invoices` | `{ id, provider, description, amount, dueDate?, status: pending\|approved\|paid\|rejected, createdAt }` |
| `sales-lots` | `{ id, lotNumber, beds, baths, cars, internalArea, listPrice, status: available\|reserved\|under_contract\|settled, buyer?, agent?, reservedDate?, contractDate?, depositPaid?, settlementDue?, salePrice?, notes? }` |
| `checklist` | `{ id }` — presence = that checklist item id (e.g. `s1-i3`) is ticked |
| `defects` | `{ id, location, description, contractor, contractorEmail?, raisedDate, status: open\|sent\|signed_off, signedOffDate?, hasPhoto }` |
| `rfis` | `{ id, subject, contractor, contractorPhone, sentDate, status: awaiting\|responded, responseDate?, quotedAmount?, note? }` |
| `inspections` | `{ id, type, inspector, organisation, date, status: passed\|failed\|pending, certificate?, notes? }` |
| `ohs` | `{ id, type, name, party, date, expiry? }` |
| `permits` | `{ id, name, authority, status: not_lodged\|lodged\|rfi\|approved, lodgementDate?, approvalDate?, expiryDate?, fees?, notes? }` |
| `utilities` | `{ id, kind: Electricity\|Water\|Gas\|Other, provider, status: not_applied\|applied\|approved\|energised\|connected, applicationNo?, feesPaid?, date?, notes? }` |
| `consultants` | `{ id, reportName, discipline, submittedBy?, submitterEmail?, submitterPhone?, dateReceived?, status: not_received\|draft\|final\|superseded, dueDate?, notes? }` |
| `legal` | `{ id, name, section: Acquisition\|Planning\|Construction\|Sales, dateReceived?, submittedBy?, notes? }` |
| `feasibility` | single record: `{ id, gdv, totalCost, liveCost, equity, debt, irr, costLines[], revenueLines[], cashflow[], sensitivity[] }` |

### Portfolio-level collections (`items.project_id` = `__portfolio__`)
| `collection` | Record shape |
|--------------|--------------|
| `assets` | `{ id, address, suburb, state, propertyValue, valuationDate, valuationSource, loanAmount, lender, weeklyRent, managedBy, contactNumber, dateOwned, ownedUnder, ownershipType: Personal\|Company\|Trust\|SMSF, documents[] }` |
| `packs` | `{ id, type, title, projectId, recipient, recipientOrg, status: draft\|ready\|shared, lastGenerated?, sharedDate?, sections[] }` |
| `capital` | `{ id, projectId, purpose, amount, party, status: identified\|in_discussion\|term_sheet\|committed, note? }` |

> **Not in the database (yet):** per-phase **to-dos & notes** and the **Planner** board still
> live in the browser's `localStorage`, so they're per-browser. Migrating them to an `items`
> collection (e.g. `todos`, `notes`) is a small, well-defined job.

---

## 5. Inspecting & querying

```bash
ssh root@170.64.225.210
DB=/root/propdev-data/propdev.db          # staging: /root/propdev-staging-data/propdev.db

sqlite3 "$DB" ".tables"
sqlite3 "$DB" ".schema items"
sqlite3 "$DB" "SELECT id, json_extract(data,'$.name') AS name FROM projects;"
sqlite3 "$DB" "SELECT DISTINCT collection FROM items;"                       # which modules have data
sqlite3 "$DB" "SELECT collection, COUNT(*) FROM items GROUP BY collection;"  # counts per module
# all invoices for a project, pretty:
sqlite3 "$DB" "SELECT json_extract(data,'$.provider'), json_extract(data,'$.amount'), json_extract(data,'$.status')
               FROM items WHERE collection='invoices';"
sqlite3 "$DB" "SELECT name, size, category FROM files;"
```
SQLite ships `json_extract(...)` so you can query inside the JSON blobs.

---

## 6. Backup & restore

The whole state is **two folders** (`propdev-data`, `propdev-staging-data`). Back them up as a unit.

```bash
# --- BACKUP (db + uploaded files) ---
# safe hot backup of the db (handles WAL correctly):
ssh root@170.64.225.210 'sqlite3 /root/propdev-data/propdev.db ".backup /root/propdev-data/backup.db"'
# then archive db backup + uploads and pull it down:
ssh root@170.64.225.210 'tar czf /root/propdev-backup-$(date +%F).tgz -C /root/propdev-data backup.db uploads'
scp root@170.64.225.210:/root/propdev-backup-*.tgz .

# --- RESTORE ---
# stop the app, replace files, restart:
ssh root@170.64.225.210 'pm2 stop gabe'
#   put propdev.db + uploads/ back into /root/propdev-data/ (extract your archive there)
ssh root@170.64.225.210 'pm2 start gabe'
```
> There is **no automated/scheduled backup yet** — recommend a nightly cron of the above.

---

## 7. Changing the schema / migrations

There is **no migration framework**. The schema is defined by the `CREATE TABLE IF NOT EXISTS`
block in `server/index.js`, run on every boot.

- **Most changes need NO migration.** Because module records are JSON in `items.data`, adding/
  removing a field on a record type is just a frontend change — existing rows keep working
  (missing fields read as `undefined`).
- **Adding a whole new module:** no DB change — pick a new `collection` name and use
  `useCollection('propdev:<projectId>:<newname>')`.
- **Adding a real column or table** (e.g. when you add per-user accounts): edit the schema block
  in `server/index.js`. `CREATE TABLE IF NOT EXISTS` / `CREATE INDEX IF NOT EXISTS` are safe to
  re-run. For altering an existing table, add an idempotent `ALTER TABLE ... ADD COLUMN` guarded
  by a check, or write a one-off SQL script. Test on **staging first** (copy prod data over —
  see `HANDOVER.md` §7).

---

## 8. Known limitations

- **No foreign keys / referential integrity** — deleting a project cascades in app code
  (`server/index.js`), not via DB constraints.
- **JSON-blob records** aren't fully relational — fine at this scale; queries use `json_extract`.
- **No per-user ownership / multi-tenant isolation** — all logged-in users share one dataset
  (portfolio collections under `__portfolio__` are global). Adding real accounts means new
  `users` + ownership columns.
- **Single file, single server** — no replication. Backups are your safety net.
- For the original "proper" relational design (Postgres, full normalised schema with FKs/RLS),
  see `DATABASE-DESIGN.md` — that's the aspirational target if this grows beyond a prototype.

---

## 9. Quick reference

```
Prod DB:     /root/propdev-data/propdev.db          uploads: /root/propdev-data/uploads/
Staging DB:  /root/propdev-staging-data/propdev.db  uploads: /root/propdev-staging-data/uploads/
Schema:      server/index.js  (CREATE TABLE block)
Tables:      projects | items (generic, keyed by project_id+collection+id) | files
Inspect:     sqlite3 <db> "SELECT collection, COUNT(*) FROM items GROUP BY collection;"
Backup:      sqlite3 <db> ".backup out.db"  +  tar the uploads/ dir
```
