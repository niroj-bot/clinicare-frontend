import { useState, useEffect } from 'react';
import { clinicDashApi } from '../../api';
import { Btn } from '../../components/admin/AdminUI';
import styles from './ClinicPages.module.css';

export default function ClinicProfile() {
  const [info,   setInfo]   = useState(null);
  const [form,   setForm]   = useState({ name:'', address:'', phone:'', description:'' });
  const [saving, setSaving] = useState(false);
  const [msg,    setMsg]    = useState('');

  useEffect(() => {
    clinicDashApi.getInfo().then(({ data }) => {
      setInfo(data);
      setForm({ name: data.name||'', address: data.address||'', phone: data.phone||'', description: data.description||'' });
    });
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await clinicDashApi.updateInfo(form);
      setMsg('Clinic info updated!');
      setTimeout(() => setMsg(''), 3000);
    } finally { setSaving(false); }
  };

  const f = key => ({ value: form[key], onChange: e => setForm(p=>({...p,[key]:e.target.value})) });

  if (!info) return <div className={styles.loading}>Loading...</div>;

  return (
    <div>
      <h1 className={styles.title}>Clinic Info</h1>

      <div className={styles.infoCard}>
        <div className={styles.infoRow}>
          <span>Average Rating</span>
          <strong>⭐ {info.averageRating?.toFixed(1)} ({info.reviewCount} reviews)</strong>
        </div>
        <div className={styles.infoRow}>
          <span>Coordinates</span>
          <strong>{info.latitude}, {info.longitude}</strong>
        </div>
      </div>

      <div className={styles.formCard}>
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label>Clinic name</label>
            <input {...f('name')} />
          </div>
          <div className={styles.field}>
            <label>Phone</label>
            <input {...f('phone')} placeholder="03-XXXX-XXXX" />
          </div>
          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label>Address</label>
            <input {...f('address')} />
          </div>
          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label>Description</label>
            <textarea {...f('description')} rows={3} />
          </div>
        </div>
        {msg && <div className={styles.success}>{msg}</div>}
        <Btn onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</Btn>
      </div>
    </div>
  );
}
