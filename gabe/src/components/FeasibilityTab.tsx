import React, { useEffect, useState } from 'react';
import { useCollection } from '../data/useCollection';

// ---------------------------------------------------------------------------
// Local record types (single record per project, stored in the collection)
// ---------------------------------------------------------------------------

interface FeasoLine {
  label: string;
  feasibility: number;
  live: number;
}
interface CashRow {
  period: string;
  outflow: number;
  inflow: number;
  net: number;
}
interface SensRow {
  scenario: string;
  margin: number;
  profit: number;
  irr: number;
}
interface FeasoRecord {
  id: string;
  gdv: number;
  totalCost: number;
  liveCost: number;
  equity: number;
  debt: number;
  irr: number;
  costLines: FeasoLine[];
  revenueLines: FeasoLine[];
  cashflow: CashRow[];
  sensitivity: SensRow[];
}

function starterRecord(): Omit<FeasoRecord, 'id'> {
  return {
    gdv: 0,
    totalCost: 0,
    liveCost: 0,
    equity: 0,
    debt: 0,
    irr: 0,
    costLines: [],
    revenueLines: [],
    cashflow: [],
    sensitivity: [],
  };
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function formatAUD(n: number): string {
  return n.toLocaleString('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatAUDShort(n: number): string {
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${Math.round(abs / 1_000)}K`;
  return `${sign}$${Math.round(abs)}`;
}

function pct(n: number): string {
  return n.toFixed(1) + '%';
}

// ---------------------------------------------------------------------------
// Small presentational pieces
// ---------------------------------------------------------------------------

function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3.5">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-lg font-semibold ${accent ?? 'text-gray-900'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cost breakdown row — dual bar (feasibility gray, live coloured)
// ---------------------------------------------------------------------------

function CostRow({ line, maxValue }: { line: FeasoLine; maxValue: number }) {
  const variance = line.live - line.feasibility; // +ve = over budget
  const over = variance > 0;
  const equalish = variance === 0;
  const feasW = maxValue > 0 ? (line.feasibility / maxValue) * 100 : 0;
  const liveW = maxValue > 0 ? (line.live / maxValue) * 100 : 0;
  const liveColor = over ? 'bg-red-500' : 'bg-emerald-500';
  const varColor = over ? 'text-red-600' : equalish ? 'text-gray-400' : 'text-emerald-600';

  return (
    <div className="py-3">
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <p className="text-sm font-medium text-gray-800">{line.label}</p>
        <div className="flex items-baseline gap-4 text-right tabular-nums">
          <span className="text-xs text-gray-400 w-24">{formatAUD(line.feasibility)}</span>
          <span className="text-sm font-semibold text-gray-900 w-24">{formatAUD(line.live)}</span>
          <span className={`text-xs font-medium w-24 ${varColor}`}>
            {equalish ? '—' : `${over ? '+' : '−'}${formatAUD(Math.abs(variance))}`}
          </span>
        </div>
      </div>
      {/* dual bar: gray feasibility underneath, coloured live overlaid */}
      <div className="relative h-3 w-full">
        <div
          className="absolute top-0 left-0 h-3 rounded bg-gray-200"
          style={{ width: `${feasW}%` }}
        />
        <div
          className={`absolute top-0 left-0 h-3 rounded ${liveColor} opacity-80`}
          style={{ width: `${liveW}%` }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Revenue row — progress toward feasibility target
// ---------------------------------------------------------------------------

function RevenueRow({ line }: { line: FeasoLine }) {
  const progress = line.feasibility > 0 ? (line.live / line.feasibility) * 100 : 0;
  const clamped = Math.min(100, Math.max(0, progress));
  return (
    <div className="py-3">
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <p className="text-sm font-medium text-gray-800">{line.label}</p>
        <div className="flex items-baseline gap-4 text-right tabular-nums">
          <span className="text-sm font-semibold text-gray-900">{formatAUD(line.live)}</span>
          <span className="text-xs text-gray-400 w-28">of {formatAUD(line.feasibility)}</span>
          <span className="text-xs font-medium text-blue-600 w-12">{pct(progress)}</span>
        </div>
      </div>
      <div className="h-3 w-full rounded bg-gray-100 overflow-hidden">
        <div
          className="h-3 rounded bg-blue-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cashflow chart — CSS only. Outflow bars down (red), inflow up (emerald),
// cumulative net plotted as a coloured strip with value labels.
// ---------------------------------------------------------------------------

function CashflowChart({ points }: { points: CashRow[] }) {
  const maxFlow = Math.max(1, ...points.map((p) => Math.max(p.outflow, p.inflow)));
  return (
    <div>
      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-emerald-500" /> Inflow
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-red-400" /> Outflow
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-1.5 rounded-sm bg-gray-700" /> Cumulative net
        </span>
      </div>

      <div className="flex items-stretch gap-2 sm:gap-3">
        {points.map((p) => {
          const inflowH = (p.inflow / maxFlow) * 100;
          const outflowH = (p.outflow / maxFlow) * 100;
          const netPositive = p.net >= 0;
          return (
            <div key={p.period} className="flex-1 flex flex-col items-center min-w-0">
              {/* inflow (up) */}
              <div className="h-20 w-full flex items-end justify-center">
                <div
                  className="w-5 sm:w-6 rounded-t bg-emerald-500"
                  style={{ height: `${inflowH}%` }}
                  title={`Inflow ${formatAUD(p.inflow)}`}
                />
              </div>
              {/* zero axis */}
              <div className="w-full border-t border-gray-200" />
              {/* outflow (down) */}
              <div className="h-20 w-full flex items-start justify-center">
                <div
                  className="w-5 sm:w-6 rounded-b bg-red-400"
                  style={{ height: `${outflowH}%` }}
                  title={`Outflow ${formatAUD(p.outflow)}`}
                />
              </div>
              {/* cumulative net strip + label */}
              <div
                className={`mt-2 w-full rounded text-center text-[10px] font-semibold py-0.5 ${
                  netPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                }`}
                title={`Cumulative ${formatAUD(p.net)}`}
              >
                {formatAUDShort(p.net)}
              </div>
              <p className="mt-1.5 text-[11px] text-gray-500 truncate w-full text-center">
                {p.period}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sensitivity table
// ---------------------------------------------------------------------------

function marginColor(margin: number): string {
  if (margin >= 25) return 'text-emerald-600';
  if (margin >= 15) return 'text-amber-600';
  return 'text-red-600';
}

function SensitivityTable({ rows }: { rows: SensRow[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
          <th className="font-medium py-2">Scenario</th>
          <th className="font-medium py-2 text-right">Margin</th>
          <th className="font-medium py-2 text-right">Profit</th>
          <th className="font-medium py-2 text-right">IRR</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const isBase = r.scenario.toLowerCase().includes('base case');
          return (
            <tr
              key={r.scenario}
              className={`border-b border-gray-50 last:border-0 ${
                isBase ? 'bg-blue-50/60' : ''
              }`}
            >
              <td className="py-2.5">
                <span className={`${isBase ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                  {r.scenario}
                </span>
                {isBase && (
                  <span className="ml-2 text-[10px] font-medium uppercase tracking-wide text-blue-600">
                    Base
                  </span>
                )}
              </td>
              <td className={`py-2.5 text-right font-semibold tabular-nums ${marginColor(r.margin)}`}>
                {pct(r.margin)}
              </td>
              <td className="py-2.5 text-right tabular-nums text-gray-800">
                {formatAUDShort(r.profit)}
              </td>
              <td className="py-2.5 text-right tabular-nums text-gray-700">{pct(r.irr)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ---------------------------------------------------------------------------
// Editor modal
// ---------------------------------------------------------------------------

const field =
  'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500';
const label = 'block text-xs font-medium text-gray-500 mb-1';

function num(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function FeasibilityEditor({
  initial,
  onSave,
  onClose,
}: {
  initial: FeasoRecord;
  onSave: (patch: Omit<FeasoRecord, 'id'>) => void;
  onClose: () => void;
}) {
  const [gdv, setGdv] = useState(String(initial.gdv));
  const [totalCost, setTotalCost] = useState(String(initial.totalCost));
  const [liveCost, setLiveCost] = useState(String(initial.liveCost));
  const [equity, setEquity] = useState(String(initial.equity));
  const [debt, setDebt] = useState(String(initial.debt));
  const [irr, setIrr] = useState(String(initial.irr));
  const [costLines, setCostLines] = useState<FeasoLine[]>(initial.costLines);
  const [revenueLines, setRevenueLines] = useState<FeasoLine[]>(initial.revenueLines);
  const [cashflow, setCashflow] = useState<CashRow[]>(initial.cashflow);
  const [sensitivity, setSensitivity] = useState<SensRow[]>(initial.sensitivity);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function setLine(
    list: FeasoLine[],
    setter: (v: FeasoLine[]) => void,
    i: number,
    patch: Partial<FeasoLine>
  ) {
    setter(list.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      gdv: num(gdv),
      totalCost: num(totalCost),
      liveCost: num(liveCost),
      equity: num(equity),
      debt: num(debt),
      irr: num(irr),
      costLines,
      revenueLines,
      cashflow,
      sensitivity,
    });
    onClose();
  }

  const lineHeader = (
    <div className="hidden sm:flex items-center gap-2 text-[11px] font-medium text-gray-400 px-1">
      <span className="flex-1">Label</span>
      <span className="w-32">Feasibility $</span>
      <span className="w-32">Live $</span>
      <span className="w-7" />
    </div>
  );

  function LineEditor({
    list,
    setter,
  }: {
    list: FeasoLine[];
    setter: (v: FeasoLine[]) => void;
  }) {
    return (
      <div className="space-y-2">
        {list.length > 0 && lineHeader}
        {list.map((l, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className={`${field} flex-1`}
              placeholder="Label"
              value={l.label}
              onChange={(e) => setLine(list, setter, i, { label: e.target.value })}
            />
            <input
              className={`${field} w-32`}
              type="number"
              placeholder="0"
              value={l.feasibility}
              onChange={(e) => setLine(list, setter, i, { feasibility: num(e.target.value) })}
            />
            <input
              className={`${field} w-32`}
              type="number"
              placeholder="0"
              value={l.live}
              onChange={(e) => setLine(list, setter, i, { live: num(e.target.value) })}
            />
            <button
              type="button"
              onClick={() => setter(list.filter((_, idx) => idx !== i))}
              className="text-gray-400 hover:text-red-600 p-1 shrink-0"
              title="Remove row"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setter([...list, { label: '', feasibility: 0, live: 0 }])}
          className="text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          + Add row
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded-2xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Edit feasibility model</h2>
            <p className="text-xs text-gray-400 mt-0.5">GDV, costs, capital structure and scenarios</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Headline numbers */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className={label}>GDV (Gross Dev. Value)</label>
              <input className={field} type="number" value={gdv} onChange={(e) => setGdv(e.target.value)} />
            </div>
            <div>
              <label className={label}>Total cost (feasibility)</label>
              <input className={field} type="number" value={totalCost} onChange={(e) => setTotalCost(e.target.value)} />
            </div>
            <div>
              <label className={label}>Live cost</label>
              <input className={field} type="number" value={liveCost} onChange={(e) => setLiveCost(e.target.value)} />
            </div>
            <div>
              <label className={label}>Equity</label>
              <input className={field} type="number" value={equity} onChange={(e) => setEquity(e.target.value)} />
            </div>
            <div>
              <label className={label}>Debt</label>
              <input className={field} type="number" value={debt} onChange={(e) => setDebt(e.target.value)} />
            </div>
            <div>
              <label className={label}>IRR (%)</label>
              <input className={field} type="number" value={irr} onChange={(e) => setIrr(e.target.value)} />
            </div>
          </div>

          {/* Cost lines */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Cost lines</h3>
            <LineEditor list={costLines} setter={setCostLines} />
          </div>

          {/* Revenue lines */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Revenue lines</h3>
            <LineEditor list={revenueLines} setter={setRevenueLines} />
          </div>

          {/* Cashflow */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Cashflow</h3>
            <div className="space-y-2">
              {cashflow.length > 0 && (
                <div className="hidden sm:flex items-center gap-2 text-[11px] font-medium text-gray-400 px-1">
                  <span className="flex-1">Period</span>
                  <span className="w-28">Outflow $</span>
                  <span className="w-28">Inflow $</span>
                  <span className="w-28">Cum. net $</span>
                  <span className="w-7" />
                </div>
              )}
              {cashflow.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    className={`${field} flex-1`}
                    placeholder="Q1 25"
                    value={c.period}
                    onChange={(e) =>
                      setCashflow(cashflow.map((r, idx) => (idx === i ? { ...r, period: e.target.value } : r)))
                    }
                  />
                  <input
                    className={`${field} w-28`}
                    type="number"
                    value={c.outflow}
                    onChange={(e) =>
                      setCashflow(cashflow.map((r, idx) => (idx === i ? { ...r, outflow: num(e.target.value) } : r)))
                    }
                  />
                  <input
                    className={`${field} w-28`}
                    type="number"
                    value={c.inflow}
                    onChange={(e) =>
                      setCashflow(cashflow.map((r, idx) => (idx === i ? { ...r, inflow: num(e.target.value) } : r)))
                    }
                  />
                  <input
                    className={`${field} w-28`}
                    type="number"
                    value={c.net}
                    onChange={(e) =>
                      setCashflow(cashflow.map((r, idx) => (idx === i ? { ...r, net: num(e.target.value) } : r)))
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setCashflow(cashflow.filter((_, idx) => idx !== i))}
                    className="text-gray-400 hover:text-red-600 p-1 shrink-0"
                    title="Remove row"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setCashflow([...cashflow, { period: '', outflow: 0, inflow: 0, net: 0 }])}
                className="text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                + Add period
              </button>
            </div>
          </div>

          {/* Sensitivity */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Sensitivity scenarios</h3>
            <div className="space-y-2">
              {sensitivity.length > 0 && (
                <div className="hidden sm:flex items-center gap-2 text-[11px] font-medium text-gray-400 px-1">
                  <span className="flex-1">Scenario</span>
                  <span className="w-24">Margin %</span>
                  <span className="w-28">Profit $</span>
                  <span className="w-24">IRR %</span>
                  <span className="w-7" />
                </div>
              )}
              {sensitivity.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    className={`${field} flex-1`}
                    placeholder="Base case"
                    value={s.scenario}
                    onChange={(e) =>
                      setSensitivity(sensitivity.map((r, idx) => (idx === i ? { ...r, scenario: e.target.value } : r)))
                    }
                  />
                  <input
                    className={`${field} w-24`}
                    type="number"
                    value={s.margin}
                    onChange={(e) =>
                      setSensitivity(sensitivity.map((r, idx) => (idx === i ? { ...r, margin: num(e.target.value) } : r)))
                    }
                  />
                  <input
                    className={`${field} w-28`}
                    type="number"
                    value={s.profit}
                    onChange={(e) =>
                      setSensitivity(sensitivity.map((r, idx) => (idx === i ? { ...r, profit: num(e.target.value) } : r)))
                    }
                  />
                  <input
                    className={`${field} w-24`}
                    type="number"
                    value={s.irr}
                    onChange={(e) =>
                      setSensitivity(sensitivity.map((r, idx) => (idx === i ? { ...r, irr: num(e.target.value) } : r)))
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setSensitivity(sensitivity.filter((_, idx) => idx !== i))}
                    className="text-gray-400 hover:text-red-600 p-1 shrink-0"
                    title="Remove row"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setSensitivity([...sensitivity, { scenario: '', margin: 0, profit: 0, irr: 0 }])
                }
                className="text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                + Add scenario
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 pb-5 pt-1 flex justify-end gap-2 sticky bottom-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Save feasibility
          </button>
        </div>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function FeasibilityTab({ projectId }: { projectId: string }) {
  const feaso = useCollection<FeasoRecord>(`propdev:${projectId}:feasibility`);
  const model = feaso.items[0];
  const [editing, setEditing] = useState(false);

  // ---- Empty state -------------------------------------------------------
  if (!model) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <p className="text-sm font-semibold text-gray-900 mb-1">No feasibility model yet</p>
          <p className="text-gray-400 text-sm mb-5">
            Set up your GDV, costs, capital structure and scenarios to start tracking feasibility vs live.
          </p>
          <button
            onClick={() => {
              feaso.add(starterRecord());
              setEditing(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Set up feasibility
          </button>
        </div>
        {editing && feaso.items[0] && (
          <FeasibilityEditor
            initial={feaso.items[0]}
            onSave={(patch) => feaso.update(feaso.items[0].id, patch)}
            onClose={() => setEditing(false)}
          />
        )}
      </div>
    );
  }

  // ---- Derived values ----------------------------------------------------
  const profit = model.gdv - model.totalCost;
  const marginOnCost = model.totalCost ? (profit / model.totalCost) * 100 : 0;
  const marginOnGdv = model.gdv ? (profit / model.gdv) * 100 : 0;
  const lvr = model.equity + model.debt ? (model.debt / (model.equity + model.debt)) * 100 : 0;

  // Live cost computed from cost line items (fall back to model.liveCost).
  const computedLiveCost = model.costLines.reduce((sum, l) => sum + l.live, 0);
  const liveCost = computedLiveCost || model.liveCost;

  // Headline cost variance vs feasibility total.
  const costVariance = liveCost - model.totalCost; // +ve = over budget
  const overBudget = costVariance > 0;
  const onBudget = costVariance === 0;
  const variancePct = model.totalCost > 0 ? (costVariance / model.totalCost) * 100 : 0;
  const projectedProfit = profit - costVariance; // erodes when over budget

  const maxCostLine = Math.max(
    1,
    ...model.costLines.map((l) => Math.max(l.feasibility, l.live))
  );

  const bannerTone = onBudget
    ? { wrap: 'bg-gray-50 border-gray-200', accent: 'text-gray-700', chip: 'text-gray-500' }
    : overBudget
    ? { wrap: 'bg-red-50 border-red-200', accent: 'text-red-700', chip: 'text-red-600' }
    : { wrap: 'bg-emerald-50 border-emerald-200', accent: 'text-emerald-700', chip: 'text-emerald-600' };

  return (
    <div className="space-y-6">
      {/* Edit action */}
      <div className="flex justify-end">
        <button
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit feasibility
        </button>
      </div>

      {/* 1. KPI HEADER */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard label="GDV (Gross Dev. Value)" value={formatAUDShort(model.gdv)} sub={formatAUD(model.gdv)} />
        <KpiCard
          label="Total cost (feasibility)"
          value={formatAUDShort(model.totalCost)}
          sub={formatAUD(model.totalCost)}
        />
        <KpiCard
          label="Profit (feasibility)"
          value={formatAUDShort(profit)}
          sub={formatAUD(profit)}
          accent="text-emerald-600"
        />
        <KpiCard label="Margin on cost" value={pct(marginOnCost)} sub={`${pct(marginOnGdv)} on GDV`} />
        <KpiCard label="IRR" value={pct(model.irr)} sub="project equity" />
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3.5">
          <p className="text-xs text-gray-400 mb-1.5">Capital structure</p>
          <div className="space-y-0.5 text-xs tabular-nums">
            <div className="flex justify-between">
              <span className="text-gray-500">Equity</span>
              <span className="font-medium text-gray-800">{formatAUDShort(model.equity)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Debt</span>
              <span className="font-medium text-gray-800">{formatAUDShort(model.debt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">LVR</span>
              <span className="font-medium text-blue-600">{pct(lvr)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FEASIBILITY vs LIVE banner */}
      <div className={`rounded-xl border shadow-sm p-5 ${bannerTone.wrap}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
              Feasibility vs Live — cost variance
            </p>
            <div className="flex items-baseline gap-3">
              <span className={`text-2xl font-bold tabular-nums ${bannerTone.accent}`}>
                {onBudget ? '' : overBudget ? '+' : '−'}
                {formatAUD(Math.abs(costVariance))}
              </span>
              <span className={`text-sm font-semibold ${bannerTone.chip}`}>
                {onBudget ? 'On budget' : `${overBudget ? '+' : '−'}${pct(Math.abs(variancePct))}`}
              </span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  onBudget
                    ? 'bg-gray-100 text-gray-600'
                    : overBudget
                    ? 'bg-red-100 text-red-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {onBudget ? 'On budget' : overBudget ? 'Over budget' : 'Under budget'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1.5 tabular-nums">
              Feasibility {formatAUD(model.totalCost)} → Live {formatAUD(liveCost)}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs text-gray-500 mb-1">Projected profit impact</p>
            <p
              className={`text-xl font-bold tabular-nums ${
                projectedProfit >= profit ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {formatAUD(projectedProfit)}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              vs feasibility {formatAUDShort(profit)}
            </p>
          </div>
        </div>
      </div>

      {/* 3. COST BREAKDOWN */}
      {model.costLines.length > 0 && (
        <SectionCard title="Cost breakdown — Budget vs Live" subtitle="gray = feasibility · solid = live">
          <div className="hidden sm:flex items-baseline justify-end gap-4 text-[11px] text-gray-400 pb-1 border-b border-gray-100 mb-1">
            <span className="w-24 text-right">Budget</span>
            <span className="w-24 text-right">Live</span>
            <span className="w-24 text-right">Variance</span>
          </div>
          <div className="divide-y divide-gray-50">
            {model.costLines.map((line, i) => (
              <CostRow key={`${line.label}-${i}`} line={line} maxValue={maxCostLine} />
            ))}
          </div>
          <div className="flex items-baseline justify-between gap-3 pt-3 mt-1 border-t border-gray-200">
            <p className="text-sm font-semibold text-gray-900">Total development cost</p>
            <div className="flex items-baseline gap-4 text-right tabular-nums">
              <span className="text-xs text-gray-400 w-24">{formatAUD(model.totalCost)}</span>
              <span className="text-sm font-bold text-gray-900 w-24">{formatAUD(liveCost)}</span>
              <span className={`text-xs font-semibold w-24 ${overBudget ? 'text-red-600' : onBudget ? 'text-gray-400' : 'text-emerald-600'}`}>
                {onBudget ? '—' : `${overBudget ? '+' : '−'}${formatAUD(Math.abs(costVariance))}`}
              </span>
            </div>
          </div>
        </SectionCard>
      )}

      {/* 4. REVENUE */}
      {model.revenueLines.length > 0 && (
        <SectionCard title="Revenue — Achieved vs Target" subtitle="blue = achieved to date">
          <div className="divide-y divide-gray-50">
            {model.revenueLines.map((line, i) => (
              <RevenueRow key={`${line.label}-${i}`} line={line} />
            ))}
          </div>
        </SectionCard>
      )}

      {/* 5. CASHFLOW */}
      {model.cashflow.length > 0 && (
        <SectionCard title="Project cashflow" subtitle="cumulative position by period">
          <CashflowChart points={model.cashflow} />
        </SectionCard>
      )}

      {/* 6. SENSITIVITY */}
      {model.sensitivity.length > 0 && (
        <SectionCard title="Sensitivity analysis" subtitle="scenario stress testing">
          <SensitivityTable rows={model.sensitivity} />
        </SectionCard>
      )}

      {editing && (
        <FeasibilityEditor
          initial={model}
          onSave={(patch) => feaso.update(model.id, patch)}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  );
}
