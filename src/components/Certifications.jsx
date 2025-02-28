import React from 'react';
import './Certifications.css';

const Certifications = ({ content }) => {
  return (
    <section id="certifications">
      <div className="container">
        <h2>Certifications</h2>
        <p className="section-description">
          A collection of professional certifications that validate my expertise in various aspects of product management and development.
        </p>
        <div className="certification-grid">
          {content.certifications.items.map((cert, index) => (
            <div key={index} className="certification-card">
              <h3>{cert.title}</h3>
              <p>{cert.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Certifications;