import { useSlotUpdates } from '../hooks/useSlotUpdates';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Check } from 'lucide-react';
import { clinicApi, bookingApi } from '../api';
import api from '../api';
import { useAuth } from '../AuthContext';
import styles from './BookingPage.module.css';

const STEPS = ['Service', 'Time slot', 'Your details', 'Confirm'];

function groupSlots(slots) {
  const morning   = slots.filter(s => {
    const h = parseInt(s.startTime?.split(':')[0]);
    return h >= 9 && h < 12;
  });
  const afternoon = slots.filter(s => {
    const h = parseInt(s.startTime?.split(':')[0]);
    return h >= 13 && h < 17;
  });
  const evening   = slots.filter(s => {
    const h = parseInt(s.startTime?.split(':')[0]);
    return h >= 18 && h <= 20;
  });
  return { morning, afternoon, evening };
}

function fmt(time) {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12  = h % 12 || 12;
  return `${h12}:${String(m).padStart(2,'0')} ${ampm}`;
}

function getDays() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      date:  d.toISOString().split('T')[0],
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow'
        : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    };
  });
}

export default function BookingPage() {
  const { clinicId } = useParams();
  const { user }     = useAuth();
  const navigate     = useNavigate();

  const [clinic,          setClinic]   = useState(null);
  const [step,            setStep]     = useState(0);
  const [selectedService, setService]  = useState(null);
  const [selectedSlot,    setSlot]     = useState(null);
  const [selectedDay,     setDay]      = useState(getDays()[0].date);
  const [allSlots,        setAllSlots] = useState([]);
  const [slotCounts,      setCounts]   = useState({});
  const [guestForm,       setGuestForm]= useState({ name:'', email:'', phone:'', notes:'' });
  const [loading,         setLoading]  = useState(true);
  const [submitting,      setSubmitting]= useState(false);
  const [bookedSlots,     setBooked]   = useState(new Set());
  const [insurance,       setInsurance]= useState(null);
  const [error,           setError]    = useState('');

  // Real-time slot removal
  useSlotUpdates(clinicId, ({ slotId }) => {
    setBooked(prev => new Set([...prev, slotId]));
  });

  useEffect(() => {
    clinicApi.getById(clinicId)
      .then(({ data }) => {
        setClinic(data);
        if (user) api.get('/api/profile').then(r => setInsurance(r.data.insurance)).catch(() => {});
      })
      .finally(() => setLoading(false));
  }, [clinicId]);

  // Fetch slots for selected day
  useEffect(() => {
    if (!clinicId) return;
    api.get(`/api/clinics/${clinicId}/slots`, { params: { date: selectedDay } })
      .then(({ data }) => setAllSlots(Array.isArray(data) ? data : []))
      .catch(() => setAllSlots([]));
  }, [clinicId, selectedDay]);

  // Count available slots per day for tabs
  useEffect(() => {
    if (!clinicId) return;
    const days = getDays();
    Promise.all(days.map(d =>
      api.get(`/api/clinics/${clinicId}/slots`, { params: { date: d.date } })
        .then(({ data }) => ({ date: d.date, count: Array.isArray(data) ? data.length : 0 }))
        .catch(() => ({ date: d.date, count: 0 }))
    )).then(results => {
      const map = {};
      results.forEach(r => { map[r.date] = r.count; });
      setCounts(map);
    });
  }, [clinicId]);

  const handleBook = async () => {
    setSubmitting(true); setError('');
    try {
      let res;
      if (user) {
        res = await bookingApi.userBook({
          clinicId:    parseInt(clinicId),
          serviceId:   selectedService.id,
          timeSlotId:  selectedSlot.id,
          notes:       guestForm.notes,
        });
      } else {
        res = await bookingApi.guestBook({
          clinicId:    parseInt(clinicId),
          serviceId:   selectedService.id,
          timeSlotId:  selectedSlot.id,
          guestName:   guestForm.name,
          guestEmail:  guestForm.email,
          guestPhone:  guestForm.phone,
          notes:       guestForm.notes,
        });
      }
      navigate(`/booking/confirm?ref=${res.data.bookingRef}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed. Please try again.');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (!clinic)  return <div className={styles.loading}>Clinic not found.</div>;

  const days = getDays();
  const visibleSlots = allSlots.filter(s => !bookedSlots.has(s.id));
  const { morning, afternoon, evening } = groupSlots(visibleSlots);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Link to={`/clinic/${clinicId}`} className={styles.back}>
          <ChevronLeft size={15}/> {clinic.name}
        </Link>

        {/* Steps */}
        <div className={styles.steps}>
          {STEPS.map((s, i) => (
            <div key={s} className={`${styles.stepItem} ${i === step ? styles.stepActive : ''} ${i < step ? styles.stepDone : ''}`}>
              <div className={styles.stepCircle}>
                {i < step ? <Check size={12}/> : i + 1}
              </div>
              <span>{s}</span>
            </div>
          ))}
        </div>

        {/* Step 0 — Select service */}
        {step === 0 && (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Choose a service</h2>
            <div className={styles.serviceList}>
              {clinic.services?.filter(s => s.available !== false).map(svc => (
                <button key={svc.id}
                  className={`${styles.serviceCard} ${selectedService?.id === svc.id ? styles.serviceSelected : ''}`}
                  onClick={() => setService(svc)}>
                  <div className={styles.svcName}>{svc.serviceName}</div>
                  <div className={styles.svcMeta}>{svc.category} · {svc.durationMinutes} min</div>
                  <div className={styles.svcPrice}>¥{Number(svc.price).toLocaleString()}</div>
                </button>
              ))}
            </div>
            <button className={styles.nextBtn} disabled={!selectedService}
              onClick={() => setStep(1)}>
              Next →
            </button>
          </div>
        )}

        {/* Step 1 — Select time slot */}
        {step === 1 && (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Choose a time slot</h2>

            {/* Day tabs */}
            <div className={styles.dayTabs}>
              {days.map(d => (
                <button key={d.date}
                  className={`${styles.dayTab} ${selectedDay === d.date ? styles.dayTabActive : ''}`}
                  onClick={() => { setDay(d.date); setSlot(null); }}>
                  <div className={styles.dayLabel}>{d.label}</div>
                  <div className={`${styles.dayCount} ${(slotCounts[d.date] || 0) === 0 ? styles.dayCountEmpty : ''}`}>
                    {slotCounts[d.date] === undefined ? '...'
                      : slotCounts[d.date] === 0 ? 'No slots'
                      : `${slotCounts[d.date]} available`}
                  </div>
                </button>
              ))}
            </div>

            {/* Slot groups */}
            {visibleSlots.length === 0 ? (
              <div className={styles.noSlots}>
                <div style={{fontSize:32,marginBottom:8}}>🕐</div>
                No available slots for this day.
              </div>
            ) : (
              <div className={styles.slotGroups}>
                {morning.length > 0 && (
                  <div className={styles.slotGroup}>
                    <div className={styles.groupLabel}>
                      🌅 Morning <span>09:00 – 12:00</span>
                    </div>
                    <div className={styles.slotGrid}>
                      {morning.map(slot => (
                        <button key={slot.id}
                          className={`${styles.slotBtn} ${selectedSlot?.id === slot.id ? styles.slotSelected : ''}`}
                          onClick={() => setSlot(slot)}>
                          {fmt(slot.startTime)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {afternoon.length > 0 && (
                  <div className={styles.slotGroup}>
                    <div className={styles.groupLabel}>
                      ☀️ Afternoon <span>13:00 – 17:00</span>
                    </div>
                    <div className={styles.slotGrid}>
                      {afternoon.map(slot => (
                        <button key={slot.id}
                          className={`${styles.slotBtn} ${selectedSlot?.id === slot.id ? styles.slotSelected : ''}`}
                          onClick={() => setSlot(slot)}>
                          {fmt(slot.startTime)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {evening.length > 0 && (
                  <div className={styles.slotGroup}>
                    <div className={styles.groupLabel}>
                      🌆 Evening <span>18:00 – 20:00</span>
                    </div>
                    <div className={styles.slotGrid}>
                      {evening.map(slot => (
                        <button key={slot.id}
                          className={`${styles.slotBtn} ${selectedSlot?.id === slot.id ? styles.slotSelected : ''}`}
                          onClick={() => setSlot(slot)}>
                          {fmt(slot.startTime)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className={styles.navBtns}>
              <button className={styles.backBtn2} onClick={() => setStep(0)}>← Back</button>
              <button className={styles.nextBtn} disabled={!selectedSlot} onClick={() => setStep(2)}>
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Your details */}
        {step === 2 && (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Your details</h2>
            {user ? (
              <div className={styles.loggedInNote}>
                ✅ Booking as <strong>{user.name}</strong> ({user.email})
              </div>
            ) : (
              <div className={styles.guestForm}>
                <input className={styles.input} placeholder="Full name *"
                  value={guestForm.name} onChange={e => setGuestForm(p => ({...p, name: e.target.value}))} required/>
                <input className={styles.input} type="email" placeholder="Email *"
                  value={guestForm.email} onChange={e => setGuestForm(p => ({...p, email: e.target.value}))} required/>
                <input className={styles.input} placeholder="Phone *"
                  value={guestForm.phone} onChange={e => setGuestForm(p => ({...p, phone: e.target.value}))} required/>
              </div>
            )}
            <textarea className={styles.textarea} placeholder="Any notes for the clinic (optional)" rows={3}
              value={guestForm.notes} onChange={e => setGuestForm(p => ({...p, notes: e.target.value}))}/>
            <div className={styles.navBtns}>
              <button className={styles.backBtn2} onClick={() => setStep(1)}>← Back</button>
              <button className={styles.nextBtn}
                disabled={!user && (!guestForm.name || !guestForm.email || !guestForm.phone)}
                onClick={() => setStep(3)}>
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Confirm */}
        {step === 3 && (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Confirm booking</h2>
            <div className={styles.confirmCard}>
              <div className={styles.confirmRow}><span>Clinic</span><strong>{clinic.name}</strong></div>
              <div className={styles.confirmRow}><span>Service</span><strong>{selectedService?.serviceName}</strong></div>
              <div className={styles.confirmRow}><span>Price</span><strong>¥{Number(selectedService?.price).toLocaleString()}</strong></div>
              <div className={styles.confirmRow}><span>Date</span><strong>{selectedSlot?.date}</strong></div>
              <div className={styles.confirmRow}><span>Time</span><strong>{fmt(selectedSlot?.startTime)}</strong></div>
              <div className={styles.confirmRow}><span>Name</span><strong>{user ? user.name : guestForm.name}</strong></div>
              {insurance && (
                <div className={styles.confirmRow}>
                  <span>Insurance</span>
                  <strong>🛡 {insurance.insuranceName || insurance.insuranceType}</strong>
                </div>
              )}
            </div>
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.navBtns}>
              <button className={styles.backBtn2} onClick={() => setStep(2)}>← Back</button>
              <button className={styles.confirmBtn} onClick={handleBook} disabled={submitting}>
                {submitting ? 'Booking...' : '✅ Confirm Booking'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
