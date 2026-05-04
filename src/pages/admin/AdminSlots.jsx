import { useState, useEffect } from 'react';
import { adminApi } from '../../adminApi';
import { PageHeader, AdminTable, Modal, FormField, Input, Btn } from '../../components/admin/AdminUI';
import { Plus } from 'lucide-react';

const today = () => new Date().toISOString().split('T')[0];
const EMPTY  = { date: today(), startTime: '09:00', endTime: '09:30', waitMinutes: '0' };

export default function AdminSlots() {
  const [clinics,  setClinics]  = useState([]);
  const [slots,    setSlots]    = useState([]);
  const [selClinic, setSelClinic] = useState('');
  const [modal,    setModal]    = useState(false);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  useEffect(() => {
    adminApi.getClinics().then(({ data }) => {
      setClinics(data);
      if (data.length) setSelClinic(String(data[0].id));
    });
  }, []);

  useEffect(() => {
    if (!selClinic) return;
    adminApi.getClinics().then(({ data }) => {
      const c = data.find(c => String(c.id) === selClinic);
      setSlots(c?.timeSlots || []);
    });
  }, [selClinic]);

  const handleSave = async () => {
    if (!form.date || !form.startTime || !form.endTime) { setError('Date and times are required.'); return; }
    setSaving(true); setError('');
    try {
      await adminApi.addSlot(selClinic, {
        date: form.date,
        startTime: form.startTime,
        endTime:   form.endTime,
        waitMinutes: parseInt(form.waitMinutes) || 0,
      });
      setModal(false);
      adminApi.getClinics().then(({ data }) => {
        const c = data.find(c => String(c.id) === selClinic);
        setSlots(c?.timeSlots || []);
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed.');
    } finally { setSaving(false); }
  };

  // Bulk add — generate slots for a whole day
  const bulkAdd = async () => {
    const times = [
      ['09:00','09:30'],['09:30','10:00'],['10:00','10:30'],['10:30','11:00'],
      ['11:00','11:30'],['13:00','13:30'],['13:30','14:00'],['14:00','14:30'],
      ['14:30','15:00'],['15:00','15:30'],['15:30','16:00'],['16:00','16:30'],
    ];
    setSaving(true);
    try {
      for (const [s, e] of times) {
        await adminApi.addSlot(selClinic, { date: form.date, startTime: s, endTime: e, waitMinutes: 0 });
      }
      adminApi.getClinics().then(({ data }) => {
        const c = data.find(c => String(c.id) === selClinic);
        setSlots(c?.timeSlots || []);
      });
      setModal(false);
    } finally { setSaving(false); }
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });

  const columns = [
    { key: 'date',      label: 'Date' },
    { key: 'startTime', label: 'Start', render: r => r.startTime?.slice(0, 5) },
    { key: 'endTime',   label: 'End',   render: r => r.endTime?.slice(0, 5) },
    { key: 'isBooked',  label: 'Status', render: r => (
      <span style={{ fontSize: 12, fontWeight: 500, color: r.isBooked ? 'var(--danger)' : 'var(--brand)' }}>
        {r.isBooked ? 'Booked' : 'Available'}
      </span>
    )},
    { key: 'waitMinutes', label: 'Wait', render: r => `${r.waitMinutes ?? 0} min` },
  ];

  return (
    <div>
      <PageHeader
        title="Time Slots"
        subtitle="Manage available appointment slots for each clinic"
        action={<Btn onClick={() => { setForm(EMPTY); setError(''); setModal(true); }}><Plus size={14} /> Add Slots</Btn>}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <label style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>Clinic:</label>
        <select
          value={selClinic}
          onChange={e => setSelClinic(e.target.value)}
          style={{ height: 34, border: '1px solid var(--border)', borderRadius: 6, padding: '0 10px', fontSize: 13, outline: 'none' }}
        >
          {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
          {slots.filter(s => !s.isBooked).length} available · {slots.filter(s => s.isBooked).length} booked
        </span>
      </div>

      <AdminTable
        columns={columns}
        rows={[...slots].sort((a, b) => a.date > b.date ? 1 : -1)}
        emptyMsg="No slots yet. Add slots so patients can book!"
      />

      {modal && (
        <Modal title="Add Time Slots" onClose={() => setModal(false)}>
          <FormField label="Date" required>
            <Input type="date" {...f('date')} />
          </FormField>
          <FormField label="Start Time" required>
            <Input type="time" {...f('startTime')} />
          </FormField>
          <FormField label="End Time" required>
            <Input type="time" {...f('endTime')} />
          </FormField>
          <FormField label="Wait time (minutes)">
            <Input type="number" placeholder="0" {...f('waitMinutes')} />
          </FormField>
          {error && <p style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Btn variant="secondary" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn variant="secondary" onClick={bulkAdd} disabled={saving}>
              {saving ? 'Adding...' : '+ Full Day (12 slots)'}
            </Btn>
            <Btn onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Add Single Slot'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
