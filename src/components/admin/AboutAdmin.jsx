import React from 'react';
import { useNavigate } from 'react-router-dom';

const AboutAdmin = ({ content, setContent }) => {
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setContent(prev => ({
      ...prev,
      about: {
        ...prev.about,
        [field]: value
      }
    }));
  };

  const handleSkillsChange = (value) => {
    const skillsArray = value.split(',').map(skill => skill.trim());
    handleChange('skills', skillsArray);
  };

  const handleCurrentlyChange = (value) => {
    const currentlyArray = value.split(',').map(item => item.trim());
    handleChange('currently', currentlyArray);
  };

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>About Section</h2>
        <button onClick={() => navigate('/admin')} className="back-button">
          Back to Dashboard
        </button>
      </div>

      <div className="form-group">
        <label>Title:</label>
        <input
          type="text"
          value={content.about.title}
          onChange={(e) => handleChange('title', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Description:</label>
        <textarea
          value={content.about.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Skills (comma-separated):</label>
        <input
          type="text"
          value={content.about.skills.join(', ')}
          onChange={(e) => handleSkillsChange(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Currently Working On (comma-separated):</label>
        <input
          type="text"
          value={content.about.currently.join(', ')}
          onChange={(e) => handleCurrentlyChange(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Profile Picture:</label>
        <input
          type="text"
          value={content.about.profilePicture}
          onChange={(e) => handleChange('profilePicture', e.target.value)}
        />
      </div>
    </div>
  );
};

export default AboutAdmin;