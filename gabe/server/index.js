const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');
const { USERS, publicUser } = require('./users');

// ── Config ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const BUILD_DIR = path.join(__dirname, '..', 'build');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const JWT_SECRET = process.env.JWT_SECRET || 'propdev-prototype-secret-change-me';

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ── Database ────────────────────────────────────────────────────────────────
const db = new Database(path.join(DATA_DIR, 'propdev.db'));
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS items (
    project_id TEXT NOT NULL,
    collection TEXT NOT NULL,
    id TEXT NOT NULL,
    data TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    PRIMARY KEY (project_id, collection, id)
  );
  CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    size INTEGER NOT NULL,
    storage TEXT NOT NULL,
    uploaded_at INTEGER NOT NULL,
    uploaded_by TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS items_pc ON items (project_id, collection);
  CREATE INDEX IF NOT EXISTS files_p ON files (project_id);
`);

const newId = (prefix) => `${prefix}-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`;

// ── App ───────────────────────────────────────────────────────────────────────
const app = express();
app.use(express.json({ limit: '2mb' }));

// ── Auth ──────────────────────────────────────────────────────────────────────
app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  const user = USERS.find((u) => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid username or password.' });
  const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, user: publicUser(user) });
});

function auth(req, res, next) {
  const header = req.headers.authorization;
  const bearer = header && header.startsWith('Bearer ') ? header.slice(7) : null;
  const token = bearer || req.query.token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = USERS.find((u) => u.username === payload.username);
    if (!req.user) return res.status(401).json({ error: 'Unknown user' });
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

app.get('/api/me', auth, (req, res) => res.json({ user: publicUser(req.user) }));

// ── Projects ──────────────────────────────────────────────────────────────────
app.get('/api/projects', auth, (req, res) => {
  const rows = db.prepare('SELECT data FROM projects ORDER BY created_at DESC').all();
  res.json(rows.map((r) => JSON.parse(r.data)));
});

app.post('/api/projects', auth, (req, res) => {
  const id = newId('proj');
  const project = { ...req.body, id };
  db.prepare('INSERT INTO projects (id, data, created_at) VALUES (?, ?, ?)').run(id, JSON.stringify(project), Date.now());
  res.status(201).json(project);
});

app.get('/api/projects/:id', auth, (req, res) => {
  const row = db.prepare('SELECT data FROM projects WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(JSON.parse(row.data));
});

app.put('/api/projects/:id', auth, (req, res) => {
  const row = db.prepare('SELECT data FROM projects WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  const updated = { ...JSON.parse(row.data), ...req.body, id: req.params.id };
  db.prepare('UPDATE projects SET data = ? WHERE id = ?').run(JSON.stringify(updated), req.params.id);
  res.json(updated);
});

app.delete('/api/projects/:id', auth, (req, res) => {
  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  db.prepare('DELETE FROM items WHERE project_id = ?').run(req.params.id);
  const files = db.prepare('SELECT storage FROM files WHERE project_id = ?').all(req.params.id);
  files.forEach((f) => fs.existsSync(path.join(UPLOAD_DIR, f.storage)) && fs.unlinkSync(path.join(UPLOAD_DIR, f.storage)));
  db.prepare('DELETE FROM files WHERE project_id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ── Generic collections (contacts, invoices, lots, defects, rfis, checklist…) ──
app.get('/api/projects/:projectId/collections/:name', auth, (req, res) => {
  const rows = db
    .prepare('SELECT data FROM items WHERE project_id = ? AND collection = ? ORDER BY created_at DESC')
    .all(req.params.projectId, req.params.name);
  res.json(rows.map((r) => JSON.parse(r.data)));
});

app.post('/api/projects/:projectId/collections/:name', auth, (req, res) => {
  const id = req.body.id || newId('i');
  const record = { ...req.body, id };
  db.prepare('INSERT OR REPLACE INTO items (project_id, collection, id, data, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(req.params.projectId, req.params.name, id, JSON.stringify(record), Date.now());
  res.status(201).json(record);
});

app.put('/api/projects/:projectId/collections/:name/:id', auth, (req, res) => {
  const row = db
    .prepare('SELECT data FROM items WHERE project_id = ? AND collection = ? AND id = ?')
    .get(req.params.projectId, req.params.name, req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  const updated = { ...JSON.parse(row.data), ...req.body, id: req.params.id };
  db.prepare('UPDATE items SET data = ? WHERE project_id = ? AND collection = ? AND id = ?')
    .run(JSON.stringify(updated), req.params.projectId, req.params.name, req.params.id);
  res.json(updated);
});

app.delete('/api/projects/:projectId/collections/:name/:id', auth, (req, res) => {
  db.prepare('DELETE FROM items WHERE project_id = ? AND collection = ? AND id = ?')
    .run(req.params.projectId, req.params.name, req.params.id);
  res.json({ ok: true });
});

// ── Files ──────────────────────────────────────────────────────────────────────
const upload = multer({ dest: UPLOAD_DIR, limits: { fileSize: 50 * 1024 * 1024 } });

function fileMeta(row) {
  return {
    id: row.id, projectId: row.project_id, category: row.category, name: row.name,
    type: row.type, size: row.size, uploadedAt: row.uploaded_at, uploadedBy: row.uploaded_by,
  };
}

app.get('/api/projects/:projectId/files', auth, (req, res) => {
  const rows = db.prepare('SELECT * FROM files WHERE project_id = ? ORDER BY uploaded_at DESC').all(req.params.projectId);
  res.json(rows.map(fileMeta));
});

app.post('/api/projects/:projectId/files', auth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  const id = newId('f');
  const row = {
    id, project_id: req.params.projectId, category: req.body.category || 'Other',
    name: req.file.originalname, type: req.file.mimetype || 'application/octet-stream',
    size: req.file.size, storage: req.file.filename, uploaded_at: Date.now(),
    uploaded_by: req.user.name,
  };
  db.prepare(`INSERT INTO files (id, project_id, category, name, type, size, storage, uploaded_at, uploaded_by)
    VALUES (@id, @project_id, @category, @name, @type, @size, @storage, @uploaded_at, @uploaded_by)`).run(row);
  res.status(201).json(fileMeta(row));
});

app.get('/api/files/:id', auth, (req, res) => {
  const row = db.prepare('SELECT * FROM files WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  const filePath = path.join(UPLOAD_DIR, row.storage);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File missing' });
  res.setHeader('Content-Type', row.type);
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(row.name)}"`);
  fs.createReadStream(filePath).pipe(res);
});

app.delete('/api/files/:id', auth, (req, res) => {
  const row = db.prepare('SELECT * FROM files WHERE id = ?').get(req.params.id);
  if (row) {
    const filePath = path.join(UPLOAD_DIR, row.storage);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    db.prepare('DELETE FROM files WHERE id = ?').run(req.params.id);
  }
  res.json({ ok: true });
});

// ── Serve the built SPA (everything not /api) ──────────────────────────────────
app.use(express.static(BUILD_DIR));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(BUILD_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`PropDev server on :${PORT}  (data: ${DATA_DIR})`);
});
