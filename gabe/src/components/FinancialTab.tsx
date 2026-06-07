import React, { useState } from 'react';
import { financialData, PendingInvoice } from '../data/financial-data';
import { getVariations, CapturedInvoice, Variation } from '../data/variations-data';

interface FinancialTabProps {
  projectId: string;
}

function formatAUD(amount: number): string {
  return amount.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Roughly "today" for highlighting overdue due-dates.
const TODAY = '2026-06-07';

export default function FinancialTab({ projectId }: FinancialTabProps) {
  const data = financialData[projectId];
  const [pendingInvoices, setPendingInvoices] = useState<PendingInvoice[]>(
    data?.pendingInvoices ?? []
  );
  const [dismissed, setDismissed] = useState<Record<string, 'approved' | 'rejected'>>({});

  const [capturedInvoices, setCapturedInvoices] = useState<CapturedInvoice[]>(
    () => getVariations(projectId).capturedInvoices
  );
  const [variations, setVariations] = useState<Variation[]>(
    () => getVariations(projectId).variations
  );

  function approveCaptured(id: string) {
    setCapturedInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: 'approved' } : inv))
    );
  }

  function rejectCaptured(id: string) {
    setCapturedInvoices((prev) => prev.filter((inv) => inv.id !== id));
  }

  function payCaptured(id: string) {
    setCapturedInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: 'paid' } : inv))
    );
  }

  function setVariationStatus(id: string, status: Variation['status']) {
    setVariations((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status } : v))
    );
  }

  const capturedPending = capturedInvoices.filter((inv) => inv.status === 'captured').length;
  const variationsPending = variations.filter((v) => v.status === 'pending');
  const approvedVariationsTotal = variations
    .filter((v) => v.status === 'approved')
    .reduce((sum, v) => sum + v.amount, 0);
  const pendingVariationsTotal = variationsPending.reduce((sum, v) => sum + v.amount, 0);

  if (!data) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
        <p className="text-gray-400 text-sm">No financial data available</p>
      </div>
    );
  }

  const { summary, paidInvoices } = data;
  const variance = summary.forecast - summary.totalSpend;
  const isFavourable = variance >= 0;

  function handleApprove(id: string) {
    setDismissed((prev) => ({ ...prev, [id]: 'approved' }));
    setTimeout(() => setPendingInvoices((prev) => prev.filter((inv) => inv.id !== id)), 400);
  }

  function handleReject(id: string) {
    setDismissed((prev) => ({ ...prev, [id]: 'rejected' }));
    setTimeout(() => setPendingInvoices((prev) => prev.filter((inv) => inv.id !== id)), 400);
  }

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Summary</h3>
        </div>
        <div className="px-5 py-5 grid grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-gray-400 mb-1">Total Spend to Date</p>
            <p className="text-xl font-semibold text-gray-900">{formatAUD(summary.totalSpend)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Forecast</p>
            <p className="text-xl font-semibold text-gray-900">{formatAUD(summary.forecast)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Variance</p>
            <p className={`text-xl font-semibold ${isFavourable ? 'text-green-600' : 'text-red-500'}`}>
              {isFavourable ? '+' : '-'}{formatAUD(Math.abs(variance))}
            </p>
            <p className={`text-xs mt-0.5 ${isFavourable ? 'text-green-500' : 'text-red-400'}`}>
              {isFavourable ? 'Under forecast' : 'Over forecast'}
            </p>
          </div>
        </div>
      </div>

      {/* Captured from Email */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">Captured from Email</h3>
          <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
            📨 Auto-captured
          </span>
          {capturedPending > 0 && (
            <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              {capturedPending} new
            </span>
          )}
        </div>
        <div className="px-5 py-4">
          {capturedInvoices.length === 0 ? (
            <p className="text-sm text-gray-400 italic py-2">No invoices captured from email</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {capturedInvoices.map((inv) => {
                const overdue = inv.dueDate < TODAY;
                return (
                  <li key={inv.id} className="py-3 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-800">{inv.provider}</p>
                        <span className="text-[11px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          → {inv.budgetLine}
                        </span>
                        {inv.isExtra && (
                          <span className="text-[11px] font-medium bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                            ⚡ Extra
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{inv.description}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5 truncate">📨 {inv.capturedFrom}</p>
                    </div>
                    <div className="flex-shrink-0 w-28 text-right">
                      <p className="text-sm font-semibold text-gray-900">{formatAUD(inv.amount)}</p>
                      <p className={`text-[11px] mt-0.5 ${overdue ? 'text-red-500' : 'text-gray-400'}`}>
                        Due {formatDate(inv.dueDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {inv.status === 'captured' && (
                        <>
                          <button
                            onClick={() => approveCaptured(inv.id)}
                            className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg transition-colors"
                          >
                            Approve to budget
                          </button>
                          <button
                            onClick={() => rejectCaptured(inv.id)}
                            className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-red-600 transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {inv.status === 'approved' && (
                        <>
                          <span className="px-2.5 py-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded-full">
                            ✓ Approved
                          </span>
                          <button
                            onClick={() => payCaptured(inv.id)}
                            className="px-3 py-1.5 text-xs font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                          >
                            Mark paid
                          </button>
                        </>
                      )}
                      {inv.status === 'paid' && (
                        <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded-full">
                          Paid
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Variations & Extras */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-semibold text-gray-900">Variations &amp; Extras</h3>
          {variationsPending.length > 0 && (
            <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              {variationsPending.length} pending
            </span>
          )}
          <span className="ml-auto text-xs text-gray-500">
            Approved variations: <span className="font-medium text-gray-700">{formatAUD(approvedVariationsTotal)}</span>
            <span className="mx-1.5 text-gray-300">·</span>
            Pending: <span className="font-medium text-amber-600">{formatAUD(pendingVariationsTotal)}</span>
          </span>
        </div>
        <div className="px-5 py-4">
          {variations.length === 0 ? (
            <p className="text-sm text-gray-400 italic py-2">No variations raised</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {variations.map((v) => (
                <li key={v.id} className="py-3 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-gray-700">{v.ref}</span>
                      <p className="text-sm font-medium text-gray-800 truncate">{v.description}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{v.contractor}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5 truncate">{v.reason}</p>
                  </div>
                  <p
                    className={`text-sm font-semibold flex-shrink-0 w-28 text-right ${
                      v.status === 'rejected' ? 'text-gray-400 line-through' : 'text-gray-900'
                    }`}
                  >
                    {formatAUD(v.amount)}
                  </p>
                  <div className="flex items-center gap-2 flex-shrink-0 w-44 justify-end">
                    {v.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => setVariationStatus(v.id, 'approved')}
                          className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setVariationStatus(v.id, 'rejected')}
                          className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    ) : v.status === 'approved' ? (
                      <span className="px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                        Approved
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded-full">
                        Rejected
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* For Approval */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">For Approval</h3>
          {pendingInvoices.length > 0 && (
            <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              {pendingInvoices.length}
            </span>
          )}
        </div>
        <div className="px-5 py-4">
          {pendingInvoices.length === 0 ? (
            <p className="text-sm text-gray-400 italic py-2">No invoices pending approval</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {pendingInvoices.map((inv) => {
                const status = dismissed[inv.id];
                return (
                  <li
                    key={inv.id}
                    className={`py-3 flex items-center gap-4 transition-opacity duration-300 ${status ? 'opacity-0' : 'opacity-100'}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{inv.provider}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{inv.description}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 flex-shrink-0 w-28 text-right">
                      {formatAUD(inv.amount)}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleApprove(inv.id)}
                        className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(inv.id)}
                        className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Paid Invoices */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Paid Invoices</h3>
        </div>
        <div className="px-5 py-4">
          {paidInvoices.length === 0 ? (
            <p className="text-sm text-gray-400 italic py-2">No paid invoices</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {paidInvoices.map((inv) => (
                <li key={inv.id} className="py-3 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{inv.provider}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{inv.description}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 flex-shrink-0 w-28 text-right">
                    {formatAUD(inv.amount)}
                  </p>
                  <p className="text-xs text-gray-400 flex-shrink-0 w-28 text-right">
                    {formatDate(inv.datePaid)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
