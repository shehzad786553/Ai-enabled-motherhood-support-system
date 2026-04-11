import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const FEATURES = [
  { icon: '🏃‍♀️', title: 'Exercise Planner', color: 'rose',  desc: 'Month-by-month personalized workout plans safe for each trimester. From gentle walks to prenatal yoga.' },
  { icon: '💧',   title: 'Water Tracker',   color: 'teal',  desc: 'Smart hydration goals based on your weight and trimester. Glass-by-glass tracking with reminders.' },
  { icon: '🧬',   title: 'Baby Growth',     color: 'navy',  desc: 'Week-wise fetal development visualization. Size comparisons, milestones, and care tips every week.' },
  { icon: '🩺',   title: 'AI Diagnosis',    color: 'rose',  desc: 'Upload blood reports or describe symptoms. Our AI predicts risk levels and provides medical suggestions.' },
  { icon: '📅',   title: 'Appointments',    color: 'teal',  desc: 'Schedule and manage doctor appointments. Set reminders and keep notes for every visit.' },
  { icon: '🚨',   title: 'Emergency SOS',   color: 'navy',  desc: 'One-tap emergency call to your doctor. Shares your GPS location instantly with emergency contacts.' },
];

const STEPS = [
  { n: '01', title: 'Create Your Profile', desc: 'Enter your pregnancy start date, weight, medical history, and emergency contact details.' },
  { n: '02', title: 'Track Daily',         desc: 'Log your water intake, follow exercise plans, and monitor your baby\'s weekly development.' },
  { n: '03', title: 'AI Health Check',     desc: 'Upload reports or enter symptoms. Our AI model screens for risks and gives personalized advice.' },
  { n: '04', title: 'Stay Connected',      desc: 'Your doctor gets real-time alerts. Use emergency SOS any time, anywhere.' },
];

const STATS = [
  { val: '9 Months', sub: 'Complete Tracking' },
  { val: '40+ Weeks', sub: 'Fetal Milestones' },
  { val: 'AI-Powered', sub: 'Disease Prediction' },
  { val: '24/7', sub: 'Emergency Access' },
];

