// Shared demo state for the Director portal (saved in sessionStorage; "Reset demo data" in the profile menu clears it).
import React, { createContext, useContext, useEffect, useState } from 'react';
import { enquiries as ENQ0, me } from './biz';
import * as D from './director';

export type Ask = { id: string; record: string; to: string; text: string; when: string; reply?: string };
export type Note = { id: string; record: string; text: string; when: string };
const fresh = () => ({
  enquiries: ENQ0, projects: D.PROJECTS0, approvals: D.APPROVALS0, diary: D.DIARY0, audit: D.AUDIT0,
  asks: [] as Ask[], notes: [] as Note[], notifsRead: false,
  prefs: { approvals: true, overdue: true, delays: true, integ: false, daily: true, weekly: true },
});
export type State = ReturnType<typeof fresh>;
const KEY = 'jadeite-director-v1';
const load = (): State => { try { const s = sessionStorage.getItem(KEY); if (s) return { ...fresh(), ...JSON.parse(s) }; } catch { /* ignore */ } return structuredClone(fresh()); };
export const stamp = () => { const t = new Date(); return `Today, ${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`; };

type Ctx = State & {
  set: <K extends keyof State>(k: K, fn: (v: State[K]) => State[K]) => void;
  log: (action: string, record: string, area: string, before?: [string, string][], reason?: string) => void;
  ask: (record: string, to: string, text: string) => void;
  note: (record: string, text: string) => void;
  reset: () => void;
};
const C = createContext<Ctx>(null as any);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [st, setSt] = useState<State>(load);
  useEffect(() => { try { sessionStorage.setItem(KEY, JSON.stringify(st)); } catch { /* ignore */ } }, [st]);
  const set: Ctx['set'] = (k, fn) => setSt(s => ({ ...s, [k]: fn(s[k]) }));
  const log: Ctx['log'] = (action, record, area, before, reason) =>
    setSt(s => ({ ...s, audit: [{ id: 'a' + Date.now() + Math.random().toString(36).slice(2, 5), when: stamp(), day: 0, who: me.name, action, record, area, source: 'Director', before, reason }, ...s.audit] }));
  const ask: Ctx['ask'] = (record, to, text) => {
    setSt(s => ({ ...s, asks: [{ id: 'q' + Date.now(), record, to, text, when: stamp() }, ...s.asks] }));
    log('Asked for an update', `${record} · ${to}`, 'Updates', undefined, text);
  };
  const note: Ctx['note'] = (record, text) => {
    setSt(s => ({ ...s, notes: [{ id: 'n' + Date.now(), record, text, when: stamp() }, ...s.notes] }));
    log('Added a director note', record, 'Notes');
  };
  const reset = () => setSt(structuredClone(fresh()));
  return <C.Provider value={{ ...st, set, log, ask, note, reset }}>{children}</C.Provider>;
}
export const useStore = () => useContext(C);
