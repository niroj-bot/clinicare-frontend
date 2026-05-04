import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Activity } from 'lucide-react';
import styles from './AuthPage.module.css';

const DEMO_ACCOUNTS = [
  { role: 'Patient',  email: 'patient@clinicare.com', password: 'patient123', color: '#1a6b4a' },
  { role: 'Clinic',   email: 'clinic1@clinicare.com', password: 'clinic123',  color: '#0c2d4a' },
  { role: 'Admin',    email: 'admin@clinicare.com',   password: 'admin123',   color: '#7c3aed' },
];

export default function LoginPage() {
  const { login, getHomePath, user } = useAuth();
  const navigate = useNavigate();
  const [form,    setForm]   = useState({ email: '', password: '' });
  const [error,   setError]  = useState('');
  const [loading, setLoading]= useState(false);
  const [demoLoading, setDemoLoading] = useState('');

  if (user) return <Navigate to={getHomePath(user.role)} replace />;

  const handle = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const data = await login(form.email, form.password);
      navigate(getHomePath(data.role));
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  const demoLogin = async (account) => {
    setDemoLoading(account.role); setError('');
    try {
      const data = await login(account.email, account.password);
      navigate(getHomePath(data.role));
    } catch {
      setError('Demo login failed. Please try again.');
    } finally { setDemoLoading(''); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}><Activity size={22}/> ClinICare</div>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.sub}>Login to your account</p>

        {/* Demo accounts */}
        <div className={styles.demoSection}>
          <div className={styles.demoLabel}>🎯 Try a demo account</div>
          <div className={styles.demoButtons}>
            {DEMO_ACCOUNTS.map(account => (
              <button
                key={account.role}
                className={styles.demoBtn}
                style={{ '--demo-color': account.color }}
                onClick={() => demoLogin(account)}
                disabled={!!demoLoading}
              >
                {demoLoading === account.role ? '...' : account.role}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.dividerRow}>
          <div className={styles.dividerLine}/>
          <span className={styles.dividerText}>or login manually</span>
          <div className={styles.dividerLine}/>
        </div>

        <form onSubmit={handle} className={styles.form}>
          <input className={styles.input} type="email" placeholder="Email"
            value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} required/>
          <input className={styles.input} type="password" placeholder="Password"
            value={form.password} onChange={e => setForm(p=>({...p,password:e.target.value}))} required/>
          {error && <div className={styles.error}>{error}</div>}
          <button className={styles.btn} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <Link to="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
        <p className={styles.switch}>No account? <Link to="/register" className={styles.switchLink}>Register here</Link></p>
        <p className={styles.switch}>Or <Link to="/" className={styles.switchLink}>continue as guest</Link></p>
      </div>
    </div>
  );
}
