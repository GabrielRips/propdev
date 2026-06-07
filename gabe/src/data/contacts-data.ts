export interface Contact {
  id: string;
  name: string;
  organisation: string;
  phone: string;
  email: string;
  role?: string;
}

export const contactsData: Record<string, Contact[]> = {
  'proj-001': [
    { id: 'c-001-01', name: 'Sarah Brennan', organisation: 'Yarra City Council', phone: '+61 3 9205 5555', email: 'sbrennan@yarracity.vic.gov.au', role: 'Planning Officer' },
    { id: 'c-001-02', name: 'Mark Stevens', organisation: 'GeoTech Surveys Pty Ltd', phone: '+61 412 334 567', email: 'mstevens@geotech.com.au', role: 'Licensed Surveyor' },
    { id: 'c-001-03', name: 'James Whitfield', organisation: 'Archi Studio Melbourne', phone: '+61 3 9654 8800', email: 'jwhitfield@archistudio.com.au', role: 'Principal Architect' },
    { id: 'c-001-04', name: 'Tom Radcliffe', organisation: 'Buildcorp Pty Ltd', phone: '+61 438 201 985', email: 'tradcliffe@buildcorp.com.au', role: 'Project Manager' },
    { id: 'c-001-05', name: 'Claire Nguyen', organisation: 'Town Planning Partners', phone: '+61 421 773 490', email: 'cnguyen@tpp.com.au', role: 'Senior Town Planner' },
    { id: 'c-001-06', name: 'Robert Halliday', organisation: 'ANZ Property Finance', phone: '+61 3 9273 5100', email: 'rhalliday@anz.com.au', role: 'Relationship Manager' },
    { id: 'c-001-07', name: 'Priya Mehta', organisation: 'Fitzroy Legal Group', phone: '+61 455 088 312', email: 'pmehta@fitzroylegal.com.au', role: 'Property Solicitor' },
    { id: 'c-001-08', name: 'Dean Kowalski', organisation: 'Peninsula Plumbing Co.', phone: '+61 407 652 819', email: 'dean@peninsulaplumbing.com.au', role: 'Managing Director' },
    { id: 'c-001-09', name: 'Amanda Li', organisation: 'Yarra Valley Landscaping', phone: '+61 3 9730 8800', email: 'ali@yarravalleylandscaping.com.au', role: 'Landscape Designer' },
    { id: 'c-001-10', name: 'Chris Walker', organisation: 'Electra Group', phone: '+61 3 9555 2211', email: 'cwalker@electragroup.com.au', role: 'Electrical Contractor' },
  ],

  'proj-002': [
    { id: 'c-002-01', name: 'Paul Driscoll', organisation: 'The Hills Shire Council', phone: '+61 2 9843 0555', email: 'paul.driscoll@thehills.nsw.gov.au', role: 'Planning Assessment Officer' },
    { id: 'c-002-02', name: 'Sandra Clarke', organisation: 'Clarke & Partners Architecture', phone: '+61 418 509 273', email: 'sandra@clarkepartners.com.au', role: 'Principal Architect' },
    { id: 'c-002-03', name: 'Andrew Fong', organisation: 'NSW Planning Consultants', phone: '+61 447 126 830', email: 'afong@nswplanning.com.au', role: 'Development Consultant' },
    { id: 'c-002-04', name: 'Nicole Patterson', organisation: 'SurveyNSW', phone: '+61 2 9333 8800', email: 'npatterson@surveynswg.com.au', role: 'Principal Surveyor' },
    { id: 'c-002-05', name: 'Greg McNamara', organisation: 'McNamara Legal', phone: '+61 403 917 554', email: 'gmcnamara@mcnamaralegal.com.au', role: 'Property Lawyer' },
    { id: 'c-002-06', name: 'Vanessa Holt', organisation: 'Hills Bank', phone: '+61 2 8888 2200', email: 'vholt@hillsbank.com.au', role: 'Commercial Lending Manager' },
    { id: 'c-002-07', name: 'Tim Nguyen', organisation: 'EcoAssess Pty Ltd', phone: '+61 2 9719 3300', email: 'tnguyen@ecoassess.com.au', role: 'Ecologist' },
    { id: 'c-002-08', name: 'Rachel Moore', organisation: 'Kellyville Traffic Engineers', phone: '+61 431 068 745', email: 'rmoore@kelltrafficeng.com.au', role: 'Traffic Engineer' },
  ],

  'proj-003': [
    { id: 'c-003-01', name: 'David Lam', organisation: 'Brisbane City Council', phone: '+61 7 3403 8888', email: 'david.lam@brisbane.qld.gov.au', role: 'Senior Development Assessment Officer' },
    { id: 'c-003-02', name: 'Fiona Hartley', organisation: 'Cox Architecture', phone: '+61 416 340 892', email: 'fhartley@coxarchitecture.com.au', role: 'Design Principal' },
    { id: 'c-003-03', name: 'Michael Russo', organisation: 'Multiplex Constructions', phone: '+61 452 719 306', email: 'mrusso@multiplex.global', role: 'Project Director' },
    { id: 'c-003-04', name: 'Karen Zhou', organisation: 'AECOM Australia', phone: '+61 7 3553 2200', email: 'karen.zhou@aecom.com', role: 'Structural Engineer' },
    { id: 'c-003-05', name: 'Brett Callahan', organisation: 'ANZ Project Finance', phone: '+61 7 3228 7700', email: 'bcallahan@anz.com.au', role: 'Senior Project Finance Manager' },
    { id: 'c-003-06', name: 'Jessica Tran', organisation: 'Slattery Asset Management', phone: '+61 428 583 017', email: 'jtran@slattery.com.au', role: 'Quantity Surveyor' },
    { id: 'c-003-07', name: 'Nathan Ellis', organisation: 'Façade Systems Qld', phone: '+61 409 274 651', email: 'nellis@facadesystemsqld.com.au', role: 'Technical Director' },
    { id: 'c-003-08', name: 'Rachel Dowd', organisation: 'Brisbane Fire Protection', phone: '+61 7 3444 1122', email: 'rdowd@bfpro.com.au', role: 'Fire Services Engineer' },
    { id: 'c-003-09', name: 'Alan Ng', organisation: 'Savills Queensland', phone: '+61 444 932 178', email: 'ang@savills.com.au', role: 'Sales Manager' },
  ],

  'proj-004': [
    { id: 'c-004-01', name: 'Helen Barclay', organisation: 'Adelaide City Council', phone: '+61 8 8203 7777', email: 'hbarclay@adelaidecity.sa.gov.au', role: 'Development Assessment Planner' },
    { id: 'c-004-02', name: 'Simon Drew', organisation: 'Woods Bagot Architects', phone: '+61 423 815 047', email: 'sdrew@woodsbagot.com', role: 'Studio Principal' },
    { id: 'c-004-03', name: 'Joanna Park', organisation: 'SMEC Engineering', phone: '+61 8 8100 6600', email: 'jpark@smec.com.au', role: 'Civil Engineer' },
    { id: 'c-004-04', name: 'Mark Finlayson', organisation: 'Finlaysons Lawyers', phone: '+61 408 360 724', email: 'mfinlayson@finlaysons.com.au', role: 'Partner, Property Law' },
    { id: 'c-004-05', name: 'Catherine Bell', organisation: 'CBA Corporate Finance', phone: '+61 8 8419 3300', email: 'cbell@cba.com.au', role: 'Relationship Director' },
    { id: 'c-004-06', name: 'Richard Malin', organisation: 'DPA Planning SA', phone: '+61 461 594 230', email: 'rmalin@dpaplanning.com.au', role: 'Principal Planner' },
    { id: 'c-004-07', name: 'Tony Ricci', organisation: 'Adelaide Geotechnics', phone: '+61 8 8364 7788', email: 'tricci@adelaidegeo.com.au', role: 'Geotechnical Engineer' },
    { id: 'c-004-08', name: 'Mia Costello', organisation: 'Colliers SA', phone: '+61 436 107 589', email: 'mcostello@colliers.com', role: 'Sales & Marketing Director' },
  ],

  'proj-005': [
    { id: 'c-005-01', name: 'Jason Hendricks', organisation: 'City of Rockingham', phone: '+61 8 9528 0333', email: 'jhendricks@rockingham.wa.gov.au', role: 'Planning Officer' },
    { id: 'c-005-02', name: 'Wayne Greer', organisation: 'Baldivis Survey Group', phone: '+61 419 847 263', email: 'wgreer@baldivissurvey.com.au', role: 'Licensed Surveyor' },
    { id: 'c-005-03', name: 'Sophie Turner', organisation: 'Cardno Pty Ltd', phone: '+61 8 6318 5500', email: 'sturner@cardno.com.au', role: 'Civil Engineer' },
    { id: 'c-005-04', name: 'Patrick Corser', organisation: 'Corser & Corser Lawyers', phone: '+61 450 382 916', email: 'pcorser@corserlawyers.com.au', role: 'Property Conveyancer' },
    { id: 'c-005-05', name: 'Linda Chase', organisation: 'Strategen Environmental', phone: '+61 8 6141 3300', email: 'lchase@strategen.com.au', role: 'Environmental Consultant' },
    { id: 'c-005-06', name: 'Aaron Burgess', organisation: 'Burgess Design Group', phone: '+61 427 015 638', email: 'aburgess@burgessdesign.com.au', role: 'Urban Designer' },
    { id: 'c-005-07', name: 'Natalie Wong', organisation: 'Landgate WA', phone: '+61 8 9273 7373', email: 'nwong@landgate.wa.gov.au', role: 'Registration Officer' },
  ],
};
