import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api';
import { Activity, Lock } from 'lucide-react';
import styles from './AuthPage.module.css';

export default function ForgotPasswordPage() {
  const [step,     setStep]    = useState(1); // 1=email, 2=otp+newpass
  const [email,    setEmail]   = useState('');
  const [otp,      setOtp]     = useState('');
  const [newPass,  setNewPass] = useState('');
  const [error,    setError]   = useState('');
  const [msg,      setMsg]     = useState('');
  const [loading,  setLoading] = useState(false);

  const sendOtp = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setMsg('Code sent! Check your email.');
      setStep(2);
    } catch { setError('Failed to send code. Check your email address.'); }
    finally { setLoading(false); }
  };

  const resetPass = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await authApi.resetPassword({ email, otp, newPassword: newPass });
      setMsg('Password reset! You can now login.');
      setStep(3);
    } catch (err) { setError(err.response?.data?.error || 'Invalid code'); }
    finally { setLoading(false); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}><Activity size={22}/> ClinICare</div>
        <div className={styles.otpIcon}><Lock size={32}/></div>

        {step === 1 && (
          <>
            <h1 className={styles.title}>Forgot password?</h1>
            <p className={styles.sub}>Enter your email and we'll send a reset code</p>
            <form onSubmit={sendOtp} className={styles.form}>
              <input className={styles.input} type="email" placeholder="Your email"
                value={email} onChange={e => setEmail(e.target.value)} required />
              {error && <div className={styles.error}>{error}</div>}
              <button className={styles.btn} disabled={loading}>
                {loading ? 'Sending...' : 'Send reset code'}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className={styles.title}>Enter reset code</h1>
            <p className={styles.sub}>Code sent to <strong>{email}</strong></p>
            <form onSubmit={resetPass} className={styles.form}>
              <input className={styles.otpInput} placeholder="000000" maxLength={6}
                value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} required />
              <input className={styles.input} type="password" placeholder="New password (min 6 chars)"
                value={newPass} onChange={e => setNewPass(e.target.value)} required />
              {error && <div className={styles.error}>{error}</div>}
              <button className={styles.btn} disabled={loading || otp.length < 6}>
                {loading ? 'Resetting...' : 'Reset password'}
              </button>
            </form>
          </>
        )}

        {step === 3 && (
          <div className={styles.successBox}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <h2 style={{ marginBottom: 8 }}>Password reset!</h2>
            <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 20 }}>You can now login with your new password.</p>
            <Link to="/login" className={styles.btn} style={{ textAlign: 'center', display: 'block' }}>Go to Login</Link>
          </div>
        )}

        {step < 3 && (
          <p className={styles.switch}><Link to="/login" className={styles.switchLink}>← Back to login</Link></p>
        )}
      </div>
    </div>
  );
}
