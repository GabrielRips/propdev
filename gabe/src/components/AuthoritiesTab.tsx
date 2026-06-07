import React, { useState } from 'react';
import {
  authoritiesData,
  UtilityStatus,
  ElectricityData,
  WaterData,
  GasData,
  AuthDocument,
} from '../data/authorities-data';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAUD(n: number): string {
  if (n === 0) return '—';
  return n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Status Badges ────────────────────────────────────────────────────────────

const utilityStatusConfig: Record<UtilityStatus, { label: string; className: string }> = {
  not_applied: { label: 'Not Applied', className: 'bg-gray-100 text-gray-500' },
  applied:     { label: 'Applied', className: 'bg-amber-100 text-amber-700' },
  approved:    { label: 'Approved', className: 'bg-blue-100 text-blue-700' },
  energised:   { label: 'Energised', className: 'bg-green-100 text-green-700' },
  connected:   { label: 'Connected', className: 'bg-green-100 text-green-700' },
};

function UtilityBadge({ status }: { status: UtilityStatus }) {
  const { label, className } = utilityStatusConfig[status];
  return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${className}`}>{label}</span>;
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}

function FinancialStat({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div>
      <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-sm font-semibold ${muted ? 'text-gray-400' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}

function LayerDivider({ label }: { label: string }) {
  return (
    <div className="px-5 py-2 bg-gray-50 border-t border-b border-gray-100 flex items-center gap-2">
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{label}</span>
    </div>
  );
}

function DocumentList({ docs }: { docs: AuthDocument[] }) {
  const [openFile, setOpenFile] = useState<string | null>(null);
  const uploaded = docs.filter((d) => d.fileName);
  const pending = docs.filter((d) => !d.fileName);

  return (
    <>
      <div className="space-y-4">
        {uploaded.length > 0 && (
          <ul className="space-y-2">
            {uploaded.map((doc) => (
              <li key={doc.label} className="flex items-start gap-3">
                <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">{doc.label}</p>
                  <button
                    onClick={() => setOpenFile(doc.fileName!)}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline text-left truncate max-w-full"
                  >
                    {doc.fileName}
                  </button>
                  {doc.date && (
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(doc.date)}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

      {pending.length > 0 && (
        <div>
          {uploaded.length > 0 && (
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Pending</p>
          )}
          <ul className="space-y-1.5">
            {pending.map((doc) => (
              <li key={doc.label} className="flex items-center gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-3 h-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </span>
                <span className="text-sm text-gray-400">{doc.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      </div>

      {openFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpenFile(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-gray-900">Document Preview</h2>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{openFile}</p>
              </div>
              <button
                onClick={() => setOpenFile(null)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-12 flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">PDF of the document will be shown here</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Section Cards ────────────────────────────────────────────────────────────

function ElectricitySection({ data }: { data: ElectricityData }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-base">⚡</span>
          <h3 className="text-sm font-semibold text-gray-900">Electricity</h3>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={data.portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            {data.retailer} Portal
          </a>
          <UtilityBadge status={data.connectionStatus} />
        </div>
      </div>

      {/* Layer 1: Status Summary */}
      <div className="px-5 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
          <InfoField label="Retailer" value={data.retailer} />
          {data.applicationNumber && (
            <InfoField label="Application No." value={data.applicationNumber} />
          )}
          {data.estimatedEnergisationDate && (
            <InfoField label="Est. Energisation" value={formatDate(data.estimatedEnergisationDate)} />
          )}
          <div>
            <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">Meter Installed</p>
            <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${data.meterInstalled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {data.meterInstalled ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>

      {/* Layer 2: Financials */}
      <LayerDivider label="Financials" />
      <div className="px-5 py-4 bg-gray-50/60">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
          <FinancialStat label="Fees Paid" value={formatAUD(data.feesPaid)} muted={data.feesPaid === 0} />
        </div>
      </div>

      {/* Layer 3: Documents */}
      <LayerDivider label="Documents" />
      <div className="px-5 py-4">
        <DocumentList docs={data.documents} />
      </div>
    </div>
  );
}

function WaterSection({ data }: { data: WaterData }) {
  const totalExposure = data.feesPaid + data.headworksCharges;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-base">💧</span>
          <h3 className="text-sm font-semibold text-gray-900">Water</h3>
        </div>
        <UtilityBadge status={data.connectionStatus} />
      </div>

      {/* Layer 1: Status Summary */}
      <div className="px-5 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
          <InfoField label="Authority" value={data.authority} />
          {data.tapInDate && (
            <InfoField label="Tap-In Date" value={formatDate(data.tapInDate)} />
          )}
          {!data.tapInDate && (
            <InfoField label="Tap-In Date" value="TBD" />
          )}
        </div>
      </div>

      {/* Layer 2: Financials */}
      <LayerDivider label="Financials" />
      <div className="px-5 py-4 bg-gray-50/60">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
          <FinancialStat label="Fees Paid" value={formatAUD(data.feesPaid)} muted={data.feesPaid === 0} />
          <FinancialStat label="Headworks Charges" value={formatAUD(data.headworksCharges)} muted={data.headworksCharges === 0} />
        </div>
        {totalExposure > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              Total water exposure:{' '}
              <span className="font-semibold text-gray-700">{formatAUD(totalExposure)}</span>
            </p>
          </div>
        )}
      </div>

      {/* Layer 3: Documents */}
      <LayerDivider label="Documents" />
      <div className="px-5 py-4">
        <DocumentList docs={data.documents} />
      </div>
    </div>
  );
}

function GasSection({ data }: { data: GasData }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-base">🔥</span>
          <h3 className="text-sm font-semibold text-gray-900">Gas</h3>
        </div>
        <UtilityBadge status={data.connectionStatus} />
      </div>

      {/* Layer 1: Status Summary */}
      <div className="px-5 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
          <InfoField label="Provider" value={data.provider} />
          {data.meterInstallationDate && (
            <InfoField label="Meter Installation" value={formatDate(data.meterInstallationDate)} />
          )}
          {!data.meterInstallationDate && (
            <InfoField label="Meter Installation" value="TBD" />
          )}
        </div>
      </div>

      {/* Layer 2: Financials */}
      <LayerDivider label="Financials" />
      <div className="px-5 py-4 bg-gray-50/60">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
          <FinancialStat label="Fees Paid" value={formatAUD(data.feesPaid)} muted={data.feesPaid === 0} />
        </div>
      </div>

      {/* Layer 3: Documents */}
      <LayerDivider label="Documents" />
      <div className="px-5 py-4">
        <DocumentList docs={data.documents} />
      </div>
    </div>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

interface AuthoritiesTabProps {
  projectId: string;
}

export default function AuthoritiesTab({ projectId }: AuthoritiesTabProps) {
  const data = authoritiesData[projectId];

  if (!data) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
        <p className="text-gray-400 text-sm">No authority data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ElectricitySection data={data.electricity} />
      <WaterSection data={data.water} />
      <GasSection data={data.gas} />
    </div>
  );
}
