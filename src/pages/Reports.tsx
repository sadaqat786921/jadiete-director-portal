// Reports: Sales, Jobs and diary, Money (from Xero) and Team. Agreed definitions on every number, drill down to the records, export and print.
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { IconDownload, IconPrinter, IconTrendingUp, IconCircleCheck, IconClock, IconTool, IconCurrencyPound, IconAlertTriangle, IconPlayerPause, IconBriefcase, IconChevronRight } from '@tabler/icons-react';
import { PageHead, Card, CardHead, Tabs, Tile, Tag, useToast } from '../components/ui';
import { BarChart, Donut, HBars } from '../components/charts';
import { useStore } from '../data/store';
import { salesByMonth, enquirySources, salespeople, staffById } from '../data/biz';
import { CASH_BY_MONTH, FITTERS, PSTAGES, DEFS } from '../data/director';
import { Def, gbp, money } from '../components/director';
import { useNumbers, addD } from './Dashboard';

const PERIODS = ['This month', 'Last 3 months', 'This year'];
const LOST = [['Price — chose a cheaper quote', 4], ['Went with another company', 2], ['Not going ahead for now', 2], ['No reply after follow-ups', 1]] as [string, number][];

function Kpi({ l, v, sub, I, c, k }: { l: string; v: string; sub: string; I: any; c: string; k?: keyof typeof DEFS }) {
  return <div className="card" style={{ flexDirection: 'row', gap: 14, alignItems: 'center', padding: 16 }}><Tile icon={<I size={22} />} color={c} size={48} /><div className="vstack grow" style={{ gap: 2 }}><span className="small t2 hstack" style={{ gap: 2 }}>{l}{k && <Def k={k} />}</span><b style={{ fontSize: 20 }}>{v}</b><span className="tiny muted">{sub}</span></div></div>;
}

