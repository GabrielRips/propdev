import React, { useEffect, useMemo, useState } from 'react';
import AppShell from './AppShell';
import { useCollection } from '../data/useCollection';
import {
  Pack,
  PackSection,
  PackType,
  PackStatus,
  CapitalRequest,
} from '../data/investor-data';
import { getProjects } from '../data/projectStore';

const PACKS_KEY = 'propdev:__portfolio__:packs';
const CAPITAL_KEY = 'propdev:__portfolio__:capital';

const today = new Date().toISOString().slice(0, 10);

// ── Helpers ──────────────────────────────────────────────────────────────
function formatAUD(amount: number): string {
  return amount.toLocaleString('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatAUDShort(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (Math.abs(amount) >= 1_000) return `$${Math.round(amount / 1_000)}K`;
  return formatAUD(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function projectName(projectId: string): string {
  if (!projectId) return 'No project';
  return getProjects().find((p) => p.id === projectId)?.name ?? 'Unknown project';
}

// Default section list seeded onto every new pack.
function defaultSections(): PackSection[] {
  return [
    { label: 'Project summary & status', included: true, source: 'Dashboard' },
    { label: 'Feasibility & margin', included: true, source: 'Feasibility Engine' },
    { label: 'Pre-sales register', included: true, source: 'Sales' },
    { label: 'Live budget vs feasibility', included: true, source: 'Financial Control Centre' },
    { label: 'Construction progress & photos', included: true, source: 'Construction Hub' },
    { label: 'Planning & permits', included: true, source: 'Permits' },
    { label: 'Cashflow forecast', included: true, source: 'Feasibility Engine' },
  ];
}

// ── Static config ────────────────────────────────────────────────────────
const PACK_FILTERS: Array<'All' | PackType> = [
  'All',
  'Lender Pack',
  'Investor Pack',
  'JV Report',
];

const PACK_TYPES: PackType[] = ['Lender Pack', 'Investor Pack', 'JV Report'];

const PACK_TYPE_BADGE: Record<PackType, string> = {
  'Lender Pack': 'bg-blue-50 text-blue-700 border-blue-200',
  'Investor Pack': 'bg-purple-50 text-purple-700 border-purple-200',
  'JV Report': 'bg-amber-50 text-amber-700 border-amber-200',
};

const PACK_STATUSES: PackStatus[] = ['draft', 'ready', 'shared'];

const PACK_STATUS_PILL: Record<PackStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  ready: 'bg-blue-50 text-blue-700',
  shared: 'bg-emerald-50 text-emerald-700',
};

const CAP_STATUS_ORDER: CapitalRequest['status'][] = [
  'identified',
  'in_discussion',
  'term_sheet',
  'committed',
];

const CAP_STATUS_LABEL: Record<CapitalRequest['status'], string> = {
  identified: 'Identified',
  in_discussion: 'In discussion',
  term_sheet: 'Term sheet',
  committed: 'Committed',
};

const CAP_STATUS_PILL: Record<CapitalRequest['status'], string> = {
  identified: 'bg-gray-100 text-gray-600',
  in_discussion: 'bg-amber-50 text-amber-700',
  term_sheet: 'bg-blue-50 text-blue-700',
  committed: 'bg-emerald-50 text-emerald-700',
};

const CAP_STATUS_BAR: Record<CapitalRequest['status'], string> = {
  identified: 'bg-gray-300',
  in_discussion: 'bg-amber-400',
  term_sheet: 'bg-blue-500',
  committed: 'bg-emerald-500',
};

// ── Escape-to-close hook ─────────────────────────────────────────────────
function useEscapeClose(onClose: () => void) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);
}

