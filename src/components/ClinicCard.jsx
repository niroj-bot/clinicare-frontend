import { Link } from 'react-router-dom';
import { MapPin, Star, Clock } from 'lucide-react';
import styles from './ClinicCard.module.css';

const SCORE_CONFIG = {
  BEST_DEAL:  { label: 'Best Deal',   cls: 'best'  },
  FAIR_PRICE: { label: 'Fair Price',  cls: 'fair'  },
  EXPENSIVE:  { label: 'Expensive',   cls: 'exp'   },
};

const TAG_CONFIG = {
  'Best Value': 'tagValue',
  'Closest':    'tagClose',
  'Fastest':    'tagFast',
};

export default function ClinicCard({ clinic }) {
  const score = SCORE_CONFIG[clinic.priceScore] || SCORE_CONFIG.FAIR_PRICE;

  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <div className={styles.info}>
          <h3 className={styles.name}>{clinic.name}</h3>
          <div className={styles.meta}>
            <span><MapPin size={13} /> {clinic.distanceKm ?? '—'} km</span>
            <span><Star size={13} /> {clinic.averageRating?.toFixed(1)} ({clinic.reviewCount})</span>
          </div>
        </div>
        <div className={styles.priceBlock}>
          <div className={styles.price}>
            ¥{clinic.lowestPrice?.toLocaleString()}
          </div>
          <span className={`${styles.scoreBadge} ${styles[score.cls]}`}>
            {score.label}
          </span>
        </div>
      </div>

      {clinic.tags?.length > 0 && (
        <div className={styles.tags}>
          {clinic.tags.map(tag => (
            <span key={tag} className={`${styles.tag} ${styles[TAG_CONFIG[tag] || '']}`}>
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className={styles.bottom}>
        <div className={styles.treatmentTime}>
          <Clock size={13} />
          Treatment in ~<strong>{clinic.timeToTreatment ?? '—'} min</strong>
        </div>
        <div className={styles.actions}>

          <Link to={`/clinic/${clinic.id}`} className={styles.detailBtn}>
            View
          </Link>
          <Link to={`/booking/${clinic.id}`} className={styles.bookBtn}>
            Book now
          </Link>
        </div>
      </div>
    </div>
  );
}
