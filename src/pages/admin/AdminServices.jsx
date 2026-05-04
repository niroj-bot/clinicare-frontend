import { useState, useEffect } from 'react';
import { adminApi } from '../../adminApi';
import { PageHeader, AdminTable, Modal, FormField, Input, Select, Btn } from '../../components/admin/AdminUI';
import { Plus, Pencil } from 'lucide-react';

const CATEGORIES = ['Lab', 'Imaging', 'Cardiology', 'Pediatrics', 'Preventive', 'Dental', 'General'];
const EMPTY = { clinicId: '', serviceName: '', category: '', description: '', price: '', durationMinutes: '30', available: true };

export default function AdminServices() {
  const [clinics,  setClinics]  = useState([]);
  const [services, setServices] = useState([]);
  const [selClinic, setSelClinic] = useState('');
  const [modal,    setModal]    = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  useEffect(() => {
    adminApi.getClinics().then(({ data }) => {
      setClinics(data);
      if (data.length > 0) setSelClinic(String(data[0].id));
    });
  }, []);

  useEffect(() => {
    if (!selClinic) return;
    // Load services from the clinic's services list
    adminApi.getClinics().then(({ data }) => {
      const c = data.find(c => String(c.id) === selClinic);
      setServices(c?.services || []);
    });
  }, [selClinic]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY, clinicId: selClinic });
    setError(''); setModal(true);
  };

  const openEdit = (svc) => {
    setEditing(svc);
    setForm({
      clinicId: selClinic,
      serviceName: svc.serviceName || '',
      category: svc.category || '',
      description: svc.description || '',
      price: svc.price || '',
      durationMinutes: svc.durationMinutes || 30,
      available: svc.available !== false,
    });
    setError(''); setModal(true);
  };

  const handleSave = async () => {
    if (!form.serviceName.trim() || !form.price) { setError('Service name and price are required.'); return; }
    setSaving(true); setError('');
    try {
      const payload = {
        serviceName: form.serviceName, category: form.category,
        description: form.description, price: parseFloat(form.price),
        durationMinutes: parseInt(form.durationMinutes) || 30,
        available: form.available,
      };
      if (editing) await adminApi.updateService(editing.id, payload);
      else         await adminApi.addService(selClinic, payload);
      setModal(false);
      // Refresh
      adminApi.getClinics().then(({ data }) => {
        const c = data.find(c => String(c.id) === selClinic);
        setServices(c?.services || []);
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed.');
    } finally { setSaving(false); }
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });

  const columns = [
    { key: 'serviceName',    label: 'Service',  render: r => <strong>{r.serviceName}</strong> },
    { key: 'category',       label: 'Category' },
    { key: 'price',          label: 'Price',    render: r => `¥${Number(r.price).toLocaleString()}` },
    { key: 'durationMinutes',label: 'Duration', render: r => `${r.durationMinutes} min` },
    { key: 'available',      label: 'Status',   render: r => (
      <span style={{ color: r.available !== false ? 'var(--brand)' : 'var(--danger)', fontSize: 12, fontWeight: 500 }}>
        {r.available !== false ? 'Active' : 'Inactive'}
      </span>
    )},
    { key: 'actions', label: '', render: r => (
      <Btn variant="secondary" onClick={() => openEdit(r)}>
        <Pencil size={12} /> Edit
      </Btn>
    )},
  ];

  return (
    <div>
      <PageHeader
        title="Services"
        subtitle="Manage what each clinic offers and their prices"
        action={<Btn onClick={openCreate}><Plus size={14} /> Add Service</Btn>}
      />

      {/* Clinic selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <label style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>Clinic:</label>
        <select
          value={selClinic}
          onChange={e => setSelClinic(e.target.value)}
          style={{ height: 34, border: '1px solid var(--border)', borderRadius: 6, padding: '0 10px', fontSize: 13, outline: 'none' }}
        >
          {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <AdminTable columns={columns} rows={services} emptyMsg="No services for this clinic yet." />

      {modal && (
        <Modal title={editing ? 'Edit Service' : 'Add Service'} onClose={() => setModal(false)}>
          <FormField label="Service Name" required>
            <Input placeholder="e.g. Blood Test" {...f('serviceName')} />
          </FormField>
          <FormField label="Category">
            <Select {...f('category')}>
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </FormField>
          <FormField label="Description">
            <Input placeholder="Short description" {...f('description')} />
          </FormField>
          <FormField label="Price (¥)" required>
            <Input type="number" placeholder="e.g. 3500" {...f('price')} />
          </FormField>
          <FormField label="Duration (minutes)">
            <Input type="number" placeholder="30" {...f('durationMinutes')} />
          </FormField>
          {editing && (
            <FormField label="Status">
              <Select value={form.available} onChange={e => setForm(p => ({ ...p, available: e.target.value === 'true' }))}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
            </FormField>
          )}
          {error && <p style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn variant="secondary" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
