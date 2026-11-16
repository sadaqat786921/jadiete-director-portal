// Needs attention (overdue, blocked, incomplete, not booked, late deliveries, open snags, sync errors) and Approvals (authorised overrides).
import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { IconSend, IconChevronRight, IconCircleCheck, IconChecks, IconCheck, IconX, IconScale } from '@tabler/icons-react';
import { PageHead, Card, Tag, Tile, Drawer, Empty } from '../components/ui';
import { useStore } from '../data/store';
import { useExceptions, ExType, EX_ICON, EX_COLOR, AskModal, AskedTag, DecideModal, Def, Ex } from '../components/director';

const TYPES: ExType[] = ['Overdue', 'Blocked', 'Incomplete', 'Unscheduled', 'Late delivery', 'Open snags', 'Sync errors'];

export function Attention() {
  const ex = useExceptions();
  const [sp, setSp] = useSearchParams();
  const type = sp.get('type') || 'All';
  const [ask, setAsk] = useState<Ex | null>(null);
  const rows = ex.filter(e => type === 'All' || e.type === type);
  return (
    <>
      <PageHead title="Needs attention" crumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Needs attention' }]} actions={<span className="hstack small t2" style={{ gap: 4 }}>What counts as overdue<Def k="overdue" /></span>} />
      <div className="grid-4" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {TYPES.map(t => { const I = EX_ICON[t]; const n = ex.filter(e => e.type === t).length; return (
          <button key={t} className="card" onClick={() => setSp(type === t ? {} : { type: t }, { replace: true })} style={{ padding: 14, gap: 8, cursor: 'pointer', textAlign: 'left', borderColor: type === t ? 'var(--primary)' : undefined, background: type === t ? 'var(--tint)' : undefined }}>
            <Tile icon={<I size={18} />} color={n ? EX_COLOR[t] : '#6b7a78'} size={36} /><b style={{ fontSize: 20 }}>{n}</b><span className="small t2">{t === 'Unscheduled' ? 'Not booked' : t}</span>
          </button>
        ); })}
      </div>
      <div className="card flush">
        <div className="toolbar"><button className={`chip ${type === 'All' ? 'on' : ''}`} onClick={() => setSp({}, { replace: true })}>All<span className="n">{ex.length}</span></button>{TYPES.map(t => <button key={t} className={`chip ${type === t ? 'on' : ''}`} onClick={() => setSp({ type: t }, { replace: true })}>{t === 'Unscheduled' ? 'Not booked' : t}</button>)}</div>
        <table className="tbl">
          <thead><tr><th>What</th><th>Type</th><th>Owner</th><th>Next action</th><th>Due</th><th style={{ textAlign: 'right' }}></th></tr></thead>
          <tbody>
            {rows.map(e => { const I = EX_ICON[e.type]; return (
              <tr key={e.id}>
                <td><Link to={e.link} className="hstack" style={{ gap: 10 }}><Tile icon={<I size={16} />} color={EX_COLOR[e.type]} size={32} /><span className="vstack" style={{ gap: 1 }}><b className="small">{e.title}</b><span className="tiny muted">{e.record}</span></span></Link></td>
                <td><Tag tone={EX_COLOR[e.type] === '#d64545' ? 'err' : EX_COLOR[e.type] === '#2f6fde' ? 'info' : 'warn'}>{e.type === 'Unscheduled' ? 'Not booked' : e.type}</Tag></td>
                <td className="t2">{e.owner}</td>
                <td className="t2">{e.next}</td>
                <td className="t2">{e.due}{e.days ? <span className="tiny" style={{ color: 'var(--err)', display: 'block' }}>{e.days} day{e.days > 1 ? 's' : ''} late</span> : null}</td>
                <td style={{ textAlign: 'right' }}><span className="hstack" style={{ gap: 6, justifyContent: 'flex-end' }}><AskedTag record={e.record} />{e.type !== 'Sync errors' && <button className="btn btn-outline btn-sm" onClick={() => setAsk(e)}><IconSend size={15} />Ask for an update</button>}<Link to={e.link} className="icon-btn" aria-label={`Open ${e.record}`}><IconChevronRight size={16} /></Link></span></td>
              </tr>
            ); })}
            {rows.length === 0 && <tr><td colSpan={6}><Empty icon={<IconCircleCheck size={22} />} title="Nothing here" sub="All on track." /></td></tr>}
          </tbody>
        </table>
      </div>
      {ask && <AskModal record={ask.record} to={ask.owner.split(' (')[0]} about={ask.title} onClose={() => setAsk(null)} />}
    </>
  );
}

