import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <div className="footer__logo">
              <span>🌸</span>
              <span>MomCare <em>AI</em></span>
            </div>
            <p className="footer__tagline">
              Smart pregnancy tracking powered by Artificial Intelligence.<br/>
              Every mother deserves intelligent care.
            </p>
            <div className="footer__team">
              <span className="badge badge-teal">Capstone Project 2025</span>
            </div>
          </div>

          <div className="footer__col">
            <h4>Features</h4>
            <ul>
              <li><Link to="/exercise">Exercise Tracker</Link></li>
              <li><Link to="/water">Water Tracker</Link></li>
              <li><Link to="/embryo">Baby Growth</Link></li>
              <li><Link to="/predict">AI Disease Predictor</Link></li>
              <li><Link to="/emergency">Emergency Help</Link></li>
            </ul>
          </div>

          <div className="footer__col">
            <h4>Team</h4>
            <ul>
              <li><span>Shehzad Khan</span></li>
              <li><span>Ryan Javed</span></li>
              <li><span>Shivam Saroj</span></li>
              <li><span>Vinay Singh Yadav</span></li>
            </ul>
            <div style={{ marginTop: '12px' }}>
              <p style={{ fontSize: '12px', color: 'var(--gray-3)' }}>
                Mentor: <strong style={{ color: 'var(--teal-lt)' }}>Ms. Ayushi Mittal</strong>
              </p>
            </div>
          </div>

          <div className="footer__col">
            <h4>Technology</h4>
            <ul>
              <li><span>React.js + Tailwind</span></li>
              <li><span>Node.js + Express</span></li>
              <li><span>MongoDB</span></li>
              <li><span>Python ML Models</span></li>
              <li><span>Scikit-learn</span></li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© 2025 MomCare AI — AI-Enabled Motherhood Support System. Built with ❤️ for expecting mothers.</p>
          <p style={{ fontSize: '12px', color: 'var(--gray-3)', marginTop: '4px' }}>
            ⚠️ This app provides general guidance only. Always consult a qualified doctor for medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
