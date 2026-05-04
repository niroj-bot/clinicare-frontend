import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { clinicApi } from '../api';
import styles from './ComparePage.module.css';
import StarRating from '../components/StarRating';

export default function ComparePage() {
  const [searchParams] = useSearchParams();
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = searchParams.get('ids')?.split(',').map(Number) || [];
    if (ids.length) {
      clinicApi.compare(ids)
        .then(({ data }) => setClinics(data))
        .finally(() => setLoading(false));
    }
  }, [searchParams]);

  if (loading) return <div className={styles.loading}>Loading comparison...</div>;

  const rows = [
    { label: 'Rating',       render: c => <StarRating value={c.averageRating} size={14} /> },
    { label: 'Reviews',      render: c => `${c.reviewCount} reviews` },
    { label: 'Lowest price', render: c => `¥${c.lowestPrice?.toLocaleString()}` },
    { label: 'Address',      render: c => c.address },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Link to="/" className={styles.back}>← Back to search</Link>
        <h1 className={styles.title}>Compare clinics</h1>

        <div className={styles.table}>
          {/* Header row */}
          <div className={styles.labelCol} />
          {clinics.map(c => (
            <div key={c.id} className={styles.clinicCol}>
              <div className={styles.clinicName}>{c.name}</div>
              <Link to={`/booking/${c.id}`} className={styles.bookBtn}>Book →</Link>
            </div>
          ))}

          {/* Data rows */}
          {rows.map(row => (
            <>
              <div key={row.label + '_label'} className={styles.rowLabel}>{row.label}</div>
              {clinics.map(c => (
                <div key={c.id + row.label} className={styles.cell}>{row.render(c)}</div>
              ))}
            </>
          ))}
        </div>

        <Link to="/" className={styles.addMore}>+ Add more clinics from search</Link>
      </div>
    </div>
  );
}
