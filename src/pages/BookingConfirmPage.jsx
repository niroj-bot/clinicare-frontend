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

  // Pre-fill track URL with ref so guest can track immediately
  const trackUrl = `/track-booking?ref=${encodeURIComponent(booking.bookingRef)}`;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <CheckCircle size={48} className={styles.icon} />
        <h1 className={styles.title}>Booking confirmed!</h1>
        <p className={styles.sub}>Your reference number:</p>
        <div className={styles.ref}>{booking.bookingRef}</div>
        <p className={styles.hint}>
          {isGuest
            ? 'Save this reference — you can track your booking anytime with your email.'
            : 'You can view this booking in My Bookings anytime.'}
        </p>
        <div className={styles.summary}>
          <div className={styles.row}><span>Clinic</span><strong>{clinic?.name}</strong></div>
          <div className={styles.row}><span>Service</span><strong>{service?.serviceName}</strong></div>
          <div className={styles.row}><span>Date</span><strong>{slot?.date}</strong></div>
          <div className={styles.row}><span>Time</span><strong>{slot?.startTime}</strong></div>
          <div className={styles.row}><span>Status</span><strong className={styles.status}>Booked</strong></div>
        </div>
        <div className={styles.actions}>
          <Link to="/" className={styles.homeBtn}>Find another clinic</Link>

          {/* Guest — track booking + register prompt */}
          {isGuest && (
            <>
              <Link to={trackUrl} className={styles.trackBtn}>
                Track your booking
              </Link>
              <Link to="/register" className={styles.registerBtn}>
                Create account to manage bookings
              </Link>
            </>
          )}

          {/* Logged-in user — go to my bookings */}
          {!isGuest && (
            <Link to="/my-bookings" className={styles.trackBtn}>
              View my bookings
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
