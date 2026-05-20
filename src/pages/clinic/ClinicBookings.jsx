import { useState, useEffect } from 'react';
import { clinicDashApi } from '../../api';
import { AdminTable, StatusBadge } from '../../components/admin/AdminUI';
import Pagination from '../../components/Pagination';
import styles from './ClinicPages.module.css';

const STATUSES = ['ALL','BOOKED','CONFIRMED','COMPLETED','CANCELLED'];
const PER_PAGE = 10;

export default function ClinicBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter,   setFilter]   = useState('ALL');
  const [date,     setDate]     = useState('');
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);

  const load = () => {
    setLoading(true);
    clinicDashApi.getBookings({
      date:   date   || undefined,
      status: filter !== 'ALL' ? filter : undefined,
    }).then(({ data }) => setBookings(data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter, date]);
  useEffect(() => { setPage(1); }, [filter, date]);

  const updateStatus = async (id, status) => {
    await clinicDashApi.updateStatus(id, status);
    setBookings(prev => prev.map(b => b.id === id ? {...b, status} : b));
  };

  const paginated = bookings.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const columns = [
    { key: 'bookingRef', label: 'Ref',     render: r => <code style={{fontSize:11}}>{r.bookingRef}</code> },
    { key: 'patient',    label: 'Patient'  },
    { key: 'phone',      label: 'Phone'    },
    { key: 'service',    label: 'Service'  },
    { key: 'date',       label: 'Date'     },
    { key: 'time',       label: 'Time',    render: r => r.time?.slice(0,5) },
    { key: 'status',     label: 'Status',  render: r => <StatusBadge status={r.status} /> },
    { key: 'action',     label: 'Update',  render: r => (
      <select value={r.status}
        onChange={e => updateStatus(r.id, e.target.value)}
        style={{height:28,border:'1px solid var(--border)',borderRadius:5,padding:'0 6px',fontSize:11}}>
        {['BOOKED','CONFIRMED','COMPLETED','CANCELLED'].map(s =>
          <option key={s} value={s}>{s}</option>)}
      </select>
    )},
  ];

  return (
    <div>
      <h1 className={styles.title}>Bookings</h1>
      <div className={styles.toolbar}>
        <div className={styles.chips}>
          {STATUSES.map(s => (
            <button key={s} className={`${styles.chip} ${filter===s?styles.chipActive:''}`}
              onClick={() => setFilter(s)}>{s}</button>
          ))}
        </div>
        <input type="date" className={styles.dateInput} value={date}
          onChange={e => setDate(e.target.value)} />
        {date && <button className={styles.clearDate} onClick={() => setDate('')}>Clear</button>}
      </div>
      {loading ? <p style={{color:'var(--text-3)'}}>Loading...</p> : (
        <>
          <AdminTable columns={columns} rows={paginated} emptyMsg="No bookings found." />
          <Pagination
            total={bookings.length}
            page={page}
            perPage={PER_PAGE}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}
