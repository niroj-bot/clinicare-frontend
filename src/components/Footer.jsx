import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.logo}><Activity size={18} strokeWidth={2.5}/> ClinICare</div>
          <p className={styles.tagline}>
            Smart clinic finder and booking system for Japan.
            Find the best clinic by price, distance, and rating — book instantly.
          </p>
        </div>

        <div className={styles.col}>
          <div className={styles.colTitle}>For patients</div>
          <Link to="search-results"             className={styles.colLink}>Find a clinic</Link>
          <Link to="/my-bookings"  className={styles.colLink}>My bookings</Link>
          <Link to="/profile"      className={styles.colLink}>My profile</Link>
          <Link to="/register"     className={styles.colLink}>Create account</Link>
          <Link to="/login"        className={styles.colLink}>Login</Link>
        </div>

        <div className={styles.col}>
          <div className={styles.colTitle}>Features</div>
          <span className={styles.colText}>Smart ranking</span>
          <span className={styles.colText}>Price comparison</span>
          <span className={styles.colText}>Real-time booking</span>
          <span className={styles.colText}>Email confirmation</span>
          <span className={styles.colText}>Insurance support</span>
        </div>

        <div className={styles.col}>
          <div className={styles.colTitle}>For clinics</div>
          <Link to="/login"   className={styles.colLink}>Clinic login</Link>
          <Link to="/clinic"  className={styles.colLink}>Clinic dashboard</Link>
          <span className={styles.colText}>Manage services</span>
          <span className={styles.colText}>View bookings</span>
          <span className={styles.colText}>Slot management</span>
        </div>
      </div>

      <div className={styles.bottom}>
        <span>© 2026 ClinICare. Built For Educational Purpose</span>
        <div className={styles.bottomLinks}>
          <span className={styles.colText}>Privacy Policy</span>
          <span className={styles.colText}>Terms of Service</span>
        </div>
      </div>
    </footer>
  );
}
