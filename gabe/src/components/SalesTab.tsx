import React, { useState, useEffect, useMemo } from 'react';
import { getSalesSummary, SalesLot, LotStatus } from '../data/sales-data';
import { useCollection } from '../data/useCollection';

// ── Formatters ───────────────────────────────────────────────────────────────
function formatAUD(n: number): string {
  return '$' + n.toLocaleString('en-AU');
}

function formatAUDShort(n: number): string {
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return '$' + (v >= 10 ? Math.round(v).toString() : v.toFixed(1).replace(/\.0$/, '')) + 'M';
  }
  if (n >= 1_000) {
    return '$' + Math.round(n / 1_000) + 'K';
  }
  return '$' + n.toLocaleString('en-AU');
}

function formatDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ── Status config ────────────────────────────────────────────────────────────
type FilterKey = 'all' | LotStatus;

const STATUS_META: Record<
  LotStatus,
  { label: string; pill: string; dot: string; bar: string }
> = {
  available: {
    label: 'Available',
    pill: 'bg-gray-100 text-gray-600 border border-gray-200',
    dot: 'bg-gray-400',
    bar: 'bg-gray-300',
  },
  reserved: {
    label: 'Reserved',
    pill: 'bg-amber-100 text-amber-700 border border-amber-200',
    dot: 'bg-amber-400',
    bar: 'bg-amber-400',
  },
  under_contract: {
    label: 'Under contract',
    pill: 'bg-blue-100 text-blue-700 border border-blue-200',
    dot: 'bg-blue-500',
    bar: 'bg-blue-500',
  },
  settled: {
    label: 'Settled',
    pill: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    dot: 'bg-emerald-500',
    bar: 'bg-emerald-500',
  },
};

