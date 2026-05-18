import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Search, Map, List, Zap, ChevronLeft, MapPin, ChevronLeft as Prev, ChevronRight as Next } from 'lucide-react';
import { clinicApi } from '../api';
import ClinicCard from '../components/ClinicCard';
import MapView from '../components/MapView';
import styles from './SearchResultsPage.module.css';

const SORT_OPTIONS = [
  { value: 'smart',    label: '✨ Smart' },
  { value: 'price',    label: '💰 Price' },
  { value: 'distance', label: '📍 Nearest' },
  { value: 'rating',   label: '⭐ Rating' },
];

const CATEGORIES = [
  { label: 'All',          value: '' },
  { label: '🩸 Lab',       value: 'Lab' },
  { label: '🔬 Imaging',   value: 'Imaging' },
  { label: '🦷 Dental',    value: 'Dental' },
  { label: '❤️ Cardio',    value: 'Cardiology' },
  { label: '👶 Pediatric', value: 'Pediatrics' },
  { label: '🛡 Preventive',value: 'Preventive' },
  { label: '🏥 General',   value: 'General' },
];

const PER_PAGE = 10;

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [keyword,  setKeyword]  = useState(searchParams.get('keyword') || '');
  const [sortBy,   setSortBy]   = useState('smart');
  const [category, setCategory] = useState('');
  const [view,     setView]     = useState('list');
  const [clinics,  setClinics]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [urgency,  setUrgency]  = useState(false);
  const [userLoc,  setUserLoc]  = useState(null);
  const [filters,  setFilters]  = useState({ maxPrice: '', maxDistanceKm: '', minRating: '' });
  const [page,     setPage]     = useState(1);
  const topRef = useRef(null);

  // Reset to page 1 when filters/sort/category change
  useEffect(() => { setPage(1); }, [sortBy, category, urgency, clinics]);

  // GPS
  useEffect(() => {
    const DEFAULT = { lat: 35.6895, lng: 139.6917 };
    const cached = localStorage.getItem('userLocation');
    if (cached) {
      try { setUserLoc(JSON.parse(cached)); return; } catch {}
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          localStorage.setItem('userLocation', JSON.stringify(loc));
          setUserLoc(loc);
        },
        () => setUserLoc(DEFAULT),
        { timeout: 5000 }
      );
    } else {
      setUserLoc(DEFAULT);
    }
  }, []);

  useEffect(() => {
    if (userLoc) fetchClinics();
  }, [sortBy, category, urgency, userLoc]);

  const fetchClinics = async () => {
    setLoading(true);
    try {
      const params = {
        keyword:       keyword || category || undefined,
        sortBy,
        userLat:       userLoc?.lat,
        userLng:       userLoc?.lng,
        maxPrice:      filters.maxPrice      || undefined,
        maxDistanceKm: filters.maxDistanceKm || undefined,
        minRating:     filters.minRating     || undefined,
      };
      const { data } = urgency
        ? await clinicApi.urgency(params)
        : await clinicApi.search(params);
      setClinics(Array.isArray(data) ? data : []);
      setPage(1);
    } catch { setClinics([]); }
    finally { setLoading(false); }
  };

  const handleSearch = e => {
    e.preventDefault();
    fetchClinics();
  };

  // Pagination
  const totalPages  = Math.ceil(clinics.length / PER_PAGE);
  const paginated   = clinics.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const goPage = (p) => {
    setPage(p);
    // Scroll to top of results
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Build page buttons with ellipsis
  const buildPages = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    const visible = pages.filter(p =>
      p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)
    );
    const result = [];
    let prev = null;
    for (const p of visible) {
      if (prev && p - prev > 1) result.push('...');
      result.push(p);
      prev = p;
    }
    return result;
  };

  return (
    <div className={styles.page}>
      {/* Search bar */}
      <div className={styles.topBar}>
        <Link to="/" className={styles.backBtn}><ChevronLeft size={20}/></Link>
        <form className={styles.searchForm} onSubmit={handleSearch}>
          <Search size={15} className={styles.searchIcon}/>
          <input
            className={styles.searchInput}
            placeholder="Search clinics or services..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
          />
          <button type="submit" className={styles.searchBtn}>Search</button>
          <button type="button"
            className={`${styles.urgencyBtn} ${urgency ? styles.urgencyOn : ''}`}
            onClick={() => setUrgency(v => !v)}>
            <Zap size={13}/> {urgency ? 'ASAP ON' : 'ASAP'}
          </button>
        </form>
        <div className={styles.viewToggle}>
          <button className={`${styles.viewBtn} ${view==='list'?styles.viewActive:''}`}
            onClick={() => setView('list')}><List size={14}/></button>
          <button className={`${styles.viewBtn} ${view==='map'?styles.viewActive:''}`}
            onClick={() => setView('map')}><Map size={14}/></button>
        </div>
      </div>

      <div className={styles.body}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarTitle}>Sort by</div>
            {SORT_OPTIONS.map(opt => (
              <button key={opt.value}
                className={`${styles.sideBtn} ${sortBy===opt.value?styles.sideBtnActive:''}`}
                onClick={() => setSortBy(opt.value)}>
                {opt.label}
              </button>
            ))}
          </div>

          <div className={styles.sidebarSection}>
            <div className={styles.sidebarTitle}>Category</div>
            {CATEGORIES.map(cat => (
              <button key={cat.value}
                className={`${styles.sideBtn} ${category===cat.value?styles.sideBtnActive:''}`}
                onClick={() => setCategory(cat.value)}>
                {cat.label}
              </button>
            ))}
          </div>

          <div className={styles.sidebarSection}>
            <div className={styles.sidebarTitle}>Filters</div>
            <div className={styles.filterField}>
              <label>Max price (¥)</label>
              <input type="number" placeholder="e.g. 5000"
                value={filters.maxPrice}
                onChange={e => setFilters(p => ({...p, maxPrice: e.target.value}))}/>
            </div>
            <div className={styles.filterField}>
              <label>Max distance (km)</label>
              <input type="number" placeholder="e.g. 5"
                value={filters.maxDistanceKm}
                onChange={e => setFilters(p => ({...p, maxDistanceKm: e.target.value}))}/>
            </div>
            <div className={styles.filterField}>
              <label>Min rating</label>
              <input type="number" min="1" max="5" step="0.5" placeholder="e.g. 4"
                value={filters.minRating}
                onChange={e => setFilters(p => ({...p, minRating: e.target.value}))}/>
            </div>
            <button className={styles.applyBtn} onClick={fetchClinics}>Apply</button>
            <button className={styles.clearBtn}
              onClick={() => { setFilters({maxPrice:'',maxDistanceKm:'',minRating:''}); }}>
              Clear
            </button>
          </div>
        </aside>

        {/* Results */}
        <div className={styles.main}>
          <div className={styles.resultsHeader} ref={topRef}>
            <div className={styles.resultsCount}>
              {loading ? 'Searching...' :
                `${clinics.length} clinic${clinics.length!==1?'s':''} found${urgency?' (ASAP)':''}`}
              {!loading && clinics.length > PER_PAGE && (
                <span className={styles.pageInfo}>
                  — page {page} of {totalPages}
                </span>
              )}
            </div>
            {userLoc && (
              <div className={styles.locInfo}>
                <MapPin size={12}/> Distance from your location
              </div>
            )}
          </div>

          {view === 'map' ? (
            <MapView clinics={clinics} userLocation={userLoc}/>
          ) : (
            <>
              <div className={styles.cardList}>
                {loading ? (
                  <div className={styles.loading}>
                    <div className={styles.spinner}/>
                    Searching clinics...
                  </div>
                ) : clinics.length === 0 ? (
                  <div className={styles.empty}>
                    <div style={{fontSize:48,marginBottom:12}}>🔍</div>
                    <p style={{fontWeight:500,marginBottom:6}}>No clinics found</p>
                    <p style={{fontSize:13,color:'var(--text-3)'}}>
                      Try different keywords or remove filters
                    </p>
                    <button className={styles.browseAll}
                      onClick={() => { setKeyword(''); setCategory(''); fetchClinics(); }}>
                      Browse all clinics
                    </button>
                  </div>
                ) : paginated.map(clinic => (
                  <ClinicCard key={clinic.id} clinic={clinic}
                    onCompareToggle={() => {}} compareSelected={false}/>
                ))}
              </div>

              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <div className={styles.pagination}>
                  <span className={styles.paginationInfo}>
                    {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, clinics.length)} of {clinics.length} clinics
                  </span>
                  <div className={styles.paginationControls}>
                    <button
                      className={styles.pageBtn}
                      disabled={page === 1}
                      onClick={() => goPage(page - 1)}
                    >
                      ←
                    </button>
                    {buildPages().map((p, i) =>
                      p === '...' ? (
                        <span key={`e-${i}`} className={styles.ellipsis}>…</span>
                      ) : (
                        <button
                          key={p}
                          className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`}
                          onClick={() => goPage(p)}
                        >
                          {p}
                        </button>
                      )
                    )}
                    <button
                      className={styles.pageBtn}
                      disabled={page === totalPages}
                      onClick={() => goPage(page + 1)}
                    >
                      →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
