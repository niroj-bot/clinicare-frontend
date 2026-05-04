import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';
import Footer from '../components/Footer';
import styles from './SearchPage.module.css';

const POPULAR = ['Blood test', 'X-Ray', 'Dental checkup', 'ECG', 'General checkup', 'MRI Scan'];

const CATEGORIES = [
  { icon: '🩸', label: 'Blood Test',    value: 'Blood Test'    },
  { icon: '🔬', label: 'Imaging',       value: 'Imaging'       },
  { icon: '🦷', label: 'Dental',        value: 'Dental'        },
  { icon: '❤️', label: 'Cardiology',    value: 'Cardiology'    },
  { icon: '👶', label: 'Pediatrics',    value: 'Pediatrics'    },
  { icon: '🛡', label: 'Preventive',    value: 'Preventive'    },
  { icon: '🏥', label: 'General',       value: 'General'       },
  { icon: '💊', label: 'Lab Tests',     value: 'Lab'           },
];

export default function SearchPage() {
  const navigate  = useNavigate();
  const [keyword, setKeyword]       = useState('');
  const [showSug, setShowSug]       = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handler = e => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSug(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const goSearch = (kw) => {
    const q = kw ?? keyword;
    navigate(`/search-results${q ? `?keyword=${encodeURIComponent(q)}` : ''}`);
  };

  const handleSubmit = (e) => { e.preventDefault(); goSearch(); };

  return (
    <div className={styles.page}>
      {/* ── HERO ── */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>Smart Clinic Finder</div>
          <h1 className={styles.heroTitle}>Find the best clinic near you</h1>
          <p className={styles.heroSub}>
            Compare prices, distance, and availability — book instantly
          </p>

          {/* Single clean search bar */}
          <form className={styles.searchBar} onSubmit={handleSubmit}>
            <div className={styles.searchInner} ref={searchRef}>
              <Search size={18} className={styles.searchIcon}/>
              <input
                className={styles.searchInput}
                placeholder="Search clinics, services, or specialties..."
                value={keyword}
                onChange={e => { setKeyword(e.target.value); setShowSug(true); }}
                onFocus={() => setShowSug(true)}
              />
              {keyword && (
                <button type="button" className={styles.clearBtn}
                  onClick={() => { setKeyword(''); setShowSug(false); }}>
                  ✕
                </button>
              )}

              {/* Suggestions dropdown */}
              {showSug && (
                <div className={styles.dropdown}>
                  {POPULAR.filter(p =>
                    !keyword || p.toLowerCase().includes(keyword.toLowerCase())
                  ).map(p => (
                    <button key={p} type="button" className={styles.sugItem}
                      onClick={() => { setKeyword(p); setShowSug(false); goSearch(p); }}>
                      <Search size={13} className={styles.sugIcon}/> {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button type="submit" className={styles.searchBtn}>Search</button>
          </form>

          {/* Location note */}
          <div className={styles.locNote}>
            <MapPin size={13}/> Distance calculated automatically using your location
          </div>

          {/* Popular chips */}
          <div className={styles.popularRow}>
            <span className={styles.popLabel}>Popular:</span>
            {POPULAR.map(p => (
              <button key={p} className={styles.popChip} onClick={() => goSearch(p)}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── STATS STRIP ── */}
      <div className={styles.statsStrip}>
        <div className={styles.statItem}><strong>50+</strong> Clinics</div>
        <div className={styles.dot}/>
        <div className={styles.statItem}><strong>10</strong> Cities</div>
        <div className={styles.dot}/>
        <div className={styles.statItem}><strong>Smart</strong> Ranking</div>
        <div className={styles.dot}/>
        <div className={styles.statItem}><strong>Instant</strong> Booking</div>
      </div>

      {/* ── CATEGORY SHORTCUTS ── */}
      <div className={styles.catSection}>
        <div className={styles.sectionInner}>
          <h2 className={styles.catTitle}>Browse by category</h2>
          <div className={styles.catGrid}>
            {CATEGORIES.map(cat => (
              <button key={cat.value} className={styles.catCard}
                onClick={() => goSearch(cat.value)}>
                <span className={styles.catIcon}>{cat.icon}</span>
                <span className={styles.catLabel}>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>How it works</div>
          <h2 className={styles.sectionTitle}>Book in 3 simple steps</h2>
          <div className={styles.stepsGrid}>
            {[
              { n:'01', icon:'🔍', title:'Search', desc:'Search by service or specialty. Filter by price, distance, and rating.' },
              { n:'02', icon:'📍', title:'Smart ranking', desc:'Smart score ranks clinics automatically.' },
              { n:'03', icon:'📅', title:'Book instantly', desc:'Pick a slot, confirm as guest or with account. Get email confirmation.' },
            ].map(s => (
              <div key={s.n} className={styles.stepCard}>
                <div className={styles.stepNum}>{s.n}</div>
                <div className={styles.stepIcon}>{s.icon}</div>
                <div className={styles.stepTitle}>{s.title}</div>
                <div className={styles.stepDesc}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <div className={styles.sectionGray}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>Why ClinICare</div>
          <h2 className={styles.sectionTitle}>Smarter than a simple list</h2>
          <div className={styles.featGrid}>
            {[
              { icon:'💰', title:'Fair Price Score',   desc:'Best Deal, Fair Price, or Expensive — shown clearly on every clinic card.' },
              { icon:'⏱️', title:'Time-to-Treatment', desc:'Travel time + wait time = exactly how long until you are treated.' },
              { icon:'🛡', title:'Insurance Support', desc:'Add your 健康保険 card to your profile for easy reference during booking.' },
            ].map(f => (
              <div key={f.title} className={styles.featCard}>
                <div className={styles.featIcon}>{f.icon}</div>
                <div className={styles.featTitle}>{f.title}</div>
                <div className={styles.featDesc}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className={styles.cta}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>Ready to find your clinic?</h2>
          <p className={styles.ctaSub}>No account required to browse or book</p>
          <button className={styles.ctaBtn} onClick={() => goSearch('')}>
            Browse all clinics →
          </button>
        </div>
      </div>

      <Footer/>
    </div>
  );
}
