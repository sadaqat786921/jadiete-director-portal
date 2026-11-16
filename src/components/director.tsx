// Director building blocks: exceptions (what needs attention), approvals, "ask for an update", director notes, metric definitions.
import React, { useState } from 'react';
import { IconInfoCircle, IconSend, IconNote, IconAlertTriangle, IconClock, IconPlayerPause, IconCalendarOff, IconTruck, IconTool, IconPlugConnected, IconListCheck } from '@tabler/icons-react';
import { Modal, Field, Tag, useToast } from './ui';
import { useStore } from '../data/store';
import { staffById, gbp } from '../data/biz';
import { DEFS, INTEG, Approval } from '../data/director';

export { gbp };
export const money = (n: number) => (n >= 1000 ? `£${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : gbp(n));

/* ---------- Exceptions: overdue, blocked, incomplete, unscheduled, late deliveries, open snags, sync errors ---------- */
export type ExType = 'Overdue' | 'Blocked' | 'Incomplete' | 'Unscheduled' | 'Late delivery' | 'Open snags' | 'Sync errors';
export type Ex = { id: string; type: ExType; title: string; record: string; customer: string; link: string; owner: string; next: string; due: string; days?: number };
export const EX_ICON: Record<ExType, any> = { Overdue: IconClock, Blocked: IconPlayerPause, Incomplete: IconListCheck, Unscheduled: IconCalendarOff, 'Late delivery': IconTruck, 'Open snags': IconTool, 'Sync errors': IconPlugConnected };
export const EX_COLOR: Record<ExType, string> = { Overdue: '#d64545', Blocked: '#d64545', Incomplete: '#e0a100', Unscheduled: '#e0a100', 'Late delivery': '#d64545', 'Open snags': '#e0a100', 'Sync errors': '#2f6fde' };

export function useExceptions(): Ex[] {
  const { enquiries, projects } = useStore();
  const out: Ex[] = [];
  enquiries.filter(e => e.nextDue === 'Overdue').forEach(e => out.push({ id: 'x-' + e.id, type: 'Overdue', title: `${e.next} · ${e.name}`, record: e.id, customer: e.name, link: `/pipeline?id=${e.id}`, owner: staffById(e.assigned)?.name || 'Sarah Mitchell (not assigned yet)', next: e.next, due: `Received ${e.received.split(',')[0]}`, days: 2 }));
  enquiries.filter(e => !e.assigned && e.stage === 'New Enquiry' && e.nextDue !== 'Overdue').forEach(e => out.push({ id: 'i-' + e.id, type: 'Incomplete', title: `Not assigned to a salesperson · ${e.name}`, record: e.id, customer: e.name, link: `/pipeline?id=${e.id}`, owner: 'Sarah Mitchell', next: 'Assign and call', due: 'Today' }));
  projects.forEach(p => {
    if (p.flag === 'Overdue') out.push({ id: 'o-' + p.id, type: 'Overdue', title: p.flagWhy || p.next, record: p.id, customer: p.customer, link: `/projects/${p.id}`, owner: p.owner, next: p.next, due: p.due, days: 14 });
    if (p.flag === 'Blocked' && !p.delivery.late) out.push({ id: 'b-' + p.id, type: 'Blocked', title: p.flagWhy || p.next, record: p.id, customer: p.customer, link: `/projects/${p.id}`, owner: p.owner, next: p.next, due: p.due, days: p.delivery.late });
    if (p.flag === 'Incomplete') out.push({ id: 'c-' + p.id, type: 'Incomplete', title: p.flagWhy || p.next, record: p.id, customer: p.customer, link: `/projects/${p.id}`, owner: p.owner, next: p.next, due: p.due });
    if (p.stage === 'Ready to book' && p.install === 'Not booked') out.push({ id: 'u-' + p.id, type: 'Unscheduled', title: `Ready to fit but no date booked · ${p.customer}`, record: p.id, customer: p.customer, link: `/projects/${p.id}`, owner: p.owner, next: 'Book the installation', due: 'Today', days: 1 });
    if (p.delivery.late) out.push({ id: 'd-' + p.id, type: 'Late delivery', title: `${p.supplier} delivery ${p.delivery.late} days late · ${p.customer}`, record: p.id, customer: p.customer, link: '/deliveries', owner: p.owner, next: 'Get a new date from the supplier', due: p.delivery.expected, days: p.delivery.late });
    const open = p.snags.filter(s => s.status !== 'Fixed');
    if (open.length) out.push({ id: 's-' + p.id, type: 'Open snags', title: `${open.length} snag${open.length > 1 ? 's' : ''} waiting for the customer to confirm · ${p.customer}`, record: p.id, customer: p.customer, link: `/projects/${p.id}`, owner: p.owner, next: 'Customer confirms the repairs', due: p.due });
  });
  const n = INTEG.reduce((s, i) => s + i.errors, 0);
  if (n) out.push({ id: 'sync', type: 'Sync errors', title: `${n} sync errors with Framepoint, Outlook and Xero`, record: 'System Admin', customer: '—', link: '/', owner: 'Tom Fletcher', next: 'System Admin is fixing them', due: 'Today' });
  return out;
}

/* ---------- Approvals: approve or decline, and what happens next ---------- */
export function useDecide() {
  const st = useStore();
  const toast = useToast();
  return (a: Approval, ok: boolean, note: string) => {
    st.set('approvals', xs => xs.map(x => (x.id === a.id ? { ...x, status: ok ? 'Approved' : 'Declined', decidedOn: '16 Oct', note } : x)));
    st.log(ok ? `Approved: ${a.kind.toLowerCase()}` : `Declined: ${a.kind.toLowerCase()}`, `${a.record} · ${a.id}`, 'Approvals', [['Request', `Waiting → ${ok ? 'Approved' : 'Declined'}`]], note || undefined);
    if (ok && a.id === 'AP-31') {
      st.set('projects', ps => ps.map(p => (p.id === 'JG-10477' ? { ...p, install: 'Tue 27 – Wed 28 Oct', fitters: ['Dan Hughes', 'Lee Brooks'], flag: undefined, flagWhy: undefined, next: 'Fitting Tue 27 Oct · stage payment due Mon 26', due: 'Tue 27 Oct', timeline: [{ when: '16 Oct', text: 'Fitting booked Tue 27 – Wed 28 Oct (approved by James Whitfield)', who: 'Sarah Mitchell' }, ...p.timeline] } : p)));
      st.set('diary', ds => [...ds, { id: 'd-ap31', who: ['Dan Hughes', 'Lee Brooks'], date: '2026-10-27', days: 2, kind: 'Installation', title: 'The Bakers · 8 windows', job: 'JG-10477', color: '#0b6e5c' }]);
    }
    if (ok && a.id === 'AP-30') st.set('diary', ds => [...ds, { id: 'd-ap30', who: ['Tom Wright'], date: '2026-10-19', days: 1, kind: 'Return visit', title: 'The Greens · door (08:00)', job: 'JG-10433', color: '#e0a100' }]);
    if (ok && a.id === 'AP-29') st.set('enquiries', es => es.map(e => (e.id === 'EN-2284' ? { ...e, assigned: 'ec' } : e)));
    toast(ok ? `Approved · ${a.by.split(' ')[0]} has been told` : `Declined · ${a.by.split(' ')[0]} has been told`);
  };
}

export function DecideModal({ a, ok, onClose }: { a: Approval; ok: boolean; onClose: () => void }) {
  const decide = useDecide();
  const [note, setNote] = useState('');
  return (
    <Modal title={ok ? 'Approve this request?' : 'Decline this request?'} sub={`${a.id} · ${a.title}`} onClose={onClose} width={560}
      footer={<><button className="btn btn-grey" onClick={onClose}>Cancel</button><button className={`btn ${ok ? 'btn-primary' : 'btn-danger'}`} disabled={!ok && note.trim().length < 3} onClick={() => { decide(a, ok, note.trim()); onClose(); }}>{ok ? 'Approve' : 'Decline'}</button></>}>
      <div className="alert info small" style={{ alignItems: 'flex-start' }}><IconInfoCircle size={16} style={{ marginTop: 1 }} /><span>{ok ? `What happens: ${a.impact}.` : `The rule stays in place: ${a.rule.toLowerCase()}.`}</span></div>
      <Field label={ok ? 'Note for ' + a.by.split(' ')[0] + ' (optional)' : 'Why? (required)'} hint="Saved in the audit history"><textarea className="textarea" rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder={ok ? 'For example: fine, but chase the payment on Monday' : 'For example: wait until the payment has cleared'} /></Field>
    </Modal>
  );
}

/* ---------- Ask the owner for an update ---------- */
export function AskModal({ record, to, about, onClose }: { record: string; to: string; about: string; onClose: () => void }) {
  const st = useStore();
  const toast = useToast();
  const quick = ['What is the latest?', 'When will this be sorted?', 'Is anything stopping this?', 'Please call me about this'];
  const [text, setText] = useState(quick[0]);
  const [who, setWho] = useState(to);
  const people = Array.from(new Set([to, 'Sarah Mitchell', 'Mike Harris', 'Emma Clarke', 'James Brook', 'Priya Shah', 'Rob King', 'Amir Khan', 'Dan Hughes', 'Tom Fletcher'])).filter(Boolean);
  return (
    <Modal title="Ask for an update" sub={`${record} · ${about}`} onClose={onClose} width={540}
      footer={<><button className="btn btn-grey" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={!text.trim()} onClick={() => { st.ask(record, who, text.trim()); toast(`Sent to ${who.split(' (')[0]}`); onClose(); }}><IconSend size={16} />Send</button></>}>
      <Field label="Send to"><select className="select" value={who} onChange={e => setWho(e.target.value)}>{people.map(p => <option key={p}>{p}</option>)}</select></Field>
      <div className="hstack" style={{ gap: 6, flexWrap: 'wrap' }}>{quick.map(q => <button key={q} className={`chip ${text === q ? 'on' : ''}`} onClick={() => setText(q)}>{q}</button>)}</div>
      <Field label="Message"><textarea className="textarea" rows={3} value={text} onChange={e => setText(e.target.value)} /></Field>
      <span className="tiny muted">They get it as a task in their portal or app, linked to {record}.</span>
    </Modal>
  );
}

export function AskedTag({ record }: { record: string }) {
  const { asks } = useStore();
  const a = asks.find(x => x.record === record);
  return a ? <Tag tone="jade" icon={<IconSend size={12} />}>Asked {a.when.replace('Today, ', '')}</Tag> : null;
}

/* ---------- Director notes ---------- */
export function Notes({ record }: { record: string }) {
  const st = useStore();
  const toast = useToast();
  const [t, setT] = useState('');
  const list = st.notes.filter(n => n.record === record);
  return (
    <div className="vstack" style={{ gap: 10 }}>
      {list.map(n => <div key={n.id} className="hstack small" style={{ gap: 10, alignItems: 'flex-start', padding: 10, background: '#fffcf3', border: '1px solid #f2e0a8', borderRadius: 8 }}><IconNote size={16} color="#9a6f00" /><span className="vstack" style={{ gap: 2 }}><span>{n.text}</span><span className="tiny muted">James Whitfield · {n.when}</span></span></div>)}
      <textarea className="textarea" rows={2} value={t} onChange={e => setT(e.target.value)} placeholder="Add a private note (staff only, never shown to the customer)" aria-label="Director note" />
      <button className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start' }} disabled={!t.trim()} onClick={() => { st.note(record, t.trim()); setT(''); toast('Note saved'); }}><IconNote size={15} />Save note</button>
    </div>
  );
}

/* ---------- "How is this counted?" ---------- */
export function Def({ k }: { k: keyof typeof DEFS }) {
  const [o, setO] = useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }} onMouseEnter={() => setO(true)} onMouseLeave={() => setO(false)}>
      <button className="icon-btn" aria-label="How is this counted?" onClick={e => { e.preventDefault(); e.stopPropagation(); setO(!o); }} style={{ width: 24, height: 24, border: 0, background: 'none' }}><IconInfoCircle size={15} color="#6b7a78" /></button>
      {o && <span style={{ position: 'absolute', top: 26, right: 0, width: 260, background: '#0b1f1b', color: '#fff', fontSize: 12, lineHeight: 1.5, padding: '10px 12px', borderRadius: 8, zIndex: 20, fontWeight: 400, textAlign: 'left' }}>{DEFS[k]}</span>}
    </span>
  );
}

export function FlagTag({ flag }: { flag?: string }) {
  if (!flag) return null;
  return <Tag tone={flag === 'Overdue' || flag === 'Blocked' ? 'err' : 'warn'} icon={<IconAlertTriangle size={12} />}>{flag}</Tag>;
}

export function IntegLogo({ logo, color, size = 34 }: { logo: string; color: string; size?: number }) {
  return <span className="tile" style={{ width: size, height: size, borderRadius: 9, background: color, color: '#fff', fontWeight: 700, fontSize: size * 0.34 }}>{logo}</span>;
}
