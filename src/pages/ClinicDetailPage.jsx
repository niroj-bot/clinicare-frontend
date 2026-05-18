import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, Star, ChevronLeft, Pencil, ChevronDown, ChevronUp } from 'lucide-react';
import { clinicApi, reviewApi } from '../api';
import { useAuth } from '../AuthContext';
import MapView from '../components/MapView';
import StarRating from '../components/StarRating';
import styles from './ClinicDetailPage.module.css';

const REVIEWS_INITIAL = 3; // show 3 reviews by default

export default function ClinicDetailPage() {
  const { id }   = useParams();
  const { user } = useAuth();

  const [clinic,       setClinic]       = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [review,       setReview]       = useState({ rating: 0, comment: '', reviewerName: '' });
  const [submitting,   setSubmitting]   = useState(false);
  const [submitted,    setSubmitted]    = useState(false);
  const [editing,      setEditing]      = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const loadClinic = () => clinicApi.getById(id)
    .then(({ data }) => setClinic(data))
    .finally(() => setLoading(false));

  useEffect(() => { loadClinic(); }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!review.rating) return;
    setSubmitting(true);
    try {
      await reviewApi.add({ clinicId: parseInt(id), ...review });
      setSubmitted(true);
      setEditing(false);
      setReview({ rating: 0, comment: '', reviewerName: '' });
      await loadClinic();
    } catch (err) {
      console.error(err);
    } finally { setSubmitting(false); }
  };

  const startEdit = (r) => {
    setReview({ rating: r.rating, comment: r.comment || '', reviewerName: r.reviewerName });
    setEditing(true);
    setSubmitted(false);
  };

  if (loading) return <div className={styles.loading}>Loading clinic details...</div>;
  if (!clinic)  return <div className={styles.loading}>Clinic not found.</div>;

  const myReview = user && clinic.recentReviews?.find(r => r.reviewerName === user.name);
  const allReviews    = clinic.recentReviews ?? [];
  const visibleReviews = showAllReviews ? allReviews : allReviews.slice(0, REVIEWS_INITIAL);
  const hasMore        = allReviews.length > REVIEWS_INITIAL;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Link to="/" className={styles.back}><ChevronLeft size={15}/> Back to search</Link>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.name}>{clinic.name}</h1>
            <div className={styles.headerMeta}>
              <span><MapPin size={13}/> {clinic.address}</span>
              {clinic.phone && <span><Phone size={13}/> {clinic.phone}</span>}
              <span><Star size={13}/> {clinic.averageRating?.toFixed(1)} ({clinic.reviewCount} reviews)</span>
            </div>
            {clinic.description && <p className={styles.desc}>{clinic.description}</p>}
          </div>
          <Link to={`/booking/${clinic.id}`} className={styles.bookBtn}>
            Book appointment
          </Link>
        </div>

        <div className={styles.grid}>
          {/* Left column */}
          <div>
            {/* Services */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Services & prices</h2>
              <div className={styles.serviceList}>
                {clinic.services?.map(svc => (
                  <div key={svc.id} className={styles.serviceRow}>
                    <div>
                      <div className={styles.svcName}>{svc.serviceName}</div>
                      <div className={styles.svcCat}>{svc.category} · {svc.durationMinutes} min</div>
                    </div>
                    <div className={styles.svcPrice}>¥{svc.price?.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Available slots preview */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Available time slots</h2>
              {clinic.availableSlots?.length === 0 ? (
                <p className={styles.empty}>No slots available today or tomorrow.</p>
              ) : (
                <div className={styles.slotGrid}>
                  {clinic.availableSlots?.slice(0, 12).map(slot => (
                    <div key={slot.id} className={styles.slot}>
                      <div className={styles.slotDate}>{slot.date}</div>
                      <div className={styles.slotTime}>{slot.startTime}</div>
                    </div>
                  ))}
                </div>
              )}
              <Link to={`/booking/${clinic.id}`} className={styles.bookAllBtn}>
                See all slots & book →
              </Link>
            </section>
          </div>

          {/* Right column */}
          <div>
            {/* Map */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Location</h2>
              <MapView clinics={[clinic]} focusClinic={clinic}/>
            </section>

            {/* Reviews */}
            <section className={styles.section}>
              <div className={styles.reviewsHeader}>
                <h2 className={styles.sectionTitle}>Reviews</h2>
                {allReviews.length > 0 && (
                  <span className={styles.reviewCount}>{allReviews.length} reviews</span>
                )}
              </div>

              {allReviews.length === 0 && (
                <p className={styles.empty}>No reviews yet. Be the first!</p>
              )}

              <div className={styles.reviewList}>
                {visibleReviews.map(r => (
                  <div key={r.id} className={styles.reviewCard}>
                    <div className={styles.reviewTop}>
                      <span className={styles.reviewerName}>{r.reviewerName}</span>
                      <StarRating value={r.rating} size={13}/>
                      {user && r.reviewerName === user.name && (
                        <button className={styles.editBtn} onClick={() => startEdit(r)}>
                          <Pencil size={12}/> Edit
                        </button>
                      )}
                    </div>
                    {r.comment && <p className={styles.reviewComment}>{r.comment}</p>}
                    <span className={styles.reviewDate}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* See more / less */}
              {hasMore && (
                <button
                  className={styles.seeMoreBtn}
                  onClick={() => setShowAllReviews(prev => !prev)}
                >
                  {showAllReviews ? (
                    <><ChevronUp size={14}/> Show less</>
                  ) : (
                    <><ChevronDown size={14}/> See all {allReviews.length} reviews</>
                  )}
                </button>
              )}

              {/* Review form */}
              {submitted && !editing ? (
                <div className={styles.successMsg}>
                  ✅ Review submitted!
                  <button className={styles.editReviewBtn} onClick={() => setSubmitted(false)}>
                    Write another
                  </button>
                </div>
              ) : (!myReview || editing) ? (
                <form className={styles.reviewForm} onSubmit={submitReview}>
                  <h3 className={styles.formTitle}>
                    {editing ? '✏️ Edit your review' : 'Leave a review'}
                  </h3>
                  {!user && (
                    <input className={styles.input} placeholder="Your name"
                      value={review.reviewerName}
                      onChange={e => setReview(p => ({...p, reviewerName: e.target.value}))}/>
                  )}
                  <div className={styles.ratingRow}>
                    <span className={styles.ratingLabel}>Your rating:</span>
                    <StarRating value={review.rating}
                      onChange={r => setReview(p => ({...p, rating: r}))} size={28}/>
                  </div>
                  <textarea className={styles.textarea}
                    placeholder="Share your experience (optional)" rows={3}
                    value={review.comment}
                    onChange={e => setReview(p => ({...p, comment: e.target.value}))}/>
                  <div className={styles.reviewActions}>
                    {editing && (
                      <button type="button" className={styles.cancelBtn}
                        onClick={() => { setEditing(false); setReview({ rating:0, comment:'', reviewerName:'' }); }}>
                        Cancel
                      </button>
                    )}
                    <button className={styles.submitBtn} type="submit"
                      disabled={!review.rating || submitting}>
                      {submitting ? 'Submitting...' : editing ? 'Update review' : 'Submit review'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className={styles.alreadyReviewed}>
                  You already reviewed this clinic.
                  <button className={styles.editReviewBtn} onClick={() => startEdit(myReview)}>
                    <Pencil size={12}/> Edit your review
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