export default function Home() {
  const heroRef = useRef(null);

  useEffect(() => {
    document.title = 'MomCare AI — Smart Pregnancy Tracker';
  }, []);

  return (
    <div className="home">

      {/* ── HERO ─────────────────────────────── */}
      <section className="hero" ref={heroRef}>
        <div className="hero__bg">
          <div className="hero__blob hero__blob--1" />
          <div className="hero__blob hero__blob--2" />
          <div className="hero__blob hero__blob--3" />
          <div className="hero__grid" />
        </div>

        <div className="container">
          <div className="hero__content">
            <div className="hero__left animate-fade-up">
              <span className="badge badge-rose hero__badge">🌸 AI-Powered Pregnancy Care</span>
              <h1 className="hero__title">
                Your Smart<br />
                <span className="hero__title-accent">Motherhood</span><br />
                Companion
              </h1>
              <p className="hero__subtitle">
                From your first trimester to delivery day — MomCare AI tracks your health,
                guides your baby's growth, and connects you to your doctor instantly.
              </p>
              <div className="hero__ctas">
                <Link to="/register" className="btn btn-primary hero__cta-primary">
                  Start Your Journey →
                </Link>
                <Link to="/login" className="btn btn-ghost">
                  Already registered?
                </Link>
              </div>
              <div className="hero__trust">
                <span>✅ No subscription needed</span>
                <span>✅ Doctor alerts included</span>
                <span>✅ 24/7 Emergency SOS</span>
              </div>
            </div>

            <div className="hero__right animate-fade-up delay-3">
              <div className="hero__card-stack">
                {/* Main card */}
                <div className="hero__phone-card animate-float">
                  <div className="hero__phone-card-header">
                    <span>🌸 MomCare AI</span>
                    <span className="hero__phone-week">Week 24</span>
                  </div>
                  <div className="hero__phone-baby">
                    <div className="hero__phone-baby-icon">👶</div>
                    <div>
                      <p className="hero__phone-baby-title">Your Baby Today</p>
                      <p className="hero__phone-baby-size">Size of an ear of corn • 30cm</p>
                    </div>
                  </div>
                  <div className="hero__phone-stats">
                    <div className="hero__phone-stat">
                      <span>💧</span>
                      <div>
                        <div className="progress-bar"><div className="progress-fill" style={{ width: '65%' }} /></div>
                        <small>Water: 6/9 glasses</small>
                      </div>
                    </div>
                    <div className="hero__phone-stat">
                      <span>🏃</span>
                      <div>
                        <div className="progress-bar"><div className="progress-fill" style={{ width: '80%' }} /></div>
                        <small>Exercise: 120/150 min</small>
                      </div>
                    </div>
                  </div>
                  <div className="hero__phone-tips">
                    <span>💡</span>
                    <p>Take folic acid daily for healthy brain development.</p>
                  </div>
                </div>

                {/* Floating badge 1 */}
                <div className="hero__float-badge hero__float-badge--1">
                  <span>🩺</span>
                  <div><strong>AI Prediction</strong><small>Risk: Low ✅</small></div>
                </div>

                {/* Floating badge 2 */}
                <div className="hero__float-badge hero__float-badge--2">
                  <span>🚨</span>
                  <div><strong>Emergency SOS</strong><small>Doctor Connected</small></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="hero__stats">
          <div className="container">
            <div className="hero__stats-grid">
              {STATS.map((s, i) => (
                <div className="hero__stat-item" key={i}>
                  <strong>{s.val}</strong>
                  <span>{s.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────── */}
      <section className="section features" id="features">
        <div className="container">
          <div className="section-header">
            <span className="badge badge-teal">Everything You Need</span>
            <h2 className="section-title">6 Powerful Features for<br /><span>Your Pregnancy Journey</span></h2>
            <p className="section-sub">Comprehensive AI-powered tools designed by healthcare experts for every stage of pregnancy.</p>
          </div>

          <div className="features__grid">
            {FEATURES.map((f, i) => (
              <div className={`feature-card feature-card--${f.color} card`} key={i}>
                <div className="feature-card__icon">{f.icon}</div>
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.desc}</p>
                <Link to="/register" className="feature-card__link">
                  Explore →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────── */}
      <section className="section how-it-works" id="how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="badge badge-rose">Simple & Intuitive</span>
            <h2 className="section-title">How MomCare AI<br /><span>Works For You</span></h2>
          </div>
          <div className="steps__grid">
            {STEPS.map((st, i) => (
              <div className="step-card" key={i}>
                <div className="step-card__num">{st.n}</div>
                <h3 className="step-card__title">{st.title}</h3>
                <p className="step-card__desc">{st.desc}</p>
                {i < STEPS.length - 1 && <div className="step-card__arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI SECTION ─────────────────────────── */}
      <section className="section ai-section" id="about">
        <div className="container">
          <div className="ai-section__inner">
            <div className="ai-section__left">
              <span className="badge badge-rose">Powered by AI</span>
              <h2 className="section-title">Intelligent Health<br /><span>Predictions</span></h2>
              <p>Our machine learning models are trained on thousands of pregnancy health records to detect early signs of gestational diabetes, anemia, preeclampsia, and other complications.</p>
              <ul className="ai-section__list">
                <li>✅ Random Forest + Logistic Regression models</li>
                <li>✅ Upload blood reports for instant analysis</li>
                <li>✅ Risk level: Low / Medium / High with explanation</li>
                <li>✅ Personalized medical suggestions</li>
                <li>✅ Dataset: Kaggle + WHO research publications</li>
              </ul>
              <Link to="/register" className="btn btn-primary" style={{ marginTop: '24px' }}>
                Try AI Predictor Free →
              </Link>
            </div>
            <div className="ai-section__right">
              <div className="ai-card">
                <div className="ai-card__header">
                  <span>🩺</span>
                  <span>AI Health Analysis</span>
                </div>
                <div className="ai-card__result ai-card__result--low">
                  <div className="ai-card__result-icon">✅</div>
                  <div>
                    <strong>Risk Level: Low</strong>
                    <p>Blood pressure and glucose levels are within normal range for week 24.</p>
                  </div>
                </div>
                <div className="ai-card__suggestions">
                  <h4>AI Recommendations:</h4>
                  <div className="ai-card__tip">💊 Continue folic acid (400mcg/day)</div>
                  <div className="ai-card__tip">🥗 Increase iron-rich food intake</div>
                  <div className="ai-card__tip">🚶 30 min gentle walk daily</div>
                  <div className="ai-card__tip">📅 Next checkup in 2 weeks</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-section__inner">
            <span className="cta-section__emoji">🌸</span>
            <h2>Begin Your Smart Pregnancy Journey Today</h2>
            <p>Join thousands of expecting mothers who trust MomCare AI for their daily pregnancy care.</p>
            <div className="cta-section__btns">
              <Link to="/register" className="btn btn-primary">Create Free Account →</Link>
              <Link to="/login" className="btn btn-ghost">Sign In</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
