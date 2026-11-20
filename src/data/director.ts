// Director-only data: projects (won jobs), exceptions, approvals, diary, finance, team workload, metric definitions and audit history.
// Same customers, jobs, dates and money as the Office Admin, Sales, Surveyor, Installer and Customer portals.
import { IMG } from './biz';

export const TODAY = '2026-10-16'; // Friday 16 October 2026

/* ---------------- Projects (won jobs) ---------------- */
export type PStage = 'Final survey' | 'Ordered' | 'Delivery' | 'Ready to book' | 'Installation' | 'Snags' | 'Complete';
export const PSTAGES: PStage[] = ['Final survey', 'Ordered', 'Delivery', 'Ready to book', 'Installation', 'Snags', 'Complete'];
export type Inv = { ref: string; type: string; amount: number; status: 'Paid' | 'Due' | 'Overdue' | 'On hold' | 'Not sent'; due: string };
export type Project = {
  id: string; enquiry: string; customer: string; initials: string; address: string; products: string; photo: keyof typeof IMG;
  value: number; stage: PStage; sales: string; surveyor: string; fitters: string[]; owner: string;
  next: string; due: string; dueIso: string; flag?: 'Overdue' | 'Blocked' | 'Incomplete' | 'Unscheduled';
  flagWhy?: string; won: string; supplier: string; orderRef: string; delivery: { expected: string; status: string; late?: number };
  install: string; snags: { id: string; title: string; status: string }[]; invoices: Inv[]; portal: string;
  timeline: { when: string; text: string; who: string }[];
};
export const PROJECTS0: Project[] = [
  { id: 'JG-10482', enquiry: 'EN-2283', customer: 'Sarah & David Smith', initials: 'SS', address: '14 Ashby Road, Leicester', products: '6 windows and a front door', photo: 'house', value: 6280, stage: 'Delivery', sales: 'mh', surveyor: 'ps', fitters: ['Dan Hughes', 'Lee Brooks', 'Chris Reid'], owner: 'Sarah Mitchell',
    next: 'Stage payment £2,512 due', due: 'Tue 20 Oct', dueIso: '2026-10-20', won: '30 Sep', supplier: 'Emplas', orderRef: 'SO-48238', delivery: { expected: 'Tue 20 Oct', status: 'On the way' }, install: 'Thu 22 – Fri 23 Oct', snags: [], portal: 'Active',
    invoices: [{ ref: 'INV-3381', type: 'Deposit', amount: 3140, status: 'Paid', due: '30 Sep' }, { ref: 'INV-3392', type: 'Stage payment', amount: 2512, status: 'Due', due: '20 Oct' }, { ref: 'INV-3410', type: 'Final payment', amount: 628, status: 'Not sent', due: 'After fitting' }],
    timeline: [{ when: '16 Oct', text: 'Frames left the factory', who: 'Sarah Mitchell' }, { when: '13 Oct', text: 'Fitting booked Thu 22 – Fri 23 Oct', who: 'Sarah Mitchell' }, { when: '06 Oct', text: 'Order placed with Emplas', who: 'Sarah Mitchell' }, { when: '02 Oct', text: 'Final survey: all sizes the same', who: 'Priya Shah' }, { when: '30 Sep', text: 'Deal won · deposit paid', who: 'Mike Harris' }] },
  { id: 'JG-10477', enquiry: 'EN-2282', customer: 'The Bakers', initials: 'TB', address: '22 Ripon Road, Ripon', products: '8 windows', photo: 'window', value: 5200, stage: 'Ready to book', sales: 'ec', surveyor: 'rk', fitters: [], owner: 'Sarah Mitchell',
    next: 'Book the installation', due: 'Today', dueIso: '2026-10-16', flag: 'Unscheduled', flagWhy: 'Frames arrived 15 Oct · not booked yet', won: '25 Sep', supplier: 'Emplas', orderRef: 'SO-48213', delivery: { expected: 'Thu 15 Oct', status: 'Arrived' }, install: 'Not booked', snags: [], portal: 'Active',
    invoices: [{ ref: 'INV-3366', type: 'Deposit', amount: 2600, status: 'Paid', due: '28 Sep' }, { ref: 'INV-3399', type: 'Stage payment', amount: 2080, status: 'Due', due: '23 Oct' }, { ref: '—', type: 'Final payment', amount: 520, status: 'Not sent', due: 'After fitting' }],
    timeline: [{ when: '15 Oct', text: 'All 8 frames arrived and checked', who: 'Sarah Mitchell' }, { when: '08 Oct', text: 'Order placed with Emplas', who: 'Sarah Mitchell' }, { when: '29 Sep', text: 'Final survey: all sizes the same', who: 'Rob King' }, { when: '25 Sep', text: 'Deal won · deposit paid', who: 'Emma Clarke' }] },
  { id: 'JG-10471', enquiry: 'EN-2271', customer: 'Mrs Patel', initials: 'RP', address: '7 Leeds Road, Oadby', products: 'Bi-fold doors and 2 windows', photo: 'bifold', value: 8020, stage: 'Snags', sales: 'mh', surveyor: 'ps', fitters: ['Amir Khan', 'Joe Patel', 'Chris Reid'], owner: 'Sarah Mitchell',
    next: 'Customer to confirm the repairs', due: 'Mon 19 Oct', dueIso: '2026-10-19', won: '20 Aug', supplier: 'Origin', orderRef: 'SO-48121', delivery: { expected: 'Mon 5 Oct', status: 'Arrived' }, install: 'Thu 8 – Fri 9 Oct (done)', portal: 'Active',
    snags: [{ id: 'SN-117', title: 'Scratch on the bi-fold frame', status: 'Fixed today' }, { id: 'SN-118', title: 'Bedroom window handle is stiff', status: 'Fixed today' }],
    invoices: [{ ref: 'INV-3302', type: 'Deposit', amount: 4010, status: 'Paid', due: '20 Aug' }, { ref: 'INV-3341', type: 'Stage payment', amount: 3208, status: 'Paid', due: '02 Oct' }, { ref: 'INV-3369', type: 'Final payment', amount: 802, status: 'On hold', due: 'After repairs' }],
    timeline: [{ when: '16 Oct', text: 'Amir fixed both snags on a return visit', who: 'Amir Khan' }, { when: '15 Oct', text: 'Return visit booked', who: 'Sarah Mitchell' }, { when: '14 Oct', text: 'Handle part ordered', who: 'Tom Wright' }, { when: '09 Oct', text: 'Fitting finished · 2 snags noted', who: 'Amir Khan' }] },
  { id: 'JG-10493', enquiry: 'EN-2276', customer: 'Hartley Dental', initials: 'HD', address: '2 Market Place, Oadby', products: '10 windows (commercial)', photo: 'house', value: 6500, stage: 'Installation', sales: 'jb', surveyor: 'rk', fitters: ['Amir Khan', 'Joe Patel'], owner: 'Sarah Mitchell',
    next: 'Fitting day 1 of 2', due: 'Today', dueIso: '2026-10-16', won: '18 Sep', supplier: 'Emplas', orderRef: 'SO-48190', delivery: { expected: 'Wed 14 Oct', status: 'Arrived' }, install: 'Fri 16 – Sat 17 Oct', snags: [], portal: 'Active',
    invoices: [{ ref: 'INV-3352', type: 'Deposit', amount: 3250, status: 'Paid', due: '28 Sep' }, { ref: 'INV-3388', type: 'Stage payment', amount: 2600, status: 'Paid', due: '09 Oct' }, { ref: '—', type: 'Final payment', amount: 650, status: 'Not sent', due: 'After fitting' }],
    timeline: [{ when: '16 Oct', text: 'Amir: on site, 4 of 10 frames fitted', who: 'Amir Khan' }, { when: '14 Oct', text: '10 frames arrived', who: 'Sarah Mitchell' }, { when: '18 Sep', text: 'Deal won · deposit paid', who: 'James Brook' }] },
  { id: 'JG-10466', enquiry: 'EN-2274', customer: 'Mr & Mrs Shah', initials: 'MS', address: '4 Linton Lane, Wetherby', products: '9 windows', photo: 'window', value: 7400, stage: 'Ordered', sales: 'mh', surveyor: 'ps', fitters: [], owner: 'Sarah Mitchell',
    next: 'Get a new delivery date from Emplas', due: 'Overdue', dueIso: '2026-10-13', flag: 'Blocked', flagWhy: 'Delivery 3 days late · no new date', won: '14 Sep', supplier: 'Emplas', orderRef: 'SO-48177', delivery: { expected: 'Tue 13 Oct', status: 'Late', late: 3 }, install: 'Not booked (waiting for frames)', snags: [], portal: 'Active',
    invoices: [{ ref: 'INV-3360', type: 'Deposit', amount: 3700, status: 'Paid', due: '30 Sep' }, { ref: '—', type: 'Stage payment', amount: 2960, status: 'Not sent', due: 'Before fitting' }, { ref: '—', type: 'Final payment', amount: 740, status: 'Not sent', due: 'After fitting' }],
    timeline: [{ when: '14 Oct', text: 'Chased Emplas · waiting for a new date', who: 'Sarah Mitchell' }, { when: '13 Oct', text: 'Delivery did not arrive', who: 'Sarah Mitchell' }, { when: '22 Sep', text: 'Order placed with Emplas', who: 'Sarah Mitchell' }] },
  { id: 'JG-10488', enquiry: 'EN-2279', customer: 'Mrs Hughes', initials: 'LH', address: '31 Grange Road, Knaresborough', products: 'French doors and 3 windows', photo: 'door', value: 5900, stage: 'Final survey', sales: 'ec', surveyor: '', fitters: [], owner: 'Sarah Mitchell',
    next: 'Book the final survey', due: 'Mon 19 Oct', dueIso: '2026-10-19', flag: 'Incomplete', flagWhy: 'Won today · no surveyor booked yet', won: '16 Oct', supplier: '—', orderRef: '—', delivery: { expected: '—', status: 'Not ordered' }, install: 'Not booked', snags: [], portal: 'Not invited',
    invoices: [{ ref: 'INV-3401', type: 'Deposit', amount: 2950, status: 'Paid', due: '16 Oct' }],
    timeline: [{ when: '16 Oct', text: 'Deal won · deposit matched in Xero', who: 'Emma Clarke' }] },
  { id: 'JG-10455', enquiry: 'EN-2268', customer: 'Mr Khan', initials: 'MK', address: '41 York Road, Harrogate', products: 'Orangery roof', photo: 'orangery', value: 4680, stage: 'Complete', sales: 'ec', surveyor: 'rk', fitters: ['Amir Khan', 'Joe Patel', 'Sam Price'], owner: 'Sarah Mitchell',
    next: 'In guarantee until Oct 2036', due: 'Done', dueIso: '', won: '12 Aug', supplier: 'Origin', orderRef: 'SO-48101', delivery: { expected: 'Fri 9 Oct', status: 'Arrived' }, install: 'Mon 12 – Wed 14 Oct (done)', snags: [{ id: 'SN-116', title: 'Trim colour did not match', status: 'Fixed' }], portal: 'Active',
    invoices: [{ ref: 'INV-3290', type: 'Deposit', amount: 2340, status: 'Paid', due: '12 Aug' }, { ref: 'INV-3375', type: 'Final payment', amount: 2340, status: 'Paid', due: '14 Oct' }],
    timeline: [{ when: '15 Oct', text: 'Customer left a 5-star review', who: 'Mr Khan' }, { when: '14 Oct', text: 'Job closed · guarantee sent', who: 'Sarah Mitchell' }] },
  { id: 'JG-10433', enquiry: 'EN-2262', customer: 'The Greens', initials: 'GR', address: '6 Mill Lane, Ilkley', products: 'Front door', photo: 'door', value: 2380, stage: 'Complete', sales: 'ec', surveyor: 'ps', fitters: ['Dan Hughes', 'Lee Brooks'], owner: 'Sarah Mitchell',
    next: 'Chase the final payment', due: 'Overdue', dueIso: '2026-10-02', flag: 'Overdue', flagWhy: 'Final payment £238 overdue since 2 Oct', won: '20 Jul', supplier: 'Origin', orderRef: 'SO-48060', delivery: { expected: 'Sat 26 Sep', status: 'Arrived' }, install: 'Tue 29 Sep (done)', snags: [{ id: 'SN-114', title: 'Door draught', status: 'Fixed' }], portal: 'Active',
    invoices: [{ ref: 'INV-3270', type: 'Deposit', amount: 1190, status: 'Paid', due: '20 Jul' }, { ref: 'INV-3320', type: 'Stage payment', amount: 952, status: 'Paid', due: '22 Sep' }, { ref: 'INV-3348', type: 'Final payment', amount: 238, status: 'Overdue', due: '02 Oct' }],
    timeline: [{ when: '09 Oct', text: 'Payment reminder sent', who: 'Sarah Mitchell' }, { when: '29 Sep', text: 'Fitted and signed off', who: 'Dan Hughes' }] },
  { id: 'JG-10398', enquiry: 'EN-2240', customer: 'Mrs Cooper', initials: 'JC', address: '5 Elm Close, Ripon', products: '4 windows', photo: 'window', value: 2600, stage: 'Complete', sales: 'ec', surveyor: 'rk', fitters: ['Amir Khan', 'Joe Patel'], owner: 'Sarah Mitchell',
    next: 'In guarantee until Jun 2036', due: 'Done', dueIso: '', won: '10 May', supplier: 'Emplas', orderRef: 'SO-47820', delivery: { expected: 'Fri 5 Jun', status: 'Arrived' }, install: 'Tue 9 – Wed 10 Jun (done)', snags: [], portal: 'Active',
    invoices: [{ ref: 'INV-3120', type: 'Deposit', amount: 1300, status: 'Paid', due: '10 May' }, { ref: 'INV-3190', type: 'Final payment', amount: 1300, status: 'Paid', due: '10 Jun' }],
    timeline: [{ when: '10 Jun', text: 'Fitted and signed off', who: 'Amir Khan' }] },
];

