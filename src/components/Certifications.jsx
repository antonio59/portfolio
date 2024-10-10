import React from 'react';
import './Certifications.css';

const Certifications = () => {
  return (
    <section id="certifications">
      <div className="container">
        <h2>Certifications</h2>
        <p className="section-description">
          A collection of professional certifications that validate my expertise in various aspects of product management and development.
        </p>
        <div className="certification-grid">
          <div className="certification-card">
            <h3>Certified Scrum Product Owner (CSPO)</h3>
            <p>Scrum Alliance - Expertise in agile product ownership and backlog management.</p>
          </div>
          <div className="certification-card">
            <h3>Scrum Master (PSM1)</h3>
            <p>Scrum.org - Professional Scrum Master certification demonstrating mastery of Scrum framework.</p>
          </div>
          <div className="certification-card">
            <h3>Product Management Certification</h3>
            <p>Brainstation - Comprehensive training in product strategy, UX design, and data analytics.</p>
          </div>
          <div className="certification-card">
            <h3>Google Analytics Certification</h3>
            <p>Google - Proficiency in web analytics and data-driven decision making for product development.</p>
          </div>
          <div className="certification-card">
            <h3>Google Project Management</h3>
            <p>Google - Mastery of project management methodologies and best practices.</p>
          </div>
          <div className="certification-card">
            <h3>Full Stack Developer</h3>
            <p>Le Wagon - Comprehensive training in full-stack web development, enhancing technical product management skills.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Certifications;