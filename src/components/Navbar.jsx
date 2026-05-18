import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Activity, BookOpen, LogOut, User, LayoutDashboard, UserCircle, Building2, Search } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.logo}>
        <Activity size={20} strokeWidth={2.5}/>
        <span>ClinICare</span>
      </Link>

      <div className={styles.right}>
        {/* Track booking — visible to everyone */}
        <Link to="/track-booking" className={styles.trackLink}>
          <Search size={14}/> Track booking
        </Link>

        {user ? (
          <>
            {user.role === 'ADMIN' && (
              <Link to="/admin" className={styles.adminBtn}>
                <LayoutDashboard size={14}/> Admin Panel
              </Link>
            )}
            {user.role === 'CLINIC' && (
              <Link to="/clinic" className={styles.clinicBtn}>
                <Building2 size={14}/> Clinic Dashboard
              </Link>
            )}
            {user.role === 'USER' && (
              <>
                <Link to="/my-bookings" className={styles.link}>
                  <BookOpen size={15}/> My Bookings
                </Link>
                <Link to="/profile" className={styles.link}>
                  <UserCircle size={15}/> Profile
                </Link>
              </>
            )}
            <span className={styles.userName}>
              <User size={14}/> {user.name}
              {user.role !== 'USER' && (
                <span className={styles.roleBadge}>{user.role}</span>
              )}
            </span>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              <LogOut size={14}/> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login"    className={styles.link}>Login</Link>
            <Link to="/register" className={styles.registerBtn}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
