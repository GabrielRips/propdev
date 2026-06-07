import React, { useEffect, useMemo, useState } from 'react';
import AppShell from './AppShell';
import {
  ownedAssets,
  getPortfolioSummary,
  assetLvr,
  OwnedAsset,
  AssetDocument,
  OwnershipType,
} from '../data/assets-data';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatAUD(n: number): string {
  return '$' + Math.round(n).toLocaleString('en-AU');
}

function formatAUDShort(n: number): string {
  if (Math.abs(n) >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M';
  if (Math.abs(n) >= 1_000) return '$' + Math.round(n / 1_000) + 'K';
  return '$' + Math.round(n).toLocaleString('en-AU');
}

function formatDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function lvrFor(value: number, loan: number): number {
  return value ? Math.round((loan / value) * 100) : 0;
}

function assetYield(value: number, weeklyRent: number): number {
  return value ? +(((weeklyRent * 52) / value) * 100).toFixed(1) : 0;
}

// ownership badge colours
const OWNERSHIP_STYLES: Record<OwnershipType, string> = {
  Personal: 'bg-blue-50 text-blue-700 border-blue-200',
  Company: 'bg-purple-50 text-purple-700 border-purple-200',
  Trust: 'bg-amber-50 text-amber-700 border-amber-200',
  SMSF: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const CATEGORY_STYLES: Record<AssetDocument['category'], string> = {
  'Rental Statement': 'bg-emerald-50 text-emerald-700',
  Loan: 'bg-blue-50 text-blue-700',
  Valuation: 'bg-purple-50 text-purple-700',
  Insurance: 'bg-amber-50 text-amber-700',
  Title: 'bg-gray-100 text-gray-600',
  Tax: 'bg-rose-50 text-rose-700',
};

function lvrPillClass(lvr: number): string {
  if (lvr < 60) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (lvr <= 80) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-red-50 text-red-600 border-red-200';
}

// ---------------------------------------------------------------------------
// KPI card
// ---------------------------------------------------------------------------

function Kpi({
  label,
  value,
  accent = 'text-gray-900',
  emphasise = false,
  caption,
}: {
  label: string;
  value: string;
  accent?: string;
  emphasise?: boolean;
  caption?: string;
}) {
  return (
    <div
      className={`bg-white rounded-xl border p-4 ${
        emphasise ? 'border-emerald-200 ring-1 ring-emerald-100' : 'border-gray-200'
      }`}
    >
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-xl font-bold ${accent}`}>{value}</p>
      {caption && <p className="text-[11px] text-gray-400 mt-0.5">{caption}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Update-loan modal
// ---------------------------------------------------------------------------

function UpdateLoanModal({
  asset,
  currentLoan,
  onSave,
  onClose,
}: {
  asset: OwnedAsset;
  currentLoan: number;
  onSave: (loan: number) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState<string>(String(currentLoan));

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const parsed = Number(value.replace(/[^0-9.]/g, '')) || 0;
  const newLvr = lvrFor(asset.propertyValue, parsed);
  const newEquity = asset.propertyValue - parsed;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-xl shadow-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Update loan balance</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {asset.address}, {asset.suburb} · {asset.lender}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5">
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Outstanding loan amount (manually maintained)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input
              autoFocus
              inputMode="numeric"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
              <p className="text-[11px] text-gray-400">New LVR</p>
              <p className="text-base font-semibold text-gray-900">{newLvr}%</p>
            </div>
            <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2">
              <p className="text-[11px] text-emerald-600">New equity</p>
              <p className="text-base font-semibold text-emerald-700">{formatAUD(newEquity)}</p>
            </div>
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
            onClick={() => onSave(parsed)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Save loan
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Extract-pack modal
// ---------------------------------------------------------------------------

type PackMode = 'lender' | 'jv';

function ExtractModal({
  asset,
  equity,
  onClose,
}: {
  asset: OwnedAsset;
  equity: number;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<Record<string, boolean>>(
    () => Object.fromEntries(asset.documents.map((d) => [d.id, true]))
  );
  const [generated, setGenerated] = useState<{ count: number; mode: PackMode } | null>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const selectedCount = Object.values(selected).filter(Boolean).length;

  // group documents by category for a scoped, auditable view
  const grouped = useMemo(() => {
    const map = new Map<AssetDocument['category'], AssetDocument[]>();
    asset.documents.forEach((d) => {
      const arr = map.get(d.category) ?? [];
      arr.push(d);
      map.set(d.category, arr);
    });
    return Array.from(map.entries());
  }, [asset.documents]);

  function generate(mode: PackMode) {
    setGenerated({ count: selectedCount, mode });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl">{'📤'}</span>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 truncate">Extract info pack</h2>
              <p className="text-xs text-gray-500 truncate">
                {asset.address}, {asset.suburb} {asset.state}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {generated ? (
          <div className="px-6 py-10 flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900">
              {generated.mode === 'lender' ? 'Lender pack' : 'JV extract'} generated
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {generated.count} document{generated.count === 1 ? '' : 's'} bundled · equity{' '}
              <span className="font-semibold text-emerald-700">{formatAUD(equity)}</span>
            </p>
            <p className="text-[11px] text-gray-400 mt-2 max-w-xs">
              Scoped to {asset.address} only. Files watermarked and access-logged for{' '}
              {generated.mode === 'lender' ? 'the lender' : 'the JV partner'}.
            </p>
            <button
              onClick={onClose}
              className="mt-5 px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="px-6 py-4 overflow-y-auto flex-1">
              <p className="text-xs text-gray-500 mb-3">
                Select the documents to include. Defaults to the full file set for this asset.
              </p>
              <div className="space-y-4">
                {grouped.map(([category, docs]) => (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded ${CATEGORY_STYLES[category]}`}
                      >
                        {category}
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {docs.map((d) => (
                        <li key={d.id}>
                          <label className="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!selected[d.id]}
                              onChange={(e) =>
                                setSelected((prev) => ({ ...prev, [d.id]: e.target.checked }))
                              }
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-gray-800 truncate">{d.label}</p>
                              <p className="text-[11px] text-gray-400 truncate">
                                {d.fileName} · {formatDate(d.date)}
                              </p>
                            </div>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {asset.documents.length === 0 && (
                  <p className="text-sm text-gray-400 italic">No documents on file for this asset.</p>
                )}
              </div>
            </div>

            <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between gap-2">
              <span className="text-xs text-gray-400">{selectedCount} selected</span>
              <div className="flex gap-2">
                <button
                  disabled={selectedCount === 0}
                  onClick={() => generate('jv')}
                  className="px-3.5 py-2 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Generate JV extract
                </button>
                <button
                  disabled={selectedCount === 0}
                  onClick={() => generate('lender')}
                  className="px-3.5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Generate lender pack
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Equity / debt split bar
// ---------------------------------------------------------------------------

function EquityBar({ value, debt }: { value: number; debt: number }) {
  const equity = Math.max(value - debt, 0);
  const equityPct = value ? (equity / value) * 100 : 0;
  const debtPct = value ? (debt / value) * 100 : 0;
  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="bg-emerald-500 h-full" style={{ width: `${equityPct}%` }} />
        <div className="bg-blue-500 h-full" style={{ width: `${debtPct}%` }} />
      </div>
      <div className="flex items-center gap-4 mt-2 text-[11px]">
        <span className="flex items-center gap-1.5 text-gray-500">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
          Equity {formatAUD(equity)}
        </span>
        <span className="flex items-center gap-1.5 text-gray-500">
          <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
          Debt {formatAUD(debt)}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Asset card
// ---------------------------------------------------------------------------

function AssetCard({
  asset,
  loan,
  onUpdateLoan,
  onExtract,
}: {
  asset: OwnedAsset;
  loan: number;
  onUpdateLoan: () => void;
  onExtract: () => void;
}) {
  // asset.loanAmount already reflects the live (local-state) balance
  const lvr = assetLvr(asset);
  const equity = asset.propertyValue - loan;
  const yld = assetYield(asset.propertyValue, asset.weeklyRent);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">{asset.address}</p>
          <p className="text-xs text-gray-500">
            {asset.suburb}, {asset.state}
          </p>
        </div>
        <span
          className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full border ${lvrPillClass(lvr)}`}
        >
          LVR {lvr}%
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-xs text-gray-400">Value</p>
            <span className="text-[9px] font-semibold uppercase tracking-wide text-emerald-700 bg-emerald-50 px-1 py-px rounded">
              Auto
            </span>
          </div>
          <p className="text-sm font-semibold text-gray-900">{formatAUD(asset.propertyValue)}</p>
          <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">
            auto-valued via {asset.valuationSource} · {formatDate(asset.valuationDate)}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-xs text-gray-400">Loan</p>
            <button
              onClick={onUpdateLoan}
              title="Update loan"
              className="text-gray-400 hover:text-blue-600 inline-flex items-center gap-0.5 text-[10px]"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Update
            </button>
          </div>
          <p className="text-sm font-semibold text-gray-900">{formatAUD(loan)}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{asset.lender} · manual</p>
        </div>

        <div>
          <p className="text-xs text-gray-400">Equity</p>
          <p className="text-sm font-semibold text-emerald-700">{formatAUD(equity)}</p>
        </div>

        <div>
          <p className="text-xs text-gray-400">Rent / yield</p>
          <p className="text-sm font-semibold text-gray-900">
            {asset.weeklyRent ? formatAUD(asset.weeklyRent) + '/wk' : '—'}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">{yld}% gross</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-100">
        <p className="text-[11px] text-gray-400 truncate">
          Managed by {asset.managedBy} · {asset.contactNumber} · owned since{' '}
          {formatDate(asset.dateOwned)}
        </p>
        <button
          onClick={onExtract}
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <span>{'📤'}</span>
          Extract pack
          <span className="text-gray-400">({asset.documents.length})</span>
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AssetPortal() {
  // loan balances held in local state so "Update loan" recomputes everything
  const [loans, setLoans] = useState<Record<string, number>>(
    () => Object.fromEntries(ownedAssets.map((a) => [a.id, a.loanAmount]))
  );
  const [editingLoan, setEditingLoan] = useState<OwnedAsset | null>(null);
  const [extracting, setExtracting] = useState<OwnedAsset | null>(null);

  // assets reflecting the live (local-state) loan balances
  const liveAssets = useMemo<OwnedAsset[]>(
    () => ownedAssets.map((a) => ({ ...a, loanAmount: loans[a.id] ?? a.loanAmount })),
    [loans]
  );

  const summary = useMemo(() => getPortfolioSummary(liveAssets), [liveAssets]);

  // group by ownership entity
  const groups = useMemo(() => {
    const map = new Map<string, OwnedAsset[]>();
    liveAssets.forEach((a) => {
      const arr = map.get(a.ownedUnder) ?? [];
      arr.push(a);
      map.set(a.ownedUnder, arr);
    });
    return Array.from(map.entries()).map(([entity, assets]) => {
      const value = assets.reduce((t, a) => t + a.propertyValue, 0);
      const debt = assets.reduce((t, a) => t + a.loanAmount, 0);
      return {
        entity,
        ownershipType: assets[0].ownershipType,
        assets,
        value,
        debt,
        equity: value - debt,
      };
    });
  }, [liveAssets]);

  return (
    <AppShell title="Asset Portfolio" subtitle="Owned property, equity & rental performance">
      {/* Confidentiality banner */}
      <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 mb-6">
        <span>{'🔒'}</span>
        <p className="text-xs font-medium text-amber-800">
          Confidential — owned asset portfolio. Restricted access.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        <Kpi label="Total value" value={formatAUDShort(summary.totalValue)} />
        <Kpi label="Total debt" value={formatAUDShort(summary.totalDebt)} accent="text-blue-600" />
        <Kpi
          label="Total equity"
          value={formatAUDShort(summary.totalEquity)}
          accent="text-emerald-700"
          emphasise
        />
        <Kpi label="Portfolio LVR" value={`${summary.portfolioLvr}%`} />
        <Kpi label="Weekly rent" value={formatAUD(summary.weeklyRent)} />
        <Kpi label="Annual rent" value={formatAUDShort(summary.annualRent)} />
        <Kpi label="Gross yield" value={`${summary.grossYield}%`} accent="text-purple-700" />
      </div>

      {/* Portfolio equity vs debt split */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Equity position</h3>
          <span className="text-xs text-gray-400">
            {summary.assetCount} assets · {formatAUD(summary.totalValue)} total
          </span>
        </div>
        <EquityBar value={summary.totalValue} debt={summary.totalDebt} />
      </div>

      {/* Grouped by ownership entity */}
      <div className="space-y-6">
        {groups.map((g) => (
          <div key={g.entity}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-900">{g.entity}</h3>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${OWNERSHIP_STYLES[g.ownershipType]}`}
                >
                  {g.ownershipType}
                </span>
                <span className="text-xs text-gray-400">
                  {g.assets.length} asset{g.assets.length === 1 ? '' : 's'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-gray-500">
                  Value <span className="font-semibold text-gray-900">{formatAUDShort(g.value)}</span>
                </span>
                <span className="text-gray-500">
                  Debt <span className="font-semibold text-blue-600">{formatAUDShort(g.debt)}</span>
                </span>
                <span className="text-gray-500">
                  Equity{' '}
                  <span className="font-semibold text-emerald-700">{formatAUDShort(g.equity)}</span>
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {g.assets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  loan={asset.loanAmount}
                  onUpdateLoan={() => setEditingLoan(asset)}
                  onExtract={() => setExtracting(asset)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {editingLoan && (
        <UpdateLoanModal
          asset={editingLoan}
          currentLoan={loans[editingLoan.id] ?? editingLoan.loanAmount}
          onSave={(loan) => {
            setLoans((prev) => ({ ...prev, [editingLoan.id]: loan }));
            setEditingLoan(null);
          }}
          onClose={() => setEditingLoan(null)}
        />
      )}

      {extracting && (
        <ExtractModal
          asset={extracting}
          equity={extracting.propertyValue - (loans[extracting.id] ?? extracting.loanAmount)}
          onClose={() => setExtracting(null)}
        />
      )}
    </AppShell>
  );
}
