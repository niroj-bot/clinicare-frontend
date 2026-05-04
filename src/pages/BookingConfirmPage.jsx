import { useLocation, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '../AuthContext';
import styles from './BookingConfirmPage.module.css';

export default function BookingConfirmPage() {
  const { state } = useLocation();
  const { user } = useAuth();
  if (!state) return <div className={styles.loading}>No booking data. <Link to="/">Go home</Link></div>;
  const { booking, clinic, service, slot } = state;
  const isGuest = !user;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <CheckCircle size={48} className={styles.icon} />
        <h1 className={styles.title}>Booking confirmed!</h1>
        <p className={styles.sub}>Your reference number:</p>
        <div className={styles.ref}>{booking.bookingRef}</div>
        <p className={styles.hint}>Save this number to check your booking status.</p>
        <div className={styles.summary}>
          <div className={styles.row}><span>Clinic</span><strong>{clinic?.name}</strong></div>
          <div className={styles.row}><span>Service</span><strong>{service?.serviceName}</strong></div>
          <div className={styles.row}><span>Date</span><strong>{slot?.date}</strong></div>
          <div className={styles.row}><span>Time</span><strong>{slot?.startTime}</strong></div>
          <div className={styles.row}><span>Status</span><strong className={styles.status}>Booked</strong></div>
        </div>
        <div className={styles.actions}>
          <Link to="/" className={styles.homeBtn}>Find another clinic</Link>
          {/* Only show register prompt for guests */}
          {isGuest && (
            <Link to="/register" className={styles.registerBtn}>
              Create account to track bookings
            </Link>
          )}
          {/* Show my bookings for logged-in users */}
          {!isGuest && (
            <Link to="/my-bookings" className={styles.registerBtn}>
              View my bookings
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
