import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../adminApi';
import { PageHeader, StatCard } from '../../components/admin/AdminUI';
import { Building2, Stethoscope, CalendarClock, BookOpen } from 'lucide-react';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const [clinics, setClinics]   = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    adminApi.getClinics()
      .then(({ data }) => {
        setClinics(data);
        
        if (data.length > 0) {
          return adminApi.getBookings(data[0].id);
        }
      })
      .then(res => { if (res) setBookings(res.data); })
      .finally(() => setLoading(false));
  }, []);

  const totalServices = clinics.reduce((sum, c) => sum + (c.services?.length || 0), 0);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening."
      />


      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
        <>
          <div className={styles.statsGrid}>
            <StatCard label="Total Clinics"   value={clinics.length}   icon="🏥" color="green" />
            <StatCard label="Active Bookings" value={bookings.filter(b => b.status === 'BOOKED').length} icon="📅" color="blue" />
            <StatCard label="Completed"       value={bookings.filter(b => b.status === 'COMPLETED').length} icon="✅" color="gray" />
            <StatCard label="Total Bookings"  value={bookings.length}  icon="📋" color="amber" />
          </div>

          <div className={styles.quickLinks}>
            <h2 className={styles.sectionTitle}>Quick actions</h2>
            <div className={styles.linkGrid}>
              {[
                { to: '/admin/clinics',  icon: <Building2 size={20} />,     label: 'Manage Clinics',   sub: 'Add or edit clinic info' },
                { to: '/admin/services', icon: <Stethoscope size={20} />,   label: 'Manage Services',  sub: 'Update prices and services' },
                { to: '/admin/slots',    icon: <CalendarClock size={20} />, label: 'Manage Time Slots',sub: 'Add available appointment slots' },
                { to: '/admin/bookings', icon: <BookOpen size={20} />,      label: 'View Bookings',    sub: 'See and update booking status' },
              ].map(item => (
                <Link key={item.to} to={item.to} className={styles.quickCard}>
                  <div className={styles.quickIcon}>{item.icon}</div>
                  <div>
                    <div className={styles.quickLabel}>{item.label}</div>
                    <div className={styles.quickSub}>{item.sub}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {clinics.length > 0 && (
            <div className={styles.clinicList}>
              <h2 className={styles.sectionTitle}>Your clinics</h2>
              {clinics.map(c => (
                <div key={c.id} className={styles.clinicRow}>
                  <div>
                    <div className={styles.clinicName}>{c.name}</div>
                    <div className={styles.clinicAddr}>{c.address}</div>
                  </div>
                  <div className={styles.clinicRating}>⭐ {c.averageRating?.toFixed(1)}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
