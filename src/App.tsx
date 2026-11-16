import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/Layout';
import { Login, Welcome } from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Pipeline from './pages/Pipeline';
import Projects, { ProjectDetail } from './pages/Projects';
import { Diary, Deliveries } from './pages/Operations';
import { Attention, Approvals } from './pages/Decisions';
import Reports from './pages/Reports';
import { Team, Audit, Settings } from './pages/People';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/welcome/:step" element={<Welcome />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/pipeline" element={<Pipeline />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/diary" element={<Diary />} />
        <Route path="/deliveries" element={<Deliveries />} />
        <Route path="/attention" element={<Attention />} />
        <Route path="/approvals" element={<Approvals />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/team" element={<Team />} />
        <Route path="/audit" element={<Audit />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
