import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import {
  LayoutDashboard, CalendarClock, Stethoscope,
  BookOpen, LogOut, Activity, Building2, Eye
} from 'lucide-react';
import styles from './ClinicLayout.module.css';

const NAV = [
  { to: '/clinic',              label: 'Dashboard',       icon: LayoutDashboard, end: true },
  { to: '/clinic/bookings',     label: 'Bookings',        icon: BookOpen },
  { to: '/clinic/services',     label: 'Services',        icon: Stethoscope },
  { to: '/clinic/slots',        label: 'Time Slots',      icon: CalendarClock },
  { to: '/clinic/availability', label: 'Slot Availability',icon: Eye },
  { to: '/clinic/profile',      label: 'Clinic Info',     icon: Building2 },
];

export default function ClinicLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'CLINIC' && user.role !== 'ADMIN') return <Navigate to="/" replace />;

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.logo}><Activity size={18} strokeWidth={2.5}/> ClinICare</div>
          <div className={styles.badge}><Building2 size={11}/> Clinic Portal</div>
        </div>
        <nav className={styles.nav}>
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}>
              <Icon size={16}/><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className={styles.sidebarBottom}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{user.name?.charAt(0).toUpperCase()}</div>
            <div>
              <div className={styles.userName}>{user.name}</div>
              <div className={styles.userRole}>Clinic Account</div>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={() => { logout(); navigate('/login'); }}>
            <LogOut size={14}/> Logout
          </button>
        </div>
      </aside>
      <main className={styles.main}><Outlet /></main>
    </div>
  );
}