export default function Reports() {
  const st = useStore();
  const toast = useToast();
  const nav = useNavigate();
  const [sp, setSp] = useSearchParams();
  const tab = sp.get('tab') || 'sales';
  const [period, setPeriod] = useState(PERIODS[0]);
  const n = useNumbers();
  const mult = period === 'This month' ? 1 : period === 'Last 3 months' ? 3 : 10;
  const days = Array.from({ length: 10 }, (_, i) => addD('2026-10-19', i + (i >= 5 ? 2 : 0)));
  const booked = (f: string) => days.filter(d => st.diary.some(ev => ev.who.includes(f) && (ev.kind === 'Installation' || ev.kind === 'Return visit') && ev.date <= d && addD(ev.date, ev.days - 1) >= d)).length;
  const exportCsv = () => {
    let rows: (string | number)[][] = [];
    if (tab === 'sales') rows = [['Enquiry', 'Customer', 'Stage', 'Salesperson', 'Value'], ...st.enquiries.map(e => [e.id, e.name, e.stage, staffById(e.assigned)?.name || '', e.value])];
    if (tab === 'jobs') rows = [['Job', 'Customer', 'Stage', 'Owner', 'Next action', 'Due'], ...st.projects.map(p => [p.id, p.customer, p.stage, p.owner, p.next, p.due])];
    if (tab === 'money') rows = [['Invoice', 'Job', 'Customer', 'Type', 'Amount', 'Status', 'Due'], ...n.invs.map(i => [i.ref, i.job, i.customer, i.type, i.amount, i.status, i.due])];
    if (tab === 'team') rows = [['Person', 'Role', 'Measure'], ...salespeople.map(s => [s.name, 'Salesperson', st.enquiries.filter(e => e.assigned === s.id).length + ' enquiries']), ...FITTERS.map(f => [f, 'Fitter', booked(f) + ' days booked'])];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    try { const u = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); const a = document.createElement('a'); a.href = u; a.download = `jadeite-${tab}-report.csv`; document.body.appendChild(a); a.click(); a.remove(); } catch { /* ignore */ }
    st.log('Exported a report', `${tab} · ${period}`, 'Reports'); toast(`${tab === 'money' ? 'Money' : tab.charAt(0).toUpperCase() + tab.slice(1)} report exported`);
  };
  const outstanding = n.invs.filter(i => ['Due', 'Overdue', 'On hold'].includes(i.status));
  return (
    <>
      <PageHead title="Reports" crumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Reports' }]}
        actions={<><select className="select" aria-label="Period" style={{ width: 160 }} value={period} onChange={e => setPeriod(e.target.value)}>{PERIODS.map(p => <option key={p}>{p}</option>)}</select><button className="btn btn-grey" onClick={() => { try { window.print(); } catch { /* ignore */ } toast('Opening print'); }}><IconPrinter size={16} />Print</button><button className="btn btn-primary" onClick={exportCsv}><IconDownload size={16} />Export CSV</button></>} />
      <Tabs value={tab} onChange={v => setSp({ tab: v }, { replace: true })} items={[{ id: 'sales', label: 'Sales' }, { id: 'jobs', label: 'Jobs and diary' }, { id: 'money', label: 'Money' }, { id: 'team', label: 'Team' }]} />
      {tab === 'sales' && (
        <>
          <div className="grid-4">
            <Kpi l="Enquiries" v={String(34 * mult)} sub={`${period} · +9% on last year`} I={IconTrendingUp} c="#0b6e5c" />
            <Kpi l="Win rate" v={`${n.rate}%`} sub="Won ÷ (won + lost)" I={IconCircleCheck} c="#1f9d5b" k="conversion" />
            <Kpi l="Value won" v={money((n.wonOct.reduce((s, p) => s + p.value, 0)) * (mult === 1 ? 1 : mult * 0.9))} sub={period} I={IconCurrencyPound} c="#e0a100" k="won" />
            <Kpi l="Open pipeline" v={money(n.pipeline)} sub={`${n.open.length} open enquiries`} I={IconBriefcase} c="#2f6fde" k="pipeline" />
          </div>
          <div className="row">
            <Card className="grow"><CardHead title="Quoted and won by month" sub="£ thousands" /><BarChart data={salesByMonth} height={250} /></Card>
            <Card style={{ width: 360, flex: '0 0 360px' }}>
              <CardHead title="Where enquiries come from" />
              <div style={{ display: 'grid', placeItems: 'center' }}><Donut parts={enquirySources.map((s, i) => ({ v: s.n, c: ['#00c7a1', '#0b6e5c', '#e0a100', '#b7c2bf'][i] }))} size={160} thickness={28} center={String(enquirySources.reduce((s, x) => s + x.n, 0))} sub="enquiries" /></div>
              {enquirySources.map((s, i) => <div key={s.name} className="between small"><span className="hstack" style={{ gap: 6 }}><i style={{ width: 9, height: 9, borderRadius: 5, display: 'inline-block', background: ['#00c7a1', '#0b6e5c', '#e0a100', '#b7c2bf'][i] }} />{s.name}</span><b>{s.n} · {s.pct}%</b></div>)}
            </Card>
          </div>
          <div className="row">
            <Card className="grow"><CardHead title="Why deals were lost" sub={period} /><HBars rows={LOST.map(([l, v]) => ({ label: l, value: v, max: 5, right: `${v}`, color: '#d64545' }))} /></Card>
            <Card className="grow flush">
              <div style={{ padding: '18px 18px 8px' }}><CardHead title="Salespeople" right={<Link to="/pipeline" className="link">Pipeline</Link>} /></div>
              <table className="tbl"><thead><tr><th>Name</th><th>Open</th><th>Open value</th><th>Won</th><th>Win rate</th></tr></thead><tbody>
                {salespeople.map((s, i) => { const op = st.enquiries.filter(e => e.assigned === s.id && e.stage !== 'Won' && e.stage !== 'Lost'); return <tr key={s.id} className="click" onClick={() => nav('/pipeline')}><td className="b">{s.name}</td><td>{op.length}</td><td>{money(op.reduce((a, e) => a + e.value, 0))}</td><td>{[11, 6, 4][i] * (mult === 1 ? 1 : mult)}</td><td>{['78%', '55%', '44%'][i]}</td></tr>; })}
              </tbody></table>
            </Card>
          </div>
        </>
      )}
      {tab === 'jobs' && (
        <>
          <div className="grid-4">
            <Kpi l="Active projects" v={String(st.projects.filter(p => p.stage !== 'Complete').length)} sub="Won and not finished" I={IconBriefcase} c="#0b6e5c" />
            <Kpi l="Finished" v={String(2 * mult)} sub={period} I={IconCircleCheck} c="#1f9d5b" />
            <Kpi l="Days from order to fitting" v="16" sub="Average" I={IconClock} c="#e0a100" />
            <Kpi l="Open snags" v={String(st.projects.flatMap(p => p.snags).filter(s => s.status !== 'Fixed').length)} sub="Waiting for the customer to confirm" I={IconTool} c="#d64545" k="snags" />
          </div>
          <div className="row">
            <Card className="grow"><CardHead title="Average days in each step" /><HBars rows={[['Won to final survey', 4], ['Survey to order', 3], ['Order to delivery', 13], ['Delivery to fitting', 6], ['Fitting to sign-off', 2], ['Snags fixed', 7]].map(([l, v]) => ({ label: l as string, value: v as number, max: 14, right: `${v} days` }))} /></Card>
            <Card style={{ width: 360, flex: '0 0 360px' }}><CardHead title="Fitter workload" sub="Days booked in the next 2 weeks" right={<Def k="workload" />} /><HBars rows={FITTERS.map(f => ({ label: f, value: booked(f), max: 10, right: `${booked(f)} of 10` }))} /></Card>
          </div>
          <Card className="flush">
            <div style={{ padding: '18px 18px 8px' }}><CardHead title="Projects by stage" /></div>
            <table className="tbl"><thead><tr><th>Stage</th><th>Projects</th><th>Value</th><th>Needing attention</th><th></th></tr></thead><tbody>
              {PSTAGES.map(s => { const ps = st.projects.filter(p => p.stage === s); return <tr key={s} className="click" onClick={() => nav(`/projects?f=${encodeURIComponent(s)}`)}><td className="b">{s}</td><td>{ps.length}</td><td>{gbp(ps.reduce((a, p) => a + p.value, 0))}</td><td>{ps.filter(p => p.flag).length ? <Tag tone="warn">{ps.filter(p => p.flag).length}</Tag> : '—'}</td><td><IconChevronRight size={16} color="#6b7a78" /></td></tr>; })}
            </tbody></table>
          </Card>
        </>
      )}
      {tab === 'money' && (
        <>
          <div className="alert info small"><IconCurrencyPound size={16} />Money comes from Xero. Xero stays the accounting system; these numbers update every 15 minutes.</div>
          <div className="grid-4">
            <Kpi l="Received in October" v="£31,000" sub="Deposits and payments" I={IconCurrencyPound} c="#1f9d5b" />
            <Kpi l="Still to collect" v={gbp(n.toCollect)} sub={`${outstanding.length} invoices`} I={IconClock} c="#e0a100" k="outstanding" />
            <Kpi l="Overdue" v={gbp(n.overdueMoney)} sub={`${n.invs.filter(i => i.status === 'Overdue').length} invoice`} I={IconAlertTriangle} c="#d64545" />
            <Kpi l="On hold" v={gbp(n.invs.filter(i => i.status === 'On hold').reduce((s, i) => s + i.amount, 0))} sub="Until snags are confirmed" I={IconPlayerPause} c="#2f6fde" />
          </div>
          <div className="row">
            <Card className="grow">
              <CardHead title="Money received by month" sub="£ thousands · October so far" />
              <div className="hstack" style={{ alignItems: 'flex-end', gap: 18, height: 200, padding: '0 10px' }}>
                {CASH_BY_MONTH.map((m, i) => <div key={m.m} className="vstack" style={{ flex: 1, alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}><b className="tiny">£{m.v}k</b><div style={{ width: '100%', maxWidth: 52, height: `${(m.v / 60) * 100}%`, background: i === CASH_BY_MONTH.length - 1 ? '#00c7a1' : '#0b6e5c', borderRadius: '6px 6px 0 0' }} /><span className="tiny muted">{m.m}</span></div>)}
              </div>
            </Card>
            <Card className="grow flush">
              <div style={{ padding: '18px 18px 8px' }}><CardHead title="Still to collect" /></div>
              <table className="tbl"><thead><tr><th>Invoice</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead><tbody>
                {outstanding.map(i => <tr key={i.ref + i.job} className="click" onClick={() => nav(`/projects/${i.job}`)}><td><span className="vstack" style={{ gap: 1 }}><b className="small">{i.ref}</b><span className="tiny muted">{i.type} · due {i.due}</span></span></td><td className="t2">{i.customer}</td><td className="b">{gbp(i.amount)}</td><td><Tag tone={i.status === 'Overdue' ? 'err' : i.status === 'On hold' ? 'info' : 'warn'}>{i.status}</Tag></td></tr>)}
              </tbody></table>
            </Card>
          </div>
        </>
      )}
      {tab === 'team' && (
        <div className="grid-2">
          <Card className="flush">
            <div style={{ padding: '18px 18px 8px' }}><CardHead title="Sales" sub={period} /></div>
            <table className="tbl"><thead><tr><th>Name</th><th>Enquiries</th><th>Quotes sent</th><th>Won</th><th>Value won</th></tr></thead><tbody>
              {salespeople.map((s, i) => <tr key={s.id}><td className="b">{s.name}</td><td>{[14, 12, 9][i] * mult}</td><td>{[11, 9, 7][i] * mult}</td><td>{[11, 6, 4][i] * mult}</td><td className="b">{money([84200, 41800, 26300][i] * mult)}</td></tr>)}
            </tbody></table>
          </Card>
          <Card className="flush">
            <div style={{ padding: '18px 18px 8px' }}><CardHead title="Surveys and fitting" sub={period} /></div>
            <table className="tbl"><thead><tr><th>Name</th><th>Role</th><th>Done</th><th>Sizes changed</th></tr></thead><tbody>
              {[['Priya Shah', 'Surveyor', 12, 1], ['Rob King', 'Surveyor', 9, 0], ['Amir Khan', 'Lead fitter', 6, '1 snag'], ['Dan Hughes', 'Lead fitter', 5, '0 snags'], ['Tom Wright', 'Lead fitter', 3, '1 snag']].map(([a, b, c, d]) => <tr key={a as string}><td className="b">{a}</td><td className="t2">{b}</td><td>{(c as number) * mult}</td><td className="t2">{d}</td></tr>)}
            </tbody></table>
          </Card>
        </div>
      )}
    </>
  );
}
