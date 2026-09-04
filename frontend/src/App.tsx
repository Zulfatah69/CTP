import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/admin/Dashboard';
import Buildings from './pages/admin/Buildings';
import AdminBookings from './pages/admin/AdminBookings';
import AuditTrail from './pages/admin/AuditTrail';
import Reports from './pages/admin/Reports';
import Announcements from './pages/admin/Announcements';
import FokusManagement from './pages/admin/FokusManagement';
import ToleranceRequests from './pages/admin/ToleranceRequests';
import FokusCatalog from './pages/portal/FokusCatalog';
import BookingForm from './pages/portal/BookingForm';
import CalendarView from './pages/portal/CalendarView';
import PemohonDashboard from './pages/portal/PemohonDashboard';
import AdminLayout from './components/layout/AdminLayout';
import PortalLayout from './components/layout/PortalLayout';
import RequireAuth from './components/auth/RequireAuth';
import { Toaster } from '@/components/ui/toaster';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing & Auth Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/fokus" element={<FokusCatalog />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Portal Pemohon Routes — PEMOHON only */}
        <Route element={<RequireAuth allowedRoles={['PEMOHON']} />}>
          <Route element={<PortalLayout />}>
            <Route path="/portal/dashboard" element={<PemohonDashboard />} />
            <Route path="/portal" element={<BookingForm />} />
            <Route path="/portal/calendar" element={<CalendarView />} />
          </Route>
        </Route>

        {/* Admin Management Routes — all staff roles */}
        <Route
          element={
            <RequireAuth
              allowedRoles={['ADMIN', 'KEPALA_UPTD', 'KASUBAG_TU', 'SEKRETARIS', 'KEPALA_DINAS']}
            />
          }
        >
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/calendar" element={<CalendarView />} />
            <Route path="/admin/buildings" element={<Buildings />} />
            <Route path="/admin/announcements" element={<Announcements />} />
            <Route path="/admin/fokus" element={<FokusManagement />} />
            <Route path="/admin/tolerance" element={<ToleranceRequests />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/audit" element={<AuditTrail />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}
