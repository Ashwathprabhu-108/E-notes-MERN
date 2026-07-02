import React, { useState, useEffect } from 'react';
import './About.css';
import API_BASE_URL from '../../config/api';
import Save from '../../assets/saved-bookmark-icon.svg';
import UploadIcon from '../../assets/Upload.svg';
import FileIcon from '../../assets/file_preview.svg';
import SearchIcon from '../../assets/Search.svg';
import DlIcon from '../../assets/download.svg';
import StudentIco from '../../assets/student.svg';
import TeacherIco from '../../assets/teachers.svg';
import LearnerIco from '../../assets/self_learners.svg';
import ProIco from '../../assets/Professionals.svg';
import CreatorIco from '../../assets/content_creators.svg';
import EmailIco from '../../assets/Email.svg';
import InstaIco from '../../assets/Instagram.svg';

const FEATURES = [
  { icon: UploadIcon, color: '#7c6af7', bg: 'rgba(124,106,247,0.12)', label: 'Upload Notes', desc: 'Share PDFs and study material with anyone, instantly. No size limits, no paywalls.' },
  { icon: DlIcon, color: '#34d399', bg: 'rgba(52,211,153,0.12)', label: 'Download Files', desc: 'One-click downloads. No account required for basic access.' },
  { icon: FileIcon, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Smart Preview', desc: 'AI-generated summaries so you know what you\'re downloading before you get it.' },
  { icon: SearchIcon, color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', label: 'Instant Search', desc: 'Find notes by topic, subject, or uploader in milliseconds.' },
  { icon: Save, color: '#f472b6', bg: 'rgba(244,114,182,0.12)', label: 'Save for Later', desc: 'Bookmark anything to your personal library and access it from any device.' },
];

const STEPS = [
  { n: '01', title: 'Create an account', body: 'Sign up in seconds with email or Google. Completely free.' },
  { n: '02', title: 'Browse or upload', body: 'Explore the library or contribute your own notes.' },
  { n: '03', title: 'Preview content', body: 'Read the full PDF inside the built-in viewer before downloading.' },
  { n: '04', title: 'Download & bookmark', body: 'Save files offline or pin them to your personal library.' },
];

const AUDIENCE = [
  { icon: StudentIco, label: 'Students', sub: 'Exam prep & revision' },
  { icon: TeacherIco, label: 'Teachers', sub: 'Share course material' },
  { icon: LearnerIco, label: 'Self-Learners', sub: 'Curiosity without limits' },
  { icon: ProIco, label: 'Professionals', sub: 'Upskill on the job' },
  { icon: CreatorIco, label: 'Content Creators', sub: 'Research & references' },
];

export default function About() {
  const [stats, setStats] = useState({ files: 0, downloads: 0 });

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/files`)
      .then(r => r.json())
      .then(files => setStats({
        files: files.length,
        downloads: files.reduce((s, f) => s + (f.downloadCount || 0), 0),
      }))
      .catch(() => { });
  }, []);

  return (
    <div className="ab-root">

      {/* ── HERO ── two-column ───────────────────────── */}
      <section className="ab-hero">
        <div className="ab-hero-left">
          <span className="ab-eyebrow">
            <span className="ab-eyebrow-dot" />
            About E-Notes
          </span>
          <h1 className="ab-hero-h1">
            Knowledge that<br />
            <em>flows freely.</em>
          </h1>
          <p className="ab-hero-sub">
            A community-powered platform where anyone can upload, discover,
            and download notes on any topic — no cost, no catch.
          </p>
        </div>

        <div className="ab-stat-panel">
          <div className="ab-stat-item">
            <span className="ab-stat-n">{stats.files.toLocaleString()}</span>
            <span className="ab-stat-l">Notes uploaded</span>
          </div>
          <div className="ab-stat-item">
            <span className="ab-stat-n">{stats.downloads.toLocaleString()}</span>
            <span className="ab-stat-l">Total downloads</span>
          </div>
          <div className="ab-stat-item">
            <span className="ab-stat-n">100%</span>
            <span className="ab-stat-l">Free forever</span>
          </div>
        </div>
      </section>

      {/* ── WHAT IS E-NOTES ─────────────────────────── */}
      <section className="ab-section">
        <div className="ab-what">
          <div className="ab-what-text">
            <span className="ab-label">What is E-Notes?</span>
            <h2>Built for learners,<br />by learners.</h2>
            <p>
              E-Notes started from a simple frustration: great study material exists
              everywhere, but it stays locked inside individual hard drives. We built
              a place where knowledge escapes — freely shared between students,
              teachers, and curious minds worldwide.
            </p>
            <p>
              Upload a PDF in seconds, let others preview it with AI-generated
              summaries, and download anything without a subscription or hidden fee.
            </p>
          </div>
          <div className="ab-quote-card">
            <div className="ab-quote-mark">"</div>
            <p>Knowledge should never be locked away. It should flow freely between every learner, everywhere.</p>
            <footer>— The E-Notes Team</footer>
          </div>
        </div>
      </section>

      <hr className="ab-divider" />

      {/* ── FEATURES ────────────────────────────────── */}
      <section className="ab-section">
        <span className="ab-label">Platform features</span>
        <h2 className="ab-section-h2">Everything you need, nothing you don't.</h2>
        <div className="ab-bento">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="ab-bento-card"
              style={{ '--card-accent': f.color, '--card-bg': f.bg }}
            >
              <div className="ab-bento-icon">
                <img src={f.icon} alt={f.label} />
              </div>
              <h3>{f.label}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────── */}
      <div className="ab-steps-section">
        <div className="ab-steps-inner">
          <span className="ab-label">How it works</span>
          <h2 className="ab-section-h2">Up and running in four steps.</h2>
          <div className="ab-steps">
            {STEPS.map((s, i) => (
              <div key={i} className="ab-step">
                <span className="ab-step-n">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── WHO IS IT FOR ───────────────────────────── */}
      <section className="ab-section">
        <span className="ab-label">Who it's for</span>
        <h2 className="ab-section-h2">Designed for every kind of learner.</h2>
        <div className="ab-audience">
          {AUDIENCE.map((a, i) => (
            <div key={i} className="ab-aud-card">
              <div className="ab-aud-img">
                <img src={a.icon} alt={a.label} />
              </div>
              <h3>{a.label}</h3>
              <p>{a.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className="ab-divider" />

      {/* ── TEAM + CONTACT ──────────────────────────── */}
      <section className="ab-section">
        <div className="ab-bottom-row">
          <div className="ab-team-card">
            <span className="ab-label">The creator</span>
            <div className="ab-team-body">
              <div className="ab-avatar">E</div>
              <span className="ab-team-name">E-Notes Team</span>
            </div>
            <p>
              Built with passion out of Udupi, Karnataka. We bridge the gap
              between students who have great notes and those who need them.
              Knowledge should never be locked away — it belongs to everyone.
            </p>
            <span className="ab-location-tag">📍 Udupi, Karnataka</span>
          </div>

          <div className="ab-contact-card">
            <span className="ab-label">Get in touch</span>
            <h3>We'd love to hear from you.</h3>
            <div className="ab-contacts">
              <a
                className="ab-contact-item"
                href="https://mail.google.com/mail/?view=cm&to=enotes.app.admin@gmail.com"
                target="_blank"
                rel="noreferrer"
              >
                <div className="ab-contact-ico" style={{ background: 'rgba(234,67,53,0.12)' }}>
                  <img src={EmailIco} alt="Email" />
                </div>
                <div className="ab-contact-info">
                  <span className="ab-contact-name">Email</span>
                  <span className="ab-contact-val">eha108768@gmail.com</span>
                </div>
              </a>
              <a
                className="ab-contact-item"
                href="https://instagram.com/enotesapp"
                target="_blank"
                rel="noreferrer"
              >
                <div className="ab-contact-ico" style={{ background: 'rgba(188,24,136,0.12)' }}>
                  <img src={InstaIco} alt="Instagram" />
                </div>
                <div className="ab-contact-info">
                  <span className="ab-contact-name">Instagram</span>
                  <span className="ab-contact-val">@enotesapp</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────── */}
      <footer className="ab-footer">
        <span>© 2025 E-Notes</span>
        <span className="ab-footer-dot">·</span>
        <span>Made with care in Udupi, Karnataka</span>
        <span className="ab-footer-dot">·</span>
        <span>All rights reserved</span>
      </footer>

    </div>
  );
}