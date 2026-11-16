// Director dashboard: the whole business on one screen. Every number opens the records behind it.
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconArrowRight, IconTrendingUp, IconTrophy, IconPercentage, IconCurrencyPound, IconChevronRight, IconTruck, IconCalendarEvent, IconHistory, IconCircleCheck, IconChecks, IconClipboardList } from '@tabler/icons-react';
import { Card, CardHead, Tag, Tile, Avatar, Stat } from '../components/ui';
import { BarChart, HBars } from '../components/charts';
import { useStore } from '../data/store';
import { IMG, me, salesByMonth, STAGES, staffById } from '../data/biz';
import { INTEG, FITTERS, DEFS } from '../data/director';
import { useExceptions, EX_ICON, EX_COLOR, ExType, DecideModal, Def, money, gbp, IntegLogo } from '../components/director';

export function useNumbers() {
  const { enquiries, projects } = useStore();
  const open = enquiries.filter(e => e.stage !== 'Won' && e.stage !== 'Lost');
  const pipeline = open.reduce((s, e) => s + e.value, 0);
  const wonMonth = projects.filter(p => /Oct|Sep/.test(p.won) && ['16 Oct', '30 Sep', '25 Sep', '18 Sep', '14 Sep'].includes(p.won));
  const wonOct = projects.filter(p => p.won.endsWith('Oct'));
  const won = enquiries.filter(e => e.stage === 'Won').length + 1, lost = enquiries.filter(e => e.stage === 'Lost').length;
  const invs = projects.flatMap(p => p.invoices.map(i => ({ ...i, job: p.id, customer: p.customer })));
  const toCollect = invs.filter(i => ['Due', 'Overdue', 'On hold'].includes(i.status)).reduce((s, i) => s + i.amount, 0);
  const overdueMoney = invs.filter(i => i.status === 'Overdue').reduce((s, i) => s + i.amount, 0);
  return { open, pipeline, wonOct, wonMonth, rate: Math.round((won / (won + lost)) * 100), invs, toCollect, overdueMoney };
}

