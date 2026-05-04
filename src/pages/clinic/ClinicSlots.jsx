import { useState, useEffect } from 'react';
import { clinicDashApi } from '../../api';
import { AdminTable, Modal, FormField, Input, Btn } from '../../components/admin/AdminUI';
import { Plus, Trash2 } from 'lucide-react';
import styles from './ClinicPages.module.css';

const today = () => new Date().toISOString().split('T')[0];

export default function ClinicSlots() {
  const [slots,    setSlots]   = useState([]);
  const [date,     setDate]    = useState(today());
  const [modal,    setModal]   = useState(false);
  const [form,     setForm]    = useState({ date: today(), startTime: '09:00', endTime: '09:30' });
  const [saving,   setSaving]  = useState(false);
  const [deleting, setDeleting]= useState(null);

  const load = () => clinicDashApi.getSlots(date).then(({ data }) => setSlots(data));
  useEffect(() => { load(); }, [date]);

  const addSingle = async () => {
    setSaving(true);
    try { await clinicDashApi.addSlot(form); setModal(false); load(); }
    finally { setSaving(false); }
  };

  const addFullDay = async () => {
    setSaving(true);
    const times = [
      ['09:00','09:30'],['09:30','10:00'],['10:00','10:30'],['10:30','11:00'],
      ['11:00','11:30'],['11:30','12:00'],
      ['13:00','13:30'],['13:30','14:00'],['14:00','14:30'],['14:30','15:00'],
      ['15:00','15:30'],['15:30','16:00'],['16:00','16:30'],
      ['18:00','18:30'],['18:30','19:00'],['19:00','19:30'],
    ];
    try {
      for (const [s,e] of times) {
        await clinicDashApi.addSlot({ date: form.date, startTime: s, endTime: e });
      }
      setModal(false); load();
    } finally { setSaving(false); }
  };

  const deleteSlot = async (id) => {
    if (!window.confirm('Delete this slot?')) return;
    setDeleting(id);
    try { await clinicDashApi.deleteSlot(id); load(); }
    catch (err) { alert(err.response?.data?.error || 'Cannot delete booked slot'); }
    finally { setDeleting(null); }
  };

  const f = key => ({ value: form[key], onChange: e => setForm(p=>({...p,[key]:e.target.value})) });

  const available = slots.filter(s => !s.isBooked).length;
  const booked    = slots.filter(s =>  s.isBooked).length;

  const columns = [
    { key: 'date',      label: 'Date' },
    { key: 'startTime', label: 'Start', render: r => r.startTime?.slice(0,5) },
    { key: 'endTime',   label: 'End',   render: r => r.endTime?.slice(0,5)   },
    { key: 'isBooked',  label: 'Status', render: r => (
      <span style={{fontSize:12,fontWeight:500,color:r.isBooked?'var(--danger)':'var(--brand)'}}>
        {r.isBooked ? 'Booked' : 'Available'}
      </span>
    )},
    { key: 'delete', label: '', render: r => (
      !r.isBooked ? (
        <button
          onClick={() => deleteSlot(r.id)}
          disabled={deleting === r.id}
          style={{color:'var(--danger)',display:'flex',alignItems:'center',gap:4,fontSize:12,opacity:deleting===r.id?.5:1}}>
          <Trash2 size={13}/> {deleting === r.id ? '...' : 'Delete'}
        </button>
      ) : (
        <span style={{fontSize:11,color:'var(--text-3)'}}>—</span>
      )
    )},
  ];

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Time Slots</h1>
        <Btn onClick={() => { setForm({date, startTime:'09:00', endTime:'09:30'}); setModal(true); }}>
          <Plus size={14}/> Add Slots
        </Btn>
      </div>

      <div className={styles.toolbar}>
        <input type="date" className={styles.dateInput} value={date}
          onChange={e => setDate(e.target.value)} />
        <span className={styles.slotSummary}>
          <span className={styles.available}>{available} available</span>
          <span className={styles.booked}>{booked} booked</span>
        </span>
      </div>

      <AdminTable columns={columns}
        rows={[...slots].sort((a,b) => a.startTime > b.startTime ? 1 : -1)}
        emptyMsg="No slots for this date. Add slots so patients can book." />

      {modal && (
        <Modal title="Add Time Slots" onClose={() => setModal(false)}>
          <FormField label="Date"><Input type="date" {...f('date')} /></FormField>
          <FormField label="Start time"><Input type="time" {...f('startTime')} /></FormField>
          <FormField label="End time"><Input type="time" {...f('endTime')} /></FormField>
          <div style={{display:'flex',gap:8,justifyContent:'flex-end',flexWrap:'wrap'}}>
            <Btn variant="secondary" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn variant="secondary" onClick={addFullDay} disabled={saving}>
              {saving ? 'Adding...' : '+ Full Day (16 slots)'}
            </Btn>
            <Btn onClick={addSingle} disabled={saving}>
              {saving ? 'Adding...' : 'Add Single Slot'}
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
