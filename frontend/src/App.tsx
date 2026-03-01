import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { StaffPage } from './pages/clinic/StaffPage';
import { PatientsPage } from './pages/patients/PatientsPage';
import { ServicesPage } from './pages/services/ServicesPage';
import { AppointmentsPage } from './pages/appointments/AppointmentsPage';
import { PatientDetailPage } from './pages/patients/PatientDetailPage';
import { ClinicSettingsPage } from './pages/clinic/ClinicSettingsPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.accessToken);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.accessToken);
  return !token ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="patients" element={<PatientsPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="clinic/staff" element={<StaffPage />} />
          <Route path="patients/:id" element={<PatientDetailPage />} />
          <Route path="clinic/settings" element={<ClinicSettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}