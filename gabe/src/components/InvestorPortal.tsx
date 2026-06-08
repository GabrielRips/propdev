import React, { useEffect, useMemo, useState } from 'react';
import AppShell from './AppShell';
import {
  packs as PACKS,
  capitalRequests,
  Pack,
  PackType,
  CapitalRequest,
} from '../data/investor-data';
import { projects } from '../data/projects';

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

// Fixed "recent" timestamps so regenerate/share are deterministic in the prototype.
const REGEN_DATE = '2026-06-06';
const SHARE_DATE = '2026-06-07';

function projectName(projectId: string): string {
  return projects.find((p) => p.id === projectId)?.name ?? 'Unknown project';
}

// ── Static config ────────────────────────────────────────────────────────
const PACK_FILTERS: Array<'All' | PackType> = [
  'All',
  'Lender Pack',
  'Investor Pack',
  'JV Report',
];

const PACK_TYPE_BADGE: Record<PackType, string> = {
  'Lender Pack': 'bg-blue-50 text-blue-700 border-blue-200',
  'Investor Pack': 'bg-purple-50 text-purple-700 border-purple-200',
  'JV Report': 'bg-amber-50 text-amber-700 border-amber-200',
};

const PACK_STATUS_PILL: Record<Pack['status'], string> = {
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
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

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
                {pack.recipient} · {pack.recipientOrg}
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
            <span className="font-medium text-gray-600">{pack.recipientOrg}</span>.
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
  const [packList, setPackList] = useState<Pack[]>(PACKS);
  const [filter, setFilter] = useState<'All' | PackType>('All');
  const [configuringId, setConfiguringId] = useState<string | null>(null);

  const configuringPack = packList.find((p) => p.id === configuringId) ?? null;

  // KPIs
  const kpis = useMemo(() => {
    const shared = packList.filter((p) => p.status === 'shared').length;
    const sought = capitalRequests
      .filter((c) => c.status !== 'committed')
      .reduce((sum, c) => sum + c.amount, 0);
    const committed = capitalRequests
      .filter((c) => c.status === 'committed')
      .reduce((sum, c) => sum + c.amount, 0);
    return { totalPacks: packList.length, shared, sought, committed };
  }, [packList]);

  // Capital pipeline sorted by stage
  const sortedRequests = useMemo(
    () =>
      [...capitalRequests].sort(
        (a, b) =>
          CAP_STATUS_ORDER.indexOf(a.status) - CAP_STATUS_ORDER.indexOf(b.status)
      ),
    []
  );

  const stageTotals = useMemo(() => {
    const totals = CAP_STATUS_ORDER.map((status) => ({
      status,
      amount: capitalRequests
        .filter((c) => c.status === status)
        .reduce((sum, c) => sum + c.amount, 0),
    }));
    const grand = totals.reduce((sum, t) => sum + t.amount, 0) || 1;
    return { totals, grand };
  }, []);

  const visiblePacks =
    filter === 'All' ? packList : packList.filter((p) => p.type === filter);

  // Actions
  function regenerate(id: string) {
    setPackList((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: 'ready', lastGenerated: REGEN_DATE } : p
      )
    );
  }

  function share(id: string) {
    setPackList((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: 'shared', sharedDate: SHARE_DATE } : p
      )
    );
  }

  function toggleSection(packId: string, index: number) {
    setPackList((prev) =>
      prev.map((p) =>
        p.id === packId
          ? {
              ...p,
              sections: p.sections.map((s, i) =>
                i === index ? { ...s, included: !s.included } : s
              ),
            }
          : p
      )
    );
  }

  function generateFromModal(id: string) {
    setPackList((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: 'ready', lastGenerated: REGEN_DATE } : p
      )
    );
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
        <Kpi label="Capital requests" value={String(capitalRequests.length)} />
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
        <h2 className="text-lg font-bold text-gray-900 mb-1">Capital-raising pipeline</h2>
        <p className="text-sm text-gray-500 mb-4">
          Live view of debt and equity across stages.
        </p>

        {/* stacked summary bar */}
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
                  {projectName(req.projectId)} · {req.party}
                </p>
                {req.note && (
                  <p className="text-xs text-gray-400 mt-1.5">{req.note}</p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-base font-bold text-gray-900">
                  {formatAUDShort(req.amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Packs */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Reporting packs</h2>
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
                </div>

                <div className="mt-3 text-xs text-gray-500 space-y-0.5">
                  <p>
                    <span className="text-gray-400">Recipient:</span> {pack.recipient}
                    {' · '}
                    {pack.recipientOrg}
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

        {visiblePacks.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400 text-sm">No packs of this type.</p>
          </div>
        )}
      </section>

      {configuringPack && (
        <ConfigureModal
          pack={configuringPack}
          onClose={() => setConfiguringId(null)}
          onToggleSection={(index) => toggleSection(configuringPack.id, index)}
          onGenerate={() => generateFromModal(configuringPack.id)}
        />
      )}
    </AppShell>
  );
}
