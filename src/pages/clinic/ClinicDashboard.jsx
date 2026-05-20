import { useState, useEffect } from 'react';
import { clinicDashApi } from '../../api';
import { StatusBadge } from '../../components/admin/AdminUI';
import { useBookingUpdates } from '../../hooks/useBookingUpdates';
import styles from './ClinicPages.module.css';

export default function ClinicDashboard() {
  const [data,     setData]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [clinicId, setClinicId] = useState(null);

  const load = () => {
    clinicDashApi.dashboard()
      .then(({ data }) => {
        setData({ ...data, todayAppointments: [...(data.todayAppointments || [])] });
        if (data?.clinicId) setClinicId(data.clinicId);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useBookingUpdates(clinicId, () => { load(); });

  useBookingUpdates('all', () => { load(); });

  const updateStatus = async (id, status) => {
    await clinicDashApi.updateStatus(id, status);
    load();
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.sub}>{data?.clinicName} · {new Date().toLocaleDateString('ja-JP')}</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {[
          { label: "Today's Appointments", value: data?.todayTotal,     color: 'blue'  },
          { label: 'Waiting',              value: data?.todayBooked,    color: 'amber' },
          { label: 'Confirmed',            value: data?.todayConfirmed, color: 'teal'  },
          { label: 'Total Bookings',       value: data?.totalBookings,  color: 'green' },
        ].map(s => (
          <div key={s.label} className={`${styles.statCard} ${styles[s.color]}`}>
            <div className={styles.statValue}>{s.value ?? 0}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Today's appointments</h2>
        {!data?.todayAppointments?.length ? (
          <div className={styles.empty}>No appointments today.</div>
        ) : data.todayAppointments.map(b => (
          <div key={b.id} className={styles.apptRow}>
            <div className={styles.apptTime}>{b.time?.slice(0,5)}</div>
            <div className={styles.apptInfo}>
              <div className={styles.apptPatient}>{b.patient}</div>
              <div className={styles.apptSvc}>{b.service}</div>
            </div>
            <StatusBadge status={b.status} />
            <select className={styles.statusSel} value={b.status}
              onChange={e => updateStatus(b.id, e.target.value)}>
              {['BOOKED','CONFIRMED','COMPLETED','CANCELLED'].map(s =>
                <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
