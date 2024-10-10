import React, { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header>
      <nav className="container">
        <div className="logo">Antonio Smith</div>
        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <ul>
            <li><a href="#about" onClick={toggleMenu}>About Me</a></li>
            <li><a href="#experience" onClick={toggleMenu}>Experience</a></li>
            <li><a href="#projects" onClick={toggleMenu}>Projects</a></li>
            <li><a href="#certifications" onClick={toggleMenu}>Certifications</a></li>
          </ul>
          <div className="nav-buttons">
            <a href="#" className="btn btn-secondary" onClick={toggleMenu}>Resume</a>
            <a href="mailto:antoniojsmith@protonmail.com" className="btn btn-primary" onClick={toggleMenu}>Contact</a>
          </div>
        </div>
        <div className="burger-menu" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </div>
      </nav>
    </header>
  );
};

export default Header;