function StatusPill({ status }: { status: LotStatus }) {
  const m = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${m.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

function config(lot: SalesLot): string {
  return `${lot.beds} bed · ${lot.baths} bath · ${lot.cars} car`;
}

// ── KPI card ─────────────────────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${accent ?? 'text-gray-900'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Lot detail modal ─────────────────────────────────────────────────────────
function LotDetailModal({
  lot,
  agency,
  agentLead,
  onClose,
  onReserve,
  onConvert,
  onDelete,
}: {
  lot: SalesLot;
  agency: string;
  agentLead: string;
  onClose: () => void;
  onReserve: (id: string) => void;
  onConvert: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const effectivePrice = lot.salePrice ?? lot.listPrice;
  const variance = lot.salePrice != null ? lot.salePrice - lot.listPrice : 0;
  const showBoth = lot.salePrice != null && lot.salePrice !== lot.listPrice;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">{lot.lotNumber}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {config(lot)} · {lot.internalArea} m²
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusPill status={lot.status} />
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">List price</p>
              <p className="text-lg font-semibold text-gray-900">{formatAUD(lot.listPrice)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">{showBoth ? 'Sale price' : 'Price'}</p>
              <p className="text-lg font-semibold text-gray-900">{formatAUD(effectivePrice)}</p>
              {showBoth && (
                <p className={`text-xs mt-0.5 ${variance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {variance >= 0 ? '+' : '−'}
                  {formatAUD(Math.abs(variance))} vs list
                </p>
              )}
            </div>
          </div>

          {/* Buyer & agent */}
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div>
              <p className="text-xs text-gray-400 mb-1">Buyer</p>
              <p className="text-sm text-gray-900">{lot.buyer ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Agent</p>
              <p className="text-sm text-gray-900">{lot.agent || agentLead || '—'}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Reserved</p>
              <p className="text-sm text-gray-900">{lot.reservedDate ? formatDate(lot.reservedDate) : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Contract</p>
              <p className="text-sm text-gray-900">{lot.contractDate ? formatDate(lot.contractDate) : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Settlement</p>
              <p className="text-sm text-gray-900">
                {lot.settlementDue ? formatDate(lot.settlementDue) : '—'}
              </p>
            </div>
          </div>

          {/* Deposit */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400 mb-1">Deposit paid (in trust)</p>
            <p className="text-sm font-medium text-gray-900">
              {lot.depositPaid != null ? formatAUD(lot.depositPaid) : '—'}
            </p>
          </div>

          {/* Notes */}
          {lot.notes && (
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-400 mb-1">Notes</p>
              <p className="text-sm text-gray-600">{lot.notes}</p>
            </div>
          )}

          {/* Agency footer */}
          {(agency || agentLead) && (
            <div className="border-t border-gray-100 pt-4 text-xs text-gray-400">
              {agency && `Listed by ${agency}`}
              {agency && agentLead && ' · '}
              {agentLead && `Lead agent ${agentLead}`}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              if (window.confirm(`Delete ${lot.lotNumber}? This cannot be undone.`)) {
                onDelete(lot.id);
              }
            }}
            className="px-4 py-2 text-sm font-medium bg-white text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
          >
            Delete
          </button>
          <div className="flex items-center gap-2">
            {lot.status === 'available' && (
              <button
                onClick={() => onReserve(lot.id)}
                className="px-4 py-2 text-sm font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
              >
                Reserve
              </button>
            )}
            {lot.status === 'reserved' && (
              <button
                onClick={() => onConvert(lot.id)}
                className="px-4 py-2 text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
              >
                Convert to contract
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Add lot modal ────────────────────────────────────────────────────────────
const STATUS_OPTIONS: LotStatus[] = ['available', 'reserved', 'under_contract', 'settled'];

function AddLotModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (lot: Omit<SalesLot, 'id'>) => void;
}) {
  const [lotNumber, setLotNumber] = useState('');
  const [beds, setBeds] = useState('3');
  const [baths, setBaths] = useState('2');
  const [cars, setCars] = useState('1');
  const [internalArea, setInternalArea] = useState('');
  const [listPrice, setListPrice] = useState('');
  const [status, setStatus] = useState<LotStatus>('available');
  const [error, setError] = useState('');

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!lotNumber.trim()) {
      setError('Lot/unit number is required.');
      return;
    }
    onAdd({
      lotNumber: lotNumber.trim(),
      beds: Number(beds) || 0,
      baths: Number(baths) || 0,
      cars: Number(cars) || 0,
      internalArea: Number(internalArea) || 0,
      listPrice: Number(listPrice) || 0,
      status,
    });
    onClose();
  }

  const inputClass =
    'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Add lot / unit</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Lot / unit number <span className="text-red-500">*</span>
            </label>
            <input
              autoFocus
              value={lotNumber}
              onChange={(e) => {
                setLotNumber(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Unit 4, Lot 12"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Beds</label>
              <input type="number" min={0} value={beds} onChange={(e) => setBeds(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Baths</label>
              <input type="number" min={0} value={baths} onChange={(e) => setBaths(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Cars</label>
              <input type="number" min={0} value={cars} onChange={(e) => setCars(e.target.value)} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Internal area (m²)</label>
              <input
                type="number"
                min={0}
                value={internalArea}
                onChange={(e) => setInternalArea(e.target.value)}
                placeholder="e.g. 120"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">List price (AUD)</label>
              <input
                type="number"
                min={0}
                value={listPrice}
                onChange={(e) => setListPrice(e.target.value)}
                placeholder="e.g. 850000"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as LotStatus)}
              className={inputClass}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_META[s].label}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              Add lot
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function SalesTab({ projectId }: { projectId: string }) {
  const lots = useCollection<SalesLot>(`propdev:${projectId}:sales-lots`);

  const [filter, setFilter] = useState<FilterKey>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const items = lots.items;

  // Recompute summary from local items so UI changes reflect immediately.
  const summary = useMemo(
    () => getSalesSummary({ agency: '', agentLead: '', lots: items }),
    [items]
  );

  const agency = '';
  const agentLead = '';

  function reserve(id: string) {
    lots.update(id, {
      status: 'reserved',
      reservedDate: new Date().toISOString().slice(0, 10),
    });
  }

  function convert(id: string) {
    const lot = items.find((l) => l.id === id);
    if (!lot) return;
    lots.update(id, {
      status: 'under_contract',
      contractDate: new Date().toISOString().slice(0, 10),
      depositPaid: lot.depositPaid ?? Math.round((lot.salePrice ?? lot.listPrice) * 0.1),
      salePrice: lot.salePrice ?? lot.listPrice,
    });
  }

  function deleteLot(id: string) {
    lots.remove(id);
    setSelectedId((cur) => (cur === id ? null : cur));
  }

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Sales register</h2>
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="px-4 py-2 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            + Add lot
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <p className="text-gray-500 text-sm">No lots yet — add your first lot/unit</p>
          <button
            onClick={() => setAddOpen(true)}
            className="mt-4 px-4 py-2 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            + Add lot
          </button>
        </div>

        {addOpen && <AddLotModal onClose={() => setAddOpen(false)} onAdd={(lot) => lots.add(lot)} />}
      </div>
    );
  }

  const filtered = filter === 'all' ? items : items.filter((l) => l.status === filter);
  const selected = items.find((l) => l.id === selectedId) ?? null;

  const filterPills: { key: FilterKey; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: items.length },
    { key: 'available', label: 'Available', count: summary.available },
    { key: 'reserved', label: 'Reserved', count: summary.reserved },
    { key: 'under_contract', label: 'Under contract', count: summary.underContract },
    { key: 'settled', label: 'Settled', count: summary.settled },
  ];

  const countBreakdown: { status: LotStatus; count: number }[] = [
    { status: 'available', count: summary.available },
    { status: 'reserved', count: summary.reserved },
    { status: 'under_contract', count: summary.underContract },
    { status: 'settled', count: summary.settled },
  ];

  const total = summary.totalLots || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Sales register</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {summary.totalLots} lots · {summary.presalePct}% pre-sold
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="px-4 py-2 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          + Add lot
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          label="Pre-sales"
          value={`${summary.presalePct}%`}
          sub={`${summary.underContract + summary.settled} of ${summary.totalLots} sold`}
          accent="text-emerald-600"
        />
        <KpiCard
          label="Contracted value"
          value={formatAUDShort(summary.contractedValue)}
          sub="Under contract + settled"
          accent="text-blue-600"
        />
        <KpiCard
          label="Gross sales value"
          value={formatAUDShort(summary.grossSalesValue)}
          sub="All lots"
        />
        <KpiCard
          label="Deposits in trust"
          value={formatAUDShort(summary.depositsHeld)}
          sub="Held in trust"
          accent="text-purple-600"
        />
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4">
          <p className="text-xs text-gray-400 mb-2">Breakdown</p>
          <div className="space-y-1.5">
            {countBreakdown.map((c) => (
              <div key={c.status} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-gray-600">
                  <span className={`w-2 h-2 rounded-full ${STATUS_META[c.status].dot}`} />
                  {STATUS_META[c.status].label}
                </span>
                <span className="font-medium text-gray-900">{c.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sales progress stacked bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-900">Sales progress</p>
          <p className="text-xs text-gray-400">{summary.totalLots} lots</p>
        </div>
        <div className="flex w-full h-3 rounded-full overflow-hidden bg-gray-100">
          {countBreakdown.map((c) =>
            c.count > 0 ? (
              <div
                key={c.status}
                className={STATUS_META[c.status].bar}
                style={{ width: `${(c.count / total) * 100}%` }}
                title={`${STATUS_META[c.status].label}: ${c.count}`}
              />
            ) : null
          )}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
          {countBreakdown.map((c) => (
            <span key={c.status} className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className={`w-2 h-2 rounded-full ${STATUS_META[c.status].dot}`} />
              {STATUS_META[c.status].label} {c.count}
            </span>
          ))}
        </div>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {filterPills.map((p) => {
          const active = filter === p.key;
          return (
            <button
              key={p.key}
              onClick={() => setFilter(p.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                active
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {p.label}
              <span
                className={`ml-1.5 ${active ? 'text-gray-300' : 'text-gray-400'}`}
              >
                {p.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sales register table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-5 py-3 font-medium text-xs text-gray-400">Lot</th>
                <th className="px-5 py-3 font-medium text-xs text-gray-400">Config</th>
                <th className="px-5 py-3 font-medium text-xs text-gray-400">Area</th>
                <th className="px-5 py-3 font-medium text-xs text-gray-400">List price</th>
                <th className="px-5 py-3 font-medium text-xs text-gray-400">Status</th>
                <th className="px-5 py-3 font-medium text-xs text-gray-400">Buyer</th>
                <th className="px-5 py-3 font-medium text-xs text-gray-400">Settlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-400">
                    No lots match this filter
                  </td>
                </tr>
              ) : (
                filtered.map((lot) => (
                  <tr
                    key={lot.id}
                    onClick={() => setSelectedId(lot.id)}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3 font-medium text-gray-900">{lot.lotNumber}</td>
                    <td className="px-5 py-3 text-gray-600">{config(lot)}</td>
                    <td className="px-5 py-3 text-gray-600">{lot.internalArea} m²</td>
                    <td className="px-5 py-3 text-gray-900">{formatAUD(lot.listPrice)}</td>
                    <td className="px-5 py-3">
                      <StatusPill status={lot.status} />
                    </td>
                    <td className="px-5 py-3 text-gray-600">{lot.buyer ?? '—'}</td>
                    <td className="px-5 py-3 text-gray-600">
                      {lot.settlementDue ? formatDate(lot.settlementDue) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lot detail modal */}
      {selected && (
        <LotDetailModal
          lot={selected}
          agency={agency}
          agentLead={agentLead}
          onClose={() => setSelectedId(null)}
          onReserve={reserve}
          onConvert={convert}
          onDelete={deleteLot}
        />
      )}

      {/* Add lot modal */}
      {addOpen && <AddLotModal onClose={() => setAddOpen(false)} onAdd={(lot) => lots.add(lot)} />}
    </div>
  );
}
