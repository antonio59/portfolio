import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Certifications from './components/Certifications';
import Footer from './components/Footer';
import Admin from './components/Admin';
import './components/Admin.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="/" element={
          <div className="App">
            <Header />
            <Hero />
            <About />
            <Experience />
            <Projects />
            <Certifications />
            <Footer />
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;