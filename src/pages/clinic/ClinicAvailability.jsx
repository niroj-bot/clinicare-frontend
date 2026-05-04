import { useState, useEffect } from 'react';
import { clinicDashApi } from '../../api';
import styles from './ClinicAvailability.module.css';

const today = () => new Date().toISOString().split('T')[0];

export default function ClinicAvailability() {
  const [date,   setDate]   = useState(today());
  const [data,   setData]   = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async (d) => {
    setLoading(true);
    try {
      const { data: res } = await clinicDashApi.getSlotAvailability(d);
      setData(res);
    } catch { setData(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(date); }, [date]);

  // Generate 7-day tabs
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  const pct = data ? Math.round((data.booked / (data.total || 1)) * 100) : 0;

  return (
    <div>
      <h1 className={styles.title}>Slot Availability</h1>
      <p className={styles.sub}>View and monitor appointment slots for each day</p>

      {/* Day tabs */}
      <div className={styles.dayTabs}>
        {days.map(d => {
          const label = new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
          return (
            <button key={d}
              className={`${styles.dayTab} ${date === d ? styles.dayTabActive : ''}`}
              onClick={() => setDate(d)}>
              {label}
              {d === today() && <span className={styles.todayBadge}>Today</span>}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className={styles.loading}>Loading slots...</div>
      ) : !data ? (
        <div className={styles.empty}>No slot data available.</div>
      ) : (
        <>
          {/* Summary */}
          <div className={styles.summary}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryNum} style={{ color: 'var(--brand)' }}>{data.available}</div>
              <div className={styles.summaryLabel}>Available</div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryNum} style={{ color: 'var(--danger)' }}>{data.booked}</div>
              <div className={styles.summaryLabel}>Booked</div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryNum}>{data.total}</div>
              <div className={styles.summaryLabel}>Total</div>
            </div>
            <div className={`${styles.summaryCard} ${styles.summaryWide}`}>
              <div className={styles.progressLabel}>
                <span>Occupancy</span><span>{pct}%</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${pct}%` }}/>
              </div>
            </div>
          </div>

          {/* Slot grid */}
          {data.slots?.length === 0 ? (
            <div className={styles.empty}>No slots for this date.</div>
          ) : (
            <div className={styles.slotGrid}>
              {data.slots.map(slot => (
                <div key={slot.id}
                  className={`${styles.slot} ${slot.isBooked ? styles.slotBooked : styles.slotFree}`}>
                  <div className={styles.slotTime}>{slot.startTime?.slice(0, 5)}</div>
                  <div className={styles.slotStatus}>
                    {slot.isBooked ? '🔴 Booked' : '🟢 Free'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
