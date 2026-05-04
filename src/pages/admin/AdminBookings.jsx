import { useState, useEffect } from 'react';
import { adminApi } from '../../adminApi';
import { PageHeader, AdminTable, StatusBadge, Btn } from '../../components/admin/AdminUI';
import styles from './AdminBookings.module.css';

const STATUSES = ['BOOKED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

export default function AdminBookings() {
  const [clinics,   setClinics]   = useState([]);
  const [bookings,  setBookings]  = useState([]);
  const [selClinic, setSelClinic] = useState('');
  const [loading,   setLoading]   = useState(false);
  const [filter,    setFilter]    = useState('ALL');

  useEffect(() => {
    adminApi.getClinics().then(({ data }) => {
      setClinics(data);
      if (data.length) setSelClinic(String(data[0].id));
    });
  }, []);

  useEffect(() => {
    if (!selClinic) return;
    setLoading(true);
    adminApi.getBookings(selClinic)
      .then(({ data }) => setBookings(data))
      .finally(() => setLoading(false));
  }, [selClinic]);

  const updateStatus = async (bookingRef, newStatus) => {
    // Find booking id — we need to search by ref, but admin API uses id
    // For now trigger a reload after patch using index
    try {
      const idx = bookings.findIndex(b => b.bookingRef === bookingRef);
      if (idx === -1) return;
      // optimistic update
      setBookings(prev => prev.map(b =>
        b.bookingRef === bookingRef ? { ...b, status: newStatus } : b
      ));
    } catch (err) { console.error(err); }
  };

  const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter);

  const columns = [
    { key: 'bookingRef',   label: 'Ref',         render: r => <code style={{ fontSize: 12 }}>{r.bookingRef}</code> },
    { key: 'guestOrUser',  label: 'Patient' },
    { key: 'service',      label: 'Service' },
    { key: 'date',         label: 'Date' },
    { key: 'startTime',    label: 'Time',         render: r => r.startTime?.slice(0, 5) },
    { key: 'status',       label: 'Status',       render: r => <StatusBadge status={r.status} /> },
    { key: 'actions',      label: 'Update',       render: r => (
      <select
        value={r.status}
        onChange={e => updateStatus(r.bookingRef, e.target.value)}
        style={{ height: 30, border: '1px solid var(--border)', borderRadius: 6, padding: '0 8px', fontSize: 12, outline: 'none' }}
      >
        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    )},
  ];

  return (
    <div>
      <PageHeader
        title="Bookings"
        subtitle="View and manage all patient appointments"
      />

      {/* Controls */}
      <div className={styles.toolbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>Clinic:</label>
          <select
            value={selClinic}
            onChange={e => setSelClinic(e.target.value)}
            style={{ height: 34, border: '1px solid var(--border)', borderRadius: 6, padding: '0 10px', fontSize: 13, outline: 'none' }}
          >
            {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className={styles.filterChips}>
          {['ALL', ...STATUSES].map(s => (
            <button
              key={s}
              className={`${styles.chip} ${filter === s ? styles.chipActive : ''}`}
              onClick={() => setFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Summary row */}
      <div className={styles.summary}>
        {STATUSES.map(s => (
          <div key={s} className={styles.summaryItem}>
            <span className={styles.summaryCount}>{bookings.filter(b => b.status === s).length}</span>
            <span className={styles.summaryLabel}>{s}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-3)', padding: '20px 0' }}>Loading bookings...</p>
      ) : (
        <AdminTable
          columns={columns}
          rows={filtered}
          emptyMsg={filter === 'ALL' ? 'No bookings yet for this clinic.' : `No ${filter} bookings.`}
        />
      )}
    </div>
  );
}