export function Approvals() {
  const st = useStore();
  const [sp, setSp] = useSearchParams();
  const [tab, setTab] = useState<'waiting' | 'done'>('waiting');
  const [decide, setDecide] = useState<{ id: string; ok: boolean } | null>(null);
  const rows = st.approvals.filter(a => (tab === 'waiting' ? a.status === 'Waiting' : a.status !== 'Waiting'));
  const open = st.approvals.find(a => a.id === sp.get('id'));
  const close = () => setSp({}, { replace: true });
  return (
    <>
      <PageHead title="Approvals" crumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Approvals' }]} />
      <div className="alert info"><IconScale size={18} />When someone needs to break an agreed rule, it comes to you. Every decision is saved in the audit history with your reason.</div>
      <div className="card flush">
        <div className="toolbar">
          <button className={`chip ${tab === 'waiting' ? 'on' : ''}`} onClick={() => setTab('waiting')}>Waiting<span className="n">{st.approvals.filter(a => a.status === 'Waiting').length}</span></button>
          <button className={`chip ${tab === 'done' ? 'on' : ''}`} onClick={() => setTab('done')}>Decided<span className="n">{st.approvals.filter(a => a.status !== 'Waiting').length}</span></button>
        </div>
        <div className="list">
          {rows.map(a => (
            <div key={a.id} className="hstack" style={{ gap: 14, padding: '14px 18px', alignItems: 'flex-start' }}>
              <Tile icon={<IconChecks size={18} />} color={a.status === 'Approved' ? '#1f9d5b' : a.status === 'Declined' ? '#d64545' : '#0b6e5c'} size={40} />
              <button className="vstack grow" style={{ gap: 4, border: 0, background: 'none', textAlign: 'left', cursor: 'pointer', padding: 0 }} onClick={() => setSp({ id: a.id }, { replace: true })}>
                <span className="hstack" style={{ gap: 6 }}><Tag tone="grey">{a.kind}</Tag>{a.urgent && a.status === 'Waiting' && <Tag tone="warn">Urgent</Tag>}{a.status !== 'Waiting' && <Tag tone={a.status === 'Approved' ? 'ok' : 'err'}>{a.status} {a.decidedOn}</Tag>}</span>
                <b style={{ fontSize: 14 }}>{a.title}</b>
                <span className="small t2">{a.why}</span>
                <span className="tiny muted">{a.id} · {a.record} · asked by {a.by} ({a.byRole}) · {a.asked}</span>
                {a.note && <span className="small" style={{ color: 'var(--primary-dark)' }}>Your note: {a.note}</span>}
              </button>
              {a.status === 'Waiting' && <span className="hstack" style={{ gap: 8 }}><button className="btn btn-grey btn-sm" onClick={() => setDecide({ id: a.id, ok: false })}><IconX size={15} />Decline</button><button className="btn btn-primary btn-sm" onClick={() => setDecide({ id: a.id, ok: true })}><IconCheck size={15} />Approve</button></span>}
            </div>
          ))}
          {rows.length === 0 && <Empty icon={<IconCircleCheck size={22} />} title={tab === 'waiting' ? 'Nothing waiting' : 'No decisions yet'} sub={tab === 'waiting' ? 'All requests have been decided.' : undefined} />}
        </div>
      </div>
      {open && (
        <Drawer title={open.title} sub={`${open.id} · ${open.kind}`} onClose={close} width={540}
          footer={open.status === 'Waiting' ? <><button className="btn btn-grey" onClick={() => setDecide({ id: open.id, ok: false })}><IconX size={16} />Decline</button><button className="btn btn-primary" onClick={() => setDecide({ id: open.id, ok: true })}><IconCheck size={16} />Approve</button></> : <button className="btn btn-grey" onClick={close}>Close</button>}>
          <Tag tone={open.status === 'Approved' ? 'ok' : open.status === 'Declined' ? 'err' : 'warn'}>{open.status}{open.decidedOn ? ` · ${open.decidedOn}` : ''}</Tag>
          {[['Asked by', `${open.by} (${open.byRole}) · ${open.asked}`], ['Record', open.record], ['The rule', open.rule], ['Why they are asking', open.why], ['If you approve', open.impact], ...(open.note ? [['Your note', open.note]] : [])].map(([k, v]) => <div key={k} className="vstack" style={{ gap: 3 }}><span className="tiny muted">{k}</span><span className="small" style={{ lineHeight: 1.5, fontWeight: k === 'The rule' ? 600 : 400 }}>{v}</span></div>)}
          {open.link && <Link to={open.link} className="link small">Open {open.record}<IconChevronRight size={14} /></Link>}
        </Drawer>
      )}
      {decide && <DecideModal a={st.approvals.find(a => a.id === decide.id)!} ok={decide.ok} onClose={() => { setDecide(null); close(); }} />}
    </>
  );
}
