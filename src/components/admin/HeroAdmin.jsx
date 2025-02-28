import React from 'react';
import { useNavigate } from 'react-router-dom';

const HeroAdmin = ({ content, setContent }) => {
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setContent(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        [field]: value
      }
    }));
  };

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Hero Section</h2>
        <button onClick={() => navigate('/admin')} className="back-button">
          Back to Dashboard
        </button>
      </div>
      
      <div className="form-group">
        <label>Title:</label>
        <input
          type="text"
          value={content.hero.title}
          onChange={(e) => handleChange('title', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Subtitle:</label>
        <input
          type="text"
          value={content.hero.subtitle}
          onChange={(e) => handleChange('subtitle', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Description:</label>
        <textarea
          value={content.hero.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />
      </div>
    </div>
  );
};

export default HeroAdmin;