// ── Toggle switch ────────────────────────────────────────────────────────
function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${
        on ? 'bg-emerald-500' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          on ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

// ── KPI card ─────────────────────────────────────────────────────────────
function Kpi({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${accent ?? 'text-gray-900'}`}>{value}</p>
    </div>
  );
}

// Shared input styling
const inputClass =
  'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
const labelClass = 'block text-xs font-medium text-gray-500 mb-1.5';

// ── New pack modal ───────────────────────────────────────────────────────
function NewPackModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (input: Omit<Pack, 'id'>) => void;
}) {
  useEscapeClose(onClose);
  const projects = getProjects();

  const [type, setType] = useState<PackType>('Lender Pack');
  const [title, setTitle] = useState('');
  const [recipient, setRecipient] = useState('');
  const [recipientOrg, setRecipientOrg] = useState('');
  const [projectId, setProjectId] = useState('');

  const canSave = title.trim().length > 0;

  function save() {
    if (!canSave) return;
    onCreate({
      type,
      title: title.trim(),
      projectId,
      recipient: recipient.trim(),
      recipientOrg: recipientOrg.trim(),
      status: 'draft',
      sections: defaultSections(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">New reporting pack</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto space-y-4">
          <div>
            <label className={labelClass}>Pack type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as PackType)}
              className={inputClass}
            >
              {PACK_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Title *</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q2 drawdown pack"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Recipient</label>
              <input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Contact name"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Recipient org</label>
              <input
                value={recipientOrg}
                onChange={(e) => setRecipientOrg(e.target.value)}
                placeholder="Organisation"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Project</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className={inputClass}
            >
              <option value="">No project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <p className="text-[11px] text-gray-400">
            The pack is seeded with the standard 7 sections. Use Configure to scope which
            sections the recipient can see.
          </p>
        </div>

        <div className="px-6 py-3 border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={!canSave}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create pack
          </button>
        </div>
      </div>
    </div>
  );
}

// ── New capital request modal ────────────────────────────────────────────
function NewCapitalModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (input: Omit<CapitalRequest, 'id'>) => void;
}) {
  useEscapeClose(onClose);
  const projects = getProjects();

  const [purpose, setPurpose] = useState('');
  const [amount, setAmount] = useState('');
  const [party, setParty] = useState('');
  const [projectId, setProjectId] = useState('');
  const [status, setStatus] = useState<CapitalRequest['status']>('identified');
  const [note, setNote] = useState('');

  const canSave = purpose.trim().length > 0;
  const parsedAmount = Number(amount.replace(/[^0-9.]/g, '')) || 0;

  function save() {
    if (!canSave) return;
    onCreate({
      projectId,
      purpose: purpose.trim(),
      amount: parsedAmount,
      party: party.trim(),
      status,
      note: note.trim() || undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">New capital request</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto space-y-4">
          <div>
            <label className={labelClass}>Purpose *</label>
            <input
              autoFocus
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Senior debt — construction facility"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Amount (AUD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  $
                </span>
                <input
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className={`${inputClass} pl-7`}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Party</label>
              <input
                value={party}
                onChange={(e) => setParty(e.target.value)}
                placeholder="Lender / investor"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Project</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className={inputClass}
              >
                <option value="">No project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CapitalRequest['status'])}
                className={inputClass}
              >
                {CAP_STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {CAP_STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Optional context"
              className={inputClass}
            />
          </div>
        </div>

        <div className="px-6 py-3 border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={!canSave}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add request
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Configure modal ──────────────────────────────────────────────────────
function ConfigureModal({
  pack,
  onClose,
  onToggleSection,
  onGenerate,
}: {
  pack: Pack;
  onClose: () => void;
  onToggleSection: (index: number) => void;
  onGenerate: () => void;
}) {
  useEscapeClose(onClose);

  const includedCount = pack.sections.filter((s) => s.included).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-gray-200">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span
                className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded border ${PACK_TYPE_BADGE[pack.type]}`}
              >
                {pack.type}
              </span>
              <h2 className="text-base font-bold text-gray-900 mt-1.5 truncate">
                {pack.title}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {pack.recipient || '—'} · {pack.recipientOrg || '—'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 text-xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Controlled visibility — only the sections toggled on are shared with{' '}
            <span className="font-medium text-gray-600">{pack.recipientOrg || 'the recipient'}</span>.
            Unchecked sections are hidden from the recipient.
          </p>
        </div>

        <div className="px-5 py-3 overflow-y-auto divide-y divide-gray-100">
          {pack.sections.map((section, i) => (
            <div key={section.label} className="flex items-center gap-3 py-3">
              <Toggle on={section.included} onClick={() => onToggleSection(i)} />
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-medium ${
                    section.included ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {section.label}
                </p>
                <p className="text-[11px] text-gray-400">Source: {section.source}</p>
              </div>
              {!section.included && (
                <span className="text-[10px] font-semibold text-gray-400 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">
                  Hidden
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            Recipient will see{' '}
            <span className="font-semibold text-gray-900">{includedCount}</span> of{' '}
            <span className="font-semibold text-gray-900">{pack.sections.length}</span>{' '}
            sections
          </p>
          <button
            onClick={onGenerate}
            className="text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg px-4 py-2 transition-colors"
          >
            Generate pack
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────
export default function InvestorPortal() {
  const packs = useCollection<Pack>(PACKS_KEY);
  const capital = useCollection<CapitalRequest>(CAPITAL_KEY);

  const [filter, setFilter] = useState<'All' | PackType>('All');
  const [configuringId, setConfiguringId] = useState<string | null>(null);
  const [showNewPack, setShowNewPack] = useState(false);
  const [showNewCapital, setShowNewCapital] = useState(false);

  const configuringPack = packs.items.find((p) => p.id === configuringId) ?? null;

  // KPIs
  const kpis = useMemo(() => {
    const shared = packs.items.filter((p) => p.status === 'shared').length;
    const sought = capital.items
      .filter((c) => c.status !== 'committed')
      .reduce((sum, c) => sum + c.amount, 0);
    const committed = capital.items
      .filter((c) => c.status === 'committed')
      .reduce((sum, c) => sum + c.amount, 0);
    return { totalPacks: packs.items.length, shared, sought, committed };
  }, [packs.items, capital.items]);

  // Capital pipeline sorted by stage
  const sortedRequests = useMemo(
    () =>
      [...capital.items].sort(
        (a, b) =>
          CAP_STATUS_ORDER.indexOf(a.status) - CAP_STATUS_ORDER.indexOf(b.status)
      ),
    [capital.items]
  );

  const stageTotals = useMemo(() => {
    const totals = CAP_STATUS_ORDER.map((status) => ({
      status,
      amount: capital.items
        .filter((c) => c.status === status)
        .reduce((sum, c) => sum + c.amount, 0),
    }));
    const grand = totals.reduce((sum, t) => sum + t.amount, 0) || 1;
    return { totals, grand };
  }, [capital.items]);

  const visiblePacks =
    filter === 'All' ? packs.items : packs.items.filter((p) => p.type === filter);

  // Actions
  function regenerate(id: string) {
    packs.update(id, { status: 'ready', lastGenerated: today });
  }

  function share(id: string) {
    packs.update(id, { status: 'shared', sharedDate: today });
  }

  function toggleSection(pack: Pack, index: number) {
    const sections = pack.sections.map((s, i) =>
      i === index ? { ...s, included: !s.included } : s
    );
    packs.update(pack.id, { sections });
  }

  function generateFromModal(id: string) {
    packs.update(id, { status: 'ready', lastGenerated: today });
    setConfiguringId(null);
  }

  return (
    <AppShell
      title="Investor & Capital"
      subtitle="Lender packs, investor packs & JV reports"
    >
      {/* Explainer */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">One-click reporting.</span>{' '}
          Packs auto-assemble from your PropDev modules — Feasibility, Sales,
          Construction and Financial Control — so lender drawdowns, investor updates
          and JV reports are generated in a single click. Use{' '}
          <span className="font-medium text-emerald-700">controlled visibility</span>{' '}
          to scope exactly which sections each recipient can see.
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Kpi label="Total packs" value={String(kpis.totalPacks)} />
        <Kpi label="Shared" value={String(kpis.shared)} accent="text-emerald-600" />
        <Kpi label="Capital requests" value={String(capital.items.length)} />
        <Kpi
          label="Capital sought"
          value={formatAUDShort(kpis.sought)}
          accent="text-amber-600"
        />
        <Kpi
          label="Committed"
          value={formatAUDShort(kpis.committed)}
          accent="text-emerald-600"
        />
      </div>

      {/* Capital pipeline */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-gray-900">Capital-raising pipeline</h2>
          <button
            onClick={() => setShowNewCapital(true)}
            className="text-xs font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg px-3 py-1.5 transition-colors"
          >
            + New capital request
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Live view of debt and equity across stages.
        </p>

        {capital.items.length > 0 && (
          /* stacked summary bar */
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100">
              {stageTotals.totals.map((t) =>
                t.amount > 0 ? (
                  <div
                    key={t.status}
                    className={CAP_STATUS_BAR[t.status]}
                    style={{ width: `${(t.amount / stageTotals.grand) * 100}%` }}
                    title={`${CAP_STATUS_LABEL[t.status]} — ${formatAUD(t.amount)}`}
                  />
                ) : null
              )}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3">
              {stageTotals.totals.map((t) => (
                <div key={t.status} className="flex items-center gap-1.5 text-xs">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${CAP_STATUS_BAR[t.status]}`}
                  />
                  <span className="text-gray-500">{CAP_STATUS_LABEL[t.status]}</span>
                  <span className="font-semibold text-gray-900">
                    {formatAUDShort(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          {sortedRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-gray-900">{req.purpose}</p>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${CAP_STATUS_PILL[req.status]}`}
                  >
                    {CAP_STATUS_LABEL[req.status]}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {projectName(req.projectId)}
                  {req.party ? ` · ${req.party}` : ''}
                </p>
                {req.note && (
                  <p className="text-xs text-gray-400 mt-1.5">{req.note}</p>
                )}
              </div>
              <div className="text-right flex-shrink-0 flex items-start gap-3">
                <p className="text-base font-bold text-gray-900">
                  {formatAUDShort(req.amount)}
                </p>
                <button
                  onClick={() => capital.remove(req.id)}
                  className="text-gray-300 hover:text-red-500 text-sm leading-none mt-1"
                  title="Delete request"
                  aria-label="Delete request"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>

        {capital.items.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400 text-sm">No capital requests yet.</p>
          </div>
        )}
      </section>

      {/* Packs */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Reporting packs</h2>
          <button
            onClick={() => setShowNewPack(true)}
            className="text-xs font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg px-3 py-1.5 transition-colors"
          >
            + New pack
          </button>
        </div>

        {/* filter pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {PACK_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                filter === f
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {visiblePacks.map((pack) => {
            const includedCount = pack.sections.filter((s) => s.included).length;
            return (
              <div
                key={pack.id}
                className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${PACK_TYPE_BADGE[pack.type]}`}
                      >
                        {pack.type}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${PACK_STATUS_PILL[pack.status]}`}
                      >
                        {pack.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mt-2">
                      {pack.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {projectName(pack.projectId)}
                    </p>
                  </div>
                  <button
                    onClick={() => packs.remove(pack.id)}
                    className="text-gray-300 hover:text-red-500 text-lg leading-none flex-shrink-0"
                    title="Delete pack"
                    aria-label="Delete pack"
                  >
                    ×
                  </button>
                </div>

                <div className="mt-3 text-xs text-gray-500 space-y-0.5">
                  <p>
                    <span className="text-gray-400">Recipient:</span>{' '}
                    {pack.recipient || '—'}
                    {' · '}
                    {pack.recipientOrg || '—'}
                  </p>
                  <p>
                    <span className="text-gray-400">Visibility:</span>{' '}
                    {includedCount} of {pack.sections.length} sections shared
                  </p>
                  {pack.status === 'shared' && pack.sharedDate ? (
                    <p>
                      <span className="text-gray-400">Shared:</span>{' '}
                      {formatDate(pack.sharedDate)}
                    </p>
                  ) : pack.lastGenerated ? (
                    <p>
                      <span className="text-gray-400">Last generated:</span>{' '}
                      {formatDate(pack.lastGenerated)}
                    </p>
                  ) : null}
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setConfiguringId(pack.id)}
                    className="text-xs font-medium text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
                  >
                    Configure
                  </button>
                  <button
                    onClick={() => regenerate(pack.id)}
                    className="text-xs font-medium text-blue-700 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors"
                  >
                    Regenerate
                  </button>
                  <button
                    onClick={() => share(pack.id)}
                    disabled={pack.status === 'draft'}
                    className="text-xs font-medium text-white bg-emerald-600 rounded-lg px-3 py-1.5 hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ml-auto"
                  >
                    Share
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {packs.items.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400 text-sm">No packs yet — create one.</p>
          </div>
        ) : visiblePacks.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400 text-sm">No packs of this type.</p>
          </div>
        ) : null}
      </section>

      {configuringPack && (
        <ConfigureModal
          pack={configuringPack}
          onClose={() => setConfiguringId(null)}
          onToggleSection={(index) => toggleSection(configuringPack, index)}
          onGenerate={() => generateFromModal(configuringPack.id)}
        />
      )}

      {showNewPack && (
        <NewPackModal
          onClose={() => setShowNewPack(false)}
          onCreate={(input) => {
            packs.add(input);
            setShowNewPack(false);
          }}
        />
      )}

      {showNewCapital && (
        <NewCapitalModal
          onClose={() => setShowNewCapital(false)}
          onCreate={(input) => {
            capital.add(input);
            setShowNewCapital(false);
          }}
        />
      )}
    </AppShell>
  );
}
