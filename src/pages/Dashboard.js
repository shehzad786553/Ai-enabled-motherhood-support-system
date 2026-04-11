import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const QUICK_LINKS = [
  { path: '/exercise',     icon: '🏃‍♀️', title: 'Exercise',     desc: 'Today\'s workout plan', color: 'rose' },
  { path: '/water',        icon: '💧',   title: 'Water',         desc: 'Track hydration',       color: 'teal' },
  { path: '/embryo',       icon: '🧬',   title: 'Baby Growth',   desc: 'Week-wise development', color: 'navy' },
  { path: '/predict',      icon: '🩺',   title: 'AI Predict',    desc: 'Health risk analysis',  color: 'rose' },
  { path: '/appointments', icon: '📅',   title: 'Appointments',  desc: 'Manage visits',         color: 'teal' },
  { path: '/emergency',    icon: '🚨',   title: 'Emergency',     desc: 'SOS help',              color: 'sos'  },
];

const TIPS = [
  "💊 Take your prenatal vitamins with a meal to reduce nausea.",
  "🚶 A 20-minute walk daily can reduce back pain during pregnancy.",
  "💧 Drink water before you feel thirsty — dehydration comes quickly.",
  "🛌 Sleep on your left side to improve blood flow to your baby.",
  "🥗 Eat iron-rich foods like spinach and lentils to prevent anemia.",
  "🧘 Prenatal yoga helps reduce stress and improves flexibility.",
];

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const [note, setNote] = useState(user?.dashboardNote || '');
  const [noteSaved, setNoteSaved] = useState(false);

  const week = user?.pregnancyWeek || 1;
  const month = Math.ceil(week / 4.3);
  const trimester = week <= 13 ? '1st Trimester' : week <= 26 ? '2nd Trimester' : '3rd Trimester';
  const progress = Math.round((week / 40) * 100);
  const weeksLeft = Math.max(0, 40 - week);

  const tip = TIPS[week % TIPS.length];

  const saveNote = () => {
    updateUser({ dashboardNote: note });
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  return (
    <div className="dashboard">
      <div className="container">

        {/* ── Header ── */}
        <div className="dash-header">
          <div className="dash-header__left">
            <span className="badge badge-teal">{trimester}</span>
            <h1>Welcome back, <span>{user?.name?.split(' ')[0]} 🌸</span></h1>
            <p>Week <strong>{week}</strong> of 40 • {weeksLeft} weeks to go • Month {month}</p>
          </div>
          <div className="dash-header__right">
            <div className="dash-progress-ring">
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" className="dash-ring-bg" />
                <circle cx="60" cy="60" r="50" className="dash-ring-fill"
                  style={{ strokeDashoffset: `${314 - (314 * progress) / 100}` }} />
              </svg>
              <div className="dash-ring-text">
                <strong>{progress}%</strong>
                <span>Complete</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Progress Bar ── */}
        <div className="dash-progress-card card">
          <div className="dash-progress-card__header">
            <span>Pregnancy Progress</span>
            <span>Week {week} / 40</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="dash-progress-card__trimesters">
            <span className={week <= 13 ? 'active' : ''}>1st Trimester<br/><small>Weeks 1–13</small></span>
            <span className={week > 13 && week <= 26 ? 'active' : ''}>2nd Trimester<br/><small>Weeks 14–26</small></span>
            <span className={week > 26 ? 'active' : ''}>3rd Trimester<br/><small>Weeks 27–40</small></span>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="dash-stats">
          <div className="dash-stat-card">
            <span className="dash-stat-icon">👶</span>
            <div>
              <strong>Week {week}</strong>
              <p>Current Week</p>
            </div>
          </div>
          <div className="dash-stat-card">
            <span className="dash-stat-icon">📅</span>
            <div>
              <strong>Month {month}</strong>
              <p>Current Month</p>
            </div>
          </div>
          <div className="dash-stat-card">
            <span className="dash-stat-icon">⏳</span>
            <div>
              <strong>{weeksLeft} Weeks</strong>
              <p>Until Due Date</p>
            </div>
          </div>
          <div className="dash-stat-card">
            <span className="dash-stat-icon">💉</span>
            <div>
              <strong>{user?.bloodGroup || 'Not Set'}</strong>
              <p>Blood Group</p>
            </div>
          </div>
          <div className="dash-stat-card">
            <span className="dash-stat-icon">⚖️</span>
            <div>
              <strong>{user?.weight || '--'} kg</strong>
              <p>Registered Weight</p>
            </div>
          </div>
        </div>

        {/* ── Quick Links ── */}
        <div className="dash-section-title">Quick Access</div>
        <div className="dash-quick-grid">
          {QUICK_LINKS.map((l, i) => (
            <Link to={l.path} key={i} className={`dash-quick-card dash-quick-card--${l.color}`}>
              <span className="dash-quick-icon">{l.icon}</span>
              <h3>{l.title}</h3>
              <p>{l.desc}</p>
              <span className="dash-quick-arrow">→</span>
            </Link>
          ))}
        </div>

        {/* ── Bottom Grid ── */}
        <div className="dash-bottom-grid">

          {/* Daily tip */}
          <div className="dash-tip-card card">
            <div className="dash-tip-card__header">
              <span>💡</span>
              <h3>Daily Health Tip</h3>
            </div>
            <p className="dash-tip-text">{tip}</p>
            <div className="badge badge-teal" style={{ marginTop: '12px' }}>Week {week} Tip</div>
          </div>

          {/* Personal notes */}
          <div className="dash-note-card card">
            <div className="dash-note-card__header">
              <span>📝</span>
              <h3>Personal Notes</h3>
            </div>
            <textarea
              className="input dash-note-textarea"
              placeholder="Add thoughts, questions for your doctor, symptoms..."
              value={note}
              onChange={e => setNote(e.target.value)}
            />
            <button className="btn btn-secondary" onClick={saveNote} style={{ marginTop: '12px' }}>
              {noteSaved ? '✅ Saved!' : 'Save Notes'}
            </button>
          </div>

          {/* Emergency info */}
          <div className="dash-emergency-card">
            <div className="dash-emergency-card__header">
              <span>🚨</span>
              <h3>Emergency Contacts</h3>
            </div>
            {user?.emergencyContact && (
              <div className="dash-contact">
                <span>👤</span>
                <div>
                  <strong>{user.emergencyContact}</strong>
                  <p>{user.emergencyPhone}</p>
                </div>
              </div>
            )}
            {user?.doctorName && (
              <div className="dash-contact">
                <span>🩺</span>
                <div>
                  <strong>{user.doctorName}</strong>
                  <p>{user.doctorPhone}</p>
                </div>
              </div>
            )}
            <Link to="/emergency" className="btn btn-primary dash-sos-btn">
              🚨 Emergency SOS
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
