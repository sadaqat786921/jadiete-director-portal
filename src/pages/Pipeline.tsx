// Sales pipeline (Kanban, one card per enquiry from New Enquiry to Won / Lost). The Director sees everything; opens a card for the details,
// asks the salesperson for an update, adds a private note, or changes the salesperson (authorised override, reason required).
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { IconSearch, IconFlame, IconAlertTriangle, IconSend, IconUserCog, IconPhone, IconMail, IconMapPin, IconCalendarEvent } from '@tabler/icons-react';
import { PageHead, Tag, Avatar, Drawer, Modal, Field, Photo, useToast } from '../components/ui';
import { useStore } from '../data/store';
import { STAGES, IMG, salespeople, staffById, Enquiry } from '../data/biz';
import { AskModal, AskedTag, Notes, Def, money, gbp } from '../components/director';

export default function Pipeline() {
  const st = useStore();
  const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState('');
  const [who, setWho] = useState('all');
  const open = st.enquiries.find(e => e.id === sp.get('id'));
  const list = st.enquiries.filter(e => (who === 'all' || e.assigned === who || (who === 'none' && !e.assigned)) && (e.name + e.id + e.product + e.address).toLowerCase().includes(q.toLowerCase()));
  const total = list.filter(e => e.stage !== 'Won' && e.stage !== 'Lost').reduce((s, e) => s + e.value, 0);
  return (
    <>
      <PageHead title="Sales pipeline" crumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Sales pipeline' }]} actions={<span className="hstack small t2" style={{ gap: 4 }}>Open value <b style={{ color: 'var(--text)' }}>{money(total)}</b><Def k="pipeline" /></span>} />
      <div className="card flush">
        <div className="toolbar">
          <div className="input-icon" style={{ width: 280 }}><IconSearch size={16} /><input className="input" style={{ height: 36 }} placeholder="Search customer, enquiry or product" value={q} onChange={e => setQ(e.target.value)} /></div>
          <button className={`chip ${who === 'all' ? 'on' : ''}`} onClick={() => setWho('all')}>Everyone</button>
          {salespeople.map(s => <button key={s.id} className={`chip ${who === s.id ? 'on' : ''}`} onClick={() => setWho(s.id)}>{s.name}<span className="n">{st.enquiries.filter(e => e.assigned === s.id && e.stage !== 'Won' && e.stage !== 'Lost').length}</span></button>)}
          <button className={`chip ${who === 'none' ? 'on' : ''}`} onClick={() => setWho('none')}>Not assigned<span className="n">{st.enquiries.filter(e => !e.assigned).length}</span></button>
          <span className="tiny muted" style={{ marginLeft: 'auto' }}>You can see every card. Salespeople move cards in their own portal.</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridAutoFlow: 'column', gridAutoColumns: 'minmax(250px, 1fr)', gap: 14, overflowX: 'auto', paddingBottom: 8 }}>
        {STAGES.map(s => {
          const cards = list.filter(e => e.stage === s);
          return (
            <div key={s} className="vstack" style={{ gap: 10, background: '#eef3f1', borderRadius: 12, padding: 10, minHeight: 300 }}>
              <div className="between" style={{ padding: '2px 4px' }}><b className="small">{s}</b><span className="tiny muted">{cards.length} · {money(cards.reduce((a, e) => a + e.value, 0))}</span></div>
              {cards.map(e => <PCard key={e.id} e={e} onOpen={() => setSp({ id: e.id }, { replace: true })} />)}
              {cards.length === 0 && <span className="tiny muted" style={{ textAlign: 'center', padding: 16 }}>Nothing here</span>}
            </div>
          );
        })}
      </div>
      {open && <EnquiryDrawer e={open} onClose={() => setSp({}, { replace: true })} />}
    </>
  );
}

function PCard({ e, onOpen }: { e: Enquiry; onOpen: () => void }) {
  const s = staffById(e.assigned);
  return (
    <button onClick={onOpen} className="card" style={{ padding: 12, gap: 8, textAlign: 'left', cursor: 'pointer', border: e.nextDue === 'Overdue' ? '1px solid #f3c2c2' : undefined }} aria-label={`${e.name} ${e.id}`}>
      <div className="hstack" style={{ gap: 10 }}><Photo src={IMG[e.photo]} w={38} h={38} r={8} /><span className="vstack grow" style={{ gap: 1, minWidth: 0 }}><b style={{ fontSize: 13 }}>{e.name}</b><span className="tiny muted">{e.id} · {e.product}</span></span></div>
      <div className="between"><b className="small">{gbp(e.value)}</b>{s ? <span className="hstack tiny muted" style={{ gap: 6 }}><Avatar i={s.initials} size={22} />{s.name.split(' ')[0]}</span> : <Tag tone="warn">Not assigned</Tag>}</div>
      <span className="tiny" style={{ color: e.nextDue === 'Overdue' ? 'var(--err)' : 'var(--text-2)' }}>{e.stage === 'Lost' ? `Lost: ${e.next}` : `${e.next} · ${e.nextDue}`}</span>
      <span className="hstack" style={{ gap: 6, flexWrap: 'wrap' }}>{e.hot && <Tag tone="warn" icon={<IconFlame size={12} />}>Hot</Tag>}{e.nextDue === 'Overdue' && <Tag tone="err" icon={<IconAlertTriangle size={12} />}>Overdue</Tag>}<AskedTag record={e.id} /></span>
    </button>
  );
}

