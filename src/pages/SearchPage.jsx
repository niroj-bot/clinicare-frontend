import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ChevronRight, Stethoscope, Calendar, Star, Shield, Clock, Activity } from 'lucide-react';
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

const STATS = [
  { value: '55+',    label: 'Clinics across Japan' },
  { value: '11',     label: 'Major cities'         },
  { value: '< 30s',  label: 'Booking time'         },
  { value: '24/7',   label: 'Available online'     },
];

const CLINIC_BENEFITS = [
  { icon: <Calendar size={20}/>, title: 'Auto Slot Generation', desc: 'Slots created automatically every day. No manual work needed.' },
  { icon: <Activity size={20}/>, title: 'Real-time Updates',    desc: 'Bookings appear instantly on your dashboard .' },
  { icon: <Shield size={20}/>,   title: 'Secure & Reliable',    desc: 'role-based access and encrypted data storage.' },
];

export default function SearchPage() {
  const navigate  = useNavigate();
  const [keyword, setKeyword]   = useState('');
  const [showSug, setShowSug]   = useState(false);
  const [visible, setVisible]   = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
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

  return (
    <div className={styles.page}>

      {/* ── HERO ──────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={`${styles.heroInner} ${visible ? styles.heroVisible : ''}`}>

          <div className={styles.heroBadge}>
            <span className={styles.badgeDot}/>
            Smart Clinic Finder · Japan
          </div>

          <h1 className={styles.heroTitle}>
            Find the right clinic,<br/>
            <span className={styles.heroAccent}>book in seconds.</span>
          </h1>

          <p className={styles.heroSub}>
            Compare prices, distance, and ratings across 55+ clinics in Japan's major cities.
          </p>

          {/* Search */}
          <div className={styles.searchWrap} ref={searchRef}>
            <div className={styles.searchBar}>
              <Search size={18} className={styles.searchIcon}/>
              <input
                className={styles.searchInput}
                placeholder="Search by service, clinic, or specialty..."
                value={keyword}
                onChange={e => { setKeyword(e.target.value); setShowSug(true); }}
                onFocus={() => setShowSug(true)}
                onKeyDown={e => e.key === 'Enter' && goSearch()}
              />
              <button className={styles.searchBtn} onClick={() => goSearch()}>
                Search <ChevronRight size={16}/>
              </button>
            </div>

            {showSug && (
              <div className={styles.dropdown}>
                <div className={styles.dropLabel}>Popular searches</div>
                {POPULAR.filter(p => !keyword || p.toLowerCase().includes(keyword.toLowerCase())).map(p => (
                  <button key={p} className={styles.dropItem}
                    onClick={() => { setKeyword(p); setShowSug(false); goSearch(p); }}>
                    <Search size={12}/> {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.locNote}>
            <MapPin size={12}/> Distance calculated automatically from your location
          </div>

          {/* Popular chips */}
          <div className={styles.chips}>
            {POPULAR.map(p => (
              <button key={p} className={styles.chip} onClick={() => goSearch(p)}>{p}</button>
            ))}
          </div>
        </div>

        {/* Decorative blobs */}
        <div className={styles.blob1}/>
        <div className={styles.blob2}/>
      </section>

      {/* ── STATS ─────────────────────────────────────── */}
      <section className={styles.statsBar}>
        {STATS.map((s, i) => (
          <div key={i} className={styles.statItem}>
            <div className={styles.statVal}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* ── CATEGORIES ────────────────────────────────── */}
      <section className={styles.catSection}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionEyebrow}>Browse by specialty</div>
          <h2 className={styles.sectionTitle}>What are you looking for?</h2>
          <div className={styles.catGrid}>
            {CATEGORIES.map(cat => (
              <button key={cat.value} className={styles.catCard} onClick={() => goSearch(cat.value)}>
                <span className={styles.catEmoji}>{cat.icon}</span>
                <span className={styles.catLabel}>{cat.label}</span>
                <ChevronRight size={14} className={styles.catArrow}/>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────── */}
      <section className={styles.howSection}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionEyebrow}>How it works</div>
          <h2 className={styles.sectionTitle}>Book in 3 simple steps</h2>
          <div className={styles.stepsGrid}>
            {[
              { n:'01', icon:'🔍', title:'Search',         desc:'Search by service or specialty. Filter by price, distance, and rating instantly.' },
              { n:'02', icon:'📍', title:'Smart ranking',  desc:'Our algorithm ranks clinics.' },
              { n:'03', icon:'📅', title:'Book instantly', desc:'Choose a slot, confirm as guest or with your account. Email confirmation sent.' },
            ].map(s => (
              <div key={s.n} className={styles.stepCard}>
                <div className={styles.stepNum}>{s.n}</div>
                <div className={styles.stepEmoji}>{s.icon}</div>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR CLINICS (replaces Why ClinICare) ──────── */}
      <section className={styles.clinicSection}>
        <div className={styles.clinicInner}>
          <div className={styles.clinicImage}>
            <img
              src="https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=600&q=80"
              alt="Doctor using ClinICare dashboard"
              className={styles.clinicImg}
            />
            <div className={styles.clinicImgBadge}>
              <Star size={14} fill="currentColor"/> Trusted by clinics across Japan
            </div>
          </div>

          <div className={styles.clinicContent}>
            <div className={styles.sectionEyebrow}>For clinics & hospitals</div>
            <h2 className={styles.clinicTitle}>
              Modern healthcare management,<br/>
              <span className={styles.clinicAccent}>built for Japan.</span>
            </h2>
            <p className={styles.clinicDesc}>
              ClinICare gives your clinic a complete digital presence — from smart booking to real-time dashboard management.
            </p>

            <div className={styles.benefitsList}>
              {CLINIC_BENEFITS.map((b, i) => (
                <div key={i} className={styles.benefitItem}>
                  <div className={styles.benefitIcon}>{b.icon}</div>
                  <div>
                    <div className={styles.benefitTitle}>{b.title}</div>
                    <div className={styles.benefitDesc}>{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <button className={styles.clinicBtn} onClick={() => navigate('/login')}>
              Get started for your clinic <ChevronRight size={16}/>
            </button>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────── */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <div className={styles.ctaEyebrow}>Ready?</div>
          <h2 className={styles.ctaTitle}>Find your clinic today</h2>
          <p className={styles.ctaSub}>No account required · Instant booking · Free to use</p>
          <button className={styles.ctaBtn} onClick={() => goSearch('')}>
            Browse all clinics →
          </button>
        </div>
      </section>

      <Footer/>
    </div>
  );
}
