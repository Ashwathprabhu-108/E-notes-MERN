import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="enotes-wrap">

      {/* HERO */}
      <div className="hero">
        <div className="hero-badge">About E-Notes</div>
        <h1>Knowledge, <span>Shared Freely</span></h1>
        <p>A community-driven platform where students, teachers, and learners upload, discover, and download notes on any topic — completely free.</p>
        <div className="hero-stats">
          <div className="stat">
            <div className="stat-num">500+</div>
            <div className="stat-label">Notes Uploaded</div>
          </div>
          <div className="stat">
            <div className="stat-num">1200+</div>
            <div className="stat-label">Downloads</div>
          </div>
          <div className="stat">
            <div className="stat-num">300+</div>
            <div className="stat-label">Active Users</div>
          </div>
          <div className="stat">
            <div className="stat-num">50+</div>
            <div className="stat-label">Topics Covered</div>
          </div>
        </div>
      </div>

      <hr className="divider" />

      {/* WHAT IS E-NOTES */}
      <div className="section">
        <div className="section-title">What is <span>E-Notes?</span></div>
        <div className="section-line"></div>
        <p className="section-text">
          E-Notes is a free, community-powered knowledge sharing platform. Anyone can upload their study material, notes, or reference PDFs on any topic. Other users can browse, preview the content before downloading, and save files for later — all without paying a rupee. Whether you're preparing for exams, teaching a class, or just love learning, E-Notes is built for you.
        </p>
      </div>

      <hr className="divider" />

      {/* FEATURES */}
      <div className="section">
        <div className="section-title">Key <span>Features</span></div>
        <div className="section-line"></div>
        <div className="features-grid">

          <div className="feat-card">
            <div className="feat-icon icon-purple">
              <svg viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <h3>Upload Notes</h3>
            <p>Share your notes and PDFs on any topic with the community in seconds.</p>
          </div>

          <div className="feat-card">
            <div className="feat-icon icon-green">
              <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <h3>Download Files</h3>
            <p>Download any notes easily, free, with no account required for basic access.</p>
          </div>

          <div className="feat-card">
            <div className="feat-icon icon-amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
                <line x1="3" y1="9" x2="21" y2="9" />
              </svg>
            </div>
            <h3>PDF Preview</h3>
            <p>Read the full PDF content inline before choosing to download it.</p>
          </div>

          <div className="feat-card">
            <div className="feat-icon icon-blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h3>Search & Discover</h3>
            <p>Find notes by topic, subject, or uploader name instantly.</p>
          </div>

          <div className="feat-card">
            <div className="feat-icon icon-purple">
              <svg viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
              </svg>
            </div>
            <h3>Save Files</h3>
            <p>Bookmark your favourite notes and access them anytime from Saved Files.</p>
          </div>

          <div className="feat-card">
            <div className="feat-icon icon-green">
              <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <h3>Ratings & Reviews</h3>
            <p>Rate files and read community reviews to find the best quality notes.</p>
          </div>

        </div>
      </div>

      <hr className="divider" />

      {/* HOW IT WORKS */}
      <div className="section">
        <div className="section-title">How It <span>Works</span></div>
        <div className="section-line"></div>
        <div className="steps">
          <div className="step">
            <div className="step-num">1</div>
            <h3>Sign Up Free</h3>
            <p>Create your account in under a minute to unlock uploads and saving.</p>
          </div>
          <div className="step">
            <div className="step-num">2</div>
            <h3>Browse or Upload</h3>
            <p>Explore thousands of notes or contribute your own files to the community.</p>
          </div>
          <div className="step">
            <div className="step-num">3</div>
            <h3>Preview Content</h3>
            <p>Read the PDF fully inside the viewer before deciding to download.</p>
          </div>
          <div className="step">
            <div className="step-num">4</div>
            <h3>Download & Save</h3>
            <p>Download for offline use or bookmark it to your Saved Files library.</p>
          </div>
        </div>
      </div>

      <hr className="divider" />

      {/* WHO IS IT FOR */}
      <div className="section">
        <div className="section-title">Who Is It <span>For?</span></div>
        <div className="section-line"></div>
        <div className="audience-grid">
          <div className="aud-card">
            <div className="aud-icon">🎓</div>
            <h3>Students</h3>
          </div>
          <div className="aud-card">
            <div className="aud-icon">📚</div>
            <h3>Teachers</h3>
          </div>
          <div className="aud-card">
            <div className="aud-icon">💡</div>
            <h3>Self-Learners</h3>
          </div>
          <div className="aud-card">
            <div className="aud-icon">💼</div>
            <h3>Professionals</h3>
          </div>
          <div className="aud-card">
            <div className="aud-icon">✍️</div>
            <h3>Content Creators</h3>
          </div>
        </div>
      </div>

      <hr className="divider" />

      {/* MISSION */}
      <div className="section">
        <div className="section-title">Our <span>Mission</span></div>
        <div className="section-line"></div>
        <div className="mission-box">
          <p>"To make quality knowledge freely accessible to every student and learner, regardless of where they are or what they can afford."</p>
          <small>— The E-Notes Team</small>
        </div>
      </div>

      <hr className="divider" />

      <div className="section">
        <div className="section-title">Meet the <span>Creator</span></div>
        <div className="section-line"></div>
        <div className="team-card">
          <div className="avatar">E</div>
          <div className="team-info">
            <h3>E-Notes Team</h3>
            <p>Built with passion to bridge the gap between students who have great notes and those who need them. E-Notes was born from the simple belief that knowledge should never be locked away — it should flow freely between learners everywhere.</p>
            <span className="team-badge">Udupi, Karnataka</span>
          </div>
        </div>
      </div>

      <hr className="divider" />

      {/* CONTACT */}
      <div className="section">
        <div className="section-title">Get In <span>Touch</span></div>
        <div className="section-line"></div>
        <div className="contact-grid">

          <div className="contact-card">
            <div className="contact-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div>
              <h4>Email</h4>
              <p>support@enotes.com</p>
            </div>
          </div>

          <div className="contact-card">
            <div className="contact-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
              </svg>
            </div>
            <div>
              <h4>Twitter / X</h4>
              <p>@enotesapp</p>
            </div>
          </div>

          <div className="contact-card">
            <div className="contact-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
              </svg>
            </div>
            <div>
              <h4>Feedback</h4>
              <p>Share suggestions</p>
            </div>
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <div className="footer">
        All Rights are Reserved &nbsp;|&nbsp; <span>E-Notes</span> &nbsp;|&nbsp; Made with love in Udupi, Karnataka
      </div>

    </div>
  );
};

export default About;