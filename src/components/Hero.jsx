import React from 'react';
import { FaUser, FaList, FaCode, FaEnvelope, FaChevronDown } from 'react-icons/fa';
import './Hero.css';

const Hero = () => {
  return (
    <section id="hero">
      <div className="container hero-content">
        <div className="hero-text">
          <p className="intro">Hello I'm</p>
          <h1>Antonio.</h1>
          <h2>
            <span className="highlight">Technical Project Manager</span> based in London
          </h2>
          <p className="description">
            Specialising in delivering high-impact <span className="highlight">enterprise software</span> and <span className="highlight">product solutions</span>.
          </p>
          <div className="cta-container">
            <a href="mailto:antoniojsmith@protonmail.com" className="btn btn-primary">Get In Touch</a>
          </div>
        </div>
        <div className="hero-image">
          <div className="image-placeholder"></div>
        </div>
      </div>
      <div className="icon-container">
        <a href="#about" className="icon-link" title="About"><FaUser className="icon" /></a>
        <a href="#experience" className="icon-link" title="Experience"><FaList className="icon" /></a>
        <a href="#projects" className="icon-link" title="Projects"><FaCode className="icon" /></a>
        <a href="mailto:antoniojsmith@protonmail.com" className="icon-link" title="Contact"><FaEnvelope className="icon" /></a>
      </div>
      <div className="scroll-prompt">
        <FaChevronDown className="scroll-icon" />
        <span className="sr-only">Scroll down</span>
      </div>
    </section>
  );
};

export default Hero;