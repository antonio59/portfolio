import React, { useState, useEffect } from 'react';
import contentData from '../data/content.json';

const Admin = () => {
  const [content, setContent] = useState(contentData);

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

      {/* About Section */}
      <section className="admin-section">
        <h2>About Section</h2>
        <div className="form-group">
          <label>Title:</label>
          <input
            type="text"
            value={content.about.title}
            onChange={(e) => handleChange('about', 'title', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Description:</label>
          <textarea
            value={content.about.description}
            onChange={(e) => handleChange('about', 'description', e.target.value)}
          />
        </div>
      </section>

      {/* Experience Section */}
      <section className="admin-section">
        <h2>Experience Section</h2>
        {content.experience.jobs.map((job, index) => (
          <div key={index} className="form-group">
            <h3>Job {index + 1}</h3>
            <input
              type="text"
              value={job.title}
              onChange={(e) => handleChange('experience', 'jobs', { ...job, title: e.target.value }, index)}
              placeholder="Job Title"
            />
            <input
              type="text"
              value={job.company}
              onChange={(e) => handleChange('experience', 'jobs', { ...job, company: e.target.value }, index)}
              placeholder="Company"
            />
            <input
              type="text"
              value={job.period}
              onChange={(e) => handleChange('experience', 'jobs', { ...job, period: e.target.value }, index)}
              placeholder="Period"
            />
            <textarea
              value={job.description}
              onChange={(e) => handleChange('experience', 'jobs', { ...job, description: e.target.value }, index)}
              placeholder="Description"
            />
          </div>
        ))}
      </section>

      <button onClick={handleSave} className="save-button">
        Save Changes
      </button>
    </div>
  );
};

export default Admin;