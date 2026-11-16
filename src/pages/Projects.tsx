// Projects (won jobs): owner, next action and due date for every active project, with a full read-only project page for the Director.
import React, { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { IconSearch, IconChevronRight, IconSend, IconCheck, IconTruck, IconCalendarEvent, IconTool, IconCurrencyPound, IconUsers, IconHistory, IconBriefcase, IconChecks, IconDownload } from '@tabler/icons-react';
import { PageHead, Card, CardHead, Tag, Avatar, Photo, Empty, Tile, useToast } from '../components/ui';
import { useStore } from '../data/store';
import { IMG, staffById } from '../data/biz';
import { PSTAGES } from '../data/director';
import { AskModal, AskedTag, Notes, FlagTag, gbp } from '../components/director';

const invTone = (s: string) => (s === 'Paid' ? 'ok' : s === 'Overdue' ? 'err' : s === 'Due' ? 'warn' : s === 'On hold' ? 'info' : 'grey');

export default function Projects() {
  const st = useStore();
  const nav = useNavigate();
  const toast = useToast();
  const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState('');
  const f = sp.get('f') || 'active';
  const rows = st.projects.filter(p => (f === 'all' || (f === 'active' ? p.stage !== 'Complete' || !!p.flag : f === 'flag' ? !!p.flag : p.stage === f)) && (p.customer + p.id + p.address + p.products).toLowerCase().includes(q.toLowerCase()));
  const exportCsv = () => {
    const csv = ['Job,Customer,Stage,Owner,Next action,Due,Value,Paid', ...rows.map(p => [p.id, p.customer, p.stage, p.owner, p.next, p.due, p.value, p.invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amount, 0)].map(v => `"${v}"`).join(','))].join('\n');
    try { const u = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); const a = document.createElement('a'); a.href = u; a.download = 'jadeite-projects.csv'; document.body.appendChild(a); a.click(); a.remove(); } catch { /* ignore */ }
    toast(`${rows.length} projects exported`);
  };
  return (
    <>
      <PageHead title="Projects" crumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Projects' }]} actions={<button className="btn btn-grey" onClick={exportCsv}><IconDownload size={16} />Export</button>} />
      <div className="card flush">
        <div className="toolbar">
          <div className="input-icon" style={{ width: 260 }}><IconSearch size={16} /><input className="input" style={{ height: 36 }} placeholder="Search customer, job or address" value={q} onChange={e => setQ(e.target.value)} /></div>
          {[['active', 'Active'], ['flag', 'Needs attention'], ...PSTAGES.map(s => [s, s]), ['all', 'All']].map(([id, l]) => <button key={id} className={`chip ${f === id ? 'on' : ''}`} onClick={() => setSp({ f: id }, { replace: true })}>{l}<span className="n">{st.projects.filter(p => id === 'all' || (id === 'active' ? p.stage !== 'Complete' || !!p.flag : id === 'flag' ? !!p.flag : p.stage === id)).length}</span></button>)}
        </div>
        <table className="tbl">
          <thead><tr><th>Project</th><th>Stage</th><th>Owner</th><th>Next action</th><th>Due</th><th>Value</th><th>Paid</th><th></th></tr></thead>
          <tbody>
            {rows.map(p => {
              const paid = p.invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
              return (
                <tr key={p.id} className="click" onClick={() => nav(`/projects/${p.id}`)}>
                  <td><div className="hstack" style={{ gap: 10 }}><Photo src={IMG[p.photo]} w={40} h={40} r={8} /><div className="vstack" style={{ gap: 2 }}><b>{p.customer}</b><span className="tiny muted">{p.id} · {p.products}</span></div></div></td>
                  <td><span className="vstack" style={{ gap: 4, alignItems: 'flex-start' }}><Tag tone={p.stage === 'Complete' ? 'ok' : 'jade'}>{p.stage}</Tag><FlagTag flag={p.flag} /></span></td>
                  <td className="t2">{p.owner}</td>
                  <td><span className="vstack" style={{ gap: 2 }}><span>{p.next}</span>{p.flagWhy && <span className="tiny" style={{ color: 'var(--err)' }}>{p.flagWhy}</span>}<AskedTag record={p.id} /></span></td>
                  <td style={{ color: p.due === 'Overdue' ? 'var(--err)' : undefined, fontWeight: p.due === 'Overdue' ? 600 : 400 }}>{p.due}</td>
                  <td className="b">{gbp(p.value)}</td>
                  <td><span className="vstack" style={{ gap: 4, width: 90 }}><span className="tiny t2">{Math.round((paid / p.value) * 100)}%</span><div className="progress" style={{ height: 6 }}><i style={{ width: `${(paid / p.value) * 100}%` }} /></div></span></td>
                  <td><IconChevronRight size={16} color="#6b7a78" /></td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={8}><Empty icon={<IconBriefcase size={22} />} title="No projects here" /></td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function ProjectDetail() {
  const { id } = useParams();
  const st = useStore();
  const [ask, setAsk] = useState(false);
  const p = st.projects.find(x => x.id === id);
  if (!p) return <Empty icon={<IconBriefcase size={22} />} title="Project not found" action={<Link to="/projects" className="btn btn-primary btn-sm">Back to projects</Link>} />;
  const paid = p.invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
  const at = PSTAGES.indexOf(p.stage);
  const appr = st.approvals.filter(a => a.record.startsWith(p.id));
  const asks = st.asks.filter(a => a.record === p.id);
  const audit = st.audit.filter(a => a.record.includes(p.id)).slice(0, 5);
  return (
    <>
      <PageHead title={p.customer} crumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Projects', to: '/projects' }, { label: p.id }]} actions={<button className="btn btn-primary" onClick={() => setAsk(true)}><IconSend size={16} />Ask {p.owner.split(' ')[0]} for an update</button>} />
      {p.flag && <div className={`alert ${p.flag === 'Overdue' || p.flag === 'Blocked' ? 'err' : 'warn'}`}><b>{p.flag}:</b>&nbsp;{p.flagWhy} · next: {p.next} ({p.owner})</div>}
      {appr.filter(a => a.status === 'Waiting').map(a => <div key={a.id} className="alert info"><IconChecks size={18} /><span className="grow">Waiting for your decision: {a.title}</span><Link to={`/approvals?id=${a.id}`} className="btn btn-primary btn-sm">Decide</Link></div>)}
      <div className="row">
        <div className="col grow">
          <Card>
            <div className="hstack" style={{ gap: 16 }}>
              <Photo src={IMG[p.photo]} w={120} h={90} r={10} />
              <div className="vstack grow" style={{ gap: 4 }}><b style={{ fontSize: 18 }}>{p.products}</b><span className="t2">{p.id} · {p.address}</span><span className="hstack" style={{ gap: 8 }}><Tag tone={p.stage === 'Complete' ? 'ok' : 'jade'}>{p.stage}</Tag><FlagTag flag={p.flag} /><AskedTag record={p.id} /></span></div>
              <div className="vstack" style={{ gap: 2, textAlign: 'right' }}><span className="tiny muted">Value</span><b style={{ fontSize: 20 }}>{gbp(p.value)}</b><span className="tiny muted">Won {p.won}</span></div>
            </div>
            <div className="hstack" style={{ gap: 6 }}>
              {PSTAGES.map((s, i) => (
                <div key={s} className="vstack" style={{ flex: 1, gap: 6 }}>
                  <div style={{ height: 6, borderRadius: 3, background: i < at || p.stage === 'Complete' ? 'var(--primary-dark)' : i === at ? 'var(--primary)' : 'var(--border)' }} />
                  <span className="tiny" style={{ color: i <= at ? 'var(--text)' : 'var(--muted)', fontWeight: i === at ? 700 : 400 }}>{s}</span>
                </div>
              ))}
            </div>
          </Card>
          <div className="grid-2">
            <Card>
              <CardHead title="Next action" />
              <div className="hstack" style={{ gap: 12 }}><Tile icon={<IconCheck size={18} />} size={38} /><span className="vstack" style={{ gap: 2 }}><b className="small">{p.next}</b><span className="tiny muted">Owner {p.owner} · due {p.due}</span></span></div>
              <div className="divider" />
              {[[IconTruck, 'Order and delivery', `${p.supplier} ${p.orderRef} · ${p.delivery.status}${p.delivery.expected !== '—' ? ` · ${p.delivery.expected}` : ''}`], [IconCalendarEvent, 'Fitting', p.install], [IconUsers, 'Fitters', p.fitters.join(', ') || 'Not booked'], [IconUsers, 'Sales and survey', `${staffById(p.sales)?.name || '—'} · ${staffById(p.surveyor)?.name || 'no surveyor yet'}`], [IconTool, 'Snags', p.snags.length ? p.snags.map(s => `${s.title} (${s.status})`).join(', ') : 'None']].map(([I, k, v]: any) => (
                <div key={k} className="hstack" style={{ gap: 12, alignItems: 'flex-start' }}><I size={18} color="#0b6e5c" style={{ marginTop: 2 }} /><span className="vstack" style={{ gap: 1 }}><span className="tiny muted">{k}</span><b className="small">{v}</b></span></div>
              ))}
            </Card>
            <Card>
              <CardHead title="Money" sub="From Xero" right={<Tag tone="grey">Customer portal: {p.portal}</Tag>} />
              <div className="between"><span className="small t2">Paid {gbp(paid)} of {gbp(p.value)}</span><b>{Math.round((paid / p.value) * 100)}%</b></div>
              <div className="progress" style={{ height: 8 }}><i style={{ width: `${(paid / p.value) * 100}%` }} /></div>
              <div className="list">
                {p.invoices.map((i, k) => <div key={k} className="between" style={{ padding: '9px 0' }}><span className="vstack" style={{ gap: 1 }}><b className="small">{i.type}</b><span className="tiny muted">{i.ref} · {i.due}</span></span><span className="hstack" style={{ gap: 8 }}><b className="small">{gbp(i.amount)}</b><Tag tone={invTone(i.status)}>{i.status}</Tag></span></div>)}
              </div>
            </Card>
          </div>
          <Card>
            <CardHead title="What has happened" sub="From every portal and phone app" />
            <div className="timeline">{p.timeline.map((t, i) => <div key={i} className="tl-item"><Tile icon={<IconHistory size={14} />} size={28} radius={14} /><span className="vstack" style={{ gap: 2, paddingTop: 3 }}><b style={{ fontSize: 13 }}>{t.text}</b><span className="tiny muted">{t.who} · {t.when}</span></span></div>)}</div>
          </Card>
        </div>
        <div className="col" style={{ width: 360, flex: '0 0 360px' }}>
          <Card>
            <CardHead title="Updates you asked for" />
            {asks.length === 0 ? <span className="small muted">None yet.</span> : asks.map(a => <div key={a.id} className="vstack small" style={{ gap: 2 }}><b>To {a.to}</b><span className="t2">“{a.text}”</span><span className="tiny muted">{a.when} · waiting for a reply</span></div>)}
            <button className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => setAsk(true)}><IconSend size={15} />Ask for an update</button>
          </Card>
          <Card><CardHead title="Private notes" sub="Staff only · never shown to the customer" /><Notes record={p.id} /></Card>
          <Card>
            <CardHead title="Decisions and changes" right={<Link to={`/audit?q=${p.id}`} className="link">All</Link>} />
            {appr.map(a => <Link key={a.id} to={`/approvals?id=${a.id}`} className="hstack small" style={{ gap: 8 }}><Tag tone={a.status === 'Approved' ? 'ok' : a.status === 'Declined' ? 'err' : 'warn'}>{a.status}</Tag><span className="grow">{a.title}</span></Link>)}
            {audit.map(a => <span key={a.id} className="vstack" style={{ gap: 1 }}><b className="small">{a.who} · {a.action}</b><span className="tiny muted">{a.when}</span></span>)}
            {!appr.length && !audit.length && <span className="small muted">Nothing recorded yet.</span>}
          </Card>
          <Card style={{ background: 'var(--tint)', borderColor: '#cfeee4' }}><span className="hstack small t2" style={{ gap: 8 }}><IconCurrencyPound size={16} color="#0b6e5c" />The office runs this project. You can see everything, ask for updates and approve exceptions.</span></Card>
        </div>
      </div>
      {ask && <AskModal record={p.id} to={p.owner} about={p.customer} onClose={() => setAsk(false)} />}
      <span style={{ display: 'none' }}><Avatar i="" /></span>
    </>
  );
}
