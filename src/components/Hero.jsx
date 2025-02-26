import React from 'react';
import { FaChevronDown } from 'react-icons/fa';
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
            Crafting impactful <span className="highlight">products</span>, shaping <span className="highlight">visual magic</span>.
          </p>
          <div className="cta-container">
            <a href="mailto:antoniojsmith@protonmail.com" className="btn btn-primary">Get In Touch</a>
          </div>
        </div>
      </div>
      <div className="scroll-prompt">
        <div className="scroll-container">
          <FaChevronDown className="scroll-icon" />
          <span className="scroll-text">Scroll down</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;