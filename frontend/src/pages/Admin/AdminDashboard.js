import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MediaTrackLogo } from '../MediaTrackLogo';
import './AdminDashboard.css';

// Placeholder components for the routes
import { Overview } from './Overview';
import { PlansPricing } from './PlansPricing';
import { RolesPolicies } from './RolesPolicies';
import { AudienceEngagement } from './AudienceEngagement';
import { Revenue } from './Revenue';
import { Renewals } from './Renewals';
import { Notifications } from './Notifications';


export const AdminDashboard = () => {
  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main-content" style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: '2rem', right: '2.5rem', zIndex: 100 }}>
           <MediaTrackLogo size={32} />
        </div>
        <Routes>
          <Route path="/" element={<Navigate to="/admin/overview" replace />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/plans-pricing" element={<PlansPricing />} />
          <Route path="/roles-policies" element={<RolesPolicies />} />
          <Route path="/audience" element={<AudienceEngagement />} />
          <Route path="/revenue" element={<Revenue />} />
          <Route path="/renewals" element={<Renewals />} />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </main>
    </div>
  );
};