/* ---------------- Approvals (authorised overrides) ---------------- */
export type Approval = {
  id: string; kind: 'Installation override' | 'Diary clash' | 'Change salesperson' | 'Data import';
  title: string; record: string; link: string; by: string; byRole: string; asked: string; why: string; rule: string; impact: string;
  status: 'Waiting' | 'Approved' | 'Declined'; decidedOn?: string; note?: string; urgent?: boolean;
};
export const APPROVALS0: Approval[] = [
  { id: 'AP-31', kind: 'Installation override', title: 'Book The Bakers’ fitting before the stage payment arrives', record: 'JG-10477 · The Bakers', link: '/projects/JG-10477', by: 'Sarah Mitchell', byRole: 'Office Admin', asked: 'Today, 09:50', urgent: true,
    why: 'The customer is paying £2,080 by bank transfer on Monday. Tue 27 – Wed 28 Oct is the only free slot for Dan and Lee for 3 weeks.', rule: 'Stage payment must be paid before fitting is booked', impact: 'Fitting booked Tue 27 – Wed 28 Oct with Dan Hughes and Lee Brooks' },
  { id: 'AP-30', kind: 'Diary clash', title: 'Book Tom Wright on two jobs on Mon 19 Oct', record: 'JG-10433 · The Greens', link: '/diary', by: 'Sarah Mitchell', byRole: 'Office Admin', asked: 'Today, 08:35',
    why: 'Tom’s morning workshop day can move to the afternoon. The Greens want the door adjusted before they go away.', rule: 'A fitter cannot be booked twice on the same day', impact: 'Tom Wright: The Greens 08:00 – 10:00, workshop from 11:00' },
  { id: 'AP-29', kind: 'Change salesperson', title: 'Move K. Roberts from James Brook to Emma Clarke', record: 'EN-2284 · K. Roberts', link: '/pipeline?id=EN-2284', by: 'Sarah Mitchell', byRole: 'Office Admin', asked: 'Yesterday, 16:20',
    why: 'James is locked out and off until Wednesday. The customer wants an answer on the roof lantern this week.', rule: 'One customer has one salesperson; changing it needs a reason', impact: 'Emma Clarke owns the customer, quote FP-55118 and the follow-up task' },
  { id: 'AP-28', kind: 'Data import', title: 'Import 1,251 customers and active jobs from the old system', record: 'IM-03 · old-system-customers.xlsx', link: '', by: 'Tom Fletcher', byRole: 'System Admin', asked: '14 Oct',
    why: 'Trial import checked: 1,251 rows ready, 21 duplicates added to existing customers, 12 rows with problems left out (error report attached).', rule: 'The client approves before anything is imported into the live platform', impact: 'Customers and jobs from the old system appear in every portal' },
  { id: 'AP-26', kind: 'Installation override', title: 'Fit Hartley Dental on a Saturday', record: 'JG-10493 · Hartley Dental', link: '/projects/JG-10493', by: 'Sarah Mitchell', byRole: 'Office Admin', asked: '12 Oct', status: 'Approved', decidedOn: '12 Oct', note: 'Fine — the practice is closed on Saturdays, less disruption.',
    why: 'The practice is closed on Saturday, so day 2 is less disruptive.', rule: 'No fitting on weekends without approval', impact: 'Day 2 on Sat 17 Oct' } as Approval,
  { id: 'AP-25', kind: 'Change salesperson', title: 'Move Gary Wells’ customers to Emma Clarke', record: '7 customers', link: '', by: 'Tom Fletcher', byRole: 'System Admin', asked: '30 Sep', status: 'Approved', decidedOn: '30 Sep', note: 'Agreed — Gary has left.',
    why: 'Gary Wells left the company.', rule: 'Changing a salesperson needs a reason', impact: '7 customers moved to Emma Clarke' } as Approval,
].map(a => ({ status: 'Waiting', ...a })) as Approval[];

