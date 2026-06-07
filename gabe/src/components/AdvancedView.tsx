import React, { useState } from 'react';
import { Project } from '../data/projects';
import WipTab from './WipTab';
import PlansTab from './PlansTab';
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

interface Tab {
  id: TabId;
  label: string;
}

const TABS: Tab[] = [
  { id: 'wip', label: 'WIP' },
  { id: 'contacts', label: 'Contacts' },
  { id: 'feasibility', label: 'Feasibility' },
  { id: 'financial', label: 'Financial' },
  { id: 'plans', label: 'Plans' },
  { id: 'permit', label: 'Permit' },
  { id: 'consultants', label: 'Consultants' },
  { id: 'authorities', label: 'Utilities' },
  { id: 'construction', label: 'Construction' },
  { id: 'sales', label: 'Sales' },
  { id: 'legal', label: 'Legal' },
];

interface AdvancedViewProps {
  projectId: string;
  project: Project;
}

export default function AdvancedView({ projectId }: AdvancedViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>('wip');

  return (
    <div>
      {/* Tab Bar */}
      <div className="border-b border-gray-200 mb-6 overflow-x-auto">
        <nav className="flex gap-6 min-w-max">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'wip' && <WipTab projectId={projectId} />}
      {activeTab === 'plans' && <PlansTab projectId={projectId} />}
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
  );
}
