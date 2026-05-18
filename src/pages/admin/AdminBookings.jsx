import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { adminApi } from '../../adminApi';
import { PageHeader, AdminTable, StatusBadge } from '../../components/admin/AdminUI';
import styles from './AdminBookings.module.css';

const STATUSES = ['BOOKED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

export default function AdminBookings() {
  const [clinics,   setClinics]   = useState([]);
  const [bookings,  setBookings]  = useState([]);
  const [selClinic, setSelClinic] = useState('ALL');
  const [loading,   setLoading]   = useState(false);
  const [filter,    setFilter]    = useState('ALL');
  const [searchRef, setSearchRef] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    adminApi.getClinics().then(({ data }) => setClinics(data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const fetch = selClinic === 'ALL'
      ? adminApi.getAllBookings()
      : adminApi.getBookings(selClinic);
    fetch
      .then(({ data }) => setBookings(data))
      .finally(() => setLoading(false));
  }, [selClinic]);

  const updateStatus = async (id, newStatus) => {
    try {
      await adminApi.updateBookingStatus(id, newStatus);
      setBookings(prev => prev.map(b =>
        b.id === id ? { ...b, status: newStatus } : b
      ));
    } catch (err) { console.error(err); }
  };

  const handleSearch = () => setSearchRef(searchInput.trim().toUpperCase());
  const clearSearch  = () => { setSearchRef(''); setSearchInput(''); };

  const afterRefSearch = searchRef
    ? bookings.filter(b => b.bookingRef?.toUpperCase().includes(searchRef))
    : bookings;

  const filtered = filter === 'ALL'
    ? afterRefSearch
    : afterRefSearch.filter(b => b.status === filter);

  const columns = [
    { key: 'bookingRef',  label: 'Ref',     render: r => <code style={{ fontSize: 12 }}>{r.bookingRef}</code> },
    ...(selClinic === 'ALL' ? [{ key: 'clinicName', label: 'Clinic' }] : []),
    { key: 'guestOrUser', label: 'Patient' },
    { key: 'service',     label: 'Service' },
    { key: 'date',        label: 'Date'    },
    { key: 'startTime',   label: 'Time',   render: r => r.startTime?.slice(0, 5) },
    { key: 'status',      label: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'actions',     label: 'Update', render: r => (
      <select
        value={r.status}
        onChange={e => updateStatus(r.id, e.target.value)}
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

      <div className={styles.toolbar}>
    
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>Clinic:</label>
          <select
            value={selClinic}
            onChange={e => { setSelClinic(e.target.value); clearSearch(); }}
            style={{ height: 34, border: '1px solid var(--border)', borderRadius: 6, padding: '0 10px', fontSize: 13, outline: 'none' }}
          >
            <option value="ALL">All Clinics</option>
            {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className={styles.refSearch}>
          <div className={styles.refSearchBar}>
            <Search size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }}/>
            <input
              className={styles.refInput}
              placeholder="Search by booking ref..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            {searchRef && (
              <button className={styles.refClear} onClick={clearSearch}>✕</button>
            )}
          </div>
          <button className={styles.refBtn} onClick={handleSearch}>Search</button>
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

      {searchRef && (
        <div className={styles.searchBanner}>
          Showing results for ref: <strong>{searchRef}</strong>
          &nbsp;·&nbsp;{filtered.length} found
          <button className={styles.clearBannerBtn} onClick={clearSearch}>Clear</button>
        </div>
      )}

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
          emptyMsg={searchRef ? `No booking found with ref "${searchRef}".` : filter === 'ALL' ? 'No bookings found.' : `No ${filter} bookings.`}
        />
      )}
    </div>
  );
}
