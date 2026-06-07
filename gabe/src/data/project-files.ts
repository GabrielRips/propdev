export type FileCategory = 'Architectural' | 'Working Drawings' | 'Consultant Reports';

export interface FileVersion {
  version: string;
  date: string;
  uploadedBy: string;
  note?: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  category: FileCategory;
  date: string;
  size: string;
  uploadedBy: string;
  versions?: FileVersion[];
}

export const projectFiles: Record<string, ProjectFile[]> = {
  'proj-001': [
    { id: 'f-001-01', name: 'Concept Plans v3.pdf', category: 'Architectural', date: '2024-06-15', size: '4.2 MB', uploadedBy: 'Jess Thornton', versions: [
      { version: 'v2', date: '2024-05-02', uploadedBy: 'Jess Thornton', note: 'Revised setbacks after council pre-application meeting' },
      { version: 'v1', date: '2024-03-18', uploadedBy: 'Jess Thornton', note: 'Initial concept design for client review' },
    ]},
    { id: 'f-001-02', name: 'Colour Scheme Selections.pdf', category: 'Architectural', date: '2024-08-15', size: '1.8 MB', uploadedBy: 'Jo Martinelli' },
    { id: 'f-001-03', name: 'Fixture Schedule v4.xlsx', category: 'Architectural', date: '2024-08-12', size: '320 KB', uploadedBy: 'Jess Thornton', versions: [
      { version: 'v3', date: '2024-07-28', uploadedBy: 'Jess Thornton', note: 'Updated bathroom fixtures after supplier change' },
      { version: 'v2', date: '2024-07-01', uploadedBy: 'Jo Martinelli', note: 'Kitchen appliance upgrades' },
      { version: 'v1', date: '2024-06-10', uploadedBy: 'Jess Thornton', note: 'Initial fixture schedule' },
    ]},
    { id: 'f-001-04', name: 'Construction Drawings — Full Set.pdf', category: 'Working Drawings', date: '2024-09-20', size: '28.5 MB', uploadedBy: 'Jess Thornton', versions: [
      { version: 'v1', date: '2024-08-30', uploadedBy: 'Jess Thornton', note: 'Issued for construction — first issue' },
    ]},
    { id: 'f-001-05', name: 'Structural Engineering Plans.pdf', category: 'Working Drawings', date: '2024-09-18', size: '12.1 MB', uploadedBy: 'Cardno Engineering', versions: [
      { version: 'v1', date: '2024-08-22', uploadedBy: 'Cardno Engineering', note: 'Preliminary structural drawings' },
    ]},
    { id: 'f-001-06', name: 'Landscape Design Package.pdf', category: 'Working Drawings', date: '2024-09-22', size: '6.7 MB', uploadedBy: 'ASPECT Studios' },
    { id: 'f-001-07', name: 'Site Survey Report.pdf', category: 'Consultant Reports', date: '2024-02-10', size: '2.4 MB', uploadedBy: 'Mark Stevens' },
    { id: 'f-001-08', name: 'Land Valuation Report.pdf', category: 'Consultant Reports', date: '2024-03-20', size: '1.1 MB', uploadedBy: 'John Reeves' },
    { id: 'f-001-09', name: 'Wind Assessment.pdf', category: 'Consultant Reports', date: '2024-07-10', size: '3.5 MB', uploadedBy: 'MEL Consultants' },
  ],
  'proj-002': [
    { id: 'f-002-01', name: 'Floor Plans v3.pdf', category: 'Architectural', date: '2026-02-08', size: '5.1 MB', uploadedBy: 'SJB Architects', versions: [
      { version: 'v2', date: '2026-01-10', uploadedBy: 'SJB Architects', note: 'Revised unit mix — reduced 3-bed, added 2-bed' },
      { version: 'v1', date: '2025-11-28', uploadedBy: 'SJB Architects', note: 'Initial floor plan layouts' },
    ]},
    { id: 'f-002-02', name: 'Concept Design Package.pdf', category: 'Architectural', date: '2025-11-15', size: '3.8 MB', uploadedBy: 'SJB Architects' },
    { id: 'f-002-03', name: 'Shadow Diagrams.pdf', category: 'Working Drawings', date: '2026-02-05', size: '2.2 MB', uploadedBy: 'SJB Architects', versions: [
      { version: 'v1', date: '2026-01-18', uploadedBy: 'SJB Architects', note: 'Equinox & solstice shadow studies — initial issue' },
    ]},
    { id: 'f-002-04', name: 'Stormwater Management Plan.pdf', category: 'Consultant Reports', date: '2026-01-20', size: '1.9 MB', uploadedBy: 'Civil Engineer' },
    { id: 'f-002-05', name: 'Traffic Impact Assessment.pdf', category: 'Consultant Reports', date: '2026-01-25', size: '2.6 MB', uploadedBy: 'GTA Consultants' },
    { id: 'f-002-06', name: 'BASIX Certificates.pdf', category: 'Consultant Reports', date: '2026-02-01', size: '450 KB', uploadedBy: 'ESD Consultant' },
  ],
  'proj-003': [
    { id: 'f-003-01', name: 'IFC Documentation — Full Set.pdf', category: 'Architectural', date: '2025-06-20', size: '85.2 MB', uploadedBy: 'BVN Architecture', versions: [
      { version: 'v2', date: '2025-04-14', uploadedBy: 'BVN Architecture', note: 'Coordinated IFC — structural & services overlaid' },
      { version: 'v1', date: '2025-02-28', uploadedBy: 'BVN Architecture', note: 'Issued for coordination — architectural only' },
    ]},
    { id: 'f-003-02', name: 'Interior Design Specifications.pdf', category: 'Architectural', date: '2025-06-18', size: '12.4 MB', uploadedBy: 'BVN Architecture', versions: [
      { version: 'v1', date: '2025-05-10', uploadedBy: 'BVN Architecture', note: 'Preliminary finishes schedule for client approval' },
    ]},
    { id: 'f-003-03', name: 'Facade Engineering Details.pdf', category: 'Working Drawings', date: '2025-06-15', size: '18.7 MB', uploadedBy: 'Facade Consultant', versions: [
      { version: 'v2', date: '2025-05-01', uploadedBy: 'Facade Consultant', note: 'Thermal performance updated to meet NCC 2022' },
      { version: 'v1', date: '2025-03-12', uploadedBy: 'Facade Consultant', note: 'Initial facade concept & system selection' },
    ]},
    { id: 'f-003-04', name: 'Structural Engineering — Tower.pdf', category: 'Working Drawings', date: '2025-05-30', size: '42.1 MB', uploadedBy: 'Robert Bird Group', versions: [
      { version: 'v1', date: '2025-03-20', uploadedBy: 'Robert Bird Group', note: 'Preliminary structural design — core & podium' },
    ]},
    { id: 'f-003-05', name: 'Mechanical Services Design.pdf', category: 'Working Drawings', date: '2025-06-01', size: '15.3 MB', uploadedBy: 'AECOM' },
    { id: 'f-003-06', name: 'Wind Impact Assessment.pdf', category: 'Consultant Reports', date: '2025-02-18', size: '3.8 MB', uploadedBy: 'MEL Consultants' },
    { id: 'f-003-07', name: 'Traffic Study.pdf', category: 'Consultant Reports', date: '2025-03-10', size: '2.9 MB', uploadedBy: 'TTM Consulting' },
    { id: 'f-003-08', name: 'Geotechnical Report.pdf', category: 'Consultant Reports', date: '2024-12-15', size: '4.1 MB', uploadedBy: 'Douglas Partners' },
  ],
  'proj-004': [
    { id: 'f-004-01', name: 'Schematic Design Progress.pdf', category: 'Architectural', date: '2026-02-08', size: '7.3 MB', uploadedBy: 'Woods Bagot', versions: [
      { version: 'v2', date: '2026-01-15', uploadedBy: 'Woods Bagot', note: 'Updated tower articulation following heritage feedback' },
      { version: 'v1', date: '2025-12-20', uploadedBy: 'Woods Bagot', note: 'Initial schematic design — option C selected' },
    ]},
    { id: 'f-004-02', name: 'Concept Options A-C.pdf', category: 'Architectural', date: '2025-12-10', size: '4.5 MB', uploadedBy: 'Woods Bagot' },
    { id: 'f-004-03', name: 'Heritage Assessment.pdf', category: 'Consultant Reports', date: '2025-01-10', size: '1.2 MB', uploadedBy: 'Heritage SA' },
    { id: 'f-004-04', name: 'Pre-Lodgement Meeting Notes.pdf', category: 'Consultant Reports', date: '2026-01-30', size: '890 KB', uploadedBy: 'SCAP' },
    { id: 'f-004-05', name: 'Draft Planning Report.pdf', category: 'Consultant Reports', date: '2026-02-10', size: '3.6 MB', uploadedBy: 'Planning Consultant' },
  ],
  'proj-005': [
    { id: 'f-005-01', name: 'Subdivision Yield Plan.pdf', category: 'Architectural', date: '2026-01-15', size: '2.8 MB', uploadedBy: 'Surveyor' },
    { id: 'f-005-02', name: 'Geotechnical Report.pdf', category: 'Consultant Reports', date: '2025-07-20', size: '3.2 MB', uploadedBy: 'Douglas Partners' },
    { id: 'f-005-03', name: 'Water Corp Headworks Estimate.pdf', category: 'Consultant Reports', date: '2026-02-01', size: '540 KB', uploadedBy: 'Water Corp' },
  ],
};
