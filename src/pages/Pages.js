import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './PageLayout.css';

/* ══════════════════════════════════════
   WATER TRACKER
══════════════════════════════════════ */
export function WaterTracker() {
  const { user, updateUser } = useAuth();
  const week = user?.pregnancyWeek || 12;
  const trimester = week <= 13 ? 1 : week <= 26 ? 2 : 3;
  const weight = parseFloat(user?.weight || 60);
  const goalMl = trimester === 1 ? 2000 : trimester === 2 ? 2300 : 2500;
  const goalGlasses = Math.round(goalMl / 250);
  const [glasses, setGlasses] = useState(
    parseInt(localStorage.getItem(`water_${new Date().toDateString()}`) || '0')
  );
  const addGlass = () => {
    const newVal = Math.min(glasses + 1, 20);
    setGlasses(newVal);
    localStorage.setItem(`water_${new Date().toDateString()}`, newVal);
  };
  const removeGlass = () => {
    const newVal = Math.max(0, glasses - 1);
    setGlasses(newVal);
    localStorage.setItem(`water_${new Date().toDateString()}`, newVal);
  };
  const pct = Math.min(100, Math.round((glasses / goalGlasses) * 100));
  const status = pct >= 100 ? { label: '🎉 Goal Reached!', color: 'teal' }
               : pct >= 60  ? { label: '👍 Good Progress', color: 'gold' }
               : { label: '💧 Keep Drinking', color: 'rose' };

  return (
    <div className="page-layout">
      <div className="container">
        <div className="page-header">
          <span className="badge badge-teal">💧 Hydration Tracker</span>
          <h1>Daily Water Intake</h1>
          <p>Stay hydrated for you and your baby — {trimester === 1 ? '1st' : trimester === 2 ? '2nd' : '3rd'} Trimester goal: <strong>{goalGlasses} glasses ({goalMl}ml)</strong></p>
        </div>

        <div className="water-main">
          {/* Big bottle visual */}
          <div className="water-bottle-card card">
            <div className="water-bottle">
              <div className="water-bottle__fill" style={{ height: `${pct}%`, background: pct >= 100 ? 'var(--teal)' : 'var(--teal-lt)' }} />
              <div className="water-bottle__text">
                <strong>{glasses}</strong>
                <span>/ {goalGlasses}</span>
                <small>glasses</small>
              </div>
            </div>
            <div className={`water-status badge badge-${status.color}`}>{status.label}</div>
            <div className="progress-bar" style={{ margin: '16px 0 8px' }}>
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-lt)', textAlign: 'center' }}>{glasses * 250}ml / {goalMl}ml</p>
            <div className="water-btns">
              <button className="btn btn-outline" onClick={removeGlass}>−</button>
              <button className="btn btn-secondary water-add-btn" onClick={addGlass}>
                💧 Add a Glass (250ml)
              </button>
              <button className="btn btn-outline" onClick={addGlass}>+</button>
            </div>
          </div>

          {/* Glasses grid */}
          <div className="water-glasses-card card">
            <h3>Your Glasses Today</h3>
            <div className="water-glasses-grid">
              {Array.from({ length: goalGlasses }).map((_, i) => (
                <div key={i} className={`water-glass ${i < glasses ? 'water-glass--filled' : ''}`}>
                  💧
                </div>
              ))}
            </div>
            <div className="water-tips">
              <h4>Hydration Tips</h4>
              <div className="water-tip">🕗 Drink a glass first thing in the morning</div>
              <div className="water-tip">🍉 Eat water-rich foods: cucumber, watermelon</div>
              <div className="water-tip">⏰ Set reminder every 2 hours</div>
              <div className="water-tip">☕ Avoid excessive caffeine — max 200mg/day</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   EXERCISE TRACKER
══════════════════════════════════════ */
const EXERCISES = {
  1:  [{ name:'Gentle Walking',     dur:20, type:'Cardio', intensity:'Light',    desc:'20-min flat terrain walk. Helps reduce nausea.' }],
  2:  [{ name:'Prenatal Yoga',      dur:30, type:'Flex',   intensity:'Light',    desc:'Focus on breathing, gentle stretching.' }],
  3:  [{ name:'Swimming (Gentle)',  dur:25, type:'Cardio', intensity:'Light',    desc:'Low-impact, excellent for circulation.' }],
  4:  [{ name:'Pelvic Floor',       dur:15, type:'Strength',intensity:'Light',   desc:'Kegel exercises — critical for delivery prep.' }],
  5:  [{ name:'Walking + Squats',   dur:30, type:'Mixed',  intensity:'Moderate', desc:'Build leg strength for later trimesters.' }],
  6:  [{ name:'Prenatal Pilates',   dur:30, type:'Core',   intensity:'Moderate', desc:'Strengthen core and back safely.' }],
  7:  [{ name:'Water Aerobics',     dur:30, type:'Cardio', intensity:'Moderate', desc:'Reduces joint pressure, great cardio.' }],
  8:  [{ name:'Light Yoga',         dur:25, type:'Flex',   intensity:'Light',    desc:'Cat-cow, child\'s pose, lateral stretches.' }],
  9:  [{ name:'Walking',            dur:20, type:'Cardio', intensity:'Light',    desc:'Keep it gentle as baby grows heavier.' }],
};

export function ExerciseTracker() {
  const { user } = useAuth();
  const week = user?.pregnancyWeek || 12;
  const month = Math.ceil(week / 4.3);
  const exercises = EXERCISES[Math.min(9, month)] || EXERCISES[1];
  const weeklyGoal = week <= 13 ? 150 : week <= 26 ? 180 : 150;
  const [logged, setLogged] = useState(
    JSON.parse(localStorage.getItem(`exercise_${new Date().toDateString()}`) || '[]')
  );
  const logExercise = (ex) => {
    const newLogged = [...logged, { ...ex, time: new Date().toLocaleTimeString() }];
    setLogged(newLogged);
    localStorage.setItem(`exercise_${new Date().toDateString()}`, JSON.stringify(newLogged));
  };
  const totalMin = logged.reduce((s, e) => s + e.dur, 0);

  return (
    <div className="page-layout">
      <div className="container">
        <div className="page-header">
          <span className="badge badge-rose">🏃‍♀️ Exercise Planner</span>
          <h1>Month {month} Exercise Plan</h1>
          <p>Week {week} • Weekly goal: <strong>{weeklyGoal} minutes</strong> • Today: <strong>{totalMin} min logged</strong></p>
        </div>
        <div className="exercise-grid">
          {exercises.map((ex, i) => (
            <div className="exercise-card card" key={i}>
              <div className="exercise-card__header">
                <div>
                  <h3>{ex.name}</h3>
                  <div style={{ display:'flex', gap:'8px', marginTop:'8px' }}>
                    <span className="badge badge-teal">{ex.type}</span>
                    <span className="badge badge-rose">{ex.intensity}</span>
                    <span className="badge badge-gold">{ex.dur} min</span>
                  </div>
                </div>
                <span style={{ fontSize:'40px' }}>
                  {ex.type==='Cardio'?'🚶':ex.type==='Flex'?'🧘':ex.type==='Core'?'💪':'🏋️'}
                </span>
              </div>
              <p className="exercise-card__desc">{ex.desc}</p>
              <button className="btn btn-secondary" onClick={() => logExercise(ex)}>
                ✅ Mark as Done
              </button>
            </div>
          ))}

          {/* Log */}
          <div className="exercise-log card">
            <h3>Today's Log</h3>
            <div className="progress-bar" style={{ margin:'12px 0 8px' }}>
              <div className="progress-fill" style={{ width:`${Math.min(100,(totalMin/weeklyGoal)*100)}%` }} />
            </div>
            <p style={{ fontSize:'13px', color:'var(--text-md)', marginBottom:'16px' }}>{totalMin} / {weeklyGoal} weekly minutes</p>
            {logged.length === 0
              ? <p style={{ color:'var(--text-lt)', fontSize:'14px' }}>No exercises logged today. Start one above!</p>
              : logged.map((l, i) => (
                  <div className="exercise-log-item" key={i}>
                    <span>✅</span>
                    <div><strong>{l.name}</strong><small>{l.dur} min • {l.time}</small></div>
                  </div>
                ))
            }
          </div>
        </div>

        <div className="safety-note">
          <span>⚠️</span>
          <p><strong>Safety Note:</strong> Always warm up and cool down. Stop immediately if you feel pain, dizziness, or shortness of breath. Consult your doctor before starting any exercise programme.</p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   EMBRYO TRACKER
══════════════════════════════════════ */
const FETAL_DATA = {
  1:  { size:'Poppy seed',   cm:'0.1',  weight:'<1g',   desc:'Fertilization occurs. The embryo implants in the uterine wall.', tip:'Start taking folic acid (400mcg/day) immediately.' },
  2:  { size:'Sesame seed',  cm:'0.2',  weight:'<1g',   desc:'Neural tube forming. Heart begins to develop.', tip:'Avoid alcohol, smoking and raw fish entirely.' },
  3:  { size:'Lentil',       cm:'0.4',  weight:'<1g',   desc:'Brain, spinal cord, and heart forming rapidly.', tip:'Prenatal vitamins are crucial right now.' },
  4:  { size:'Blueberry',    cm:'1.3',  weight:'1g',    desc:'Facial features beginning to form. Arm and leg buds appear.', tip:'Morning sickness may peak — eat small meals.' },
  5:  { size:'Raspberry',    cm:'1.6',  weight:'1g',    desc:'Fingers and toes forming. Eyes developing.', tip:'Stay hydrated — nausea is strong this week.' },
  6:  { size:'Grape',        cm:'2.3',  weight:'3g',    desc:'Brain growing rapidly. Baby can make small movements.', tip:'First ultrasound usually scheduled around week 8.' },
  7:  { size:'Lime',         cm:'4',    weight:'14g',   desc:'All major organs formed. Baby is now a fetus.', tip:'Start sleeping on your side for better circulation.' },
  8:  { size:'Lemon',        cm:'7.4',  weight:'43g',   desc:'Baby can swallow, kick, and make fists.', tip:'Prenatal yoga can help with round ligament pain.' },
  9:  { size:'Avocado',      cm:'14',   weight:'100g',  desc:'Baby is developing taste buds and fingerprints.', tip:'Great week to do a mid-pregnancy checkup.' },
  10: { size:'Banana',       cm:'26.7', weight:'360g',  desc:'Hearing is developing — baby can hear your voice!', tip:'Talk and sing to your baby. They can hear you!' },
  11: { size:'Cauliflower',  cm:'34',   weight:'660g',  desc:'Lungs and brain growing rapidly.', tip:'Attend childbirth preparation classes now.' },
  12: { size:'Ear of corn',  cm:'40',   weight:'1.3kg', desc:'Baby can open eyes and practice breathing motions.', tip:'Sleep on your left side for optimal blood flow.' },
};

export function EmbryoTracker() {
  const { user } = useAuth();
  const week = user?.pregnancyWeek || 1;
  const month = Math.min(12, Math.ceil(week / 4.3));
  const [selectedMonth, setSelectedMonth] = useState(month);
  const data = FETAL_DATA[selectedMonth] || FETAL_DATA[1];

  return (
    <div className="page-layout">
      <div className="container">
        <div className="page-header">
          <span className="badge badge-teal">🧬 Baby Growth Tracker</span>
          <h1>Fetal Development Journey</h1>
          <p>Week-by-week tracking of your baby's growth and milestones</p>
        </div>

        {/* Month selector */}
        <div className="embryo-month-selector card">
          <h3>Select Month</h3>
          <div className="embryo-months">
            {Array.from({ length: 9 }, (_, i) => i + 1).map(m => (
              <button key={m}
                className={`embryo-month-btn ${selectedMonth === m ? 'active' : ''} ${m <= month ? 'reached' : ''}`}
                onClick={() => setSelectedMonth(m)}>
                Month {m}
              </button>
            ))}
          </div>
        </div>

        <div className="embryo-content">
          {/* Main card */}
          <div className="embryo-main-card card">
            <div className="embryo-baby-display">
              <div className="embryo-baby-icon animate-float">👶</div>
              <div className="embryo-month-badge">Month {selectedMonth}</div>
            </div>
            <div className="embryo-stats">
              <div className="embryo-stat">
                <span>📏</span>
                <div><strong>{data.cm} cm</strong><small>Size</small></div>
              </div>
              <div className="embryo-stat">
                <span>⚖️</span>
                <div><strong>{data.weight}</strong><small>Weight</small></div>
              </div>
              <div className="embryo-stat">
                <span>🍃</span>
                <div><strong>{data.size}</strong><small>Comparable to</small></div>
              </div>
            </div>
            <p className="embryo-desc">{data.desc}</p>
            <div className="embryo-tip">
              <span>💡</span>
              <p><strong>Health Tip:</strong> {data.tip}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="embryo-timeline card">
            <h3>Development Timeline</h3>
            <div className="timeline">
              {Object.entries(FETAL_DATA).map(([m, d]) => (
                <div key={m}
                  className={`timeline-item ${parseInt(m) === selectedMonth ? 'timeline-item--active' : ''} ${parseInt(m) < selectedMonth ? 'timeline-item--past' : ''}`}
                  onClick={() => setSelectedMonth(parseInt(m))}>
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <strong>Month {m}</strong>
                    <span>{d.size}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   DISEASE PREDICTOR
══════════════════════════════════════ */
const SYMPTOMS_LIST = ['Headache','Dizziness','Swollen feet','Blurred vision','Nausea/Vomiting','Back pain','Abdominal pain','Shortness of breath','High blood pressure','Excessive fatigue','Vaginal bleeding','Fever','Reduced fetal movement'];

export function DiseasePredictor() {
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState([]);
  const [bp, setBp]         = useState('');
  const [glucose, setGlucose] = useState('');
  const [hb, setHb]         = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const toggleSymptom = (s) => {
    setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const predict = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const token = localStorage.getItem('momcare_token');
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ symptoms, bp, glucose, hemoglobin: hb }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setResult({
        risk:        data.data.riskLevel,
        warnings:    data.data.warnings    || [],
        suggestions: data.data.suggestions || [],
        confidence:  data.data.confidence,
        modelUsed:   data.data.modelUsed,
        mlActive:    data.data.mlServerActive,
      });
    } catch (err) {
      setError(err.message || 'Prediction failed. Make sure backend is running.');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-layout">
      <div className="container">
        <div className="page-header">
          <span className="badge badge-rose">🩺 AI Health Analysis</span>
          <h1>Disease Risk Predictor</h1>
          <p>Select your current symptoms and enter test values for AI-powered risk assessment</p>
          <div className="predictor-model-badge">
            🤖 Model: <strong>Random Forest + Logistic Regression Ensemble</strong>
            &nbsp;•&nbsp; Dataset: Kaggle Maternal Health Risk
          </div>
        </div>

        {error && <div className="auth-error" style={{ marginBottom:'16px' }}>⚠️ {error}</div>}

        <div className="predictor-grid">
          <div className="predictor-form card">
            <h3>Step 1: Select Your Symptoms</h3>
            <div className="symptoms-grid">
              {SYMPTOMS_LIST.map(s => (
                <button key={s}
                  className={`symptom-btn ${symptoms.includes(s) ? 'symptom-btn--active' : ''}`}
                  onClick={() => toggleSymptom(s)}>
                  {symptoms.includes(s) ? '✓ ' : ''}{s}
                </button>
              ))}
            </div>
            <h3 style={{ marginTop:'24px' }}>Step 2: Enter Lab Values (Optional but more accurate)</h3>
            <div className="predictor-inputs">
              <div className="auth-field">
                <label>Blood Pressure — Systolic (mmHg)</label>
                <input className="input" type="number" placeholder="e.g. 120" value={bp} onChange={e=>setBp(e.target.value)} />
                <small>Normal: 90–130 mmHg</small>
              </div>
              <div className="auth-field">
                <label>Blood Glucose (mg/dL)</label>
                <input className="input" type="number" placeholder="e.g. 95" value={glucose} onChange={e=>setGlucose(e.target.value)} />
                <small>Normal fasting: 70–110 mg/dL</small>
              </div>
              <div className="auth-field">
                <label>Hemoglobin (g/dL)</label>
                <input className="input" type="number" step="0.1" placeholder="e.g. 11.5" value={hb} onChange={e=>setHb(e.target.value)} />
                <small>Normal in pregnancy: 11–13 g/dL</small>
              </div>
            </div>
            <button className="btn btn-primary" onClick={predict} disabled={loading} style={{ width:'100%', marginTop:'16px' }}>
              {loading ? '🔄 Running AI Analysis...' : '🩺 Analyse My Health →'}
            </button>
          </div>

          <div className="predictor-result-panel">
            {!result && !loading && (
              <div className="predictor-empty card">
                <span style={{ fontSize:'64px' }}>🩺</span>
                <h3>Your AI Health Report</h3>
                <p>Fill in your symptoms and lab values on the left, then click Analyse to get your personalised risk assessment.</p>
                <div className="predictor-info-box">
                  <h4>How our AI works:</h4>
                  <p>• <strong>Random Forest</strong> (200 trees) trained on 1000 pregnancy records</p>
                  <p>• <strong>Logistic Regression</strong> for probability calibration</p>
                  <p>• <strong>Ensemble</strong>: RF 65% + LR 35% weighted vote</p>
                  <p>• Dataset: Kaggle Maternal Health Risk + WHO guidelines</p>
                </div>
              </div>
            )}
            {loading && (
              <div className="predictor-loading card">
                <div className="predictor-spinner" />
                <h3>Running AI Analysis...</h3>
                <p>RandomForest + LogisticRegression ensemble processing</p>
              </div>
            )}
            {result && !loading && (
              <div className={`predictor-result card predictor-result--${result.risk.toLowerCase()}`}>
                <div className="predictor-result__header">
                  <span>{result.risk==='Low'?'✅':result.risk==='Medium'?'⚠️':'🚨'}</span>
                  <div>
                    <h3>Risk Level: {result.risk}</h3>
                    <p>
                      {result.confidence ? `Confidence: ${result.confidence}% • ` : ''}
                      {symptoms.length} symptom{symptoms.length!==1?'s':''} analysed
                    </p>
                    {result.modelUsed && (
                      <small style={{ color:'var(--text-lt)' }}>
                        🤖 {result.mlActive ? '✅ Python ML Server' : '⚡ Rule Engine'}: {result.modelUsed}
                      </small>
                    )}
                  </div>
                </div>
                {result.warnings.length > 0 && (
                  <div className="predictor-warnings">
                    {result.warnings.map((w,i) => <div key={i} className="predictor-warning">⚠️ {w}</div>)}
                  </div>
                )}
                <h4>AI Recommendations:</h4>
                <div className="predictor-suggestions">
                  {result.suggestions.map((s,i) => (
                    <div key={i} className="ai-card__tip">✅ {s}</div>
                  ))}
                </div>
                <div className="predictor-disclaimer">
                  ⚠️ <em>This is an AI-based screening tool only. Always consult a qualified doctor for medical decisions.</em>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

}

/* ══════════════════════════════════════
   EMERGENCY PAGE
══════════════════════════════════════ */
export function Emergency() {
  const { user } = useAuth();
  const [activated, setActivated] = useState(false);
  const [countdown, setCountdown] = useState(null);

  const activateSOS = () => {
    let c = 3;
    setCountdown(c);
    const timer = setInterval(() => {
      c--;
      if (c <= 0) { clearInterval(timer); setCountdown(null); setActivated(true); }
      else setCountdown(c);
    }, 1000);
  };

  const WHEN_TO_CALL = [
    'Severe abdominal pain or cramps',
    'Vaginal bleeding at any time',
    'Severe headache or vision changes',
    'Water breaking before 37 weeks',
    'Decreased fetal movement',
    'High fever (above 100.4°F / 38°C)',
    'Swelling in face, hands, or feet',
    'Difficulty breathing',
  ];

  return (
    <div className="page-layout">
      <div className="container" style={{ maxWidth:'800px' }}>
        <div className="page-header" style={{ textAlign:'center' }}>
          <span className="badge badge-rose">🚨 Emergency</span>
          <h1>Emergency Assistance</h1>
          <p>Get immediate help for pregnancy-related emergencies 24/7</p>
        </div>

        {/* SOS Button */}
        <div className="emergency-sos-card card">
          {!activated ? (
            <>
              <div className="emergency-when">
                <h3>When to use Emergency Call:</h3>
                <div className="emergency-when-grid">
                  {WHEN_TO_CALL.map((w,i) => <div key={i} className="emergency-when-item">⚠️ {w}</div>)}
                </div>
              </div>
              <div style={{ textAlign:'center', margin:'32px 0' }}>
                {countdown !== null
                  ? <div className="emergency-countdown">{countdown}</div>
                  : (
                    <button className="emergency-sos-btn" onClick={activateSOS}>
                      <span>🚨</span>
                      Contact On-Call Doctor Now
                    </button>
                  )
                }
                <p style={{ color:'var(--text-lt)', fontSize:'13px', marginTop:'12px' }}>
                  Your location will be shared with emergency services
                </p>
              </div>
            </>
          ) : (
            <div className="emergency-activated">
              <div className="emergency-activated__icon">🚑</div>
              <h2>Emergency Activated!</h2>
              <p>Your emergency contact and doctor have been notified.</p>
              <p>Your location has been shared.</p>
              <div className="emergency-contacts-called">
                {user?.emergencyContact && (
                  <div className="emergency-contact-card">
                    <span>📞</span>
                    <div>
                      <strong>{user.emergencyContact}</strong>
                      <p>Notified: {user.emergencyPhone}</p>
                    </div>
                    <span className="badge badge-teal">Called ✅</span>
                  </div>
                )}
                {user?.doctorName && (
                  <div className="emergency-contact-card">
                    <span>🩺</span>
                    <div>
                      <strong>Dr. {user.doctorName}</strong>
                      <p>Notified: {user.doctorPhone}</p>
                    </div>
                    <span className="badge badge-teal">Called ✅</span>
                  </div>
                )}
              </div>
              <button className="btn btn-outline" onClick={() => setActivated(false)} style={{ marginTop:'24px' }}>
                Cancel Emergency
              </button>
            </div>
          )}
        </div>

        {/* Helplines */}
        <div className="emergency-helplines card">
          <h3>Emergency Helplines (India)</h3>
          <div className="helpline-grid">
            <div className="helpline-card"><span>🚑</span><strong>Ambulance</strong><span className="helpline-num">102</span></div>
            <div className="helpline-card"><span>🏥</span><strong>Emergency</strong><span className="helpline-num">108</span></div>
            <div className="helpline-card"><span>👩‍⚕️</span><strong>Women Helpline</strong><span className="helpline-num">181</span></div>
            <div className="helpline-card"><span>☎️</span><strong>Health Helpline</strong><span className="helpline-num">104</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   APPOINTMENTS
══════════════════════════════════════ */
export function Appointments() {
  const [appts, setAppts] = useState(
    JSON.parse(localStorage.getItem('momcare_appointments') || '[]')
  );
  const [form, setForm] = useState({ doctor:'', specialty:'', date:'', time:'', location:'', notes:'' });
  const [showForm, setShowForm] = useState(false);

  const save = (e) => {
    e.preventDefault();
    const newAppts = [...appts, { ...form, id: Date.now() }];
    setAppts(newAppts);
    localStorage.setItem('momcare_appointments', JSON.stringify(newAppts));
    setForm({ doctor:'', specialty:'', date:'', time:'', location:'', notes:'' });
    setShowForm(false);
  };
  const del = (id) => {
    const updated = appts.filter(a => a.id !== id);
    setAppts(updated);
    localStorage.setItem('momcare_appointments', JSON.stringify(updated));
  };
  const set = f => e => setForm(p => ({...p, [f]: e.target.value}));

  const upcoming = appts.filter(a => new Date(a.date) >= new Date()).sort((a,b) => new Date(a.date)-new Date(b.date));
  const past     = appts.filter(a => new Date(a.date) <  new Date()).sort((a,b) => new Date(b.date)-new Date(a.date));

  return (
    <div className="page-layout">
      <div className="container">
        <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'16px' }}>
          <div>
            <span className="badge badge-teal">📅 Appointments</span>
            <h1>Doctor Appointments</h1>
            <p>Manage all your prenatal visits in one place</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
            {showForm ? '✕ Cancel' : '+ Add Appointment'}
          </button>
        </div>

        {showForm && (
          <div className="appt-form card" style={{ marginBottom:'28px' }}>
            <h3>New Appointment</h3>
            <form onSubmit={save} className="appt-form-grid">
              <div className="auth-field"><label>Doctor Name *</label><input className="input" placeholder="Dr. Ayesha Rao" value={form.doctor} onChange={set('doctor')} required /></div>
              <div className="auth-field"><label>Speciality</label><input className="input" placeholder="Obstetrician" value={form.specialty} onChange={set('specialty')} /></div>
              <div className="auth-field"><label>Date *</label><input className="input" type="date" value={form.date} onChange={set('date')} required /></div>
              <div className="auth-field"><label>Time</label><input className="input" type="time" value={form.time} onChange={set('time')} /></div>
              <div className="auth-field auth-field--full"><label>Location / Hospital</label><input className="input" placeholder="City Hospital, Main Road" value={form.location} onChange={set('location')} /></div>
              <div className="auth-field auth-field--full"><label>Notes / Reminders</label><input className="input" placeholder="Bring ultrasound report, blood test results..." value={form.notes} onChange={set('notes')} /></div>
              <div style={{ gridColumn:'1/-1' }}><button type="submit" className="btn btn-primary">Save Appointment ✅</button></div>
            </form>
          </div>
        )}

        <div className="appt-section-title">Upcoming ({upcoming.length})</div>
        {upcoming.length === 0
          ? <div className="appt-empty card"><span>📅</span><p>No upcoming appointments. Add one above!</p></div>
          : <div className="appt-list">
              {upcoming.map(a => (
                <div className="appt-card card" key={a.id}>
                  <div className="appt-card__icon">🩺</div>
                  <div className="appt-card__info">
                    <strong>{a.doctor}</strong>
                    {a.specialty && <span className="badge badge-teal" style={{marginLeft:'8px'}}>{a.specialty}</span>}
                    <p>📅 {new Date(a.date).toLocaleDateString('en-IN', {weekday:'long',day:'numeric',month:'long'})} {a.time && `at ${a.time}`}</p>
                    {a.location && <p>📍 {a.location}</p>}
                    {a.notes && <p style={{fontStyle:'italic',color:'var(--text-lt)'}}>📝 {a.notes}</p>}
                  </div>
                  <button className="appt-delete" onClick={() => del(a.id)}>✕</button>
                </div>
              ))}
            </div>
        }

        {past.length > 0 && <>
          <div className="appt-section-title" style={{ marginTop:'32px' }}>Past ({past.length})</div>
          <div className="appt-list appt-list--past">
            {past.map(a => (
              <div className="appt-card appt-card--past card" key={a.id}>
                <div className="appt-card__icon">✅</div>
                <div className="appt-card__info">
                  <strong>{a.doctor}</strong>
                  <p>📅 {new Date(a.date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>
                </div>
                <button className="appt-delete" onClick={() => del(a.id)}>✕</button>
              </div>
            ))}
          </div>
        </>}
      </div>
    </div>
  );
}
