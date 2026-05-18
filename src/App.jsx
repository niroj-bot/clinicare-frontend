import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './AuthContext';
import Navbar from './components/Navbar';
import 'leaflet/dist/leaflet.css';

// Patient pages
const SearchPage         = lazy(() => import('./pages/SearchPage'));
const SearchResultsPage  = lazy(() => import('./pages/SearchResultsPage'));
const ClinicDetailPage   = lazy(() => import('./pages/ClinicDetailPage'));
const BookingPage        = lazy(() => import('./pages/BookingPage'));
const BookingConfirmPage = lazy(() => import('./pages/BookingConfirmPage'));
const TrackBookingPage = lazy(() => import('./pages/TrackBookingPage'));
const LoginPage          = lazy(() => import('./pages/LoginPage'));
const RegisterPage       = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const MyBookingsPage     = lazy(() => import('./pages/MyBookingsPage'));
const ProfilePage        = lazy(() => import('./pages/ProfilePage'));

// Clinic dashboard
const ClinicLayout       = lazy(() => import('./pages/clinic/ClinicLayout'));
const ClinicDashboard    = lazy(() => import('./pages/clinic/ClinicDashboard'));
const ClinicBookings     = lazy(() => import('./pages/clinic/ClinicBookings'));
const ClinicServices     = lazy(() => import('./pages/clinic/ClinicServices'));
const ClinicSlots        = lazy(() => import('./pages/clinic/ClinicSlots'));
const ClinicAvailability = lazy(() => import('./pages/clinic/ClinicAvailability'));
const ClinicProfile      = lazy(() => import('./pages/clinic/ClinicProfile'));

// Admin
const AdminLayout    = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminClinics   = lazy(() => import('./pages/admin/AdminClinics'));
const AdminServices  = lazy(() => import('./pages/admin/AdminServices'));
const AdminBookings  = lazy(() => import('./pages/admin/AdminBookings'));

const W = ({ children }) => (
  <Suspense fallback={
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',color:'#8a9490',fontSize:14}}>
      Loading...
    </div>
  }>
    {children}
  </Suspense>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Patient routes */}
          <Route path="/"                  element={<><Navbar/><W><SearchPage /></W></>} />
          <Route path="/search-results"    element={<><Navbar/><W><SearchResultsPage /></W></>} />
          <Route path="/clinic/:id"        element={<><Navbar/><W><ClinicDetailPage /></W></>} />
          <Route path="/booking/confirm"   element={<><Navbar/><W><BookingConfirmPage /></W></>} />
          <Route path="/track-booking" element={<><Navbar/><W><TrackBookingPage /></W></>} />
          <Route path="/booking/:clinicId" element={<><Navbar/><W><BookingPage /></W></>} />
          <Route path="/login"             element={<><Navbar/><W><LoginPage /></W></>} />
          <Route path="/register"          element={<><Navbar/><W><RegisterPage /></W></>} />
          <Route path="/forgot-password"   element={<><Navbar/><W><ForgotPasswordPage /></W></>} />
          <Route path="/my-bookings"       element={<><Navbar/><W><MyBookingsPage /></W></>} />
          <Route path="/profile"           element={<><Navbar/><W><ProfilePage /></W></>} />

          {/* Clinic dashboard routes */}
          <Route path="/clinic" element={<W><ClinicLayout /></W>}>
            <Route index               element={<W><ClinicDashboard /></W>} />
            <Route path="bookings"     element={<W><ClinicBookings /></W>} />
            <Route path="services"     element={<W><ClinicServices /></W>} />
            <Route path="slots"        element={<W><ClinicSlots /></W>} />
            <Route path="availability" element={<W><ClinicAvailability /></W>} />
            <Route path="profile"      element={<W><ClinicProfile /></W>} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={<W><AdminLayout /></W>}>
            <Route index           element={<W><AdminDashboard /></W>} />
            <Route path="clinics"  element={<W><AdminClinics /></W>} />
            <Route path="services" element={<W><AdminServices /></W>} />
            <Route path="bookings" element={<W><AdminBookings /></W>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