/* ---------------- Diary (Mon 12 – Sat 24 Oct) ---------------- */
export type DEvent = { id: string; who: string[]; date: string; days: number; kind: 'Installation' | 'Return visit' | 'Workshop' | 'Leave' | 'Survey'; title: string; job?: string; color: string };
export const DIARY0: DEvent[] = [
  { id: 'd1', who: ['Amir Khan', 'Joe Patel', 'Sam Price'], date: '2026-10-12', days: 3, kind: 'Installation', title: 'Mr Khan · orangery roof', job: 'JG-10455', color: '#0b6e5c' },
  { id: 'd2', who: ['Amir Khan'], date: '2026-10-16', days: 1, kind: 'Return visit', title: 'Mrs Patel · 2 snags (08:00)', job: 'JG-10471', color: '#e0a100' },
  { id: 'd3', who: ['Amir Khan', 'Joe Patel'], date: '2026-10-16', days: 2, kind: 'Installation', title: 'Hartley Dental · 10 windows', job: 'JG-10493', color: '#0b6e5c' },
  { id: 'd4', who: ['Dan Hughes', 'Lee Brooks', 'Chris Reid'], date: '2026-10-22', days: 2, kind: 'Installation', title: 'The Smiths · 6 windows and a door', job: 'JG-10482', color: '#0b6e5c' },
  { id: 'd5', who: ['Tom Wright', 'Ben Cole'], date: '2026-10-12', days: 5, kind: 'Workshop', title: 'Workshop', color: '#7a8f8b' },
  { id: 'd6', who: ['Ben Cole'], date: '2026-10-19', days: 2, kind: 'Leave', title: 'Holiday', color: '#b6c2bf' },
  { id: 'd7', who: ['Tom Wright'], date: '2026-10-19', days: 1, kind: 'Workshop', title: 'Workshop', color: '#7a8f8b' },
  { id: 'd8', who: ['Dan Hughes', 'Lee Brooks'], date: '2026-10-14', days: 1, kind: 'Installation', title: 'Dr Okoro · back door', color: '#0b6e5c' },
  { id: 'd9', who: ['Chris Reid'], date: '2026-10-20', days: 1, kind: 'Workshop', title: 'Workshop · prep Smiths', color: '#7a8f8b' },
];
export const FITTERS = ['Dan Hughes', 'Lee Brooks', 'Chris Reid', 'Amir Khan', 'Joe Patel', 'Tom Wright', 'Ben Cole', 'Sam Price'];

