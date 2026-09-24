import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { RoleProvider } from './context/RoleContext';
import { ToastProvider } from './components/ui/Toast';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import CommandCentre from './pages/CommandCentre';
import AIInventory from './pages/AIInventory';
import AISystemDetail from './pages/AISystemDetail';
import EUAIActAssessment from './pages/EUAIActAssessment';
import RequirementsGaps from './pages/RequirementsGaps';
import AskComplianceOS from './pages/AskComplianceOS';
import SuperAdminPortal from './pages/SuperAdminPortal';

export default function App() {
  return (
    <RoleProvider>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<Layout><CommandCentre /></Layout>} />
          <Route path="/inventory" element={<Layout><AIInventory /></Layout>} />
          <Route path="/inventory/:id" element={<Layout><AISystemDetail /></Layout>} />
          <Route path="/inventory/:id/assessment" element={<Layout><EUAIActAssessment /></Layout>} />
          <Route path="/requirements" element={<Layout><RequirementsGaps /></Layout>} />
          <Route path="/ask" element={<Layout><AskComplianceOS /></Layout>} />
          <Route path="/admin" element={<Layout><SuperAdminPortal /></Layout>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </ToastProvider>
    </RoleProvider>
  );
}
