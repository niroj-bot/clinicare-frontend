import { useState, useEffect } from 'react';
import { clinicDashApi } from '../../api';
import { AdminTable, Modal, FormField, Input, Select, Btn } from '../../components/admin/AdminUI';
import { Plus, Pencil } from 'lucide-react';
import styles from './ClinicPages.module.css';

const CATEGORIES = ['Lab','Imaging','Cardiology','Pediatrics','Preventive','Dental','General'];
const EMPTY = { serviceName:'', category:'', description:'', price:'', durationMinutes:'30', available: true };

export default function ClinicServices() {
  const [services, setServices] = useState([]);
  const [modal,    setModal]    = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  const load = () => clinicDashApi.getServices().then(({ data }) => setServices(data));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setError(''); setModal(true); };
  const openEdit   = s => { setEditing(s); setForm({ serviceName: s.serviceName, category: s.category||'', description: s.description||'', price: s.price, durationMinutes: s.durationMinutes, available: s.available }); setError(''); setModal(true); };

  const save = async () => {
    if (!form.serviceName || !form.price) { setError('Name and price required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, price: parseFloat(form.price), durationMinutes: parseInt(form.durationMinutes)||30 };
      if (editing) await clinicDashApi.updateService(editing.id, payload);
      else         await clinicDashApi.addService(payload);
      setModal(false); load();
    } catch { setError('Save failed'); }
    finally { setSaving(false); }
  };

  const f = key => ({ value: form[key], onChange: e => setForm(p=>({...p,[key]:e.target.value})) });

  const columns = [
    { key: 'serviceName',    label: 'Service', render: r => <strong>{r.serviceName}</strong> },
    { key: 'category',       label: 'Category' },
    { key: 'price',          label: 'Price',   render: r => `¥${Number(r.price).toLocaleString()}` },
    { key: 'durationMinutes',label: 'Duration',render: r => `${r.durationMinutes} min` },
    { key: 'available',      label: 'Status',  render: r => (
      <span style={{fontSize:12,fontWeight:500,color:r.available!==false?'var(--brand)':'var(--danger)'}}>
        {r.available!==false?'Active':'Inactive'}
      </span>
    )},
    { key: 'actions', label: '', render: r => (
      <Btn variant="secondary" onClick={() => openEdit(r)}><Pencil size={12}/> Edit</Btn>
    )},
  ];

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Services</h1>
        <Btn onClick={openCreate}><Plus size={14}/> Add Service</Btn>
      </div>
      <AdminTable columns={columns} rows={services} emptyMsg="No services yet. Add your first service." />

      {modal && (
        <Modal title={editing ? 'Edit Service' : 'Add Service'} onClose={() => setModal(false)}>
          <FormField label="Service name" required><Input placeholder="e.g. Blood Test" {...f('serviceName')} /></FormField>
          <FormField label="Category">
            <Select {...f('category')}>
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </FormField>
          <FormField label="Price (¥)" required><Input type="number" placeholder="3500" {...f('price')} /></FormField>
          <FormField label="Duration (minutes)"><Input type="number" placeholder="30" {...f('durationMinutes')} /></FormField>
          {editing && (
            <FormField label="Status">
              <Select value={String(form.available)} onChange={e => setForm(p=>({...p,available:e.target.value==='true'}))}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
            </FormField>
          )}
          {error && <p style={{color:'var(--danger)',fontSize:13}}>{error}</p>}
          <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
            <Btn variant="secondary" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn onClick={save} disabled={saving}>{saving?'Saving...':'Save'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
