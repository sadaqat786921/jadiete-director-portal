import React, { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  IconLayoutDashboard, IconLayoutKanban, IconBriefcase, IconCalendarEvent, IconTruck, IconAlertTriangle, IconChecks, IconChartBar, IconUsersGroup, IconHistory,
  IconSettings, IconSearch, IconBell, IconMenu2, IconChevronRight, IconArrowRight, IconHelpCircle, IconLogout, IconUser, IconRefresh, IconSelector,
} from '@tabler/icons-react';
import { useStore } from '../data/store';
import { IMG, me } from '../data/biz';
import { Avatar, Tile, Tag } from './ui';
import { useExceptions, EX_ICON, EX_COLOR } from './director';

const NAV: { section: string; items: { to: string; label: string; icon: any; end?: boolean; k?: string }[] }[] = [
  { section: 'Main', items: [{ to: '/', label: 'Dashboard', icon: IconLayoutDashboard, end: true }] },
  { section: 'Business', items: [{ to: '/pipeline', label: 'Sales pipeline', icon: IconLayoutKanban }, { to: '/projects', label: 'Projects', icon: IconBriefcase }, { to: '/diary', label: 'Installation diary', icon: IconCalendarEvent }, { to: '/deliveries', label: 'Deliveries', icon: IconTruck }] },
  { section: 'Decisions', items: [{ to: '/attention', label: 'Needs attention', icon: IconAlertTriangle, k: 'ex' }, { to: '/approvals', label: 'Approvals', icon: IconChecks, k: 'ap' }] },
  { section: 'Insight', items: [{ to: '/reports', label: 'Reports', icon: IconChartBar }, { to: '/team', label: 'Team', icon: IconUsersGroup }, { to: '/audit', label: 'Audit history', icon: IconHistory }] },
];

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { approvals } = useStore();
  const ex = useExceptions();
  const waiting = approvals.filter(a => a.status === 'Waiting').length;
  const count: Record<string, number> = { ex: ex.length, ap: waiting };
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="brand"><img src="images/mark.svg" alt="" /><b>Jadeite</b><button className="collapse" onClick={onToggle} aria-label="Collapse menu"><IconMenu2 size={20} /></button></div>
      <div className="workspace"><span className="ws-logo"><img src="images/mark.svg" alt="" /></span><span>Jadeite Glazing · Director</span><IconSelector size={15} className="muted" style={{ marginLeft: 'auto' }} /></div>
      {NAV.map(s => (
        <React.Fragment key={s.section}>
          <div className="nav-label">{s.section}</div>
          {s.items.map(it => (
            <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={it.label}>
              <it.icon size={18} stroke={1.8} /><span>{it.label}</span>
              {it.k && count[it.k] ? <em className="count" style={{ fontStyle: 'normal' }}>{count[it.k]}</em> : null}
            </NavLink>
          ))}
        </React.Fragment>
      ))}
      <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ marginTop: 6 }} title="My settings"><IconSettings size={18} stroke={1.8} /><span>My settings</span></NavLink>
      <div className="promo">
        <img src={IMG.orangery} alt="" style={{ objectPosition: 'center 40%' }} />
        <div>
          <b>{waiting ? `${waiting} decision${waiting > 1 ? 's' : ''} waiting` : 'No decisions waiting'}</b>
          <p>{waiting ? 'Your team is waiting for you to approve or decline.' : 'Nothing needs your approval right now.'}</p>
          <Link to="/approvals">Open approvals <IconArrowRight size={13} /></Link>
        </div>
      </div>
    </aside>
  );
}

const PAGES = [['Dashboard', '/'], ['Sales pipeline', '/pipeline'], ['Projects', '/projects'], ['Installation diary', '/diary'], ['Deliveries', '/deliveries'], ['Needs attention', '/attention'], ['Approvals', '/approvals'], ['Reports', '/reports'], ['Sales report', '/reports?tab=sales'], ['Jobs report', '/reports?tab=jobs'], ['Money report', '/reports?tab=money'], ['Team', '/team'], ['Audit history', '/audit'], ['My settings', '/settings']];

