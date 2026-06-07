export type LegalSection = 'Acquisition' | 'Planning' | 'Construction' | 'Sales';

export interface LegalDocVersion {
  version: string;
  date: string;
  note?: string;
}

export interface LegalDocument {
  id: string;
  name: string;
  section: LegalSection;
  dateReceived?: string;
  submittedBy?: string;
  submitterPhone?: string;
  submitterEmail?: string;
  versions?: LegalDocVersion[];
}

export const legalData: Record<string, LegalDocument[]> = {
  'proj-001': [
    // Acquisition
    {
      id: 'leg-001-acq-01',
      name: 'Contract of Sale — 42 Lithgow St Abbotsford.pdf',
      section: 'Acquisition',
      dateReceived: '2024-03-10',
      submittedBy: 'Maddocks Lawyers',
      submitterPhone: '+61 3 9258 3555',
      submitterEmail: 'property@maddocks.com.au',
      versions: [
        { version: 'v1', date: '2024-02-28', note: 'Initial draft — revised after vendor\'s solicitor review' },
      ],
    },
    {
      id: 'leg-001-acq-02',
      name: 'Vendor Statement (Section 32) — 42 Lithgow St Abbotsford.pdf',
      section: 'Acquisition',
      dateReceived: '2024-02-20',
      submittedBy: 'Maddocks Lawyers',
      submitterPhone: '+61 3 9258 3555',
      submitterEmail: 'property@maddocks.com.au',
    },
    {
      id: 'leg-001-acq-03',
      name: 'Caveat Removal — 42 Lithgow St Abbotsford.pdf',
      section: 'Acquisition',
      dateReceived: '2024-03-22',
      submittedBy: 'Maddocks Lawyers',
      submitterPhone: '+61 3 9258 3555',
      submitterEmail: 'property@maddocks.com.au',
    },
    // Planning
    {
      id: 'leg-001-plan-01',
      name: 'Planning Permit PP-2024-0881 — Yarra City Council.pdf',
      section: 'Planning',
      dateReceived: '2024-10-15',
      submittedBy: 'Yarra City Council',
      submitterPhone: '+61 3 9205 5555',
      submitterEmail: 'planning@yarracity.vic.gov.au',
    },
    {
      id: 'leg-001-plan-02',
      name: 'Section 173 Agreement — Yarra City Council.pdf',
      section: 'Planning',
      dateReceived: '2024-11-05',
      submittedBy: 'Maddocks Lawyers',
      submitterPhone: '+61 3 9258 3555',
      submitterEmail: 'property@maddocks.com.au',
    },
    // Construction
    {
      id: 'leg-001-con-01',
      name: 'Head Contract — Buildcorp Pty Ltd (AS 4000-1997).pdf',
      section: 'Construction',
      dateReceived: '2025-07-12',
      submittedBy: 'HWL Ebsworth Lawyers',
      submitterPhone: '+61 3 8644 3500',
      submitterEmail: 'construction@hwlebsworth.com.au',
      versions: [
        { version: 'v2', date: '2025-06-15', note: 'Revised programme and PC date' },
        { version: 'v1', date: '2025-05-30', note: 'Initial execution draft' },
      ],
    },
    {
      id: 'leg-001-con-02',
      name: 'Subcontractor Deed — Structural Works.pdf',
      section: 'Construction',
      dateReceived: '2025-08-20',
      submittedBy: 'HWL Ebsworth Lawyers',
      submitterPhone: '+61 3 8644 3500',
      submitterEmail: 'construction@hwlebsworth.com.au',
    },
    {
      id: 'leg-001-con-03',
      name: 'Performance Bond — Buildcorp Pty Ltd.pdf',
      section: 'Construction',
      dateReceived: '2025-07-15',
      submittedBy: 'Buildcorp Pty Ltd',
      submitterPhone: '+61 3 9670 4400',
      submitterEmail: 'contracts@buildcorp.com.au',
    },
    // Sales
    {
      id: 'leg-001-sal-01',
      name: 'Off-the-Plan Contract of Sale — Lot 1.pdf',
      section: 'Sales',
      dateReceived: '2025-03-01',
      submittedBy: 'Maddocks Lawyers',
      submitterPhone: '+61 3 9258 3555',
      submitterEmail: 'property@maddocks.com.au',
    },
    {
      id: 'leg-001-sal-02',
      name: 'Off-the-Plan Contract of Sale — Lot 3.pdf',
      section: 'Sales',
      dateReceived: '2025-04-18',
      submittedBy: 'Maddocks Lawyers',
      submitterPhone: '+61 3 9258 3555',
      submitterEmail: 'property@maddocks.com.au',
    },
  ],

  'proj-002': [
    // Acquisition
    {
      id: 'leg-002-acq-01',
      name: 'Contract for Sale of Land — 18 Memorial Ave Kellyville.pdf',
      section: 'Acquisition',
      dateReceived: '2024-12-20',
      submittedBy: 'Colin Biggers & Paisley',
      submitterPhone: '+61 2 9264 9999',
      submitterEmail: 'property@cbp.com.au',
      versions: [
        { version: 'v1', date: '2024-12-05', note: 'Initial draft — amended cooling-off waiver' },
      ],
    },
    {
      id: 'leg-002-acq-02',
      name: 'Vendor Disclosure Statement — 18 Memorial Ave Kellyville.pdf',
      section: 'Acquisition',
      dateReceived: '2024-12-10',
      submittedBy: 'Colin Biggers & Paisley',
      submitterPhone: '+61 2 9264 9999',
      submitterEmail: 'property@cbp.com.au',
    },
    // Planning
    {
      id: 'leg-002-plan-01',
      name: 'Development Application Lodgement Receipt — DA 2026/0042.pdf',
      section: 'Planning',
      dateReceived: '2026-01-28',
      submittedBy: 'The Hills Shire Council',
      submitterPhone: '+61 2 9843 0555',
      submitterEmail: 'da@thehills.nsw.gov.au',
    },
    {
      id: 'leg-002-plan-02',
      name: 'Council Objector Notice — 18 Memorial Ave Kellyville.pdf',
      section: 'Planning',
    },
    // Sales
    {
      id: 'leg-002-sal-01',
      name: 'Off-the-Plan Contracts Template — Wattle Grove Residences.pdf',
      section: 'Sales',
      dateReceived: '2026-01-15',
      submittedBy: 'Colin Biggers & Paisley',
      submitterPhone: '+61 2 9264 9999',
      submitterEmail: 'property@cbp.com.au',
    },
  ],

  'proj-003': [
    // Acquisition
    {
      id: 'leg-003-acq-01',
      name: 'Contract of Sale — 155 Grey St South Brisbane.pdf',
      section: 'Acquisition',
      dateReceived: '2024-08-15',
      submittedBy: 'McCullough Robertson',
      submitterPhone: '+61 7 3233 8888',
      submitterEmail: 'property@mccullough.com.au',
    },
    {
      id: 'leg-003-acq-02',
      name: 'Stamp Duty Exemption Certificate — Lot 1 on SP123456.pdf',
      section: 'Acquisition',
      dateReceived: '2024-10-01',
      submittedBy: 'Queensland Revenue Office',
      submitterPhone: '+61 7 3179 2500',
      submitterEmail: 'info@qro.qld.gov.au',
    },
    // Planning
    {
      id: 'leg-003-plan-01',
      name: 'Development Approval DA2025-0391 — Brisbane City Council.pdf',
      section: 'Planning',
      dateReceived: '2025-04-22',
      submittedBy: 'Brisbane City Council',
      submitterPhone: '+61 7 3403 8888',
      submitterEmail: 'developmentassessment@brisbane.qld.gov.au',
    },
    {
      id: 'leg-003-plan-02',
      name: 'Infrastructure Agreement — BCC Trunk Infrastructure.pdf',
      section: 'Planning',
      dateReceived: '2025-05-10',
      submittedBy: 'McCullough Robertson',
      submitterPhone: '+61 7 3233 8888',
      submitterEmail: 'property@mccullough.com.au',
      versions: [
        { version: 'v1', date: '2025-03-18', note: 'Draft — revised infrastructure charge schedule' },
      ],
    },
    // Construction
    {
      id: 'leg-003-con-01',
      name: 'Head Contract — Multiplex Constructions (GC21 Form).pdf',
      section: 'Construction',
      dateReceived: '2025-09-05',
      submittedBy: 'Allens',
      submitterPhone: '+61 7 3334 3000',
      submitterEmail: 'projects@allens.com.au',
      versions: [
        { version: 'v2', date: '2025-08-20', note: 'Amended risk allocation schedule' },
        { version: 'v1', date: '2025-07-30', note: 'Initial execution draft' },
      ],
    },
    {
      id: 'leg-003-con-02',
      name: 'Bank Guarantee — ANZ Construction Facility.pdf',
      section: 'Construction',
      dateReceived: '2025-09-15',
      submittedBy: 'ANZ Banking Group',
      submitterPhone: '+61 7 3947 0700',
      submitterEmail: 'construction.finance@anz.com.au',
    },
    {
      id: 'leg-003-con-03',
      name: 'Latent Conditions Deed — Horizon Tower.pdf',
      section: 'Construction',
      dateReceived: '2025-10-01',
      submittedBy: 'Allens',
      submitterPhone: '+61 7 3334 3000',
      submitterEmail: 'projects@allens.com.au',
    },
    // Sales
    {
      id: 'leg-003-sal-01',
      name: 'Off-the-Plan Contract of Sale — Horizon Tower (Standard).pdf',
      section: 'Sales',
      dateReceived: '2025-02-10',
      submittedBy: 'McCullough Robertson',
      submitterPhone: '+61 7 3233 8888',
      submitterEmail: 'property@mccullough.com.au',
    },
    {
      id: 'leg-003-sal-02',
      name: 'Disclosure Statement — Horizon Tower Community Title.pdf',
      section: 'Sales',
      dateReceived: '2025-02-10',
      submittedBy: 'McCullough Robertson',
      submitterPhone: '+61 7 3233 8888',
      submitterEmail: 'property@mccullough.com.au',
    },
    {
      id: 'leg-003-sal-03',
      name: 'Marketing Agent Agreement — CBRE Residential.pdf',
      section: 'Sales',
      dateReceived: '2025-01-20',
      submittedBy: 'CBRE Residential Projects',
      submitterPhone: '+61 7 3009 5400',
      submitterEmail: 'projects@cbre.com.au',
    },
  ],

  'proj-004': [
    // Acquisition
    {
      id: 'leg-004-acq-01',
      name: 'Contract of Sale — 90 Grote St Adelaide.pdf',
      section: 'Acquisition',
      dateReceived: '2025-01-08',
      submittedBy: 'Piper Alderman',
      submitterPhone: '+61 8 8205 3333',
      submitterEmail: 'property@piperalderman.com.au',
    },
    {
      id: 'leg-004-acq-02',
      name: 'Vendor Statement — 90 Grote St Adelaide.pdf',
      section: 'Acquisition',
      dateReceived: '2024-12-22',
      submittedBy: 'Piper Alderman',
      submitterPhone: '+61 8 8205 3333',
      submitterEmail: 'property@piperalderman.com.au',
    },
    // Planning
    {
      id: 'leg-004-plan-01',
      name: 'Development Application Receipt — DAP 2025/00711.pdf',
      section: 'Planning',
      dateReceived: '2025-11-14',
      submittedBy: 'City of Adelaide',
      submitterPhone: '+61 8 8203 7203',
      submitterEmail: 'planning@cityofadelaide.com.au',
    },
    {
      id: 'leg-004-plan-02',
      name: 'State Heritage Referral Acknowledgement — DPLG.pdf',
      section: 'Planning',
    },
    // Sales
    {
      id: 'leg-004-sal-01',
      name: 'Form 1 Vendor Disclosure — Aurora Central (Draft).pdf',
      section: 'Sales',
      dateReceived: '2026-01-20',
      submittedBy: 'Piper Alderman',
      submitterPhone: '+61 8 8205 3333',
      submitterEmail: 'property@piperalderman.com.au',
    },
  ],

  'proj-005': [
    // Acquisition
    {
      id: 'leg-005-acq-01',
      name: 'Option Agreement — Lot 500 Baldivis Rd Baldivis.pdf',
      section: 'Acquisition',
      dateReceived: '2025-08-20',
      submittedBy: 'Lavan',
      submitterPhone: '+61 8 9288 6000',
      submitterEmail: 'property@lavan.com.au',
      versions: [
        { version: 'v1', date: '2025-07-30', note: 'Initial option deed — extended exercise date by 90 days' },
      ],
    },
    {
      id: 'leg-005-acq-02',
      name: 'Due Diligence Report — Lot 500 Baldivis Rd.pdf',
      section: 'Acquisition',
      dateReceived: '2025-10-05',
      submittedBy: 'Lavan',
      submitterPhone: '+61 8 9288 6000',
      submitterEmail: 'property@lavan.com.au',
    },
  ],
};
