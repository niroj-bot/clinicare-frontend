import { useState, useEffect } from 'react';
import { adminApi } from '../../adminApi';
import api from '../../api';
import { PageHeader, AdminTable, Modal, FormField, Input, Btn } from '../../components/admin/AdminUI';
import { Plus, Pencil, KeyRound, CheckCircle } from 'lucide-react';

const EMPTY = { name:'', address:'', phone:'', description:'', latitude:'', longitude:'' };
const ACCT  = { email:'', password:'' };

export default function AdminClinics() {
  const [clinics,   setClinics]  = useState([]);
  const [loading,   setLoading]  = useState(true);
  const [modal,     setModal]    = useState(false);   // clinic edit modal
  const [acctModal, setAcctModal]= useState(false);   // create account modal
  const [editing,   setEditing]  = useState(null);
  const [acctClinic,setAcctClinic]=useState(null);    // clinic to create account for
  const [form,      setForm]     = useState(EMPTY);
  const [acctForm,  setAcctForm] = useState(ACCT);
  const [accounts,  setAccounts] = useState({});      
  const [saving,    setSaving]   = useState(false);
  const [error,     setError]    = useState('');
  const [acctMsg,   setAcctMsg]  = useState('');

  const load = () => {
    adminApi.getClinics()
      .then(({ data }) => {
        setClinics(data);
        // Load account status for each clinic
        data.forEach(c => {
          api.get(`/api/admin/clinics/${c.id}/account`)
            .then(({ data: a }) => {
              if (a.hasAccount) setAccounts(prev => ({...prev, [c.id]: a}));
            }).catch(() => {});
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setError(''); setModal(true); };
  const openEdit   = (c) => {
    setEditing(c);
    setForm({ name:c.name||'', address:c.address||'', phone:c.phone||'',
              description:c.description||'', latitude:c.latitude||'', longitude:c.longitude||'' });
    setError(''); setModal(true);
  };
  const openAcct   = (c) => { setAcctClinic(c); setAcctForm(ACCT); setAcctMsg(''); setError(''); setAcctModal(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Clinic name required.'); return; }
    setSaving(true); setError('');
    try {
      const payload = { ...form,
        latitude:  form.latitude  ? parseFloat(form.latitude)  : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      };
      if (editing) await adminApi.updateClinic(editing.id, payload);
      else         await adminApi.createClinic(payload);
      setModal(false); load();
    } catch (err) { setError(err.response?.data?.error || 'Save failed.'); }
    finally { setSaving(false); }
  };

  const handleCreateAccount = async () => {
    if (!acctForm.email || !acctForm.password) { setError('Email and password required.'); return; }
    if (acctForm.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setSaving(true); setError('');
    try {
      await api.post(`/api/admin/clinics/${acctClinic.id}/account`, acctForm);
      setAcctMsg(`✅ Account created! Email: ${acctForm.email}`);
      setAccounts(prev => ({...prev, [acctClinic.id]: { hasAccount:true, email:acctForm.email }}));
      setAcctForm(ACCT);
    } catch (err) { setError(err.response?.data?.error || 'Failed to create account.'); }
    finally { setSaving(false); }
  };

  const f    = key => ({ value: form[key],     onChange: e => setForm(p=>({...p,[key]:e.target.value})) });
  const af   = key => ({ value: acctForm[key], onChange: e => setAcctForm(p=>({...p,[key]:e.target.value})) });

  const columns = [
    { key: 'name',    label: 'Clinic Name', render: r => <strong>{r.name}</strong> },
    { key: 'address', label: 'Address' },
    { key: 'phone',   label: 'Phone' },
    { key: 'rating',  label: 'Rating', render: r => `⭐ ${r.averageRating?.toFixed(1) ?? '—'}` },
    { key: 'account', label: 'Login Account', render: r => (
      accounts[r.id] ? (
        <span style={{display:'flex',alignItems:'center',gap:5,fontSize:12,color:'var(--brand)'}}>
          <CheckCircle size={13}/> {accounts[r.id].email}
        </span>
      ) : (
        <span style={{fontSize:12,color:'var(--text-3)'}}>No account</span>
      )
    )},
    { key: 'actions', label: '', render: r => (
      <div style={{display:'flex',gap:6}}>
        <Btn variant="secondary" onClick={() => openEdit(r)}>
          <Pencil size={12}/> Edit
        </Btn>
        {!accounts[r.id] && (
          <Btn onClick={() => openAcct(r)}>
            <KeyRound size={12}/> Create Account
          </Btn>
        )}
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader
        title="Clinics"
        subtitle="Manage clinic profiles and login accounts"
        action={<Btn onClick={openCreate}><Plus size={14}/> Add Clinic</Btn>}
      />

      {loading ? <p>Loading...</p>
        : <AdminTable columns={columns} rows={clinics} emptyMsg="No clinics yet." />}

      {/* Edit/Create clinic modal */}
      {modal && (
        <Modal title={editing ? 'Edit Clinic' : 'Add New Clinic'} onClose={() => setModal(false)}>
          <FormField label="Clinic Name" required><Input placeholder="e.g. Shinjuku Medical Center" {...f('name')} /></FormField>
          <FormField label="Address"><Input placeholder="Full address" {...f('address')} /></FormField>
          <FormField label="Phone"><Input placeholder="03-XXXX-XXXX" {...f('phone')} /></FormField>
          <FormField label="Description"><Input placeholder="Short description" {...f('description')} /></FormField>
          <FormField label="Latitude"><Input type="number" step="any" placeholder="e.g. 35.6895" {...f('latitude')} /></FormField>
          <FormField label="Longitude"><Input type="number" step="any" placeholder="e.g. 139.6917" {...f('longitude')} /></FormField>
          {error && <p style={{color:'var(--danger)',fontSize:13}}>{error}</p>}
          <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
            <Btn variant="secondary" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn onClick={handleSave} disabled={saving}>{saving?'Saving...':'Save'}</Btn>
          </div>
        </Modal>
      )}

      {/* Create account modal */}
      {acctModal && (
        <Modal title={`Create Login — ${acctClinic?.name}`} onClose={() => setAcctModal(false)}>
          <p style={{fontSize:13,color:'var(--text-2)',marginBottom:16}}>
            Create login credentials for this clinic. Give these to the clinic owner so they can access their dashboard.
          </p>
          <FormField label="Email address">
            <Input type="email" placeholder="e.g. osaka1@clinicare.com" {...af('email')} />
          </FormField>
          <FormField label="Password">
            <Input type="password" placeholder="Min 6 characters" {...af('password')} />
          </FormField>
          {error  && <p style={{color:'var(--danger)',fontSize:13,marginBottom:8}}>{error}</p>}
          {acctMsg && (
            <div style={{background:'var(--brand-light)',border:'1px solid var(--brand)',borderRadius:8,padding:'10px 14px',fontSize:13,color:'var(--brand)',marginBottom:8}}>
              {acctMsg}
              <div style={{marginTop:4,fontSize:12,color:'var(--text-2)'}}>
                Clinic can change password anytime via Forgot Password.
              </div>
            </div>
          )}
          <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
            <Btn variant="secondary" onClick={() => setAcctModal(false)}>
              {acctMsg ? 'Close' : 'Cancel'}
            </Btn>
            {!acctMsg && (
              <Btn onClick={handleCreateAccount} disabled={saving}>
                {saving ? 'Creating...' : 'Create Account'}
              </Btn>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