function CommandSearch({ onClose }: { onClose: () => void }) {
  const { projects, enquiries } = useStore();
  const [q, setQ] = useState('');
  const nav = useNavigate();
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [onClose]);
  const s = q.toLowerCase();
  const pr = projects.filter(p => !s || (p.id + p.customer + p.address + p.products).toLowerCase().includes(s)).slice(0, 5);
  const en = enquiries.filter(e => !['Won'].includes(e.stage) && (!s || (e.id + e.name + e.address + e.product).toLowerCase().includes(s))).slice(0, 5);
  const pg = PAGES.filter(([n]) => !s || n.toLowerCase().includes(s)).slice(0, 5);
  const go = (to: string) => { onClose(); nav(to); };
  const Row = ({ to, i, t, sub, right }: any) => <button onClick={() => go(to)} className="nav-item" style={{ width: '100%', border: 0, background: 'none', height: 50, gap: 12 }}><Avatar i={i} size={32} /><div className="vstack" style={{ alignItems: 'flex-start', gap: 1 }}><b style={{ fontSize: 13 }}>{t}</b><span className="tiny muted">{sub}</span></div><span style={{ marginLeft: 'auto' }}>{right}</span></button>;
  return (
    <div className="overlay" onMouseDown={onClose} style={{ alignItems: 'flex-start' }}>
      <div className="cmd" onMouseDown={e => e.stopPropagation()}>
        <div className="hstack" style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', gap: 10 }}><IconSearch size={18} color="#6b7a78" /><input ref={ref} value={q} onChange={e => setQ(e.target.value)} placeholder="Search customers, jobs, enquiries or pages…" aria-label="Search" style={{ border: 0, outline: 0, fontSize: 15, flex: 1 }} /><kbd className="tiny muted">Esc</kbd></div>
        <div style={{ maxHeight: 440, overflowY: 'auto', padding: 8 }}>
          {pr.length > 0 && <div className="nav-label">Projects</div>}
          {pr.map(p => <Row key={p.id} to={`/projects/${p.id}`} i={p.initials} t={p.customer} sub={`${p.id} · ${p.products}`} right={<Tag tone="grey">{p.stage}</Tag>} />)}
          {en.length > 0 && <div className="nav-label">Enquiries</div>}
          {en.map(e => <Row key={e.id} to={`/pipeline?id=${e.id}`} i={e.initials} t={e.name} sub={`${e.id} · ${e.product}`} right={<Tag tone="grey">{e.stage}</Tag>} />)}
          {pg.length > 0 && <div className="nav-label">Pages</div>}
          {pg.map(([n, to]) => <button key={to} onClick={() => go(to)} className="nav-item" style={{ width: '100%', border: 0, background: 'none' }}><IconChevronRight size={16} /><span>{n}</span></button>)}
          {!pr.length && !en.length && !pg.length && <div className="small muted" style={{ padding: 16 }}>Nothing found for “{q}”.</div>}
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const st = useStore();
  const ex = useExceptions();
  const [search, setSearch] = useState(false);
  const [bell, setBell] = useState(false);
  const [menu, setMenu] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();
  useEffect(() => { setBell(false); setMenu(false); }, [loc.pathname, loc.search]);
  useEffect(() => { const h = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearch(true); } }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, []);
  const waiting = st.approvals.filter(a => a.status === 'Waiting');
  const items = [
    ...waiting.map(a => ({ to: `/approvals?id=${a.id}`, icon: IconChecks, c: '#0b6e5c', t: `Approval: ${a.title}`, s: `${a.by} · ${a.asked}` })),
    ...ex.filter(e => ['Overdue', 'Blocked', 'Late delivery'].includes(e.type)).map(e => ({ to: e.link, icon: EX_ICON[e.type], c: EX_COLOR[e.type], t: e.title, s: `${e.type} · ${e.owner}` })),
  ];
  return (
    <header className="header">
      <div className="search" onClick={() => setSearch(true)}><IconSearch size={16} />Search<kbd>⌘K</kbd></div>
      <div className="spacer" />
      <div style={{ position: 'relative' }}>
        <button className="icon-btn" onClick={() => { setBell(!bell); setMenu(false); }} aria-label="Notifications"><IconBell size={18} />{!st.notifsRead && items.length > 0 && <span className="dot" />}</button>
        {bell && (
          <div className="popover" style={{ width: 390 }}>
            <div className="between" style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}><b style={{ fontSize: 14 }}>For you</b>{!st.notifsRead && items.length ? <button className="link" onClick={() => st.set('notifsRead', () => true)}>Mark all as read</button> : <span className="tiny muted">All read</span>}</div>
            <div className="list" style={{ maxHeight: 400, overflowY: 'auto' }}>
              {items.length === 0 && <div className="small muted" style={{ padding: 16 }}>Nothing new.</div>}
              {items.map((n, i) => (
                <button key={i} className="hstack" style={{ padding: '12px 16px', gap: 12, alignItems: 'flex-start', width: '100%', border: 0, background: 'none', textAlign: 'left', cursor: 'pointer' }} onClick={() => { st.set('notifsRead', () => true); nav(n.to); }}>
                  <Tile icon={<n.icon size={17} />} color={n.c} size={34} radius={17} /><div className="vstack" style={{ gap: 2, flex: 1 }}><b style={{ fontSize: 13 }}>{n.t}</b><span className="small muted">{n.s}</span></div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div style={{ position: 'relative' }}>
        <button className="me" aria-label="My account" onClick={() => { setMenu(!menu); setBell(false); }}>{me.initials}</button>
        {menu && (
          <div className="popover" style={{ width: 250 }}>
            <div className="hstack" style={{ padding: 14, gap: 10, borderBottom: '1px solid var(--border)' }}><Avatar i={me.initials} size={38} bg="#00c7a1" fg="#0b1f1b" /><div className="vstack" style={{ gap: 1 }}><b>{me.name}</b><span className="tiny muted">{me.role}</span></div></div>
            <div style={{ padding: 6 }}>
              <button className="nav-item" style={{ width: '100%', border: 0, background: 'none' }} onClick={() => nav('/settings')}><IconUser size={17} /><span>My settings</span></button>
              <button className="nav-item" style={{ width: '100%', border: 0, background: 'none' }} onClick={() => nav('/welcome/1')}><IconHelpCircle size={17} /><span>Take the tour again</span></button>
              <button className="nav-item" style={{ width: '100%', border: 0, background: 'none' }} onClick={() => { st.reset(); setMenu(false); nav('/'); }}><IconRefresh size={17} /><span>Reset demo data</span></button>
              <button className="nav-item" style={{ width: '100%', border: 0, background: 'none' }} onClick={() => nav('/login')}><IconLogout size={17} /><span>Sign out</span></button>
            </div>
          </div>
        )}
      </div>
      {search && <CommandSearch onClose={() => setSearch(false)} />}
    </header>
  );
}

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const loc = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);
  return (
    <div className="app">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className="main">
        <Header />
        <main className="content"><Outlet /></main>
        <footer className="footer"><span>© 2026 Jadeite Systems · Jadeite Glazing</span><span>Director · Help · Privacy</span></footer>
      </div>
    </div>
  );
}