function EnquiryDrawer({ e, onClose }: { e: Enquiry; onClose: () => void }) {
  const st = useStore();
  const toast = useToast();
  const [m, setM] = useState<'' | 'ask' | 'owner'>('');
  const [to, setTo] = useState(e.assigned === 'ec' ? 'mh' : 'ec');
  const [why, setWhy] = useState('');
  const s = staffById(e.assigned);
  const idx = STAGES.indexOf(e.stage);
  const asks = st.asks.filter(a => a.record === e.id);
  return (
    <>
      <Drawer title={e.name} sub={`${e.id} · ${e.product} · ${gbp(e.value)}`} onClose={onClose} width={560}
        footer={<><button className="btn btn-outline" onClick={() => setM('owner')} disabled={e.stage === 'Won' || e.stage === 'Lost'}><IconUserCog size={16} />Change salesperson</button><button className="btn btn-primary" onClick={() => setM('ask')}><IconSend size={16} />Ask for an update</button></>}>
        <img src={IMG[e.photo]} alt="" style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 10 }} />
        <div className="hstack" style={{ gap: 4 }}>{STAGES.filter(x => x !== 'Lost').map((x, i) => <span key={x} title={x} style={{ flex: 1, height: 6, borderRadius: 3, background: e.stage === 'Lost' ? '#f3c2c2' : i <= idx ? 'var(--primary)' : 'var(--border)' }} />)}</div>
        <span className="small"><b>{e.stage}</b>{e.stage === 'Lost' ? ` · ${e.next}` : ''}</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[['Salesperson', s?.name || 'Not assigned'], ['Next action', e.stage === 'Lost' ? '—' : e.next], ['Due', e.nextDue], ['Value', gbp(e.value)], ['Came from', e.source], ['Received', e.received]].map(([k, v]) => <div key={k} className="vstack" style={{ gap: 2 }}><span className="tiny muted">{k}</span><b className="small" style={{ color: v === 'Overdue' ? 'var(--err)' : undefined }}>{v}</b></div>)}
        </div>
        <div className="vstack small t2" style={{ gap: 6 }}>
          <span className="hstack" style={{ gap: 8 }}><IconMapPin size={15} />{e.address}, {e.postcode}</span>
          <span className="hstack" style={{ gap: 8 }}><IconPhone size={15} />{e.phone}</span>
          <span className="hstack" style={{ gap: 8 }}><IconMail size={15} />{e.email}</span>
          {e.stage === 'Appointment' && <span className="hstack" style={{ gap: 8 }}><IconCalendarEvent size={15} />Sales visit {e.nextDue}</span>}
        </div>
        {asks.length > 0 && <div className="vstack" style={{ gap: 6 }}><b className="small">Updates you asked for</b>{asks.map(a => <span key={a.id} className="small t2">• {a.when} to {a.to}: “{a.text}”</span>)}</div>}
        <b className="small">Private notes</b>
        <Notes record={e.id} />
      </Drawer>
      {m === 'ask' && <AskModal record={e.id} to={s?.name || 'Sarah Mitchell'} about={e.name} onClose={() => setM('')} />}
      {m === 'owner' && (
        <Modal title="Change salesperson" sub={`${e.id} · ${e.name} · now ${s?.name || 'not assigned'}`} onClose={() => setM('')} width={520}
          footer={<><button className="btn btn-grey" onClick={() => setM('')}>Cancel</button><button className="btn btn-primary" disabled={why.trim().length < 3 || to === e.assigned} onClick={() => { const n = staffById(to)!.name; st.set('enquiries', es => es.map(x => (x.id === e.id ? { ...x, assigned: to } : x))); st.log('Changed the salesperson', `${e.id} · ${e.name}`, 'Sales', [['Salesperson', `${s?.name || 'Not assigned'} → ${n}`]], why.trim()); toast(`${n} now looks after ${e.name}`); setM(''); }}>Change</button></>}>
          <span className="small t2">One customer has one salesperson. The quote, tasks and Outlook appointments move with them.</span>
          <Field label="New salesperson"><select className="select" value={to} onChange={x => setTo(x.target.value)}>{salespeople.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
          <Field label="Why? (required)" hint="Saved in the audit history"><input className="input" value={why} onChange={x => setWhy(x.target.value)} placeholder="For example: James is off this week" /></Field>
        </Modal>
      )}
    </>
  );
}
