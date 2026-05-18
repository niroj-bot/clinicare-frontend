import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { bookingApi } from '../api';
import { useAuth } from '../AuthContext';
import { X } from 'lucide-react';
import styles from './MyBookingsPage.module.css';

const STATUS_COLOR = { BOOKED:'blue', CONFIRMED:'green', COMPLETED:'gray', CANCELLED:'red' };

export default function MyBookingsPage() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [cancelling, setCancelling] = useState(null);

  const load = () => {
    if (!user) { navigate('/login'); return; }
    bookingApi.myBookings()
      .then(({ data }) => setBookings(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [user]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    setCancelling(id);
    try {
      await bookingApi.cancel(id);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel');
    } finally { setCancelling(null); }
  };

  const active    = bookings.filter(b => b.status !== 'CANCELLED' && b.status !== 'COMPLETED');
  const past      = bookings.filter(b => b.status === 'CANCELLED' || b.status === 'COMPLETED');

  if (loading) return <div className={styles.loading}>Loading your bookings...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>My Bookings</h1>

        {bookings.length === 0 ? (
          <div className={styles.empty}>
            <p>No bookings yet.</p>
            <Link to="/" className={styles.searchLink}>Find a clinic →</Link>
          </div>
        ) : (
          <>
            {/* Active bookings */}
            {active.length > 0 && (
              <>
                <h2 className={styles.section}>Upcoming</h2>
                <div className={styles.list}>
                  {active.map(b => (
                    <div key={b.id} className={styles.card}>
                      <div className={styles.cardTop}>
                        <div>
                          <div className={styles.clinicName}>{b.clinicName}</div>
                          <div className={styles.service}>{b.serviceName} · ¥{Number(b.price||0).toLocaleString()}</div>
                        </div>
                        <span className={`${styles.status} ${styles[STATUS_COLOR[b.status]||'gray']}`}>
                          {b.status}
                        </span>
                      </div>
                      <div className={styles.meta}>
                        <span>📅 {b.date}</span>
                        <span>🕐 {b.startTime?.slice(0,5)}</span>
                        <span className={styles.ref}>Ref: {b.bookingRef}</span>
                      </div>
                      {(b.status === 'BOOKED' || b.status === 'CONFIRMED') &&
                          new Date(b.date) >= new Date(new Date().toDateString()) && (
                        <button
                          className={styles.cancelBtn}
                          onClick={() => handleCancel(b.id)}
                          disabled={cancelling === b.id}
                        >
                          <X size={12}/>
                          {cancelling === b.id ? 'Cancelling...' : 'Cancel booking'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Past bookings */}
            {past.length > 0 && (
              <>
                <h2 className={styles.section}>Past</h2>
                <div className={styles.list}>
                  {past.map(b => (
                    <div key={b.id} className={`${styles.card} ${styles.cardPast}`}>
                      <div className={styles.cardTop}>
                        <div>
                          <div className={styles.clinicName}>{b.clinicName}</div>
                          <div className={styles.service}>{b.serviceName}</div>
                        </div>
                        <span className={`${styles.status} ${styles[STATUS_COLOR[b.status]||'gray']}`}>
                          {b.status}
                        </span>
                      </div>
                      <div className={styles.meta}>
                        <span>📅 {b.date}</span>
                        <span>🕐 {b.startTime?.slice(0,5)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