/* ---------------- Finance (from Xero) ---------------- */
export const CASH_BY_MONTH = [
  { m: 'May', v: 41 }, { m: 'Jun', v: 48 }, { m: 'Jul', v: 44 }, { m: 'Aug', v: 52 }, { m: 'Sep', v: 49 }, { m: 'Oct', v: 31 },
];

/* ---------------- Team workload ---------------- */
export type Person = { id: string; name: string; initials: string; role: string; team: string; load: string; loadPct: number; next: string; status: 'Working' | 'On site' | 'Off' | 'Locked out'; note?: string };
export const PEOPLE: Person[] = [
  { id: 'sm', name: 'Sarah Mitchell', initials: 'SM', role: 'Office Admin', team: 'Office', load: '9 jobs, 6 tasks today', loadPct: 82, next: 'Book The Bakers’ fitting', status: 'Working' },
  { id: 'km', name: 'Kate Morris', initials: 'KM', role: 'Office Admin', team: 'Office', load: 'Starting soon', loadPct: 0, next: 'Invite not opened yet', status: 'Off', note: 'New starter · invited 14 Oct' },
  { id: 'mh', name: 'Mike Harris', initials: 'MH', role: 'Salesperson', team: 'Sales', load: '3 open enquiries · £45,620', loadPct: 74, next: 'Ashby Farm follow-up today', status: 'Working' },
  { id: 'ec', name: 'Emma Clarke', initials: 'EC', role: 'Salesperson', team: 'Sales', load: '2 open enquiries · £11,350', loadPct: 40, next: 'Ms Green brochure today', status: 'Working' },
  { id: 'jb', name: 'James Brook', initials: 'JB', role: 'Salesperson', team: 'Sales', load: '2 open enquiries · £6,680', loadPct: 30, next: 'Off until Wed 21 Oct', status: 'Locked out', note: 'Locked out today · System Admin is unlocking' },
  { id: 'ps', name: 'Priya Shah', initials: 'PS', role: 'Surveyor', team: 'Surveyors', load: '3 visits next 7 days', loadPct: 60, next: 'Mon 19 Oct · The Lees', status: 'Working' },
  { id: 'rk', name: 'Rob King', initials: 'RK', role: 'Surveyor', team: 'Surveyors', load: '2 visits next 7 days', loadPct: 40, next: 'Mon 19 Oct · Mr & Mrs Lees', status: 'Working' },
  { id: 'dh', name: 'Dan Hughes', initials: 'DH', role: 'Lead fitter', team: 'Fitters · Leicester', load: '2 days booked next week', loadPct: 40, next: 'The Smiths · Thu 22 Oct', status: 'Working' },
  { id: 'lb', name: 'Lee Brooks', initials: 'LB', role: 'Fitter', team: 'Fitters · Leicester', load: '2 days booked next week', loadPct: 40, next: 'The Smiths · Thu 22 Oct', status: 'Working' },
  { id: 'cr', name: 'Chris Reid', initials: 'CR', role: 'Fitter', team: 'Fitters · Leicester', load: '3 days booked next week', loadPct: 60, next: 'Workshop · Tue 20 Oct', status: 'Working' },
  { id: 'ak', name: 'Amir Khan', initials: 'AK', role: 'Lead fitter', team: 'Fitters · Yorkshire', load: 'On site today and tomorrow', loadPct: 100, next: 'Hartley Dental · day 1 of 2', status: 'On site' },
  { id: 'jp', name: 'Joe Patel', initials: 'JP', role: 'Fitter', team: 'Fitters · Yorkshire', load: 'On site today and tomorrow', loadPct: 100, next: 'Hartley Dental · day 1 of 2', status: 'On site' },
  { id: 'tw', name: 'Tom Wright', initials: 'TW', role: 'Lead fitter', team: 'Fitters · Yorkshire', load: 'Workshop this week', loadPct: 50, next: 'Workshop · Mon 19 Oct', status: 'Working' },
  { id: 'bc', name: 'Ben Cole', initials: 'BC', role: 'Fitter', team: 'Fitters · Yorkshire', load: 'Holiday Mon 19 – Tue 20 Oct', loadPct: 20, next: 'Back Wed 21 Oct', status: 'Working' },
  { id: 'sp', name: 'Sam Price', initials: 'SP', role: 'Apprentice', team: 'Fitters · Yorkshire', load: 'Nothing booked next week', loadPct: 0, next: 'Free', status: 'Working' },
];

