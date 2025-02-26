import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import contentData from '../data/content.json';
import './Admin.css';

const Admin = () => {
  const [content, setContent] = useState(contentData);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleChange = (section, field, value, index = null) => {
    setContent(prev => {
      const newContent = { ...prev };
      if (index !== null) {
        newContent[section][field][index] = value;
      } else {
        newContent[section][field] = value;
      }
      return newContent;
    });
  };

  const handleSave = () => {
    // In a real application, this would save to a backend
    console.log('Saving content:', content);
    localStorage.setItem('portfolioContent', JSON.stringify(content));
    alert('Content saved successfully!');
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      {/* Hero Section */}
      <section className="admin-section">
        <h2>Hero Section</h2>
        <div className="form-group">
          <label>Title:</label>
          <input
            type="text"
            value={content.hero.title}
            onChange={(e) => handleChange('hero', 'title', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Subtitle:</label>
          <input
            type="text"
            value={content.hero.subtitle}
            onChange={(e) => handleChange('hero', 'subtitle', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Description:</label>
          <textarea
            value={content.hero.description}
            onChange={(e) => handleChange('hero', 'description', e.target.value)}
          />
        </div>
      </section>

      <button onClick={handleSave} className="save-button">Save Changes</button>
    </div>
  );
};

export default Admin;