import React, { useEffect, useState } from 'react';
import { useCollection } from '../data/useCollection';

// ─── Types ──────────────────────────────────────────────────────────────────────

type LegalSection = 'Acquisition' | 'Planning' | 'Construction' | 'Sales';

interface LegalRecord {
  id: string;
  name: string;
  section: LegalSection;
  dateReceived?: string;
  submittedBy?: string;
  notes?: string;
}

const SECTIONS: LegalSection[] = ['Acquisition', 'Planning', 'Construction', 'Sales'];

const sectionAccent: Record<LegalSection, string> = {
  Acquisition:  'border-indigo-400',
  Planning:     'border-amber-400',
  Construction: 'border-orange-400',
  Sales:        'border-green-400',
};

const sectionIcon: Record<LegalSection, string> = {
  Acquisition:  '🤝',
  Planning:     '🏛️',
  Construction: '🏗️',
  Sales:        '🏷️',
};

function formatDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

// ─── Document modal (add / edit) ────────────────────────────────────────────────

interface DocModalProps {
  initial?: LegalRecord;
  defaultSection?: LegalSection;
  onClose: () => void;
  onSave: (data: Omit<LegalRecord, 'id'>) => void;
}

function DocModal({ initial, defaultSection, onClose, onSave }: DocModalProps) {
  const [form, setForm] = useState<Omit<LegalRecord, 'id'>>({
    name: initial?.name ?? '',
    section: initial?.section ?? defaultSection ?? 'Acquisition',
    dateReceived: initial?.dateReceived ?? '',
    submittedBy: initial?.submittedBy ?? '',
    notes: initial?.notes ?? '',
  });

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSave() {
    if (!form.name.trim()) return;
    onSave({ ...form, name: form.name.trim() });
    onClose();
  }

  const inputClass = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelClass = 'text-xs font-medium text-gray-400 block mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{initial ? 'Edit document' : 'Add document'}</h2>
        </div>

        <div className="px-6 py-4 space-y-4 overflow-y-auto">
          <div>
            <label className={labelClass}>Document name *</label>
            <input className={inputClass} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Contract of Sale" />
          </div>

          <div>
            <label className={labelClass}>Section</label>
            <select className={inputClass} value={form.section} onChange={(e) => set('section', e.target.value as LegalSection)}>
              {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Date received</label>
              <input className={inputClass} type="date" value={form.dateReceived} onChange={(e) => set('dateReceived', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Submitted by</label>
              <input className={inputClass} value={form.submittedBy} onChange={(e) => set('submittedBy', e.target.value)} placeholder="Firm / contact" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Notes</label>
            <textarea className={`${inputClass} resize-none`} rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Optional notes" />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={!form.name.trim()} className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {initial ? 'Save changes' : 'Add document'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Section card ───────────────────────────────────────────────────────────────

interface SectionCardProps {
  section: LegalSection;
  docs: LegalRecord[];
  onAdd: (section: LegalSection) => void;
  onEdit: (doc: LegalRecord) => void;
  onDelete: (id: string) => void;
}

function SectionCard({ section, docs, onAdd, onEdit, onDelete }: SectionCardProps) {
  return (
    <div className="surface bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className={`px-5 py-3 border-b border-gray-100 border-l-4 ${sectionAccent[section]}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">{sectionIcon[section]}</span>
            <h3 className="text-sm font-semibold text-gray-900">{section}</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">{docs.length} document{docs.length === 1 ? '' : 's'}</span>
            <button
              onClick={() => onAdd(section)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add
            </button>
          </div>
        </div>
      </div>

      {docs.length === 0 ? (
        <p className="px-5 py-8 text-sm text-gray-400 italic text-center">No documents in this phase yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Document</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide hidden lg:table-cell">Submitted By</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">Date Received</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {docs.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                      {doc.notes && <span className="text-xs text-gray-400">{doc.notes}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-sm text-gray-600">{doc.submittedBy || '—'}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {doc.dateReceived ? (
                      <span className="text-sm text-gray-700">{formatDate(doc.dateReceived)}</span>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Not received</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      <button
                        onClick={() => onEdit(doc)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(doc.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main tab ───────────────────────────────────────────────────────────────────

interface LegalTabProps {
  projectId: string;
}

export default function LegalTab({ projectId }: LegalTabProps) {
  const legal = useCollection<LegalRecord>(`propdev:${projectId}:legal`);
  const [addSection, setAddSection] = useState<LegalSection | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editDoc, setEditDoc] = useState<LegalRecord | null>(null);

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button
          onClick={() => { setAddSection(null); setShowAdd(true); }}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add document
        </button>
      </div>

      {SECTIONS.map((section) => (
        <SectionCard
          key={section}
          section={section}
          docs={legal.items.filter((d) => d.section === section)}
          onAdd={(s) => { setAddSection(s); setShowAdd(true); }}
          onEdit={(doc) => setEditDoc(doc)}
          onDelete={(id) => legal.remove(id)}
        />
      ))}

      {showAdd && (
        <DocModal
          defaultSection={addSection ?? 'Acquisition'}
          onClose={() => setShowAdd(false)}
          onSave={(data) => legal.add(data)}
        />
      )}
      {editDoc && (
        <DocModal
          initial={editDoc}
          onClose={() => setEditDoc(null)}
          onSave={(data) => legal.update(editDoc.id, data)}
        />
      )}
    </div>
  );
}
