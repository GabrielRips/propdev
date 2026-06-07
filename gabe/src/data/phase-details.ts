import { ProjectPhase } from './projects';

export type TaskStatus = 'done' | 'in_progress' | 'not_started';

export interface PhaseTask {
  id: string;
  title: string;
  status: TaskStatus;
  dueDate?: string; // ISO date string e.g. '2026-03-01'
}

export type ActivityType = 'email_in' | 'email_out' | 'phone_in' | 'phone_out' | 'sms_in' | 'sms_out';

export interface Activity {
  id: string;
  type: ActivityType;
  summary: string;
  person: string;
  date: string;
  // Email fields
  subject?: string;
  body?: string;
  // Phone fields
  transcript?: string;
  // SMS fields (uses body)
}

export interface PhaseDetail {
  tasks: PhaseTask[];
  activities: Activity[];
}

// Map of projectId -> phase -> detail
export const phaseDetails: Record<string, Partial<Record<ProjectPhase, PhaseDetail>>> = {
  'proj-001': {
    'Site Identification': {
      tasks: [
        { id: 't-001-01', title: 'Site survey completed', status: 'done', dueDate: '2026-02-03' },
        { id: 't-001-02', title: 'Zoning check', status: 'done', dueDate: '2026-02-05' },
        { id: 't-001-03', title: 'Environmental assessment', status: 'done', dueDate: '2026-02-10' },
      ],
      activities: [
        {
          id: 'a-001-01', type: 'email_in', summary: 'Site survey report from GeoTech', person: 'Mark Stevens', date: '2024-02-10',
          subject: 'Site Survey Report — 42 Lithgow St, Abbotsford',
          body: 'Hi,\n\nPlease find attached the completed site survey report for 42 Lithgow Street, Abbotsford.\n\nKey findings:\n- Total site area: 2,450 sqm\n- Existing structures: Single-storey warehouse (to be demolished)\n- Easements: 3m drainage easement along eastern boundary\n- Contamination: Nil detected in preliminary soil testing\n\nHappy to discuss any questions.\n\nRegards,\nMark Stevens\nGeoTech Surveys Pty Ltd',
        },
        {
          id: 'a-001-02', type: 'phone_out', summary: 'Called council re zoning confirmation', person: 'Yarra Council', date: '2024-02-15',
          transcript: 'Called Yarra City Council planning department. Spoke with Sarah from the planning team. Confirmed the site is zoned General Residential Zone (GRZ1) under the Yarra Planning Scheme. Multi-dwelling development is permitted, subject to a planning permit. Sarah advised to check the neighbourhood character overlay that applies to the area. Maximum building height is 11m / 3 storeys. She suggested booking a pre-application meeting before lodging.',
        },
      ],
    },
    'Feasibility': {
      tasks: [
        { id: 't-001-04', title: 'Feasibility calculations', status: 'done', dueDate: '2026-02-05' },
        { id: 't-001-05', title: 'Rent appraisal from real estate agent', status: 'done', dueDate: '2026-02-08' },
        { id: 't-001-06', title: 'Land valuation', status: 'done', dueDate: '2026-02-12' },
      ],
      activities: [
        {
          id: 'a-001-03', type: 'email_in', summary: 'Valuation report attached', person: 'John Reeves', date: '2024-03-20',
          subject: 'RE: Land Valuation — 42 Lithgow St Abbotsford',
          body: 'Dear Project Team,\n\nPlease find attached our formal valuation report for 42 Lithgow Street, Abbotsford VIC 3067.\n\nValuation Summary:\n- Current market value (as-is): $4,200,000\n- Highest and best use: Multi-unit residential development\n- Comparable sales referenced: 5 recent transactions in Abbotsford/Collingwood\n- Valuation date: 18 March 2024\n\nThe full report with supporting evidence is in the attached PDF.\n\nKind regards,\nJohn Reeves AAPI\nCertified Practising Valuer',
        },
        {
          id: 'a-001-04', type: 'phone_out', summary: 'Discussed rental yield estimates', person: 'Richard Tan', date: '2024-03-22',
          transcript: 'Called Richard Tan at Ray White Abbotsford to discuss rental yields in the area. Richard provided the following estimates:\n- 3-bed townhouse: $750-$850/week\n- 2-bed townhouse: $600-$680/week\n- Vacancy rate in Abbotsford currently around 1.8%\n- Strong demand from young professionals and couples\n\nHe also mentioned that new builds with car spaces and outdoor areas are commanding premium rents. Agreed he would send through a formal rent appraisal by end of week.',
        },
      ],
    },
    'Financing': {
      tasks: [
        { id: 't-001-07', title: 'Loan application submitted', status: 'done', dueDate: '2026-02-03' },
        { id: 't-001-08', title: 'Bank valuation completed', status: 'done', dueDate: '2026-02-10' },
        { id: 't-001-09', title: 'Loan approval received', status: 'done', dueDate: '2026-02-14' },
      ],
      activities: [
        {
          id: 'a-001-05', type: 'email_in', summary: 'Loan approval letter', person: 'ANZ Business Banking', date: '2024-04-15',
          subject: 'Formal Approval — Development Finance Facility',
          body: 'Dear Valued Client,\n\nWe are pleased to advise that your development finance application has been formally approved.\n\nFacility Details:\n- Facility limit: $9,800,000\n- Facility type: Construction & Development Loan\n- Term: 24 months\n- Interest rate: BBSY + 2.85% p.a.\n- Pre-sale requirement: 60% of total project value\n- LVR: 65% of on-completion value\n\nPlease review the attached letter of offer and return signed copies within 14 days.\n\nRegards,\nDevelopment Finance Team\nANZ Business Banking',
        },
        {
          id: 'a-001-06', type: 'email_out', summary: 'Sent signed loan documents', person: 'Sarah Chen', date: '2024-04-18',
          subject: 'Signed Loan Documents — Riverside Townhouses',
          body: 'Hi Sarah,\n\nPlease find attached the signed letter of offer and supporting documents for the Riverside Townhouses development finance facility.\n\nDocuments enclosed:\n1. Signed letter of offer\n2. Director guarantees\n3. Company resolution\n4. Updated insurance certificates\n\nPlease confirm receipt and advise on next steps for drawdown.\n\nThanks,\nProject Team',
        },
      ],
    },
    'Pre-sales': {
      tasks: [
        { id: 't-001-10', title: 'Engage sales agent', status: 'done', dueDate: '2026-02-05' },
        { id: 't-001-11', title: 'Marketing campaign', status: 'in_progress', dueDate: '2026-02-18' },
        { id: 't-001-12', title: 'Sales contracts prepared', status: 'done', dueDate: '2026-02-12' },
        { id: 't-001-13', title: 'Achieve 60% pre-sales target', status: 'in_progress', dueDate: '2026-03-15' },
      ],
      activities: [
        {
          id: 'a-001-07', type: 'email_in', summary: 'Sale enquiry for unit 4', person: 'David Wong', date: '2026-01-28',
          subject: 'Enquiry — Unit 4, Riverside Townhouses',
          body: 'Hi there,\n\nI came across the Riverside Townhouses listing on Domain and I\'m very interested in Unit 4 (3-bed, 2-bath).\n\nCould you please send me:\n- Floor plan and specifications\n- Price guide\n- Expected completion date\n- Body corporate estimates\n\nI\'m a first home buyer and would also like to know if the development qualifies for any stamp duty concessions.\n\nLooking forward to hearing from you.\n\nBest regards,\nDavid Wong\n0412 345 678',
        },
        {
          id: 'a-001-08', type: 'email_out', summary: 'Contracts sent for review', person: 'Stuart McPherson', date: '2026-01-25',
          subject: 'Draft Contracts of Sale — Riverside Townhouses Units 1-12',
          body: 'Hi Stuart,\n\nPlease find attached the draft contracts of sale for Units 1 through 12 at Riverside Townhouses, 42 Lithgow Street Abbotsford.\n\nKey items for your review:\n- Sunset clause: 24 months from contract date\n- Deposit: 10% on signing\n- Special conditions re: variations and substitutions\n- Section 32 vendor statements\n\nPlease provide your comments by Friday so we can finalise for the sales launch.\n\nRegards,\nProject Team',
        },
        {
          id: 'a-001-09', type: 'sms_in', summary: 'Buyer asking about display suite timing', person: 'Michelle Lee', date: '2026-01-30',
          body: 'Hi, I visited the Riverside site last weekend. When will the display townhouse be ready for inspection? Also interested in units 7 or 8 if still available. Thanks, Michelle',
        },
      ],
    },
    'Land Acquisition': {
      tasks: [
        { id: 't-001-14', title: 'Contract of sale signed', status: 'done', dueDate: '2026-02-03' },
        { id: 't-001-15', title: 'Settlement completed', status: 'done', dueDate: '2026-02-10' },
        { id: 't-001-16', title: 'Title transfer registered', status: 'done', dueDate: '2026-02-14' },
      ],
      activities: [
        {
          id: 'a-001-10', type: 'email_out', summary: 'Settlement confirmation to solicitor', person: 'Helen Park', date: '2024-05-30',
          subject: 'Settlement Completed — 42 Lithgow Street Abbotsford',
          body: 'Hi Helen,\n\nConfirming that settlement has been completed today for 42 Lithgow Street, Abbotsford.\n\nSettlement details:\n- Purchase price: $4,200,000\n- Settlement date: 30 May 2024\n- Title reference: Vol 10234 Fol 567\n\nPlease arrange for transfer of title to be registered with Land Use Victoria at your earliest convenience.\n\nThanks,\nProject Team',
        },
      ],
    },
    'Architecture': {
      tasks: [
        { id: 't-001-17', title: 'Initial concept plans', status: 'done', dueDate: '2026-02-03' },
        { id: 't-001-18', title: '3D renders', status: 'done', dueDate: '2026-02-07' },
        { id: 't-001-19', title: 'Landscape design', status: 'done', dueDate: '2026-02-10' },
        { id: 't-001-20', title: 'Working drawings', status: 'done', dueDate: '2026-02-14' },
      ],
      activities: [
        {
          id: 'a-001-11', type: 'email_in', summary: 'Updated fixture schedule', person: 'Jess Thornton', date: '2024-08-12',
          subject: 'Updated Fixture & Fitting Schedule v4',
          body: 'Hi Team,\n\nPlease find attached the updated fixture and fitting schedule (v4) for Riverside Townhouses.\n\nChanges from v3:\n- Kitchen benchtops upgraded to Caesarstone (from laminate)\n- Bathroom tapware changed to matte black finish\n- Timber flooring specification updated to Engineered Oak 190mm\n- Garage door motors upgraded to Merlin Commander\n\nThese changes add approximately $8,500 per unit to the fitout cost. Please confirm you\'re happy to proceed.\n\nCheers,\nJess Thornton\nInterior Designer',
        },
        {
          id: 'a-001-12', type: 'email_out', summary: 'Colour selections confirmed', person: 'Jo Martinelli', date: '2024-08-15',
          subject: 'RE: Colour Scheme Selections — Riverside Townhouses',
          body: 'Hi Jo,\n\nWe\'ve reviewed the three colour scheme options and have made our selections:\n\n- Standard scheme: "Coastal Light" (Option B)\n- Premium upgrade scheme: "Urban Dark" (Option C)\n- External render colour: Dulux "Antique White USA"\n- Roof tiles: Monier Concrete in "Sambuca"\n\nPlease update the design documentation accordingly.\n\nThanks,\nProject Team',
        },
        {
          id: 'a-001-13', type: 'phone_out', summary: 'Cabinet design finalisation', person: 'David Lau', date: '2024-08-18',
          transcript: 'Called David Lau at Custom Cabinets Melbourne to finalise kitchen and bathroom cabinetry. Agreed on polyurethane finish in "Snow" for standard units and two-pack in "Charcoal" for premium scheme. Soft-close hardware throughout. Island benches for units 1, 4, 7, and 10 (larger floor plans). David to send updated quote by Wednesday. Lead time is 8 weeks from order confirmation.',
        },
      ],
    },
    'Planning Permit': {
      tasks: [
        { id: 't-001-21', title: 'Planning application lodged', status: 'done', dueDate: '2026-02-02' },
        { id: 't-001-22', title: 'Neighbour notification', status: 'done', dueDate: '2026-02-06' },
        { id: 't-001-23', title: 'Council assessment', status: 'done', dueDate: '2026-02-12' },
        { id: 't-001-24', title: 'Permit issued', status: 'done', dueDate: '2026-02-17' },
      ],
      activities: [
        {
          id: 'a-001-14', type: 'email_in', summary: 'Planning permit granted', person: 'Yarra Council', date: '2024-10-05',
          subject: 'Notice of Decision — Planning Permit PLN/2024/00456',
          body: 'Dear Applicant,\n\nI am pleased to advise that the City of Yarra has resolved to issue Planning Permit PLN/2024/00456 for the development of 12 dwellings at 42 Lithgow Street, Abbotsford.\n\nPermit Conditions:\n1. Development must be generally in accordance with endorsed plans\n2. Maximum building height not to exceed 10.5 metres\n3. Landscaping to be completed prior to occupation\n4. Car parking as per approved plans (24 spaces)\n5. Construction management plan required prior to commencement\n\nThe permit is subject to a 28-day appeal period. No objections were received during the notification period.\n\nRegards,\nPlanning Department\nCity of Yarra',
        },
        {
          id: 'a-001-14b', type: 'sms_out', summary: 'Quick update to architect on permit approval', person: 'Jess Thornton', date: '2024-10-05',
          body: 'Hi Jess, great news — planning permit approved today with no objections! 28-day appeal period starts now. Will forward the full conditions shortly. Can we meet next week to review against working drawings?',
        },
      ],
    },
    'Construction': {
      tasks: [
        { id: 't-001-25', title: 'Builder appointed', status: 'done', dueDate: '2026-02-03' },
        { id: 't-001-26', title: 'Site preparation and demolition', status: 'done', dueDate: '2026-02-10' },
        { id: 't-001-27', title: 'Foundations and slab', status: 'done', dueDate: '2026-02-17' },
        { id: 't-001-28', title: 'Framing', status: 'in_progress', dueDate: '2026-02-19' },
        { id: 't-001-29', title: 'Lock-up stage', status: 'not_started', dueDate: '2026-03-05' },
        { id: 't-001-30', title: 'Fit-out and finishing', status: 'not_started', dueDate: '2026-03-18' },
        { id: 't-001-31', title: 'Final inspections', status: 'not_started', dueDate: '2026-03-28' },
      ],
      activities: [
        {
          id: 'a-001-15', type: 'email_in', summary: 'Progress photos — framing 80% done', person: 'Tom Builder', date: '2026-02-15',
          subject: 'Weekly Site Update — Riverside Townhouses — Week 42',
          body: 'Hi Team,\n\nPlease find attached this week\'s progress photos and update.\n\nProgress Summary:\n- Framing: 80% complete (Units 1-8 done, Units 9-12 in progress)\n- Roof trusses: Installed on Units 1-6\n- Plumbing rough-in: Started on Units 1-4\n- Electrical rough-in: Scheduled to start Monday\n\nIssues:\n- Minor delay on timber delivery for Units 11-12 trusses (expected next Tuesday)\n- No impact on overall programme at this stage\n\nNext week:\n- Complete framing on Units 9-12\n- Continue roof truss installation\n- Start window installation on Units 1-4\n\nRegards,\nTom\nSenior Site Manager',
        },
        {
          id: 'a-001-16', type: 'phone_in', summary: 'Delay on timber delivery, 1 week', person: 'Tom Builder', date: '2026-02-12',
          transcript: 'Received call from Tom re timber delivery delay. Supplier (Carter Holt Harvey) has advised a 1-week delay on LVL beams for Units 11 and 12. Issue is at the mill in Myrtleford. Tom has re-sequenced the program to work on roofing for Units 1-6 during the wait. No impact on practical completion date at this stage. Tom will keep us posted if the delay extends beyond one week.',
        },
        {
          id: 'a-001-17', type: 'email_out', summary: 'Approved variation for upgraded windows', person: 'Tom Builder', date: '2026-02-08',
          subject: 'Approved — Variation #12 — Window Upgrade',
          body: 'Hi Tom,\n\nWe confirm approval of Variation #12 for the upgrade of windows across all 12 units.\n\nVariation details:\n- From: Standard aluminium sliding windows (AWS Series 462)\n- To: Thermally broken aluminium (AWS ThermalHEART)\n- Additional cost: $2,800 per unit ($33,600 total)\n- No programme impact confirmed\n\nPlease proceed with ordering. Approved by Project Director.\n\nRegards,\nProject Team',
        },
      ],
    },
    'Marketing': {
      tasks: [
        { id: 't-001-32', title: 'Brand identity and signage', status: 'done', dueDate: '2026-02-10' },
        { id: 't-001-33', title: 'Website and listing pages', status: 'in_progress', dueDate: '2026-02-25' },
        { id: 't-001-34', title: 'Display suite setup', status: 'not_started', dueDate: '2026-03-10' },
        { id: 't-001-35', title: 'Open for inspection schedule', status: 'not_started', dueDate: '2026-03-20' },
      ],
      activities: [
        {
          id: 'a-001-18', type: 'email_in', summary: 'Website mockup for review', person: 'Creative Agency', date: '2026-02-10',
          subject: 'Riverside Townhouses — Website Design Mockup v2',
          body: 'Hi Team,\n\nPlease review the updated website mockup for Riverside Townhouses (link in attachment).\n\nUpdates from v1:\n- Hero image replaced with new 3D render (river view)\n- Floor plans section now interactive\n- Added virtual tour embed placeholder\n- Contact form integrated with CRM\n- Mobile responsive design finalised\n\nPlease provide feedback by Thursday so we can begin development next week.\n\nCheers,\nCreative Team',
        },
        {
          id: 'a-001-19', type: 'phone_out', summary: 'Discussed launch timeline', person: 'Lisa Morris', date: '2026-02-05',
          transcript: 'Called Lisa Morris at the sales agency to discuss marketing launch timeline. Agreed on the following plan:\n- Website go-live: 1 March\n- Domain & REA listings: 5 March\n- VIP preview event: 15 March (Saturday)\n- Public launch: 22 March\n- Display suite opening: dependent on construction — targeting May\n\nLisa also suggested a targeted digital campaign for 3 weeks pre-launch, budget approx $15K. Will send proposal by Friday.',
        },
      ],
    },
  },

  'proj-002': {
    'Site Identification': {
      tasks: [
        { id: 't-002-01', title: 'Site inspection', status: 'done', dueDate: '2026-02-03' },
        { id: 't-002-02', title: 'Zoning verification', status: 'done', dueDate: '2026-02-06' },
      ],
      activities: [
        {
          id: 'a-002-01', type: 'email_in', summary: 'Zoning certificate received', person: 'Hills Shire Council', date: '2024-11-20',
          subject: 'Zoning Certificate — 18 Memorial Avenue, Kellyville',
          body: 'Dear Sir/Madam,\n\nPlease find attached the Section 10.7 Planning Certificate for 18 Memorial Avenue, Kellyville NSW 2155.\n\nZoning: R3 Medium Density Residential\nPermitted uses include: Multi-dwelling housing, residential flat buildings\nMinimum lot size: 700sqm\nMaximum height: 11.5m\nFSR: 0.75:1\n\nRegards,\nThe Hills Shire Council',
        },
      ],
    },
    'Feasibility': {
      tasks: [
        { id: 't-002-03', title: 'Market analysis', status: 'done', dueDate: '2026-02-04' },
        { id: 't-002-04', title: 'Cost estimation', status: 'done', dueDate: '2026-02-07' },
        { id: 't-002-05', title: 'Revenue projections', status: 'done', dueDate: '2026-02-12' },
      ],
      activities: [
        {
          id: 'a-002-02', type: 'email_in', summary: 'Comparable sales data', person: 'REA Group', date: '2024-12-10',
          subject: 'Market Report — Kellyville Townhouse Sales Data',
          body: 'Hi,\n\nAs requested, here is the recent comparable sales data for townhouses in the Kellyville area:\n\n1. 24 Wrights Rd — 3 bed, 2 bath — $1,180,000 (Sep 2024)\n2. 8/15 Stanhope Pkwy — 4 bed, 2 bath — $1,350,000 (Oct 2024)\n3. 3/42 Arnold Ave — 3 bed, 2 bath — $1,095,000 (Nov 2024)\n4. 12 Barry Rd — 4 bed, 3 bath — $1,420,000 (Nov 2024)\n\nMedian townhouse price in Kellyville: $1,210,000\nAnnual growth rate: 5.2%\n\nFull report attached.\n\nREA Group — Property Data',
        },
        {
          id: 'a-002-03', type: 'phone_out', summary: 'Discussed build costs', person: 'QS Consulting', date: '2024-12-12',
          transcript: 'Called QS Consulting to discuss preliminary build cost estimates for an 8-townhouse development in Kellyville. QS advised current build rates for medium-quality townhouses in NW Sydney are $2,800-$3,200 per sqm. For our proposed 180sqm average per unit, that\'s approximately $504,000-$576,000 per unit. Site costs (demolition, excavation, retaining walls) estimated at $350,000-$400,000 for the whole site. They\'ll provide a formal cost plan within 2 weeks for $4,500+GST.',
        },
      ],
    },
    'Financing': {
      tasks: [
        { id: 't-002-06', title: 'Prepare finance application', status: 'done', dueDate: '2026-02-10' },
        { id: 't-002-07', title: 'Submit to lender', status: 'in_progress', dueDate: '2026-02-17' },
        { id: 't-002-08', title: 'Credit approval', status: 'not_started', dueDate: '2026-03-10' },
      ],
      activities: [
        {
          id: 'a-002-04', type: 'email_out', summary: 'Finance application pack sent', person: 'Westpac Dev Finance', date: '2025-12-05',
          subject: 'Development Finance Application — Wattle Grove Residences',
          body: 'Dear Westpac Development Finance Team,\n\nPlease find attached our development finance application for Wattle Grove Residences, 18 Memorial Avenue, Kellyville NSW.\n\nAttached documents:\n1. Application form\n2. Feasibility study\n3. Development approval (pending)\n4. Quantity surveyor report\n5. Company financials (3 years)\n6. Director statements of position\n\nSeeking: $5,600,000 construction facility\nEstimated GDV: $8,800,000\n\nPlease advise on expected timeframes.\n\nRegards,\nProject Team',
        },
        {
          id: 'a-002-05', type: 'phone_in', summary: 'Additional docs requested by lender', person: 'Westpac', date: '2026-01-15',
          transcript: 'Received call from Karen at Westpac Dev Finance. They\'ve completed their initial review and need the following additional documents:\n1. Updated pre-sales evidence (minimum 3 signed contracts)\n2. Builder\'s fixed-price contract (or at least signed HoA)\n3. Updated valuation — their panel valuer is Opteon\n4. Evidence of equity contribution deposited\n\nKaren mentioned the current approval timeline is 4-6 weeks from receipt of all documents. Interest rate likely to be BBSY + 3.10% given current market.',
        },
        {
          id: 'a-002-05b', type: 'sms_out', summary: 'Chasing builder for fixed-price contract', person: 'Paul Henderson', date: '2026-01-16',
          body: 'Hi Paul, Westpac needs our signed fixed-price building contract to progress the finance application. Can you get the final contract to us this week? Thanks',
        },
      ],
    },
    'Pre-sales': {
      tasks: [
        { id: 't-002-09', title: 'Appoint selling agent', status: 'in_progress', dueDate: '2026-02-14' },
        { id: 't-002-10', title: 'Prepare marketing materials', status: 'not_started', dueDate: '2026-03-05' },
        { id: 't-002-11', title: 'Price list finalisation', status: 'not_started', dueDate: '2026-03-12' },
      ],
      activities: [
        {
          id: 'a-002-06', type: 'phone_out', summary: 'Interview with McGrath Kellyville', person: 'Alex Georgiou', date: '2026-02-01',
          transcript: 'Interviewed Alex Georgiou from McGrath Kellyville as a potential selling agent. Alex has sold 4 similar developments in the area in the last 2 years. Commission proposed: 2.2% + GST with $15K marketing contribution. He estimates 3-bed units at $1.05M-$1.15M and 4-bed at $1.25M-$1.35M. Suggested off-the-plan launch in April. Wants exclusive 6-month agency agreement. Will compare with Belle Property proposal before making a decision.',
        },
      ],
    },
    'Land Acquisition': {
      tasks: [
        { id: 't-002-12', title: 'Due diligence completed', status: 'done', dueDate: '2026-02-05' },
        { id: 't-002-13', title: 'Contract exchanged', status: 'done', dueDate: '2026-02-10' },
        { id: 't-002-14', title: 'Settlement', status: 'done', dueDate: '2026-02-14' },
      ],
      activities: [
        {
          id: 'a-002-07', type: 'email_in', summary: 'Settlement statement', person: 'Norton Rose', date: '2025-03-10',
          subject: 'Settlement Statement — 18 Memorial Avenue, Kellyville',
          body: 'Dear Client,\n\nSettlement has been completed for the above property.\n\nSettlement Summary:\n- Purchase price: $2,850,000\n- Deposit paid: $285,000\n- Balance: $2,565,000\n- Stamp duty: $126,490\n- Legal fees: $8,500 + GST\n- Registration fees: $320\n\nTitle has been transferred and registration is in progress.\n\nRegards,\nNorton Rose Fulbright',
        },
      ],
    },
    'Architecture': {
      tasks: [
        { id: 't-002-15', title: 'Concept design', status: 'done', dueDate: '2026-02-06' },
        { id: 't-002-16', title: 'Design development', status: 'in_progress', dueDate: '2026-02-20' },
        { id: 't-002-17', title: 'Construction documentation', status: 'not_started', dueDate: '2026-03-15' },
      ],
      activities: [
        {
          id: 'a-002-08', type: 'email_in', summary: 'Revised floor plans v3', person: 'SJB Architects', date: '2026-02-08',
          subject: 'Wattle Grove — Revised Floor Plans v3',
          body: 'Hi Team,\n\nPlease find attached the revised floor plans (v3) incorporating your feedback from last week\'s design review.\n\nKey changes:\n- Unit 3 & 6: Living area increased by 5sqm (reduced garage depth)\n- All units: Study nook added under stairs\n- Units 1 & 8 (end units): Side windows added to bedrooms\n- Common driveway widened to 6.0m as per council requirement\n\nPlease review and advise if we\'re ready to proceed to construction documentation.\n\nRegards,\nSJB Architects',
        },
        {
          id: 'a-002-09', type: 'phone_out', summary: 'Discussed setback requirements', person: 'SJB Architects', date: '2026-02-10',
          transcript: 'Called SJB to discuss council feedback on front setback requirements. Council wants a minimum 6.5m front setback (DCP requires 6m but council planner is pushing for consistency with streetscape). This means we lose about 0.5m from the ground floor living areas for Units 1-4. SJB will prepare an amended site plan showing the 6.5m setback and we\'ll assess the impact on internal layouts. May need to reduce the rear courtyard depth slightly to compensate.',
        },
      ],
    },
    'Planning Permit': {
      tasks: [
        { id: 't-002-18', title: 'Pre-application meeting with council', status: 'done', dueDate: '2026-02-10' },
        { id: 't-002-19', title: 'Prepare DA submission', status: 'in_progress', dueDate: '2026-02-21' },
        { id: 't-002-20', title: 'Lodge development application', status: 'not_started', dueDate: '2026-03-08' },
      ],
      activities: [
        {
          id: 'a-002-10', type: 'email_out', summary: 'Draft DA documents for review', person: 'Planning Consultant', date: '2026-02-12',
          subject: 'Draft DA Package — Wattle Grove Residences — For Review',
          body: 'Hi Planning Team,\n\nAttached is the draft DA package for your review before lodgement:\n\n1. Statement of Environmental Effects\n2. Architectural plans (SJB v3)\n3. Shadow diagrams\n4. Stormwater management plan\n5. Traffic impact assessment\n6. Landscape plan\n7. Waste management plan\n8. BASIX certificates\n\nPlease review and confirm we\'re ready to lodge next week.\n\nRegards,\nProject Team',
        },
        {
          id: 'a-002-11', type: 'phone_in', summary: 'Council planner feedback on setbacks', person: 'Hills Shire Council', date: '2026-02-14',
          transcript: 'Received call from Michael Chen, the assessing planner at Hills Shire Council. He reviewed our pre-DA submission and provided the following feedback:\n1. Front setback needs to be 6.5m minimum (not 6m)\n2. Visitor parking needs to be clearly marked — 2 spaces required\n3. Deep soil planting zone needs to be min 15% of site area\n4. He\'s generally supportive of the proposal and doesn\'t anticipate major issues\n5. Expected assessment timeframe: 60-90 days from lodgement\n\nOverall positive meeting. Michael said to reference the pre-DA meeting in our SEE.',
        },
      ],
    },
  },

  'proj-003': {
    'Site Identification': {
      tasks: [
        { id: 't-003-01', title: 'Market opportunity analysis', status: 'done', dueDate: '2026-02-03' },
        { id: 't-003-02', title: 'Site due diligence', status: 'done', dueDate: '2026-02-07' },
      ],
      activities: [
        {
          id: 'a-003-01', type: 'email_in', summary: 'Due diligence report', person: 'Knight Frank', date: '2024-12-01',
          subject: 'Due Diligence Summary — 155 Grey Street, South Brisbane',
          body: 'Dear Client,\n\nPlease find attached our due diligence report for the above property.\n\nKey findings:\n- Site area: 3,200sqm\n- Current use: Commercial car park (no heritage)\n- Contamination: Phase 1 ESA — low risk, Phase 2 recommended\n- Flood: Above Q100 flood level\n- Infrastructure: All services available at boundary\n- Comparable tower sites trading at $15,000-$18,000 per sqm\n\nRecommendation: Proceed to feasibility.\n\nKnight Frank Advisory',
        },
      ],
    },
    'Feasibility': {
      tasks: [
        { id: 't-003-03', title: 'Detailed feasibility study', status: 'done', dueDate: '2026-02-05' },
        { id: 't-003-04', title: 'Traffic impact assessment', status: 'done', dueDate: '2026-02-10' },
        { id: 't-003-05', title: 'Wind assessment', status: 'done', dueDate: '2026-02-14' },
      ],
      activities: [
        {
          id: 'a-003-02', type: 'email_in', summary: 'Wind study results', person: 'MEL Consultants', date: '2025-02-18',
          subject: 'Wind Impact Assessment — Horizon Tower, South Brisbane',
          body: 'Dear Project Team,\n\nAttached is our wind environment assessment for the proposed 45-storey tower.\n\nFindings:\n- Ground level: Acceptable with proposed canopy treatment\n- Podium terrace (Level 5): Requires wind mitigation — recommend glass balustrades and planting\n- Upper levels (35+): Standard for towers of this height\n- Rooftop pool deck: Will require retractable wind screens on south and west edges\n\nOverall the design performs well. Minor amendments to the podium landscape design are recommended.\n\nRegards,\nMEL Consultants',
        },
        {
          id: 'a-003-03', type: 'phone_out', summary: 'Reviewed feasibility with board', person: 'Board of Directors', date: '2025-02-20',
          transcript: 'Presented feasibility study to the board. Key metrics: GDV $256M, total development cost $198M, forecast profit $58M (margin 22.6%). Board approved to proceed to finance and pre-sales stages. Board requested we target minimum 25% pre-sales before committing to construction contract. Also asked to explore mezzanine finance option to reduce equity requirement. Chairman suggested engaging CBRE for sales given their success with similar projects in Brisbane.',
        },
      ],
    },
    'Financing': {
      tasks: [
        { id: 't-003-06', title: 'Equity raise from investors', status: 'done', dueDate: '2026-02-04' },
        { id: 't-003-07', title: 'Senior debt facility secured', status: 'done', dueDate: '2026-02-10' },
        { id: 't-003-08', title: 'Mezzanine finance arranged', status: 'done', dueDate: '2026-02-15' },
      ],
      activities: [
        {
          id: 'a-003-04', type: 'email_in', summary: 'Signed facility agreement', person: 'CBA Project Finance', date: '2025-05-30',
          subject: 'Executed Facility Agreement — Horizon Tower Development',
          body: 'Dear Client,\n\nPlease find attached the fully executed facility agreement for the Horizon Tower development.\n\nFacility Summary:\n- Senior debt: $142,000,000\n- Mezzanine: $22,000,000\n- Total facilities: $164,000,000\n- Interest rate: BBSY + 2.65% (senior), BBSY + 6.50% (mezz)\n- Term: 42 months\n- Pre-sale requirement: 65% of total project revenue\n- Drawdown conditions: As per schedule 4\n\nFirst drawdown available upon satisfaction of CPs.\n\nCBA Project Finance',
        },
      ],
    },
    'Pre-sales': {
      tasks: [
        { id: 't-003-09', title: 'Engaged CBRE as sales agent', status: 'done', dueDate: '2026-02-05' },
        { id: 't-003-10', title: 'Launched VIP pre-sale campaign', status: 'done', dueDate: '2026-02-10' },
        { id: 't-003-11', title: 'Achieved 70% pre-sale threshold', status: 'done', dueDate: '2026-02-18' },
      ],
      activities: [
        {
          id: 'a-003-05', type: 'email_in', summary: 'Pre-sales hit 70% — finance trigger met', person: 'CBRE Residential', date: '2025-08-15',
          subject: 'Milestone Achieved — 70% Pre-Sales — Horizon Tower',
          body: 'Dear Project Team,\n\nWe are pleased to confirm that Horizon Tower has achieved the 70% pre-sales milestone.\n\nSales Summary:\n- Total apartments: 320\n- Apartments sold: 224\n- Total pre-sale value: $179,200,000\n- Average price achieved: $800,000\n- Premium apartments (Levels 35+): 92% sold\n- Standard apartments: 65% sold\n\nThis exceeds the 65% finance trigger. Strong demand continues, particularly from interstate investors and owner-occupiers.\n\nCBRE Residential Projects',
        },
      ],
    },
    'Land Acquisition': {
      tasks: [
        { id: 't-003-12', title: 'Unconditional contract', status: 'done', dueDate: '2026-02-06' },
        { id: 't-003-13', title: 'Settlement completed', status: 'done', dueDate: '2026-02-13' },
      ],
      activities: [
        {
          id: 'a-003-06', type: 'email_out', summary: 'Settlement confirmation', person: 'Allens Linklaters', date: '2025-04-10',
          subject: 'RE: Settlement — 155 Grey Street, South Brisbane',
          body: 'Hi Allens Team,\n\nConfirming settlement completed today.\n\nPurchase price: $48,000,000\nDeposit (paid): $4,800,000\nBalance (paid today): $43,200,000\n\nPlease confirm transfer registration with Titles Queensland.\n\nRegards,\nProject Team',
        },
      ],
    },
    'Architecture': {
      tasks: [
        { id: 't-003-14', title: 'Design competition completed', status: 'done', dueDate: '2026-02-05' },
        { id: 't-003-15', title: 'Detailed design documentation', status: 'done', dueDate: '2026-02-12' },
        { id: 't-003-16', title: 'Interior design specification', status: 'done', dueDate: '2026-02-17' },
      ],
      activities: [
        {
          id: 'a-003-07', type: 'email_in', summary: 'Final construction docs issued', person: 'BVN Architecture', date: '2025-06-20',
          subject: 'IFC Issue — Horizon Tower Construction Documentation',
          body: 'Dear Project Team,\n\nWe are pleased to issue the final Issued for Construction (IFC) documentation package for Horizon Tower.\n\nThis package includes:\n- Architectural drawings (284 sheets)\n- Interior design specifications\n- Facade engineering details\n- Landscape documentation\n\nAll drawings have been coordinated with structural, mechanical, and hydraulic consultants.\n\nBVN Architecture',
        },
      ],
    },
    'Planning Permit': {
      tasks: [
        { id: 't-003-17', title: 'Development application approved', status: 'done', dueDate: '2026-02-08' },
        { id: 't-003-18', title: 'Building approval obtained', status: 'done', dueDate: '2026-02-16' },
      ],
      activities: [
        {
          id: 'a-003-08', type: 'email_in', summary: 'DA approval notice', person: 'Brisbane City Council', date: '2025-07-15',
          subject: 'Development Permit — DA/2025/12345 — 155 Grey St South Brisbane',
          body: 'Dear Applicant,\n\nBrisbane City Council has approved your development application for a 45-storey residential tower at 155 Grey Street, South Brisbane.\n\n320 residential apartments, ground floor retail, 4 levels basement parking (480 spaces).\n\nRefer to attached conditions of approval (42 conditions).\nAppeals period: 20 business days from date of this notice.\n\nBrisbane City Council\nDevelopment Assessment',
        },
      ],
    },
    'Construction': {
      tasks: [
        { id: 't-003-19', title: 'Builder appointed — Multiplex', status: 'done', dueDate: '2026-02-03' },
        { id: 't-003-20', title: 'Piling and foundations', status: 'done', dueDate: '2026-02-12' },
        { id: 't-003-21', title: 'Core and structure — Level 22 of 45', status: 'in_progress', dueDate: '2026-02-20' },
        { id: 't-003-22', title: 'Facade installation', status: 'in_progress', dueDate: '2026-03-10' },
        { id: 't-003-23', title: 'Services and fit-out', status: 'not_started', dueDate: '2026-03-18' },
        { id: 't-003-24', title: 'Completion and handover', status: 'not_started', dueDate: '2026-03-28' },
      ],
      activities: [
        {
          id: 'a-003-09', type: 'email_in', summary: 'Monthly progress report — Level 22 poured', person: 'Multiplex', date: '2026-02-14',
          subject: 'Monthly Construction Report #14 — Horizon Tower — February 2026',
          body: 'Dear Project Team,\n\nPlease find attached the February 2026 monthly construction report.\n\nHighlights:\n- Structure: Level 22 slab poured this week, on programme\n- Facade: Installation complete to Level 14, currently 2 days ahead of schedule\n- Basement: Waterproofing complete, MEP rough-in 80% done\n- Programme status: On track for practical completion Dec 2029\n\nKey metrics:\n- Total contract value: $168,500,000\n- Claimed to date: $67,400,000 (40%)\n- Variations approved: $1,230,000\n- Current workforce: 285 on site\n\nRegards,\nMultiplex Construction',
        },
        {
          id: 'a-003-10', type: 'phone_in', summary: 'Crane schedule update for facade panels', person: 'Multiplex', date: '2026-02-10',
          transcript: 'Call from Multiplex site manager regarding crane scheduling for facade panel installation. Tower crane #2 needs to be dedicated to facade works for the next 6 weeks to maintain the facade programme. This means material deliveries for the upper structure will need to use crane #1 only. Multiplex doesn\'t see this causing delays but wants our approval to adjust the crane usage schedule. Approved verbally, asked for formal written confirmation of no programme impact.',
        },
        {
          id: 'a-003-11', type: 'email_out', summary: 'Approved colour change for Level 30+ facade', person: 'BVN Architecture', date: '2026-02-05',
          subject: 'Approved — Facade Colour Variation Levels 30-45',
          body: 'Hi BVN Team,\n\nWe approve the proposed facade colour change for Levels 30 to 45.\n\nChange: From "Moonstone Grey" to "Platinum Silver" for the upper tower curtain wall mullions.\n\nReason: Better visual contrast with the sky at height, as recommended by the facade consultant.\n\nNo cost impact confirmed by Multiplex. Please issue revised facade specification.\n\nRegards,\nProject Team',
        },
      ],
    },
    'Marketing': {
      tasks: [
        { id: 't-003-25', title: 'Brand launch and display suite', status: 'in_progress', dueDate: '2026-02-15' },
        { id: 't-003-26', title: 'Digital campaign — social and REA', status: 'in_progress', dueDate: '2026-02-28' },
        { id: 't-003-27', title: 'International roadshow — Singapore, HK', status: 'not_started', dueDate: '2026-03-15' },
      ],
      activities: [
        {
          id: 'a-003-12', type: 'email_in', summary: 'Display suite fit-out photos', person: 'Creative Agency', date: '2026-02-12',
          subject: 'Horizon Tower Display Suite — Fit-Out Progress Photos',
          body: 'Hi Team,\n\nAttached are progress photos of the display suite at Fish Lane, South Brisbane.\n\nStatus:\n- 1-bed display: Complete, ready for styling\n- 2-bed display: Joinery installation this week\n- 3-bed penthouse display: Flooring being laid, completion next Friday\n- Common area / reception: Signage installed, AV being set up\n\nOn track for VIP preview on 28 Feb.\n\nCheers,\nCreative Agency',
        },
        {
          id: 'a-003-13', type: 'phone_out', summary: 'Briefed PR agency on launch plan', person: 'PR Partner', date: '2026-02-08',
          transcript: 'Briefed PR agency on the Horizon Tower marketing launch plan. Agreed deliverables: press release for property media (Urban Developer, The Urban List), social media content pack (30 posts), influencer engagement (3 Brisbane lifestyle influencers), and a launch event for 120 VIP guests at the display suite. PR budget: $35,000. Launch event budget: $25,000. PR agency to provide detailed timeline by next Monday.',
        },
      ],
    },
  },

  'proj-004': {
    'Site Identification': {
      tasks: [
        { id: 't-004-01', title: 'Identified CBD opportunity', status: 'done', dueDate: '2026-02-02' },
        { id: 't-004-02', title: 'Preliminary site assessment', status: 'done', dueDate: '2026-02-06' },
      ],
      activities: [
        {
          id: 'a-004-01', type: 'email_in', summary: 'Off-market opportunity brief', person: 'Colliers Adelaide', date: '2024-10-15',
          subject: 'Off-Market Opportunity — 90 Grote Street, Adelaide CBD',
          body: 'Dear Client,\n\nWe are pleased to present an off-market acquisition opportunity in the Adelaide CBD.\n\nProperty: 90 Grote Street, Adelaide SA 5000\nSite area: 2,100sqm\nCurrent use: 2-storey commercial building (vacant)\nZoning: Capital City Zone\nAsking price: $12,500,000 (negotiable)\nDevelopment potential: 25-35 storey residential/mixed-use tower\n\nThe vendor is motivated and willing to consider option arrangements.\n\nPlease advise if you\'d like to arrange an inspection.\n\nColliers International Adelaide',
        },
      ],
    },
    'Feasibility': {
      tasks: [
        { id: 't-004-03', title: 'Financial modelling', status: 'done', dueDate: '2026-02-04' },
        { id: 't-004-04', title: 'Market demand study', status: 'done', dueDate: '2026-02-08' },
        { id: 't-004-05', title: 'Heritage impact assessment', status: 'done', dueDate: '2026-02-12' },
      ],
      activities: [
        {
          id: 'a-004-02', type: 'email_in', summary: 'Heritage assessment — no restrictions', person: 'Heritage SA', date: '2025-01-10',
          subject: 'Heritage Assessment — 90 Grote Street, Adelaide',
          body: 'Dear Applicant,\n\nFollowing our review, we confirm that 90 Grote Street, Adelaide is NOT listed on the South Australian Heritage Register, nor is it within a Heritage Area or a Contributory Item.\n\nDemolition of the existing structure would not require heritage approval.\n\nPlease note that any new development over 4 storeys in the Capital City Zone will be assessed by SCAP (State Commission Assessment Panel).\n\nHeritage South Australia',
        },
        {
          id: 'a-004-03', type: 'phone_out', summary: 'Market demand deep-dive with agents', person: 'Ray White Adelaide', date: '2025-01-15',
          transcript: 'Called Ray White Adelaide CBD office to discuss demand for new apartments. Key takeaways:\n- Strong demand from downsizers moving from eastern suburbs\n- Premium 2-bed apartments ($650K-$800K) are the sweet spot\n- 3-bed penthouses ($1.2M-$1.5M) would sell well given limited supply\n- Ground floor retail — cafe or small bar would be ideal for this location\n- They estimate 18-24 months to sell 210 apartments\n- Adelaide market is less volatile than Sydney/Melbourne, steady growth of 4-5% pa\n\nOverall very positive about the project location and scale.',
        },
      ],
    },
    'Financing': {
      tasks: [
        { id: 't-004-06', title: 'Information memorandum prepared', status: 'done', dueDate: '2026-02-10' },
        { id: 't-004-07', title: 'Lender shortlist and submissions', status: 'in_progress', dueDate: '2026-02-19' },
        { id: 't-004-08', title: 'Term sheet negotiation', status: 'not_started', dueDate: '2026-03-08' },
      ],
      activities: [
        {
          id: 'a-004-04', type: 'email_out', summary: 'IM sent to 4 lenders', person: 'Finance Broker', date: '2026-01-20',
          subject: 'Information Memorandum — Aurora Central, Adelaide',
          body: 'Hi Finance Team,\n\nPlease find attached the Information Memorandum for Aurora Central, a 30-storey mixed-use development at 90 Grote Street, Adelaide.\n\nWe are submitting to the following lenders:\n1. NAB — Project Finance\n2. CBA — Institutional Banking\n3. Westpac — Property Finance\n4. Bank of Queensland — Development Finance\n\nSeeking: $95,000,000 senior debt facility\nEquity contribution: $35,000,000 (confirmed)\nTarget GDV: $147,000,000\n\nPlease coordinate responses and term sheets.\n\nRegards,\nProject Team',
        },
        {
          id: 'a-004-05', type: 'phone_in', summary: 'NAB expressing interest — need more info', person: 'NAB Dev Finance', date: '2026-02-01',
          transcript: 'Received call from James at NAB Development Finance. NAB is interested in the Aurora Central opportunity. James mentioned their current appetite for Adelaide CBD projects is strong. They would be looking at: LVR max 60%, pre-sale requirement 55% of GDV, interest rate indicatively BBSY + 2.95%. They need updated pre-sales figures, a finalised QS report, and the planning approval (or at least lodgement confirmation). James will issue an indicative term sheet once they have these documents. Timeline: 2 weeks for indicative, 6 weeks for formal credit approval.',
        },
      ],
    },
    'Pre-sales': {
      tasks: [
        { id: 't-004-09', title: 'EOI campaign launched', status: 'done', dueDate: '2026-02-08' },
        { id: 't-004-10', title: 'Price list and contract preparation', status: 'in_progress', dueDate: '2026-02-18' },
        { id: 't-004-11', title: 'Secure 50% pre-sales for finance', status: 'in_progress', dueDate: '2026-03-20' },
      ],
      activities: [
        {
          id: 'a-004-06', type: 'email_in', summary: '38 EOIs received — strong interest from downsizers', person: 'CBRE Adelaide', date: '2026-02-10',
          subject: 'EOI Update — Aurora Central — 38 Registrations',
          body: 'Hi Team,\n\nGreat response to the EOI campaign for Aurora Central. Summary:\n\n- Total EOIs: 38\n- Buyer profile: 60% downsizers, 25% investors, 15% first home buyers\n- Most popular: 2-bed + study (18 enquiries)\n- Penthouse level: 4 serious enquiries already\n- Price feedback: Generally positive, some pushback on 1-bed pricing\n\nRecommendation: Move to formal pre-sales launch within 4 weeks while momentum is strong.\n\nCBRE Adelaide Residential',
        },
        {
          id: 'a-004-07', type: 'phone_out', summary: 'Discussed pricing strategy', person: 'CBRE Adelaide', date: '2026-02-12',
          transcript: 'Called CBRE to discuss pricing strategy based on EOI feedback. Agreed to reduce 1-bed apartment pricing by 3-4% to improve take-up (from $420K to $399K starting). 2-bed pricing to hold firm at $640K-$780K. 3-bed penthouses at $1.2M-$1.5M unchanged. Also discussed an "early bird" incentive — $10K rebate for first 20 contracts signed. CBRE estimates we can convert 60% of EOIs to contracts within the first month. Launch date set for 15 March.',
        },
        {
          id: 'a-004-08', type: 'email_out', summary: 'Draft contracts to solicitor for review', person: 'Lipman Karas', date: '2026-02-14',
          subject: 'Draft Contracts of Sale — Aurora Central Apartments',
          body: 'Dear Lipman Karas,\n\nPlease find attached draft contracts of sale for the Aurora Central development.\n\nWe require:\n1. Review of standard contract terms\n2. Sunset clause — propose 36 months\n3. Variations clause for minor changes during construction\n4. Deposit structure: 10% on exchange (5% on signing, 5% at 30 days)\n5. Section 7 vendor disclosure statements\n\nWe need finalised contracts by 10 March for the pre-sales launch on 15 March.\n\nRegards,\nProject Team',
        },
      ],
    },
    'Land Acquisition': {
      tasks: [
        { id: 't-004-12', title: 'Option agreement signed', status: 'done', dueDate: '2026-02-04' },
        { id: 't-004-13', title: 'Due diligence completed', status: 'done', dueDate: '2026-02-12' },
        { id: 't-004-14', title: 'Exercise option and settle', status: 'in_progress', dueDate: '2026-03-15' },
      ],
      activities: [
        {
          id: 'a-004-09', type: 'email_out', summary: 'Notice to exercise option', person: 'Vendor solicitor', date: '2026-02-05',
          subject: 'Notice to Exercise Option — 90 Grote Street, Adelaide',
          body: 'Dear Sir/Madam,\n\nWe hereby give formal notice to exercise the option to purchase the property at 90 Grote Street, Adelaide SA 5000 pursuant to the Option Agreement dated 15 November 2024.\n\nPurchase price: $12,500,000\nSettlement date: 15 March 2026 (42 days from exercise)\nDeposit (already paid): $625,000\n\nPlease arrange for the contract of sale to be prepared.\n\nRegards,\nProject Team',
        },
        {
          id: 'a-004-10', type: 'phone_in', summary: 'Settlement date confirmed — 15 March', person: 'Lipman Karas', date: '2026-02-18',
          transcript: 'Call from Lipman Karas confirming settlement has been booked for 15 March 2026. Vendor\'s solicitors have confirmed no issues. Balance of $11,875,000 to be paid on settlement. Title search is clear — no caveats or encumbrances other than the existing option. Lipman Karas will prepare the settlement statement and circulate by end of week. Need to ensure finance drawdown approval is in place by 10 March.',
        },
        {
          id: 'a-004-10b', type: 'sms_in', summary: 'Vendor confirming vacant possession', person: 'Tony Russo', date: '2026-02-19',
          body: 'Hi, just confirming the building will be fully vacated by 10 March as agreed. Last tenant moved out yesterday. Keys available on settlement day. Cheers, Tony',
        },
      ],
    },
    'Architecture': {
      tasks: [
        { id: 't-004-15', title: 'Concept design — 3 options presented', status: 'done', dueDate: '2026-02-06' },
        { id: 't-004-16', title: 'Schematic design', status: 'in_progress', dueDate: '2026-02-25' },
        { id: 't-004-17', title: 'Retail ground floor layout', status: 'in_progress', dueDate: '2026-03-05' },
        { id: 't-004-18', title: 'Apartment mix optimisation', status: 'not_started', dueDate: '2026-03-15' },
      ],
      activities: [
        {
          id: 'a-004-11', type: 'email_in', summary: 'Schematic design progress — 60% complete', person: 'Woods Bagot', date: '2026-02-08',
          subject: 'Aurora Central — Schematic Design Progress Update',
          body: 'Hi Team,\n\nSchematic design is approximately 60% complete. Update:\n\n- Tower floor plates (typical levels 5-28): Finalised — 8 apartments per floor\n- Penthouse levels (29-30): 4 large apartments per floor, layouts under review\n- Ground floor retail: 3 tenancies, ~850sqm total\n- Podium (Levels 1-4): Parking resolved — 315 spaces across 4 levels\n- Rooftop amenity (Level 31): Pool, gym, BBQ area, residents\' lounge\n\nNext milestone: 100% schematic design by 28 February.\n\nRegards,\nWoods Bagot',
        },
        {
          id: 'a-004-12', type: 'phone_out', summary: 'Retail layout workshop', person: 'Woods Bagot', date: '2026-02-15',
          transcript: 'Workshop with Woods Bagot on ground floor retail layout. Discussed three tenancy configurations: Option A — single large tenancy (supermarket), Option B — 3 small tenancies (cafe, retail, services), Option C — 2 tenancies (cafe/restaurant + retail). Agreed to proceed with Option B as it provides better activation of the street frontage and aligns with the "village feel" brand positioning. Woods Bagot will update the ground floor plan by end of next week.',
        },
      ],
    },
    'Planning Permit': {
      tasks: [
        { id: 't-004-19', title: 'Pre-lodgement meeting with SCAP', status: 'done', dueDate: '2026-02-10' },
        { id: 't-004-20', title: 'Prepare planning report', status: 'in_progress', dueDate: '2026-02-16' },
        { id: 't-004-21', title: 'Lodge DA with SCAP', status: 'not_started', dueDate: '2026-03-10' },
      ],
      activities: [
        {
          id: 'a-004-13', type: 'email_in', summary: 'Pre-lodgement meeting notes', person: 'SCAP', date: '2026-01-30',
          subject: 'Pre-Lodgement Meeting Notes — 90 Grote Street, Adelaide',
          body: 'Dear Applicant,\n\nPlease find attached the minutes from the pre-lodgement meeting held on 28 January 2026.\n\nKey feedback from the panel:\n1. 30 storeys is acceptable for this location within the Capital City Zone\n2. Ground floor activation is critical — active uses required on Grote Street frontage\n3. Setback from western boundary should allow for future development of adjacent site\n4. Sustainability measures (6-star Green Star) strongly encouraged\n5. Public art contribution required under the Development Plan\n\nThe panel was generally supportive of the proposal.\n\nSCAP Secretariat',
        },
        {
          id: 'a-004-14', type: 'email_out', summary: 'Draft planning report for client review', person: 'Planning Consultant', date: '2026-02-10',
          subject: 'Draft Planning Report — Aurora Central — For Your Review',
          body: 'Hi Team,\n\nPlease find attached the draft Planning Report for the Aurora Central development application.\n\nThe report addresses all SCAP pre-lodgement feedback and demonstrates compliance with the Development Plan.\n\nKey sections:\n- Site analysis and context\n- Development Plan assessment\n- Design quality assessment\n- Traffic and parking assessment\n- Sustainability response\n\nPlease review and provide comments by 20 February so we can finalise for lodgement in early March.\n\nRegards,\nPlanning Consultant',
        },
      ],
    },
  },

  'proj-005': {
    'Site Identification': {
      tasks: [
        { id: 't-005-01', title: 'Broadacre land search', status: 'done', dueDate: '2026-02-03' },
        { id: 't-005-02', title: 'Site inspection and survey', status: 'done', dueDate: '2026-02-07' },
        { id: 't-005-03', title: 'Geotechnical investigation', status: 'done', dueDate: '2026-02-12' },
      ],
      activities: [
        {
          id: 'a-005-01', type: 'email_in', summary: 'Geotech report — no issues', person: 'Douglas Partners', date: '2025-07-20',
          subject: 'Geotechnical Investigation Report — Lot 500 Baldivis Road',
          body: 'Dear Client,\n\nPlease find attached our geotechnical investigation report for Lot 500 Baldivis Road, Baldivis WA.\n\nKey findings:\n- Soil type: Predominantly sand over limestone (Tamala Limestone)\n- Bearing capacity: Adequate for residential slab-on-ground construction\n- Groundwater: Encountered at 4.2m depth (no impact on residential foundations)\n- Contamination: Nil detected\n- Site classification: Class A (most sand sites in this area)\n\nThe site is suitable for residential subdivision development.\n\nDouglas Partners',
        },
        {
          id: 'a-005-02', type: 'phone_out', summary: 'Discussed site access with vendor', person: 'Vendor', date: '2025-07-15',
          transcript: 'Called the vendor (farming family — the Hendersons) to discuss site access for survey and geotech. They\'re happy for our teams to access the site on weekdays between 7am and 5pm. The northern paddock has cattle so we need to use the southern gate entrance. Mr Henderson mentioned there\'s an old bore on the property that may need to be decommissioned. He also asked about the timeline for settlement — we advised likely Q1 2026 subject to DA approval.',
        },
      ],
    },
    'Feasibility': {
      tasks: [
        { id: 't-005-04', title: 'Subdivision yield analysis', status: 'done', dueDate: '2026-02-10' },
        { id: 't-005-05', title: 'Infrastructure cost estimates', status: 'in_progress', dueDate: '2026-02-18' },
        { id: 't-005-06', title: 'Market absorption rate study', status: 'in_progress', dueDate: '2026-02-21' },
      ],
      activities: [
        {
          id: 'a-005-03', type: 'email_in', summary: 'Water Corp headworks cost estimate', person: 'Water Corp', date: '2026-02-01',
          subject: 'Headworks Charges Estimate — Banksia Heights Estate, Baldivis',
          body: 'Dear Developer,\n\nFurther to your enquiry, please find below the estimated headworks charges for the proposed 100-lot subdivision:\n\n- Water headworks: $3,450 per lot ($345,000 total)\n- Sewer headworks: $5,200 per lot ($520,000 total)\n- Total Water Corp charges: $865,000\n\nThese are estimates only. Final charges will be confirmed at subdivision clearance stage.\n\nWater Corporation WA',
        },
        {
          id: 'a-005-04', type: 'phone_out', summary: 'Discussed lot pricing with local agents', person: 'Harcourts Baldivis', date: '2026-02-05',
          transcript: 'Called Harcourts Baldivis to discuss current land lot pricing in the area. Key feedback:\n- 375sqm lots: $280,000-$310,000\n- 450sqm lots: $320,000-$360,000\n- 600sqm+ lots: $380,000-$430,000\n- Current absorption rate: About 8-10 lots per month for established estates\n- New estates with good amenity (parks, playgrounds) are achieving premiums of 5-8%\n- Biggest competition is Rivergums estate (500m south) and Baldivis Parks\n\nAgent suggests a mix of lot sizes with emphasis on 375-450sqm which is the strongest demand segment.',
        },
        {
          id: 'a-005-05', type: 'email_out', summary: 'Requested Western Power connection costs', person: 'Western Power', date: '2026-02-08',
          subject: 'Electricity Connection Enquiry — Banksia Heights Estate, Baldivis',
          body: 'Dear Western Power,\n\nWe are seeking a cost estimate for electricity infrastructure provision to our proposed 100-lot residential subdivision at Lot 500 Baldivis Road, Baldivis WA 6171.\n\nPlease provide:\n1. Headworks contribution estimate\n2. Distribution network extension costs\n3. Estimated timeline for infrastructure delivery\n4. Any capacity constraints in the area\n\nSubdivision plan attached for reference.\n\nRegards,\nProject Team',
        },
        {
          id: 'a-005-05b', type: 'sms_in', summary: 'Surveyor confirming site visit', person: 'Craig Mitchell', date: '2026-02-09',
          body: 'Hi, confirming we\'ll be on site Monday 10 Feb for the feature survey. Team of 3, will take 2 days. Will enter via southern gate as discussed. Craig, McMullen Surveys',
        },
      ],
    },
    'Financing': {
      tasks: [
        { id: 't-005-07', title: 'Prepare project finance model', status: 'in_progress', dueDate: '2026-02-28' },
        { id: 't-005-08', title: 'Engage finance broker', status: 'not_started', dueDate: '2026-03-12' },
      ],
      activities: [
        {
          id: 'a-005-06', type: 'email_out', summary: 'Draft finance model to partner for review', person: 'Business Partner', date: '2026-02-12',
          subject: 'Draft Finance Model — Banksia Heights Estate — For Review',
          body: 'Hi Partner,\n\nPlease find attached the draft financial model for Banksia Heights Estate.\n\nKey assumptions:\n- 100 lots across 4 stages\n- Average lot price: $340,000\n- Total GR: $34,000,000\n- Land cost: $8,500,000\n- Civil works: $18,200,000\n- Infrastructure contributions: $3,400,000\n- Professional fees & marketing: $2,100,000\n- Interest & holding costs: $1,800,000\n- Forecast profit: $4,500,000 (13.2% margin)\n\nHappy to discuss at our meeting on Thursday.\n\nRegards,\nProject Team',
        },
      ],
    },
    'Pre-sales': {
      tasks: [
        { id: 't-005-09', title: 'Preliminary lot pricing', status: 'in_progress', dueDate: '2026-02-20' },
        { id: 't-005-10', title: 'Engage selling agent', status: 'not_started', dueDate: '2026-03-05' },
      ],
      activities: [
        {
          id: 'a-005-07', type: 'phone_out', summary: 'Discussed comparable lot sales in Baldivis', person: 'Harcourts Baldivis', date: '2026-02-14',
          transcript: 'Follow-up call with Harcourts Baldivis to discuss comparable lot sales data in more detail. They provided recent settlement data: 42 lots settled in Rivergums last quarter at an average of $315,000. Baldivis Parks achieved $335,000 average for similar-sized lots but they have more amenity. Agent recommends we price Stage 1 (25 lots) competitively to establish the estate — suggest $295,000-$330,000 range. Stage 2 onwards can increase 3-5% if Stage 1 sells well. They\'re interested in being appointed as the selling agent — will send a formal proposal.',
        },
      ],
    },
  },
};
