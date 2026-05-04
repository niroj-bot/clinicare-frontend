import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api';
import { Shield, User, Save, ChevronLeft } from 'lucide-react';
import styles from './ProfilePage.module.css';

const INSURANCE_TYPES = [
  { value: 'employee',  label: 'Employee Health Insurance (健康保険)' },
  { value: 'national',  label: 'National Health Insurance (国民健康保険)' },
  { value: 'mutualaid', label: 'Mutual Aid Insurance (共済組合)' },
  { value: 'elderly',   label: 'Elderly Insurance (後期高齢者医療)' },
];

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [profile, setProfile] = useState(null);
  const [form,    setForm]    = useState({ name: '', phone: '' });
  const [ins,     setIns]     = useState({ insuranceType: '', insuranceName: '', policyNumber: '', holderName: '' });
  const [saving,  setSaving]  = useState(false);
  const [savingIns, setSavingIns] = useState(false);
  const [msg,     setMsg]     = useState('');
  const [insMsg,  setInsMsg]  = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role === 'CLINIC') { navigate('/clinic'); return; }
    if (user.role === 'ADMIN')  { navigate('/admin'); return; }
    // Redirect doctors to their own profile page
    
    if (user.role === 'ADMIN')  { navigate('/admin'); return; }
    api.get('/api/profile').then(({ data }) => {
      setProfile(data);
      setForm({ name: data.name || '', phone: data.phone || '' });
      if (data.insurance) {
        setIns({
          insuranceType: data.insurance.insuranceType || '',
          insuranceName: data.insurance.insuranceName || '',
          policyNumber:  data.insurance.policyNumber  || '',
          holderName:    data.insurance.holderName    || '',
        });
      }
    });
  }, [user]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.put('/api/profile', form);
      setMsg('Profile updated!');
      setTimeout(() => setMsg(''), 3000);
    } finally { setSaving(false); }
  };

  const saveInsurance = async () => {
    setSavingIns(true);
    try {
      // Set display name from type
      const found = INSURANCE_TYPES.find(t => t.value === ins.insuranceType);
      await api.put('/api/profile/insurance', {
        ...ins,
        insuranceName: found?.label || ins.insuranceType,
      });
      setInsMsg('Insurance saved!');
      setTimeout(() => setInsMsg(''), 3000);
    } finally { setSavingIns(false); }
  };

  if (!profile) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Link to="/" className={styles.back}><ChevronLeft size={15}/> Back</Link>
        <h1 className={styles.title}>My Profile</h1>

        {/* Profile */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <User size={18} className={styles.cardIcon}/>
            <h2 className={styles.cardTitle}>Personal details</h2>
          </div>
          <div className={styles.fields}>
            <div className={styles.field}>
              <label>Full name</label>
              <input value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} placeholder="Your name"/>
            </div>
            <div className={styles.field}>
              <label>Email</label>
              <input value={profile.email} disabled className={styles.disabled}/>
            </div>
            <div className={styles.field}>
              <label>Phone</label>
              <input value={form.phone} onChange={e => setForm(p=>({...p,phone:e.target.value}))} placeholder="080-XXXX-XXXX"/>
            </div>
          </div>
          {msg && <div className={styles.success}>{msg}</div>}
          <button className={styles.saveBtn} onClick={saveProfile} disabled={saving}>
            <Save size={14}/> {saving ? 'Saving...' : 'Save profile'}
          </button>
        </div>

        {/* Insurance */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <Shield size={18} className={styles.cardIcon}/>
            <h2 className={styles.cardTitle}>Insurance card (保険証)</h2>
          </div>
          <div className={styles.fields}>
            <div className={styles.field}>
              <label>Insurance type</label>
              <select className={styles.select}
                value={ins.insuranceType}
                onChange={e => setIns(p=>({...p, insuranceType:e.target.value}))}>
                <option value="">Select insurance type</option>
                {INSURANCE_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label>Policy number (保険証番号)</label>
              <input value={ins.policyNumber}
                onChange={e => setIns(p=>({...p,policyNumber:e.target.value}))}
                placeholder="e.g. 12345678"/>
            </div>
            <div className={styles.field}>
              <label>Holder name (被保険者名)</label>
              <input value={ins.holderName}
                onChange={e => setIns(p=>({...p,holderName:e.target.value}))}
                placeholder="Name on insurance card"/>
            </div>
          </div>

          {ins.insuranceType && (
            <div className={styles.insPreview}>
              <div className={styles.insCard}>
                <div className={styles.insCardTop}>
                  <span className={styles.insCardLabel}>保険証</span>
                  <span className={styles.insCardType}>
                    {INSURANCE_TYPES.find(t=>t.value===ins.insuranceType)?.label}
                  </span>
                </div>
                <div className={styles.insCardName}>{ins.holderName || '—'}</div>
                <div className={styles.insCardNum}>{ins.policyNumber || '—'}</div>
              </div>
            </div>
          )}

          {insMsg && <div className={styles.success}>{insMsg}</div>}
          <button className={styles.saveBtn} onClick={saveInsurance} disabled={savingIns}>
            <Save size={14}/> {savingIns ? 'Saving...' : 'Save insurance card'}
          </button>
        </div>
      </div>
    </div>
  );
}
