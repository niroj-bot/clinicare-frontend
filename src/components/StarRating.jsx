import { useState } from 'react';
import styles from './StarRating.module.css';

export default function StarRating({ value, onChange, size = 16 }) {
  const [hovered, setHovered] = useState(0);
  const stars = [1, 2, 3, 4, 5];

  if (onChange) {
    return (
      <div className={styles.stars}>
        {stars.map(s => {
          const isGold = hovered > 0 ? s <= hovered : s <= value;
          return (
            <button
              key={s}
              type="button"
              className={`${styles.star} ${isGold ? styles.filled : styles.empty}`}
              style={{ fontSize: size }}
              onClick={() => onChange(s)}
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
            >★</button>
          );
        })}
      </div>
    );
  }

  // Read-only display
  return (
    <div className={styles.stars}>
      {stars.map(s => (
        <span
          key={s}
          className={`${styles.star} ${s <= Math.round(value) ? styles.filled : styles.empty}`}
          style={{ fontSize: size }}
        >★</span>
      ))}
    </div>
  );
}
