import React, { useState } from 'react';
import { Project } from '../data/projects';
import WipTab from './WipTab';
import FilesPanel from './FilesPanel';
import FinancialTab from './FinancialTab';
import FeasibilityTab from './FeasibilityTab';
import ContactsTab from './ContactsTab';
import AuthoritiesTab from './AuthoritiesTab';
import ConsultantsTab from './ConsultantsTab';
import PermitTab from './PermitTab';
import LegalTab from './LegalTab';
import ConstructionTab from './ConstructionTab';
import SalesTab from './SalesTab';

type TabId =
  | 'wip' | 'plans' | 'feasibility' | 'financial' | 'contacts' | 'authorities'
  | 'consultants' | 'permit' | 'legal' | 'construction' | 'sales';

interface TabDef {
  id: TabId;
  label: string;
  icon: string;
}

interface TabGroup {
  heading: string;
  tabs: TabDef[];
}

const GROUPS: TabGroup[] = [
  {
    heading: 'Workspace',
    tabs: [
      { id: 'wip', label: 'Work in progress', icon: '⚡' },
      { id: 'plans', label: 'Files & plans', icon: '📐' },
      { id: 'contacts', label: 'Contacts', icon: '👥' },
    ],
  },
  {
    heading: 'Financials',
    tabs: [
      { id: 'feasibility', label: 'Feasibility', icon: '📈' },
      { id: 'financial', label: 'Financial', icon: '💰' },
    ],
  },
  {
    heading: 'Delivery',
    tabs: [
      { id: 'construction', label: 'Construction', icon: '🏗️' },
      { id: 'sales', label: 'Sales', icon: '🏷️' },
    ],
  },
  {
    heading: 'Approvals',
    tabs: [
      { id: 'permit', label: 'Permit', icon: '📋' },
      { id: 'consultants', label: 'Consultants', icon: '📑' },
      { id: 'authorities', label: 'Utilities', icon: '🔌' },
      { id: 'legal', label: 'Legal', icon: '⚖️' },
    ],
  },
];

const ALL_TABS = GROUPS.flatMap((g) => g.tabs);

interface AdvancedViewProps {
  projectId: string;
  project: Project;
}

export default function AdvancedView({ projectId }: AdvancedViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>('wip');

  const railButton = (tab: TabDef) => {
    const active = activeTab === tab.id;
    return (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors ${
          active ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <span className={active ? '' : 'opacity-70'}>{tab.icon}</span>
        <span className="truncate">{tab.label}</span>
      </button>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Desktop: grouped left rail */}
      <aside className="hidden lg:block w-56 flex-shrink-0">
        <div className="sticky top-24 surface p-3 space-y-4">
          {GROUPS.map((group) => (
            <div key={group.heading}>
              <p className="px-3 mb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                {group.heading}
              </p>
              <div className="space-y-0.5">{group.tabs.map(railButton)}</div>
            </div>
          ))}
        </div>
      </aside>

      {/* Mobile: horizontal scroll pills */}
      <div className="lg:hidden -mx-1 overflow-x-auto">
        <div className="flex gap-1.5 px-1 pb-1 min-w-max">
          {ALL_TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  active ? 'bg-gray-900 text-white' : 'text-gray-600 bg-gray-100'
                }`}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {activeTab === 'wip' && <WipTab projectId={projectId} />}
        {activeTab === 'plans' && <FilesPanel projectId={projectId} />}
        {activeTab === 'feasibility' && <FeasibilityTab projectId={projectId} />}
        {activeTab === 'financial' && <FinancialTab projectId={projectId} />}
        {activeTab === 'contacts' && <ContactsTab projectId={projectId} />}
        {activeTab === 'permit' && <PermitTab projectId={projectId} />}
        {activeTab === 'authorities' && <AuthoritiesTab projectId={projectId} />}
        {activeTab === 'consultants' && <ConsultantsTab projectId={projectId} />}
        {activeTab === 'construction' && <ConstructionTab projectId={projectId} />}
        {activeTab === 'sales' && <SalesTab projectId={projectId} />}
        {activeTab === 'legal' && <LegalTab projectId={projectId} />}
      </div>
    </div>
  );
}
