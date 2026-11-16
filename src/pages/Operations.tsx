// Installation diary (week view by fitter, ready-to-book queue) and Deliveries (due and late arrivals from the office's order dates).
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconChevronLeft, IconChevronRight, IconCalendarOff, IconSend, IconTruck, IconInfoCircle, IconChecks } from '@tabler/icons-react';
import { PageHead, Card, CardHead, Tag, Drawer, Avatar, Tile, Empty } from '../components/ui';
import { useStore } from '../data/store';
import { FITTERS, DEvent, TODAY } from '../data/director';
import { AskModal, AskedTag, Def } from '../components/director';
import { addD } from './Dashboard';

const WEEKS = ['2026-10-12', '2026-10-19', '2026-10-26'];
const fmt = (s: string, o: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric' }) => new Date(s + 'T12:00:00').toLocaleDateString('en-GB', o);
const ini = (n: string) => n.split(' ').map(x => x[0]).join('');

export function Diary() {
  const st = useStore();
  const nav = useNavigate();
  const [w, setW] = useState(0);
  const [open, setOpen] = useState<DEvent | null>(null);
  const days = Array.from({ length: 6 }, (_, i) => addD(WEEKS[w], i));
  const on = (who: string, d: string) => st.diary.filter(ev => ev.who.includes(who) && ev.date <= d && addD(ev.date, ev.days - 1) >= d);
  const ready = st.projects.filter(p => (p.stage === 'Ready to book' && p.install === 'Not booked') || p.stage === 'Final survey' || (p.delivery.late && p.install.startsWith('Not')));
  const pending = st.approvals.filter(a => a.status === 'Waiting' && (a.kind === 'Diary clash' || a.kind === 'Installation override'));
  return (
    <>
      <PageHead title="Installation diary" crumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Installation diary' }]}
        actions={<span className="hstack" style={{ gap: 8 }}><button className="icon-btn" aria-label="Previous week" disabled={w === 0} onClick={() => setW(w - 1)}><IconChevronLeft size={18} /></button><b className="small" style={{ minWidth: 170, textAlign: 'center' }}>Week of {fmt(WEEKS[w], { day: 'numeric', month: 'long' })}</b><button className="icon-btn" aria-label="Next week" disabled={w === WEEKS.length - 1} onClick={() => setW(w + 1)}><IconChevronRight size={18} /></button><button className="btn btn-grey btn-sm" onClick={() => setW(0)}>This week</button></span>} />
      <div className="alert info"><IconInfoCircle size={18} />The office books the diary. You can see who is where, and approve bookings that break a rule.</div>
      {pending.map(a => <div key={a.id} className="alert warn"><IconChecks size={18} /><span className="grow">Waiting for you: {a.title}</span><Link to={`/approvals?id=${a.id}`} className="btn btn-primary btn-sm">Decide</Link></div>)}
      <div className="vstack" style={{ gap: 20 }}>
        <Card className="flush">
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl" style={{ tableLayout: 'fixed', minWidth: 900 }}>
              <thead><tr><th style={{ width: 170 }}>Fitter</th>{days.map(d => <th key={d} style={{ background: d === TODAY ? 'var(--tint)' : undefined }}>{fmt(d)}{d === TODAY && <span className="tiny" style={{ color: 'var(--primary-dark)' }}> · today</span>}</th>)}</tr></thead>
              <tbody>
                {FITTERS.map(f => (
                  <tr key={f}>
                    <td><span className="hstack" style={{ gap: 8 }}><Avatar i={ini(f)} size={28} /><b className="small">{f}</b></span></td>
                    {days.map(d => {
                      const evs = on(f, d);
                      return (
                        <td key={d} style={{ padding: 6, verticalAlign: 'top', background: d === TODAY ? '#f7fcfa' : undefined }}>
                          {evs.map(ev => (
                            <button key={ev.id} onClick={() => setOpen(ev)} title={ev.title} style={{ display: 'block', width: '100%', textAlign: 'left', border: 0, cursor: 'pointer', borderRadius: 6, padding: '5px 7px', marginBottom: 4, fontSize: 11.5, lineHeight: 1.3, background: ev.kind === 'Leave' ? '#eef2f1' : ev.color, color: ev.kind === 'Leave' ? 'var(--text-2)' : '#fff', fontWeight: 600 }}>
                              {ev.title}{ev.days > 1 ? ` · day ${Math.round((new Date(d).getTime() - new Date(ev.date).getTime()) / 86400000) + 1}/${ev.days}` : ''}
                            </button>
                          ))}
                          {!evs.length && <span className="tiny muted">Free</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="hstack tiny muted" style={{ gap: 14, padding: '10px 16px' }}>{[['Installation', '#0b6e5c'], ['Return visit', '#e0a100'], ['Workshop', '#7a8f8b'], ['Leave', '#eef2f1']].map(([l, c]) => <span key={l} className="hstack" style={{ gap: 6 }}><i style={{ width: 10, height: 10, borderRadius: 3, background: c, display: 'inline-block' }} />{l}</span>)}</div>
        </Card>
        <div className="grid-2">
          <Card>
            <CardHead title="Not booked yet" sub="Ready to fit, or waiting for something" right={<Def k="unscheduled" />} />
            {ready.length === 0 && <span className="small muted">Everything that is ready is booked.</span>}
            {ready.map(p => (
              <Link key={p.id} to={`/projects/${p.id}`} className="hstack" style={{ gap: 10 }}>
                <Tile icon={<IconCalendarOff size={17} />} color={p.stage === 'Ready to book' ? '#e0a100' : '#6b7a78'} size={34} />
                <span className="vstack grow" style={{ gap: 1 }}><b className="small">{p.customer}</b><span className="tiny muted">{p.stage === 'Ready to book' ? 'Frames arrived · ready to fit' : p.stage === 'Final survey' ? 'Needs a final survey first' : 'Waiting for the delivery'}</span></span>
                <AskedTag record={p.id} />
              </Link>
            ))}
          </Card>
          <Card>
            <CardHead title="This week" />
            {[['Fitting days booked', String(days.reduce((s, d) => s + FITTERS.filter(f => on(f, d).some(e => e.kind === 'Installation' || e.kind === 'Return visit')).length, 0))], ['Fitter days free', String(days.slice(0, 5).reduce((s, d) => s + FITTERS.filter(f => !on(f, d).length).length, 0))], ['On leave', String(days.reduce((s, d) => s + FITTERS.filter(f => on(f, d).some(e => e.kind === 'Leave')).length, 0)) + ' days']].map(([k, v]) => <div key={k} className="between small"><span className="t2">{k}</span><b>{v}</b></div>)}
          </Card>
        </div>
      </div>
      {open && (
        <Drawer title={open.title} sub={`${open.kind} · ${fmt(open.date, { weekday: 'long', day: 'numeric', month: 'long' })}${open.days > 1 ? ` · ${open.days} days` : ''}`} onClose={() => setOpen(null)} width={460}
          footer={<><button className="btn btn-grey" onClick={() => setOpen(null)}>Close</button>{open.job && <button className="btn btn-primary" onClick={() => nav(`/projects/${open.job}`)}>Open the project</button>}</>}>
          <div className="vstack" style={{ gap: 4 }}><span className="tiny muted">Who</span>{open.who.map(n => <span key={n} className="hstack small" style={{ gap: 8 }}><Avatar i={ini(n)} size={26} />{n}</span>)}</div>
          {open.job && <div className="vstack" style={{ gap: 2 }}><span className="tiny muted">Project</span><b className="small">{open.job}</b></div>}
          <span className="small t2">Booked by Sarah Mitchell in the Office Admin. It is in each fitter’s phone app and Outlook calendar.</span>
        </Drawer>
      )}
    </>
  );
}

export function Deliveries() {
  const st = useStore();
  const [f, setF] = useState('open');
  const [ask, setAsk] = useState<string | null>(null);
  const rows = st.projects.filter(p => p.orderRef !== '—').filter(p => f === 'all' || (f === 'late' ? !!p.delivery.late : f === 'open' ? p.delivery.status !== 'Arrived' : p.delivery.status === 'Arrived'));
  const p = st.projects.find(x => x.id === ask);
  return (
    <>
      <PageHead title="Deliveries" crumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Deliveries' }]} actions={<span className="hstack small t2" style={{ gap: 4 }}>How lateness is counted<Def k="delays" /></span>} />
      <div className="alert info"><IconInfoCircle size={18} />The office enters each supplier order and its expected date. There is no link to the suppliers, so these dates are what the office was told.</div>
      <div className="card flush">
        <div className="toolbar">{[['open', 'Due'], ['late', 'Late'], ['arrived', 'Arrived'], ['all', 'All']].map(([id, l]) => <button key={id} className={`chip ${f === id ? 'on' : ''}`} onClick={() => setF(id)}>{l}<span className="n">{st.projects.filter(x => x.orderRef !== '—').filter(x => id === 'all' || (id === 'late' ? !!x.delivery.late : id === 'open' ? x.delivery.status !== 'Arrived' : x.delivery.status === 'Arrived')).length}</span></button>)}</div>
        <table className="tbl">
          <thead><tr><th>Order</th><th>Project</th><th>Supplier</th><th>Expected</th><th>Status</th><th>Fitting</th><th style={{ textAlign: 'right' }}></th></tr></thead>
          <tbody>
            {rows.map(x => (
              <tr key={x.id}>
                <td><span className="hstack" style={{ gap: 10 }}><Tile icon={<IconTruck size={17} />} color={x.delivery.late ? '#d64545' : '#0b6e5c'} size={34} /><b>{x.orderRef}</b></span></td>
                <td><Link to={`/projects/${x.id}`} className="vstack" style={{ gap: 1 }}><b className="small">{x.customer}</b><span className="tiny muted">{x.id} · {x.products}</span></Link></td>
                <td className="t2">{x.supplier}</td>
                <td className="t2">{x.delivery.expected}</td>
                <td><Tag tone={x.delivery.late ? 'err' : x.delivery.status === 'Arrived' ? 'ok' : 'info'}>{x.delivery.late ? `${x.delivery.late} days late` : x.delivery.status}</Tag></td>
                <td className="t2">{x.install}</td>
                <td style={{ textAlign: 'right' }}>{x.delivery.status !== 'Arrived' ? <span className="hstack" style={{ gap: 6, justifyContent: 'flex-end' }}><AskedTag record={x.id} /><button className="btn btn-outline btn-sm" onClick={() => setAsk(x.id)}><IconSend size={15} />Ask for an update</button></span> : null}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={7}><Empty icon={<IconTruck size={22} />} title="Nothing here" /></td></tr>}
          </tbody>
        </table>
      </div>
      {p && <AskModal record={p.id} to={p.owner} about={`${p.supplier} delivery · ${p.customer}`} onClose={() => setAsk(null)} />}
    </>
  );
}
