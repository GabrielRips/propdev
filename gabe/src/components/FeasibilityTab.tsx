import React from 'react';
import {
  feasibilityData,
  FeasibilityModel,
  FeasibilityLineItem,
  CashflowPoint,
  SensitivityRow,
} from '../data/feasibility-data';

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

function CostRow({ line, maxValue }: { line: FeasibilityLineItem; maxValue: number }) {
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

function RevenueRow({ line }: { line: FeasibilityLineItem }) {
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

function CashflowChart({ points }: { points: CashflowPoint[] }) {
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

function SensitivityTable({ rows }: { rows: SensitivityRow[] }) {
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
// Main component
// ---------------------------------------------------------------------------

export default function FeasibilityTab({ projectId }: { projectId: string }) {
  const model: FeasibilityModel | undefined = feasibilityData[projectId];

  if (!model) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <p className="text-gray-400 text-sm">No feasibility model for this project yet</p>
        </div>
      </div>
    );
  }

  // Live cost computed from cost line items (fall back to model.liveCost).
  const computedLiveCost = model.costLines.reduce((sum, l) => sum + l.live, 0);
  const liveCost = computedLiveCost || model.liveCost;

  // Headline cost variance vs feasibility total.
  const costVariance = liveCost - model.totalCost; // +ve = over budget
  const overBudget = costVariance > 0;
  const onBudget = costVariance === 0;
  const variancePct = model.totalCost > 0 ? (costVariance / model.totalCost) * 100 : 0;
  const projectedProfit = model.profit - costVariance; // erodes when over budget

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
          value={formatAUDShort(model.profit)}
          sub={formatAUD(model.profit)}
          accent="text-emerald-600"
        />
        <KpiCard label="Margin on cost" value={pct(model.marginOnCost)} sub={`${pct(model.marginOnGdv)} on GDV`} />
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
              <span className="font-medium text-blue-600">{pct(model.lvr)}</span>
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
                projectedProfit >= model.profit ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {formatAUD(projectedProfit)}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              vs feasibility {formatAUDShort(model.profit)}
            </p>
          </div>
        </div>
      </div>

      {/* 3. COST BREAKDOWN */}
      <SectionCard title="Cost breakdown — Budget vs Live" subtitle="gray = feasibility · solid = live">
        <div className="hidden sm:flex items-baseline justify-end gap-4 text-[11px] text-gray-400 pb-1 border-b border-gray-100 mb-1">
          <span className="w-24 text-right">Budget</span>
          <span className="w-24 text-right">Live</span>
          <span className="w-24 text-right">Variance</span>
        </div>
        <div className="divide-y divide-gray-50">
          {model.costLines.map((line) => (
            <CostRow key={line.label} line={line} maxValue={maxCostLine} />
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

      {/* 4. REVENUE */}
      <SectionCard title="Revenue — Achieved vs Target" subtitle="blue = achieved to date">
        <div className="divide-y divide-gray-50">
          {model.revenueLines.map((line) => (
            <RevenueRow key={line.label} line={line} />
          ))}
        </div>
      </SectionCard>

      {/* 5. CASHFLOW */}
      <SectionCard title="Project cashflow" subtitle="cumulative position by period">
        <CashflowChart points={model.cashflow} />
      </SectionCard>

      {/* 6. SENSITIVITY */}
      <SectionCard title="Sensitivity analysis" subtitle="scenario stress testing">
        <SensitivityTable rows={model.sensitivity} />
      </SectionCard>
    </div>
  );
}
