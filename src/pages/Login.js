import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Check credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__bg">
        <div className="auth-blob auth-blob--1" />
        <div className="auth-blob auth-blob--2" />
      </div>
      <div className="auth-card animate-fade-up">
        <div className="auth-card__header">
          <Link to="/" className="auth-logo">🌸 MomCare <em>AI</em></Link>
          <h1>Welcome Back</h1>
          <p>Continue your pregnancy journey</p>
        </div>
        {error && <div className="auth-error">⚠️ {error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label>Email Address</label>
            <input className="input" type="email" placeholder="your@email.com"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div className="auth-field" style={{ marginBottom: '16px' }}>
            <label>Password</label>
            <input className="input" type="password" placeholder="Your password"
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </div>
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? '🔄 Signing In...' : 'Sign In →'}
          </button>
        </form>
        <p className="auth-switch">Don't have an account? <Link to="/register">Create one free</Link></p>
        <div className="auth-demo">
          <p>💡 Make sure the backend server is running on port 5000</p>
        </div>
      </div>
    </div>
  );
}

export function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form, setForm] = useState({
    name:'', email:'', password:'', confirmPassword:'',
    pregnancyStartDate:'', weight:'', phone:'',
    emergencyContact:'', emergencyPhone:'',
    doctorName:'', doctorPhone:'', bloodGroup:'', medicalConditions:''
  });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [step,    setStep]    = useState(1);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
      setStep(1);
    } finally { setLoading(false); }
  };

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <div className="auth-page">
      <div className="auth-page__bg">
        <div className="auth-blob auth-blob--1" />
        <div className="auth-blob auth-blob--2" />
      </div>
      <div className="auth-card auth-card--wide animate-fade-up">
        <div className="auth-card__header">
          <Link to="/" className="auth-logo">🌸 MomCare <em>AI</em></Link>
          <h1>Start Your Journey</h1>
          <p>Create your free pregnancy tracker account</p>
        </div>
        <div className="auth-steps">
          <button className={`auth-step ${step >= 1 ? 'active' : ''}`} onClick={() => setStep(1)}><span>1</span> Personal Info</button>
          <div className="auth-step-divider" />
          <button className={`auth-step ${step >= 2 ? 'active' : ''}`} onClick={() => step >= 2 && setStep(2)}><span>2</span> Pregnancy Details</button>
          <div className="auth-step-divider" />
          <button className={`auth-step ${step >= 3 ? 'active' : ''}`} onClick={() => step >= 3 && setStep(3)}><span>3</span> Emergency Contact</button>
        </div>
        {error && <div className="auth-error">⚠️ {error}</div>}
        <form onSubmit={step < 3 ? (e) => { e.preventDefault(); setStep(s => s+1); } : handleSubmit} className="auth-form">
          {step === 1 && (
            <div className="auth-form-grid">
              <div className="auth-field"><label>Full Name *</label><input className="input" type="text" placeholder="Priya Sharma" value={form.name} onChange={set('name')} required /></div>
              <div className="auth-field"><label>Email *</label><input className="input" type="email" placeholder="priya@email.com" value={form.email} onChange={set('email')} required /></div>
              <div className="auth-field"><label>Password *</label><input className="input" type="password" placeholder="Min 6 characters" value={form.password} onChange={set('password')} required /></div>
              <div className="auth-field"><label>Confirm Password *</label><input className="input" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={set('confirmPassword')} required /></div>
              <div className="auth-field"><label>Phone</label><input className="input" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} /></div>
            </div>
          )}
          {step === 2 && (
            <div className="auth-form-grid">
              <div className="auth-field"><label>Pregnancy Start Date (LMP) *</label><input className="input" type="date" value={form.pregnancyStartDate} onChange={set('pregnancyStartDate')} required /><small>LMP = Last Menstrual Period date</small></div>
              <div className="auth-field"><label>Current Weight (kg) *</label><input className="input" type="number" placeholder="60" min="30" max="150" value={form.weight} onChange={set('weight')} required /></div>
              <div className="auth-field auth-field--full"><label>Medical Conditions</label><input className="input" type="text" placeholder="Diabetes, hypertension (or none)" value={form.medicalConditions} onChange={set('medicalConditions')} /></div>
              <div className="auth-field auth-field--full"><label>Blood Group</label>
                <select className="input" value={form.bloodGroup} onChange={set('bloodGroup')}>
                  <option value="">Select blood group</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="auth-form-grid">
              <div className="auth-field"><label>Emergency Contact Name *</label><input className="input" type="text" placeholder="Husband / Parent name" value={form.emergencyContact} onChange={set('emergencyContact')} required /></div>
              <div className="auth-field"><label>Emergency Contact Phone *</label><input className="input" type="tel" placeholder="+91 98765 43210" value={form.emergencyPhone} onChange={set('emergencyPhone')} required /></div>
              <div className="auth-field auth-field--full"><label>Doctor Name</label><input className="input" type="text" placeholder="Dr. Ayesha Rao" value={form.doctorName} onChange={set('doctorName')} /></div>
              <div className="auth-field auth-field--full"><label>Doctor Phone</label><input className="input" type="tel" placeholder="+91 98765 12345" value={form.doctorPhone} onChange={set('doctorPhone')} /></div>
            </div>
          )}
          <div className="auth-form-actions">
            {step > 1 && <button type="button" className="btn btn-outline" onClick={() => setStep(s => s-1)}>← Back</button>}
            <button type="submit" className="btn btn-primary auth-submit" disabled={loading} style={{ flex:1 }}>
              {step < 3 ? 'Next Step →' : loading ? '🔄 Creating Account...' : 'Create My Account 🌸'}
            </button>
          </div>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}

export default Login;