export default function Dashboard() {
  const st = useStore();
  const nav = useNavigate();
  const ex = useExceptions();
  const n = useNumbers();
  const [decide, setDecide] = useState<{ id: string; ok: boolean } | null>(null);
  const waiting = st.approvals.filter(a => a.status === 'Waiting');
  const hr = new Date().getHours();
  const byType = (['Overdue', 'Blocked', 'Incomplete', 'Unscheduled', 'Late delivery', 'Open snags'] as ExType[]).map(t => ({ t, n: ex.filter(e => e.type === t).length }));
  const days = ['2026-10-16', '2026-10-17', '2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-26', '2026-10-27', '2026-10-28'];
  const booked = (who: string) => days.filter(d => st.diary.some(ev => ev.who.includes(who) && ev.kind !== 'Leave' && ev.kind !== 'Workshop' && ev.date <= d && addD(ev.date, ev.days - 1) >= d)).length;
  const valueWonOct = n.wonOct.reduce((s, p) => s + p.value, 0);
  const surveys = [
    ...st.enquiries.filter(e => e.stage === 'Appointment').map(e => ({ id: e.id, t: `Sales visit · ${e.name}`, s: `${e.nextDue} · ${staffById(e.assigned)?.name}`, to: `/pipeline?id=${e.id}` })),
    { id: 'sv1', t: 'Final survey · Mr & Mrs Lees', s: 'Mon 19 Oct · Rob King', to: '/diary' },
    ...st.projects.filter(p => p.stage === 'Final survey').map(p => ({ id: p.id, t: `Final survey · ${p.customer}`, s: 'Not booked yet', to: `/projects/${p.id}` })),
  ];
  return (
    <>
      <div className="banner" style={{ minHeight: 160 }}>
        <div className="photo" style={{ backgroundImage: `url(${IMG.orangery})` }} />
        <div className="vstack" style={{ gap: 8, maxWidth: 600 }}>
          <span className="small" style={{ color: '#bfe9dc', fontWeight: 600 }}>{hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening'}, {me.first} · Friday 16 October</span>
          <h1 style={{ fontSize: 26, letterSpacing: -0.4 }}>{waiting.length ? `${waiting.length} decision${waiting.length > 1 ? 's are' : ' is'} waiting for you` : 'Nothing is waiting for your decision'}</h1>
          <span style={{ color: '#d3e3de' }}>{ex.length} things need attention · {money(n.pipeline)} in the pipeline · {gbp(n.toCollect)} still to collect</span>
          <div className="hstack" style={{ gap: 10, marginTop: 6 }}>
            <Link to="/approvals" className="btn btn-primary">Review approvals<IconArrowRight size={16} /></Link>
            <Link to="/attention" className="btn" style={{ background: 'rgba(255,255,255,.12)', color: '#fff' }}>See what needs attention</Link>
          </div>
        </div>
      </div>

      <div className="grid-4">
        {[
          { to: '/pipeline', k: 'pipeline' as const, icon: IconTrendingUp, c: '#0b6e5c', v: money(n.pipeline), l: 'Open pipeline', f: [['Enquiries', String(n.open.length)], ['Hot', String(n.open.filter(e => e.hot).length)]] },
          { to: '/reports?tab=sales', k: 'won' as const, icon: IconTrophy, c: '#1f9d5b', v: gbp(valueWonOct), l: 'Won in October', f: [['Deals', String(n.wonOct.length)], ['Last Oct', '£31,400']] },
          { to: '/reports?tab=sales', k: 'conversion' as const, icon: IconPercentage, c: '#2f6fde', v: `${n.rate}%`, l: 'Win rate', f: [['Target', '55%'], ['Last month', '54%']] },
          { to: '/reports?tab=money', k: 'outstanding' as const, icon: IconCurrencyPound, c: '#e0a100', v: gbp(n.toCollect), l: 'Still to collect', f: [['Overdue', gbp(n.overdueMoney)], ['From', 'Xero']] },
        ].map(s => (
          <Link key={s.l} to={s.to} style={{ position: 'relative' }}>
            <Stat icon={<s.icon size={24} />} color={s.c} value={s.v} label={s.l} foot={s.f as [string, string][]} />
            <span style={{ position: 'absolute', top: 10, right: 10 }}><Def k={s.k} /></span>
          </Link>
        ))}
      </div>

      <div className="row">
        <Card className="grow">
          <CardHead title="Quoted and won" sub="Last 8 months · value in £ thousands" right={<Link to="/reports?tab=sales" className="link">Sales report<IconArrowRight size={14} /></Link>} />
          <BarChart data={salesByMonth} height={230} />
          <div className="hstack small t2" style={{ gap: 16 }}><span className="hstack" style={{ gap: 6 }}><i style={{ width: 10, height: 10, borderRadius: 3, background: '#dfe5e3', display: 'inline-block' }} />Quoted</span><span className="hstack" style={{ gap: 6 }}><i style={{ width: 10, height: 10, borderRadius: 3, background: '#0b6e5c', display: 'inline-block' }} />Won</span></div>
        </Card>
        <Card style={{ width: 400, flex: '0 0 400px' }} className="flush">
          <div style={{ padding: '18px 18px 6px' }}><CardHead title="Waiting for your decision" right={<Link to="/approvals" className="link">All<IconArrowRight size={14} /></Link>} /></div>
          {waiting.length === 0 ? <div className="hstack small t2" style={{ gap: 10, padding: '0 18px 18px' }}><IconCircleCheck size={18} color="#1f9d5b" />All decided. Nice.</div> : (
            <div className="list">
              {waiting.slice(0, 4).map(a => (
                <div key={a.id} className="vstack" style={{ gap: 8, padding: '12px 18px' }}>
                  <Link to={`/approvals?id=${a.id}`} className="vstack" style={{ gap: 2 }}><span className="hstack" style={{ gap: 6 }}><Tag tone={a.urgent ? 'warn' : 'grey'}>{a.kind}</Tag></span><b style={{ fontSize: 13.5 }}>{a.title}</b><span className="tiny muted">{a.by} · {a.asked}</span></Link>
                  <span className="hstack" style={{ gap: 8 }}><button className="btn btn-primary btn-sm" onClick={() => setDecide({ id: a.id, ok: true })}>Approve</button><button className="btn btn-grey btn-sm" onClick={() => setDecide({ id: a.id, ok: false })}>Decline</button></span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid-3">
        <Card>
          <CardHead title="Needs attention" sub="Overdue, blocked, incomplete and not booked" right={<Link to="/attention" className="link">Open</Link>} />
          <div className="grid-2" style={{ gap: 10 }}>
            {byType.map(({ t, n: c }) => { const I = EX_ICON[t]; return (
              <button key={t} onClick={() => nav(`/attention?type=${encodeURIComponent(t)}`)} className="doc-row" style={{ gap: 10, padding: 10 }}>
                <Tile icon={<I size={17} />} color={c ? EX_COLOR[t] : '#6b7a78'} size={34} />
                <span className="vstack" style={{ gap: 0, textAlign: 'left' }}><b style={{ fontSize: 17 }}>{c}</b><span className="tiny muted">{t}</span></span>
              </button>
            ); })}
          </div>
        </Card>
        <Card>
          <CardHead title="Fitter workload" sub="Days booked from today, next 10 working days" right={<span className="hstack" style={{ gap: 4 }}><Def k="workload" /><Link to="/diary" className="link">Diary</Link></span>} />
          <HBars rows={FITTERS.map(f => ({ label: f, value: booked(f), max: 10, right: `${booked(f)} of 10 days`, color: booked(f) === 0 ? '#e0a100' : undefined }))} />
        </Card>
        <Card>
          <CardHead title="Deliveries" sub="Due and late, from the office’s order dates" right={<span className="hstack" style={{ gap: 4 }}><Def k="delays" /><Link to="/deliveries" className="link">Open</Link></span>} />
          {st.projects.filter(p => p.delivery.status !== 'Arrived' && p.delivery.status !== 'Not ordered').map(p => (
            <Link key={p.id} to="/deliveries" className="hstack" style={{ gap: 12 }}>
              <Tile icon={<IconTruck size={18} />} color={p.delivery.late ? '#d64545' : '#0b6e5c'} size={38} />
              <span className="vstack grow" style={{ gap: 2 }}><b className="small">{p.customer} · {p.supplier}</b><span className="tiny muted">{p.orderRef} · due {p.delivery.expected}</span></span>
              <Tag tone={p.delivery.late ? 'err' : 'info'}>{p.delivery.late ? `${p.delivery.late} days late` : p.delivery.status}</Tag>
            </Link>
          ))}
          <span className="tiny muted">{st.projects.filter(p => p.delivery.status === 'Arrived' && p.stage !== 'Complete').length} more arrived and checked this month</span>
        </Card>
      </div>

      <div className="grid-3">
        <Card>
          <CardHead title="Pipeline by stage" right={<Link to="/pipeline" className="link">Pipeline</Link>} />
          <HBars rows={STAGES.filter(s => s !== 'Won' && s !== 'Lost').map(s => { const es = st.enquiries.filter(e => e.stage === s); return { label: s, value: es.length, max: 4, right: `${es.length} · ${money(es.reduce((a, e) => a + e.value, 0))}` }; })} />
        </Card>
        <Card>
          <CardHead title="Visits coming up" sub="Sales visits and surveys" />
          {surveys.map(s => <Link key={s.id} to={s.to} className="hstack" style={{ gap: 12 }}><Tile icon={s.t.startsWith('Final') ? <IconClipboardList size={18} /> : <IconCalendarEvent size={18} />} size={36} /><span className="vstack grow" style={{ gap: 1 }}><b className="small">{s.t}</b><span className="tiny muted">{s.s}</span></span><IconChevronRight size={15} color="#6b7a78" /></Link>)}
          <div className="divider" />
          <b className="small">Connections</b>
          {INTEG.map(g => <div key={g.id} className="hstack small" style={{ gap: 10 }}><IntegLogo logo={g.logo} color={g.color} size={26} /><span className="grow">{g.name}</span><Tag tone={g.errors ? 'warn' : 'ok'}>{g.errors ? `${g.errors} to fix` : 'OK'}</Tag></div>)}
          <span className="tiny muted">Tom Fletcher (System Admin) fixes sync errors.</span>
        </Card>
        <Card>
          <CardHead title="Latest changes" right={<Link to="/audit" className="link">Audit history</Link>} />
          <div className="timeline">
            {st.audit.slice(0, 6).map(x => <Link key={x.id} to={`/audit?id=${x.id}`} className="tl-item"><Tile icon={<IconHistory size={14} />} size={28} radius={14} /><span className="vstack" style={{ gap: 2, paddingTop: 3 }}><b style={{ fontSize: 12.5 }}>{x.who} · {x.action}</b><span className="tiny muted">{x.record} · {x.when}</span></span></Link>)}
          </div>
        </Card>
      </div>
      {decide && <DecideModal a={st.approvals.find(a => a.id === decide.id)!} ok={decide.ok} onClose={() => setDecide(null)} />}
    </>
  );
}

export const addD = (s: string, n: number) => { const d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