/* ---------------- What each number means (agreed definitions) ---------------- */
export const DEFS: Record<string, string> = {
  pipeline: 'Total value of open enquiries (not Won or Lost), using the latest quote, or the estimate if there is no quote yet.',
  won: 'Value of deals marked Won this month. A deal is Won when the deposit is checked in Xero.',
  conversion: 'Deals won ÷ (deals won + deals lost) in the period.',
  outstanding: 'Invoices sent from Xero and not yet paid, including on-hold balances.',
  overdue: 'Any task, follow-up, payment or delivery past its due date.',
  unscheduled: 'Jobs whose frames have arrived and are ready to fit, but no fitting date is booked.',
  delays: 'Supplier deliveries past their expected date, or not confirmed within 3 days of ordering.',
  snags: 'Snags not yet fixed, or fixed but not yet confirmed by the customer.',
  workload: 'Fitter days booked ÷ fitter days available (excluding leave) in the period.',
};

/* ---------------- Audit history ---------------- */
export type Audit = { id: string; when: string; day: number; who: string; action: string; record: string; area: string; source: string; before?: [string, string][]; reason?: string };
export const AUDIT0: Audit[] = [
  { id: 'a30', when: 'Today, 10:42', day: 0, who: 'Sarah & David Smith', action: 'Sent a message in the customer portal', record: 'JG-10482', area: 'Jobs', source: 'Customer portal' },
  { id: 'a29', when: 'Today, 09:50', day: 0, who: 'Sarah Mitchell', action: 'Asked to book a fitting before the stage payment', record: 'JG-10477 · AP-31', area: 'Approvals', source: 'Office Admin', reason: 'Only free slot for 3 weeks' },
  { id: 'a28', when: 'Today, 09:05', day: 0, who: 'Amir Khan', action: 'Fixed 2 snags on a return visit', record: 'JG-10471 · SN-117, SN-118', area: 'Jobs', source: 'Installer app', before: [['SN-117', 'Open → Fixed'], ['SN-118', 'Open → Fixed']] },
  { id: 'a27', when: 'Today, 08:12', day: 0, who: 'James Brook', action: 'Account locked after 3 wrong codes', record: 'James Brook', area: 'Sign-in', source: 'Phone app' },
  { id: 'a26', when: 'Today, 07:40', day: 0, who: 'Emma Clarke', action: 'Marked a deal as Won', record: 'EN-2279 · Mrs Hughes', area: 'Sales', source: 'Sales portal', before: [['Stage', 'Follow-up → Won']] },
  { id: 'a25', when: 'Yesterday, 16:30', day: 1, who: 'Sarah Mitchell', action: 'Booked a return visit', record: 'JG-10471', area: 'Jobs', source: 'Office Admin', before: [['Visit', '— → Fri 16 Oct, 08:00 · Amir Khan']] },
  { id: 'a24', when: '14 Oct, 17:45', day: 2, who: 'Sarah Mitchell', action: 'Closed a job and published the guarantee', record: 'JG-10455 · Mr Khan', area: 'Jobs', source: 'Office Admin' },
  { id: 'a23', when: '13 Oct, 15:10', day: 3, who: 'Sarah Mitchell', action: 'Changed a fitting date', record: 'JG-10482', area: 'Diary', source: 'Office Admin', before: [['Fitting', 'Wed 21 Oct → Thu 22 – Fri 23 Oct']], reason: 'Frames arrive 20 Oct' },
  { id: 'a22', when: '12 Oct, 11:20', day: 4, who: 'James Whitfield', action: 'Approved a Saturday fitting', record: 'JG-10493 · AP-26', area: 'Approvals', source: 'Director', reason: 'Practice closed on Saturdays' },
  { id: 'a20', when: '30 Sep, 17:10', day: 16, who: 'Tom Fletcher', action: 'Deactivated a user', record: 'Gary Wells', area: 'Users', source: 'System Admin', before: [['Customers', 'Gary Wells → Emma Clarke']], reason: 'Left the company' },
  { id: 'a19', when: '30 Sep, 16:40', day: 16, who: 'Mike Harris', action: 'Marked a deal as Won', record: 'EN-2283 · Sarah & David Smith', area: 'Sales', source: 'Sales portal', before: [['Stage', 'Quote Sent → Won']] },
];

/* ---------------- Integration health (read only for the Director) ---------------- */
export const INTEG = [
  { id: 'framepoint', name: 'Framepoint', logo: 'FP', color: '#2f6fde', status: 'Connected', errors: 1, last: '2 min ago' },
  { id: 'microsoft', name: 'Outlook', logo: 'M', color: '#0b6e5c', status: 'Needs attention', errors: 1, last: '1 min ago' },
  { id: 'xero', name: 'Xero', logo: 'X', color: '#13b5ea', status: 'Connected', errors: 2, last: '6 min ago' },
];
