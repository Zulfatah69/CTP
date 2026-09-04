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
import BookingForm from './pages/portal/BookingForm';
import CalendarView from './pages/portal/CalendarView';
import AdminLayout from './components/layout/AdminLayout';
import PortalLayout from './components/layout/PortalLayout';
import { Toaster } from '@/components/ui/toaster';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing & Auth Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Portal Pemohon Routes */}
        <Route element={<PortalLayout />}>
          <Route path="/portal" element={<BookingForm />} />
          <Route path="/portal/calendar" element={<CalendarView />} />
        </Route>
        
        {/* Admin Management Routes */}
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
          <Route path="/admin/calendar" element={<CalendarView />} />
          <Route path="/admin/buildings" element={<Buildings />} />
          <Route path="/admin/announcements" element={<Announcements />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/audit" element={<AuditTrail />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

