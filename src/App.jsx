import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Certifications from './components/Certifications';
import Footer from './components/Footer';
import Admin from './components/Admin';
import Login from './components/Login';
import Blog from './components/Blog';
import './components/Admin.css';

function ProtectedRoute({ children }) {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}

function App() {
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [content, setContent] = useState(null);

  useEffect(() => {
    try {
      if (auth) {
        setInitialized(true);
        // Load content from localStorage if available, otherwise use default content
        const savedContent = localStorage.getItem('portfolioContent');
        setContent(savedContent ? JSON.parse(savedContent) : null);
      }
    } catch (err) {
      setError(err.message);
    }
  }, []);

  if (error) {
    return <div className="error-container">Error: {error}</div>;
  }

  if (!initialized || !content) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <Router future={{ v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <Admin content={content} setContent={setContent} />
          </ProtectedRoute>
        } />
        <Route path="/blog" element={
          <div className="App">
            <Header />
            <Blog />
            <Footer />
          </div>
        } />
        <Route path="/" element={
          <div className="App">
            <Header />
            <Hero content={content} />
            <About content={content} />
            <Experience content={content} />
            <Projects content={content} />
            <Certifications content={content} />
            <Footer />
          </div>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;