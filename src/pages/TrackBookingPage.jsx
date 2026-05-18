import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { bookingApi } from '../api';
import styles from './TrackBookingPage.module.css';

const STATUS_CONFIG = {
  BOOKED:    { color: '#2563eb', bg: '#eff6ff', icon: <Clock size={16}/>,        label: 'Booked'    },
  CONFIRMED: { color: '#16a34a', bg: '#f0fdf4', icon: <CheckCircle size={16}/>,  label: 'Confirmed' },
  COMPLETED: { color: '#64748b', bg: '#f8fafc', icon: <CheckCircle size={16}/>,  label: 'Completed' },
  CANCELLED: { color: '#dc2626', bg: '#fef2f2', icon: <XCircle size={16}/>,      label: 'Cancelled' },
};

export default function TrackBookingPage() {
  const [searchParams] = useSearchParams();

  const [ref,     setRef]     = useState(searchParams.get('ref')   || '');
  const [email,   setEmail]   = useState(searchParams.get('email') || '');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleTrack = async (e) => {
    e?.preventDefault();
    if (!ref.trim() || !email.trim()) {
      setError('Please enter both booking reference and email.');
      return;
    }
    setLoading(true);
    setError('');
    setBooking(null);
    try {
      const { data } = await bookingApi.track(ref.trim(), email.trim());
      setBooking(data);
    } catch (err) {
      setError(err.response?.data?.error || 'No booking found with this reference and email.');
    } finally {
      setLoading(false);
    }
  };

  const statusCfg = booking ? (STATUS_CONFIG[booking.status] || STATUS_CONFIG.BOOKED) : null;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Search size={22} className={styles.headerIcon}/>
            <div>
              <h1 className={styles.title}>Track your booking</h1>
              <p className={styles.sub}>Enter your booking reference and email address</p>
            </div>
          </div>

          <form className={styles.form} onSubmit={handleTrack}>
            <div className={styles.field}>
              <label className={styles.label}>Booking Reference</label>
              <input
                className={styles.input}
                placeholder="e.g. CLN-7DF8A699"
                value={ref}
                onChange={e => setRef(e.target.value.toUpperCase())}
                spellCheck={false}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email Address</label>
              <input
                className={styles.input}
                type="email"
                placeholder="Email you used when booking"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            {error && (
              <div className={styles.errorMsg}>
                <AlertCircle size={15}/> {error}
              </div>
            )}

            <button
              className={styles.trackBtn}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Track booking'}
            </button>
          </form>
        </div>

        {/* Result */}
        {booking && (
          <div className={styles.resultCard}>
            <div className={styles.resultHeader}>
              <div className={styles.refBadge}>{booking.bookingRef}</div>
              <div
                className={styles.statusBadge}
                style={{ color: statusCfg.color, background: statusCfg.bg }}
              >
                {statusCfg.icon} {statusCfg.label}
              </div>
            </div>

            <div className={styles.resultGrid}>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Patient</span>
                <span className={styles.resultValue}>
                  {booking.userName || booking.guestName}
                </span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Clinic</span>
                <span className={styles.resultValue}>{booking.clinicName}</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Service</span>
                <span className={styles.resultValue}>{booking.serviceName}</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Price</span>
                <span className={styles.resultValue}>
                  ¥{Number(booking.price || 0).toLocaleString()}
                </span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Date</span>
                <span className={styles.resultValue}>{booking.date}</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Time</span>
                <span className={styles.resultValue}>
                  {booking.startTime?.slice(0, 5)}
                </span>
              </div>
            </div>

            <div className={styles.resultFooter}>
              <Link to="/" className={styles.homeLink}>← Back to search</Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
