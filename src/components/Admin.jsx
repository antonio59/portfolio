import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import contentData from '../data/content.json';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './Admin.css';

const Admin = () => {
  const [content, setContent] = useState(contentData);
  const [activeSection, setActiveSection] = useState('hero');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleChange = (section, field, value, index = null, subfield = null) => {
    setContent(prev => {
      const newContent = { ...prev };
      if (index !== null) {
        if (subfield) {
          newContent[section][field][index][subfield] = value;
        } else {
          newContent[section][field][index] = value;
        }
      } else {
        newContent[section][field] = value;
      }
      return newContent;
    });
  };

  const handleDragEnd = (result, section, field) => {
    if (!result.destination) return;

    const items = Array.from(content[section][field]);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: items
      }
    }));
  };

  const togglePin = (section, field, index) => {
    setContent(prev => {
      const newContent = { ...prev };
      const items = [...newContent[section][field]];
      const item = { ...items[index], pinned: !items[index].pinned };
      
      if (item.pinned) {
        items.splice(index, 1);
        items.unshift(item);
      } else {
        items[index] = item;
      }
      
      newContent[section][field] = items;
      return newContent;
    });
  };

  const handleSave = () => {
    // In a real application, this would save to a backend
    console.log('Saving content:', content);
    localStorage.setItem('portfolioContent', JSON.stringify(content));
    alert('Content saved successfully!');
  };

  const renderCardList = (section, field) => (
    <DragDropContext onDragEnd={(result) => handleDragEnd(result, section, field)}>
      <Droppable droppableId={`${section}-${field}`}>
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {content[section][field].map((item, index) => (
              <Draggable
                key={index}
                draggableId={`${section}-${field}-${index}`}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`card-item ${item.pinned ? 'pinned' : ''}`}
                  >
                    <div className="card-header">
                      <button
                        onClick={() => togglePin(section, field, index)}
                        className={`pin-button ${item.pinned ? 'pinned' : ''}`}
                      >
                        📌
                      </button>
                      <h4>Item {index + 1}</h4>
                    </div>
                    {Object.entries(item).map(([key, value]) => {
                      if (key !== 'pinned') {
                        return (
                          <div key={key} className="form-group">
                            <label>{key}:</label>
                            {Array.isArray(value) ? (
                              <input
                                type="text"
                                value={value.join(', ')}
                                onChange={(e) => handleChange(section, field, e.target.value.split(',').map(v => v.trim()), index, key)}
                              />
                            ) : (
                              <input
                                type="text"
                                value={value}
                                onChange={(e) => handleChange(section, field, e.target.value, index, key)}
                              />
                            )}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      <div className="section-nav">
        {Object.keys(content).map(section => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`nav-button ${activeSection === section ? 'active' : ''}`}
          >
            {section.charAt(0).toUpperCase() + section.slice(1)}
          </button>
        ))}
      </div>

      <section className="admin-section">
        <h2>{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Section</h2>
        
        {/* Title field for all sections */}
        <div className="form-group">
          <label>Title:</label>
          <input
            type="text"
            value={content[activeSection].title}
            onChange={(e) => handleChange(activeSection, 'title', e.target.value)}
          />
        </div>

        {/* Section specific fields */}
        {activeSection === 'hero' && (
          <>
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
          </>
        )}

        {activeSection === 'about' && (
          <>
            <div className="form-group">
              <label>Description:</label>
              <textarea
                value={content.about.description}
                onChange={(e) => handleChange('about', 'description', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Skills:</label>
              <input
                type="text"
                value={content.about.skills.join(', ')}
                onChange={(e) => handleChange('about', 'skills', e.target.value.split(',').map(skill => skill.trim()))}
              />
            </div>
          </>
        )}

        {/* Card-based sections */}
        {(activeSection === 'experience' && content.experience.jobs) && (
          <div className="cards-container">
            <h3>Jobs</h3>
            {renderCardList('experience', 'jobs')}
          </div>
        )}

        {activeSection === 'projects' && (
          <div className="cards-container">
            <div className="form-group">
              <label>Development Projects Description:</label>
              <textarea
                value={content.projects.developmentDescription}
                onChange={(e) => handleChange('projects', 'developmentDescription', e.target.value)}
                rows="4"
              />
            </div>
            <div className="form-group">
              <label>General Projects Description:</label>
              <textarea
                value={content.projects.generalDescription}
                onChange={(e) => handleChange('projects', 'generalDescription', e.target.value)}
                rows="4"
              />
            </div>
            <h3>Development Projects</h3>
            {renderCardList('projects', 'developmentProjects')}
            <h3>General Projects</h3>
            {renderCardList('projects', 'generalProjects')}
          </div>
        )}

        {(activeSection === 'certifications' && content.certifications.items) && (
          <div className="cards-container">
            <h3>Certifications</h3>
            {renderCardList('certifications', 'items')}
          </div>
        )}
      </section>

      <button onClick={handleSave} className="save-button">Save Changes</button>
    </div>
  );
};

export default Admin;