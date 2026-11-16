// Team (who is working on what, workload and availability), Audit history (every change, read only, export) and My settings.
import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { IconSearch, IconDownload, IconHistory, IconChevronRight, IconSend, IconKey, IconDeviceMobile, IconInfoCircle } from '@tabler/icons-react';
import { PageHead, Card, CardHead, Tag, Avatar, Drawer, Empty, Field, Switch, Modal, useToast } from '../components/ui';
import { useStore } from '../data/store';
import { me } from '../data/biz';
import { PEOPLE, Person } from '../data/director';
import { AskModal } from '../components/director';

const TEAMS = ['All', 'Office', 'Sales', 'Surveyors', 'Fitters · Leicester', 'Fitters · Yorkshire'];
const stTone = (s: Person['status']) => (s === 'Locked out' ? 'warn' : s === 'Off' ? 'grey' : s === 'On site' ? 'jade' : 'ok');

export function Team() {
  const st = useStore();
  const [team, setTeam] = useState('All');
  const [open, setOpen] = useState<Person | null>(null);
  const [ask, setAsk] = useState(false);
  const rows = PEOPLE.filter(p => team === 'All' || p.team === team);
  return (
    <>
      <PageHead title="Team" crumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Team' }]} />
      <div className="alert info"><IconInfoCircle size={18} />Who is doing what this week. Tom Fletcher (System Admin) adds people and changes access.</div>
      <div className="card flush">
        <div className="toolbar">{TEAMS.map(t => <button key={t} className={`chip ${team === t ? 'on' : ''}`} onClick={() => setTeam(t)}>{t}<span className="n">{PEOPLE.filter(p => t === 'All' || p.team === t).length}</span></button>)}</div>
        <table className="tbl">
          <thead><tr><th>Name</th><th>Team</th><th>Workload</th><th>Next</th><th>Today</th><th></th></tr></thead>
          <tbody>
            {rows.map(p => (
              <tr key={p.id} className="click" onClick={() => setOpen(p)}>
                <td><span className="hstack" style={{ gap: 10 }}><Avatar i={p.initials} size={34} /><span className="vstack" style={{ gap: 1 }}><b>{p.name}</b><span className="tiny muted">{p.role}</span></span></span></td>
                <td className="t2">{p.team}</td>
                <td><span className="vstack" style={{ gap: 4, width: 200 }}><span className="tiny t2">{p.load}</span><div className="progress" style={{ height: 6 }}><i style={{ width: `${p.loadPct}%`, background: p.loadPct >= 90 ? '#e0a100' : undefined }} /></div></span></td>
                <td className="t2">{p.next}</td>
                <td><Tag tone={stTone(p.status)}>{p.status}</Tag></td>
                <td><IconChevronRight size={16} color="#6b7a78" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && (
        <Drawer title={open.name} sub={`${open.role} · ${open.team}`} onClose={() => setOpen(null)} width={460}
          footer={<><button className="btn btn-grey" onClick={() => setOpen(null)}>Close</button><button className="btn btn-primary" onClick={() => setAsk(true)}><IconSend size={16} />Send a message</button></>}>
          <div className="hstack" style={{ gap: 12 }}><Avatar i={open.initials} size={56} /><span className="vstack" style={{ gap: 4 }}><b style={{ fontSize: 16 }}>{open.name}</b><Tag tone={stTone(open.status)}>{open.status}</Tag></span></div>
          {[['Workload', open.load], ['Next', open.next], ...(open.note ? [['Note', open.note]] : [])].map(([k, v]) => <div key={k} className="vstack" style={{ gap: 2 }}><span className="tiny muted">{k}</span><b className="small">{v}</b></div>)}
          <div className="vstack" style={{ gap: 4 }}><span className="tiny muted">Busy</span><div className="progress" style={{ height: 8 }}><i style={{ width: `${open.loadPct}%` }} /></div></div>
          {open.role === 'Salesperson' && <Link to="/pipeline" className="link small">See their enquiries in the pipeline<IconChevronRight size={14} /></Link>}
          {/fitter|Apprentice/i.test(open.role) && <Link to="/diary" className="link small">See them in the diary<IconChevronRight size={14} /></Link>}
          {st.asks.filter(a => a.to === open.name).map(a => <span key={a.id} className="small t2">• You asked {a.when}: “{a.text}” ({a.record})</span>)}
        </Drawer>
      )}
      {ask && open && <AskModal record={open.team} to={open.name} about={open.role} onClose={() => setAsk(false)} />}
    </>
  );
}

const AREAS = ['All', 'Sales', 'Jobs', 'Diary', 'Approvals', 'Permissions', 'Users', 'Sign-in', 'Updates', 'Notes', 'Reports'];
const ini = (n: string) => n.split(/[ &]+/).filter(Boolean).map(p => p[0]).join('').slice(0, 2).toUpperCase();
export function Audit() {
  const st = useStore();
  const toast = useToast();
  const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState(sp.get('q') || '');
  const [area, setArea] = useState('All');
  const [days, setDays] = useState('30');
  const rows = st.audit.filter(a => (area === 'All' || a.area === area) && a.day <= +days && (a.who + a.action + a.record + (a.reason || '')).toLowerCase().includes(q.toLowerCase()));
  const open = st.audit.find(a => a.id === sp.get('id'));
  const exportCsv = () => {
    const csv = ['When,Who,What,Record,Area,Where from,Reason', ...rows.map(a => [a.when, a.who, a.action, a.record, a.area, a.source, a.reason || ''].map(v => `"${v.replace(/"/g, '""')}"`).join(','))].join('\n');
    try { const u = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); const l = document.createElement('a'); l.href = u; l.download = 'jadeite-audit-history.csv'; document.body.appendChild(l); l.click(); l.remove(); } catch { /* ignore */ }
    toast(`${rows.length} rows exported`);
  };
  return (
    <>
      <PageHead title="Audit history" crumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Audit history' }]} actions={<button className="btn btn-grey" onClick={exportCsv}><IconDownload size={16} />Export CSV</button>} />
      <div className="card flush">
        <div className="toolbar">
          <div className="input-icon" style={{ width: 280 }}><IconSearch size={16} /><input className="input" style={{ height: 36 }} placeholder="Search person, change or record" value={q} onChange={e => setQ(e.target.value)} /></div>
          <select className="select" aria-label="Area" style={{ width: 160, height: 36 }} value={area} onChange={e => setArea(e.target.value)}>{AREAS.map(a => <option key={a} value={a}>{a === 'All' ? 'All areas' : a}</option>)}</select>
          <select className="select" aria-label="When" style={{ width: 150, height: 36 }} value={days} onChange={e => setDays(e.target.value)}><option value="0">Today</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option></select>
          <span className="small muted" style={{ marginLeft: 'auto' }}>{rows.length} change{rows.length === 1 ? '' : 's'}</span>
        </div>
        <table className="tbl">
          <thead><tr><th>When</th><th>Who</th><th>What changed</th><th>Record</th><th>Where from</th><th></th></tr></thead>
          <tbody>
            {rows.map(a => (
              <tr key={a.id} className="click" onClick={() => setSp({ id: a.id }, { replace: true })}>
                <td className="t2" style={{ whiteSpace: 'nowrap' }}>{a.when}</td>
                <td><span className="hstack" style={{ gap: 8 }}><Avatar i={ini(a.who)} size={28} />{a.who}</span></td>
                <td><span className="vstack" style={{ gap: 2 }}><b>{a.action}</b>{a.reason && <span className="tiny muted">Reason: {a.reason}</span>}</span></td>
                <td className="t2">{a.record}</td>
                <td><Tag tone="grey">{a.source}</Tag></td>
                <td><IconChevronRight size={16} color="#6b7a78" /></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6}><Empty icon={<IconHistory size={22} />} title="No changes found" sub="Try another search or a longer time." /></td></tr>}
          </tbody>
        </table>
      </div>
      {open && (
        <Drawer title={open.action} sub={`${open.when} · ${open.who}`} onClose={() => setSp({}, { replace: true })} width={500} footer={<button className="btn btn-grey" onClick={() => setSp({}, { replace: true })}>Close</button>}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>{[['Who', open.who], ['When', open.when], ['Where from', open.source], ['Area', open.area], ['Record', open.record], ['Reason', open.reason || '—']].map(([k, v]) => <div key={k} className="vstack" style={{ gap: 2 }}><span className="tiny muted">{k}</span><b className="small">{v}</b></div>)}</div>
          <b className="small">Before and after</b>
          {open.before?.length ? <table className="tbl" style={{ border: '1px solid var(--border)', borderRadius: 10 }}><thead><tr><th>What</th><th>Before</th><th>After</th></tr></thead><tbody>{open.before.map(([k, v], i) => { const [b, af] = v.includes(' → ') ? v.split(' → ') : ['—', v]; return <tr key={i}><td className="b">{k}</td><td className="t2" style={{ textDecoration: 'line-through' }}>{b}</td><td style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>{af}</td></tr>; })}</tbody></table> : <span className="small muted">A note of what happened. No values were changed.</span>}
          <span className="tiny muted">Audit entries cannot be edited or deleted.</span>
        </Drawer>
      )}
    </>
  );
}

export function Settings() {
  const st = useStore();
  const toast = useToast();
  const [reset, setReset] = useState(false);
  const p = st.prefs;
  const row = (k: keyof typeof p, t: string, d: string) => <div className="between" style={{ gap: 14, padding: '10px 0' }}><span className="vstack" style={{ gap: 2 }}><b className="small">{t}</b><span className="tiny muted">{d}</span></span><Switch on={p[k]} onChange={v => { st.set('prefs', x => ({ ...x, [k]: v })); toast('Saved'); }} /></div>;
  return (
    <>
      <PageHead title="My settings" crumbs={[{ label: 'Dashboard', to: '/' }, { label: 'My settings' }]} />
      <div className="grid-2" style={{ alignItems: 'start' }}>
        <Card>
          <CardHead title="My details" />
          <div className="hstack" style={{ gap: 14 }}><Avatar i={me.initials} size={56} bg="#00c7a1" fg="#0b1f1b" /><span className="vstack" style={{ gap: 2 }}><b style={{ fontSize: 16 }}>{me.name}</b><span className="small t2">{me.role} · Management</span></span></div>
          <Field label="Work email"><input className="input" value={me.email} disabled /></Field>
          <Field label="Mobile phone"><input className="input" defaultValue={me.phone} /></Field>
          <span className="tiny muted">Tom Fletcher (System Admin) changes your name, email or access.</span>
          <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={() => toast('Your details are saved')}>Save</button>
          <div className="divider" />
          <CardHead title="My sign-in" />
          <div className="hstack" style={{ gap: 12 }}><IconKey size={20} color="#0b6e5c" /><span className="vstack grow" style={{ gap: 1 }}><b className="small">Password</b><span className="tiny muted">Changed 20 Sep</span></span><button className="btn btn-outline btn-sm" onClick={() => toast('We have emailed you a link to change it')}>Change</button></div>
          <div className="hstack" style={{ gap: 12 }}><IconDeviceMobile size={20} color="#0b6e5c" /><span className="vstack grow" style={{ gap: 1 }}><b className="small">Two-step sign-in</b><span className="tiny muted">Authenticator app</span></span><button className="btn btn-outline btn-sm" onClick={() => setReset(true)}>Set up again</button></div>
        </Card>
        <Card>
          <CardHead title="Tell me about" sub="By email and in the bell at the top" />
          <div className="list">
            {row('approvals', 'Requests waiting for my approval', 'Straight away')}
            {row('overdue', 'Payments and jobs that become overdue', 'Once a day')}
            {row('delays', 'Late supplier deliveries', 'Straight away')}
            {row('integ', 'Sync errors with Framepoint, Outlook or Xero', 'Tom fixes these; turn on to be copied in')}
            {row('daily', 'A short summary every morning at 7:30', 'What needs attention today')}
            {row('weekly', 'Weekly report every Monday', 'Sales, jobs and money for last week (PDF)')}
          </div>
        </Card>
      </div>
      {reset && (
        <Modal title="Set up two-step sign-in again" sub="For a new phone" onClose={() => setReset(false)} width={480} footer={<><button className="btn btn-grey" onClick={() => setReset(false)}>Cancel</button><button className="btn btn-primary" onClick={() => { st.log('Set up two-step sign-in again', me.name, 'Sign-in'); toast('Two-step sign-in set up on your new phone'); setReset(false); }}>I have scanned it</button></>}>
          <div className="hstack" style={{ gap: 16 }}>
            <div style={{ width: 120, height: 120, borderRadius: 10, background: 'repeating-conic-gradient(#0b1f1b 0% 25%, #fff 0% 50%) 50% / 20px 20px', border: '8px solid #fff', boxShadow: '0 0 0 1px var(--border)' }} aria-label="QR code" />
            <span className="small t2" style={{ lineHeight: 1.6 }}>1. Open your authenticator app<br />2. Add an account and scan this code<br />3. Your old phone stops working for Jadeite</span>
          </div>
        </Modal>
      )}
    </>
  );
}
