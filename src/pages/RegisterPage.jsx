import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { authApi } from '../api';
import { Activity, Mail } from 'lucide-react';
import styles from './AuthPage.module.css';

// Step 1 — fill form + send OTP
// Step 2 — enter 6-digit code + complete registration

export default function RegisterPage() {
  const { register, getHomePath, user } = useAuth();
  const navigate      = useNavigate();
  // Already logged in → redirect to their home
  if (user) return <Navigate to={getHomePath(user.role)} replace />;

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [otp,  setOtp]  = useState('');
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const sendOtp = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError('Please fill all required fields.'); return; }
    setSending(true); setError('');
    try {
      await authApi.sendOtp({ name: form.name, email: form.email });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send code');
    } finally { setSending(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await register({ ...form, otp });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  const f = key => ({ value: form[key], onChange: e => setForm(p => ({...p, [key]: e.target.value})) });

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}><Activity size={22}/> ClinICare</div>

        {step === 1 ? (
          <>
            <h1 className={styles.title}>Create account</h1>
            <p className={styles.sub}>Track bookings and manage your health</p>
            <form onSubmit={sendOtp} className={styles.form}>
              <input className={styles.input} placeholder="Full name *" {...f('name')} required />
              <input className={styles.input} type="email" placeholder="Email *" {...f('email')} required />
              <input className={styles.input} type="password" placeholder="Password (min 6 chars) *" {...f('password')} required />
              <input className={styles.input} placeholder="Phone number" {...f('phone')} />
              {error && <div className={styles.error}>{error}</div>}
              <button className={styles.btn} disabled={sending}>
                {sending ? 'Sending code...' : 'Send verification code'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className={styles.otpIcon}><Mail size={32}/></div>
            <h1 className={styles.title}>Check your email</h1>
            <p className={styles.sub}>We sent a 6-digit code to <strong>{form.email}</strong></p>
            <form onSubmit={handleRegister} className={styles.form}>
              <input
                className={styles.otpInput}
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                required
              />
              {error && <div className={styles.error}>{error}</div>}
              <button className={styles.btn} disabled={loading || otp.length < 6}>
                {loading ? 'Creating account...' : 'Verify & Create Account'}
              </button>
              <button type="button" className={styles.resendBtn} onClick={() => { setStep(1); setOtp(''); setError(''); }}>
                ← Change email or resend
              </button>
            </form>
          </>
        )}

        <p className={styles.switch}>Already have an account? <Link to="/login" className={styles.switchLink}>Login</Link></p>
      </div>
    </div>
  );
}
