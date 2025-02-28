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
import ErrorBoundary from './components/ErrorBoundary';
import './components/Admin.css';
import './components/LoadingSpinner.css';
import './index.css';

function LoadingSpinner() {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner"></div>
      <p>Loading your experience...</p>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <LoadingSpinner />;
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
    const loadContent = async () => {
      try {
        // First try to load from localStorage
        const savedContent = localStorage.getItem('portfolioContent');
        if (savedContent) {
          setContent(JSON.parse(savedContent));
        } else {
          // If not in localStorage, load from content.json
          const response = await import('./data/content.json');
          setContent(response.default);
        }
        setInitialized(true);
      } catch (err) {
        setError(err.message);
        setInitialized(true);
      }
    };
    loadContent();
  }, []);

  if (error) {
    return <div className="error-container">Error: {error}</div>;
  }

  if (!initialized || !content) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <Router future={{ v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin/*" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <Admin content={content} setContent={setContent} />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          <Route path="/blog" element={
            <div className="App">
              <Header />
              <ErrorBoundary>
                <Blog />
              </ErrorBoundary>
              <Footer />
            </div>
          } />
          <Route path="/" element={
            <div className="App">
              <Header />
              <ErrorBoundary>
                <Hero content={content} />
                <About content={content} />
                <Experience content={content} />
                <Projects content={content} />
                <Certifications content={content} />
              </ErrorBoundary>
              <Footer />
            </div>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;