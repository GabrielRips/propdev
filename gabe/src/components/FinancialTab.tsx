import React, { useEffect, useState } from 'react';
import { useCollection } from '../data/useCollection';

interface FinancialTabProps {
  projectId: string;
}

interface InvoiceRecord {
  id: string;
  provider: string;
  description: string;
  amount: number;
  dueDate?: string; // ISO yyyy-mm-dd
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  createdAt: number;
}

function formatAUD(amount: number): string {
  return amount.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Roughly "today" for highlighting overdue due-dates.
const TODAY = '2026-06-08';

export default function FinancialTab({ projectId }: FinancialTabProps) {
  const invoices = useCollection<InvoiceRecord>(`propdev:${projectId}:invoices`);
  const [showAdd, setShowAdd] = useState(false);

  const pending = invoices.items.filter((i) => i.status === 'pending');
  const approved = invoices.items.filter((i) => i.status === 'approved');
  const paid = invoices.items.filter((i) => i.status === 'paid');

  const committed = [...approved, ...paid].reduce((sum, i) => sum + i.amount, 0);
  const pendingTotal = pending.reduce((sum, i) => sum + i.amount, 0);
  const paidTotal = paid.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-5">
      {/* Header / Add */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Financial Control Centre</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="px-3.5 py-2 text-xs font-semibold bg-gray-900 text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          + Add invoice
        </button>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Summary</h3>
        </div>
        <div className="px-5 py-5 grid grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-gray-400 mb-1">Committed / Spend</p>
            <p className="text-xl font-semibold text-gray-900">{formatAUD(committed)}</p>
            <p className="text-xs text-gray-400 mt-0.5">Approved + paid</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Pending</p>
            <p className="text-xl font-semibold text-amber-600">{formatAUD(pendingTotal)}</p>
            <p className="text-xs text-gray-400 mt-0.5">{pending.length} awaiting approval</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Paid</p>
            <p className="text-xl font-semibold text-green-600">{formatAUD(paidTotal)}</p>
            <p className="text-xs text-gray-400 mt-0.5">{paid.length} settled</p>
          </div>
        </div>
      </div>

      {invoices.items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <p className="text-gray-400 text-sm">No invoices yet — add one to start tracking spend.</p>
        </div>
      ) : (
        <>
          {/* For approval */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900">For approval</h3>
              {pending.length > 0 && (
                <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  {pending.length}
                </span>
              )}
            </div>
            <div className="px-5 py-4">
              {pending.length === 0 ? (
                <p className="text-sm text-gray-400 italic py-2">No invoices pending approval</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {pending.map((inv) => {
                    const overdue = !!inv.dueDate && inv.dueDate < TODAY;
                    return (
                      <li key={inv.id} className="py-3 flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-800">{inv.provider}</p>
                            <span className="text-[11px] font-medium bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                              Pending
                            </span>
                          </div>
                          {inv.description && (
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{inv.description}</p>
                          )}
                          {inv.dueDate && (
                            <p className={`text-[11px] mt-0.5 ${overdue ? 'text-red-500' : 'text-gray-400'}`}>
                              Due {formatDate(inv.dueDate)}
                            </p>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-gray-900 flex-shrink-0 w-28 text-right">
                          {formatAUD(inv.amount)}
                        </p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => invoices.update(inv.id, { status: 'approved' })}
                            className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => invoices.update(inv.id, { status: 'rejected' })}
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

          {/* Approved / Paid */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900">Approved / Paid</h3>
            </div>
            <div className="px-5 py-4">
              {approved.length === 0 && paid.length === 0 ? (
                <p className="text-sm text-gray-400 italic py-2">Nothing approved or paid yet</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {[...approved, ...paid].map((inv) => (
                    <li key={inv.id} className="py-3 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-800">{inv.provider}</p>
                          {inv.status === 'paid' ? (
                            <span className="px-2.5 py-0.5 text-[11px] font-medium bg-gray-100 text-gray-500 rounded-full">
                              Paid
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                              Approved
                            </span>
                          )}
                        </div>
                        {inv.description && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{inv.description}</p>
                        )}
                        {inv.dueDate && (
                          <p className="text-[11px] text-gray-400 mt-0.5">Due {formatDate(inv.dueDate)}</p>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-gray-900 flex-shrink-0 w-28 text-right">
                        {formatAUD(inv.amount)}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {inv.status === 'approved' && (
                          <button
                            onClick={() => invoices.update(inv.id, { status: 'paid' })}
                            className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg transition-colors"
                          >
                            Mark paid
                          </button>
                        )}
                        <button
                          onClick={() => invoices.remove(inv.id)}
                          className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}

      {showAdd && (
        <AddInvoiceModal
          onClose={() => setShowAdd(false)}
          onSubmit={(rec) => {
            invoices.add(rec);
            setShowAdd(false);
          }}
        />
      )}
    </div>
  );
}

interface AddInvoiceModalProps {
  onClose: () => void;
  onSubmit: (rec: Omit<InvoiceRecord, 'id'>) => void;
}

function AddInvoiceModal({ onClose, onSubmit }: AddInvoiceModalProps) {
  const [provider, setProvider] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<InvoiceRecord['status']>('pending');

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const canSubmit = provider.trim() !== '' && amount.trim() !== '' && !Number.isNaN(Number(amount));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      provider: provider.trim(),
      description: description.trim(),
      amount: Number(amount),
      dueDate: dueDate || undefined,
      status,
      createdAt: Date.now(),
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Add invoice</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Provider <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              autoFocus
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="e.g. Acme Plumbing"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="What is this invoice for?"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Amount (AUD) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Due date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as InvoiceRecord['status'])}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="px-3.5 py-2 text-xs font-semibold bg-gray-900 text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
